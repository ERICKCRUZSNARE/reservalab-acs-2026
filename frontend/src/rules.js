export const stateLabels={REQUESTED:'Solicitada',APPROVED:'Aprobada',REJECTED:'Rechazada',CANCELLED:'Cancelada',CHECKED_OUT:'En préstamo',RETURNED:'Devuelta'};
export function reservationErrors({equipment_id,start,end,purpose},now=Date.now()) {
 const errors={};const s=new Date(start).getTime(),e=new Date(end).getTime();
 if(!equipment_id)errors.equipment_id='Selecciona un equipo.';
 if(!Number.isFinite(s)||s<=now)errors.start='El inicio debe estar en el futuro.';
 else if(s>now+30*86400000)errors.start='La anticipación máxima es de 30 días.';
 if(!Number.isFinite(e)||e-s<3600000||e-s>8*3600000)errors.end='La duración debe estar entre 1 y 8 horas.';
 if(!purpose||purpose.trim().length<10||purpose.trim().length>300)errors.purpose='Escribe de 10 a 300 caracteres.';
 return errors;
}
export function visibleActions(r,user,now=Date.now()) {
 const actions=[];if(user.role==='ADMIN'){
 if(r.status==='REQUESTED'){if(Number(r.start)>now)actions.push('approve');actions.push('reject');}
 if(r.status==='APPROVED'&&now>=Number(r.start)-900000&&now<Number(r.end))actions.push('checkout');
 if(r.status==='CHECKED_OUT')actions.push('return');
 }
 if((user.id===r.user_id||user.role==='ADMIN')&&['REQUESTED','APPROVED'].includes(r.status)&&Number(r.start)>now)actions.push('cancel');
 return actions;
}
export function countActive(rows) {return rows.filter(r=>['REQUESTED','APPROVED','CHECKED_OUT'].includes(r.status)).length;}
export function filterEquipment(rows,query,status='ALL') {const q=query.trim().toLowerCase();return rows.filter(r=>(status==='ALL'||r.status===status)&&`${r.name} ${r.code} ${r.category}`.toLowerCase().includes(q));}
export function localInput(ms) {const d=new Date(ms);return new Date(ms-d.getTimezoneOffset()*60000).toISOString().slice(0,16);}
