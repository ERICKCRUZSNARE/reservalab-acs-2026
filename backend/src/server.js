import {connectDatabase,initialize} from './db.js';
import {createApp} from './app.js';
const db=await connectDatabase();
await initialize(db,{demo:process.env.SEED_DEMO==='true',adminPassword:process.env.ADMIN_PASSWORD,studentPassword:process.env.STUDENT_PASSWORD});
const server=createApp(db).listen(Number(process.env.PORT||3001),process.env.HOST||'127.0.0.1',()=>console.log('ReservaLab API lista en puerto '+(process.env.PORT||3001)));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(async()=>{await db.close();process.exit(0);}));
