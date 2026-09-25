import express from 'express';
import {randomUUID} from 'node:crypto';
import {RuleError,requireRule,validateRegistration,validateReservation,canTransition,authorizeApproval,lateMinutes,ACTIVE,HOUR} from './domain.js';
import {hashPassword,verifyPassword,newToken,tokenHash} from './security.js';
import {audit} from './db.js';
const cleanUser = u => ({id:u.id,name:u.name,email:u.email,role:u.role});
export function createApp(db,{clock=Date.now,origin=process.env.APP_ORIGIN || 'http://localhost:5173'}={}) {
  const app=express(); app.disable('x-powered-by');
  const attempts=new Map();
  app.use((req,res,next)=>{
    res.set({'X-Content-Type-Options':'nosniff','Cache-Control':'no-store','Referrer-Policy':'no-referrer'});
    if(req.headers.origin === origin) res.set({'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Headers':'Authorization,Content-Type','Access-Control-Allow-Methods':'GET,POST,PATCH,OPTIONS'});
    if(req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });
  app.use(express.json({limit:'16kb'}));
  app.get('/api/health',async(req,res)=>{await db.query('SELECT 1');res.json({status:'ok',application:'ReservaLab'});});
  app.post('/api/auth/register',async(req,res)=>{
    const data=validateRegistration(req.body); const id=randomUUID();
    try{await db.query('INSERT INTO users VALUES ($1,$2,$3,$4,$5)',[id,data.name,data.email,await hashPassword(data.password),'STUDENT']);}
    catch(e){if(e.code==='23505') throw new RuleError('DUPLICATE','El correo ya está registrado.',409);throw e;}
    res.status(201).json({id,name:data.name,email:data.email,role:'STUDENT'});
  });
  app.post('/api/auth/login',async(req,res)=>{
    const email=typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const now=clock(); for(const [k,v] of attempts) if(v.until<=now) attempts.delete(k);
    const key=req.ip+':'+email; const rate=attempts.get(key);
    requireRule(!rate || rate.count<10,'RATE_LIMIT','Demasiados intentos. Espera 15 minutos.',429);
    const user=(await db.query('SELECT * FROM users WHERE email=$1',[email])).rows[0];
    const valid=user && await verifyPassword(req.body.password,user.password_hash);
    if(!valid){attempts.set(key,{count:(rate?.count||0)+1,until:rate?.until||now+900000});throw new RuleError('LOGIN','Correo o contraseña incorrectos.',401);}
    attempts.delete(key); const token=newToken();
    await db.query('DELETE FROM sessions WHERE expires <= $1',[now]);
    await db.query('INSERT INTO sessions VALUES ($1,$2,$3)',[tokenHash(token),user.id,now+8*HOUR]);
    res.json({token,user:cleanUser(user)});
  });
  app.use('/api',async(req,res,next)=>{
    const token=req.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
    requireRule(token,'AUTH','Inicia sesión para continuar.',401);
    const user=(await db.query('SELECT u.* FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=$1 AND s.expires>$2',[tokenHash(token),clock()])).rows[0];
    requireRule(user,'AUTH','La sesión venció. Inicia sesión nuevamente.',401);req.user=cleanUser(user);req.token=token;next();
  });
  const admin=(req,res,next)=>{requireRule(req.user.role==='ADMIN','FORBIDDEN','Esta acción requiere el rol de administrador.',403);next();};
  app.get('/api/auth/me',(req,res)=>res.json(req.user));
  app.post('/api/auth/logout',async(req,res)=>{await db.query('DELETE FROM sessions WHERE token_hash=$1',[tokenHash(req.token)]);res.json({message:'Sesión cerrada.'});});
  app.get('/api/equipment',async(req,res)=>{res.json((await db.query('SELECT * FROM equipment ORDER BY code')).rows);});
  app.post('/api/equipment',admin,async(req,res)=>{
    const {code,name,category,description}=req.body;
    requireRule(typeof code==='string' && /^[A-Z0-9-]{3,20}$/.test(code),'CODE','Usa de 3 a 20 letras mayúsculas, números o guiones.');
    for(const [value,label,max] of [[name,'nombre',80],[category,'categoría',40],[description,'descripción',300]]) requireRule(typeof value==='string' && value.trim().length>=2 && value.trim().length<=max,'FIELD',`Revisa el campo ${label}.`);
    const id=randomUUID();
    try {await db.transaction(async tx=>{await tx.query('INSERT INTO equipment VALUES ($1,$2,$3,$4,$5,$6)',[id,code,name.trim(),category.trim(),description.trim(),'AVAILABLE']);await audit(tx,req.user,'EQUIPMENT_CREATED',id,clock());});}
    catch(e){if(e.code==='23505')throw new RuleError('DUPLICATE','Ese código ya existe.',409);throw e;}
    res.status(201).json({id,code,name,category,description,status:'AVAILABLE'});
  });
  app.patch('/api/equipment/:id/status',admin,async(req,res)=>{
    const status=req.body.status;requireRule(['AVAILABLE','MAINTENANCE','RETIRED'].includes(status),'STATUS','Estado de equipo inválido.');
    const result=await db.transaction(async tx=>{
      const eq=(await tx.query('SELECT * FROM equipment WHERE id=$1 FOR UPDATE',[req.params.id])).rows[0];requireRule(eq,'NOT_FOUND','Equipo no encontrado.',404);
      const commitments=await tx.query("SELECT id FROM reservations WHERE equipment_id=$1 AND status IN ('APPROVED','CHECKED_OUT')",[eq.id]);
      requireRule(status==='AVAILABLE'||commitments.rows.length===0,'COMMITTED','El equipo tiene reservas aprobadas o préstamos activos.',409);
      const result=await tx.query('UPDATE equipment SET status=$1 WHERE id=$2 RETURNING *',[status,eq.id]);await audit(tx,req.user,'EQUIPMENT_'+status,eq.id,clock());return result.rows[0];
    });res.json(result);
  });
  app.get('/api/reservations',async(req,res)=>{
    const filter=req.user.role==='ADMIN'?'':'WHERE r.user_id=$1';
    res.json((await db.query(`SELECT r.*,e.name AS equipment_name,e.code,u.name AS user_name FROM reservations r JOIN equipment e ON e.id=r.equipment_id JOIN users u ON u.id=r.user_id ${filter} ORDER BY r.created_at DESC`,req.user.role==='ADMIN'?[]:[req.user.id])).rows);
  });
  app.post('/api/reservations',async(req,res)=>{
    const data=validateReservation(req.body,clock());const id=randomUUID();
    const row=await db.transaction(async tx=>{
      await tx.query('SELECT id FROM users WHERE id=$1 FOR UPDATE',[req.user.id]);
      const eq=(await tx.query('SELECT * FROM equipment WHERE id=$1 FOR UPDATE',[data.equipment_id])).rows[0];requireRule(eq,'NOT_FOUND','Equipo no encontrado.',404);requireRule(eq.status==='AVAILABLE','EQUIPMENT','El equipo no está disponible.',409);
      const active=await tx.query('SELECT id FROM reservations WHERE user_id=$1 AND status=ANY($2::text[])',[req.user.id,ACTIVE]);requireRule(active.rows.length<3,'LIMIT','Solo se permiten 3 reservas activas por usuario.',409);
      const conflicts=await tx.query(`SELECT id FROM reservations WHERE equipment_id=$1 AND status IN ('APPROVED','CHECKED_OUT') AND start<$3 AND "end">$2`,[eq.id,data.start,data.end]);requireRule(conflicts.rows.length===0,'CONFLICT','El horario ya está reservado.',409);
      const result=await tx.query('INSERT INTO reservations (id,user_id,equipment_id,start,"end",purpose,status,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',[id,req.user.id,eq.id,data.start,data.end,data.purpose,'REQUESTED',clock()]);await audit(tx,req.user,'RESERVATION_CREATED',id,clock());return result.rows[0];
    });res.status(201).json(row);
  });
  app.post('/api/reservations/:id/:action',async(req,res)=>{
    const row=await db.transaction(async tx=>{
      const r=(await tx.query('SELECT * FROM reservations WHERE id=$1 FOR UPDATE',[req.params.id])).rows[0];requireRule(r,'NOT_FOUND','Reserva no encontrada.',404);
      const now=clock(),action=req.params.action;const to=canTransition(r,action,req.user,now);
      if(action==='approve') await authorizeApproval({equipment:async id=>(await tx.query('SELECT * FROM equipment WHERE id=$1 FOR UPDATE',[id])).rows[0],conflicts:async r=>(await tx.query(`SELECT id FROM reservations WHERE id<>$1 AND equipment_id=$2 AND status IN ('APPROVED','CHECKED_OUT') AND start<$4 AND "end">$3`,[r.id,r.equipment_id,r.start,r.end])).rows},r,now);
      const result=await tx.query('UPDATE reservations SET status=$1,returned_at=$2,late_minutes=$3 WHERE id=$4 RETURNING *',[to,action==='return'?now:null,action==='return'?lateMinutes(Number(r.end),now):0,r.id]);
      await audit(tx,req.user,'RESERVATION_'+to,r.id,now);return result.rows[0];
    });res.json(row);
  });
  app.get('/api/dashboard',async(req,res)=>{
    const filter=req.user.role==='ADMIN'?'':'WHERE user_id=$1';
    const rows=(await db.query(`SELECT status,COUNT(*)::int AS count FROM reservations ${filter} GROUP BY status`,req.user.role==='ADMIN'?[]:[req.user.id])).rows;
    res.json({counts:Object.fromEntries(rows.map(r=>[r.status,r.count])),equipment:Number((await db.query('SELECT COUNT(*)::int AS count FROM equipment')).rows[0].count)});
  });
  app.get('/api/audit',admin,async(req,res)=>res.json((await db.query('SELECT a.*,u.name AS user_name FROM audit a LEFT JOIN users u ON u.id=a.user_id ORDER BY created_at DESC LIMIT 100')).rows));
  app.use((req,res)=>res.status(404).json({code:'NOT_FOUND',message:'Ruta no encontrada.'}));
  app.use((err,req,res,next)=>{
    if(err instanceof RuleError)return res.status(err.status).json({code:err.code,message:err.message});
    if(err.type==='entity.parse.failed')return res.status(400).json({code:'JSON',message:'El cuerpo JSON no es válido.'});
    if(err.type==='entity.too.large')return res.status(413).json({code:'SIZE',message:'El cuerpo de la solicitud es demasiado grande.'});
    console.error('API_ERROR',err.code||err.name);res.status(500).json({code:'INTERNAL',message:'No fue posible procesar la solicitud.'});
  });return app;
}
