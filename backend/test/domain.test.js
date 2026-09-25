import {describe,it,expect,vi} from 'vitest';
import {validateRegistration,validateReservation,overlaps,canTransition,lateMinutes,authorizeApproval,HOUR,DAY} from '../src/domain.js';
const now=Date.UTC(2026,8,25,12),admin={id:'admin',role:'ADMIN'},student={id:'student',role:'STUDENT'};
const data={equipment_id:'eq-1',start:now+HOUR,end:now+2*HOUR,purpose:'Práctica de medición'};
const r={id:'r1',equipment_id:'eq-1',user_id:'student',...data,status:'REQUESTED'};
describe('Registro: particiones y límites',()=>{
 it('normaliza correo y nombre',()=>expect(validateRegistration({name:' Erick ',email:'ERICK@example.test',password:'Seguro2026!'})).toMatchObject({name:'Erick',email:'erick@example.test'}));
 for(const name of ['', 'E','x'.repeat(81),null])it(`rechaza nombre ${String(name).slice(0,10)}`,()=>expect(()=>validateRegistration({name,email:'a@b.test',password:'Seguro2026!'})).toThrow());
 for(const password of ['corta1A','sinmayuscula123','SINMINUSCULA123','SinDigitosAqui','A1a'.repeat(44)])it(`rechaza contraseña inválida ${password.slice(0,8)}`,()=>expect(()=>validateRegistration({name:'Erick',email:'a@b.test',password})).toThrow());
 it('rechaza correo mal formado',()=>expect(()=>validateRegistration({name:'Erick',email:'sin-arroba',password:'Seguro2026!'})).toThrow());
});
describe('Reserva: fronteras temporales',()=>{
 for(const hours of [1,8])it(`acepta duración ${hours}h`,()=>expect(validateReservation({...data,end:data.start+hours*HOUR},now).start).toBe(data.start));
 for(const minutes of [59,481,0,-60])it(`rechaza duración ${minutes}min`,()=>expect(()=>validateReservation({...data,end:data.start+minutes*60000},now)).toThrow());
 it('rechaza inicio igual a ahora',()=>expect(()=>validateReservation({...data,start:now},now)).toThrow());
 it('rechaza fecha inválida',()=>expect(()=>validateReservation({...data,start:'x'},now)).toThrow());
 it('acepta anticipación 30 días exactos',()=>expect(validateReservation({...data,start:now+30*DAY,end:now+30*DAY+HOUR},now)).toBeTruthy());
 it('rechaza 30 días y un minuto',()=>expect(()=>validateReservation({...data,start:now+30*DAY+60000,end:now+30*DAY+HOUR+60000},now)).toThrow());
 it('rechaza segundos no alineados',()=>expect(()=>validateReservation({...data,start:data.start+1},now)).toThrow());
 for(const length of [10,300])it(`acepta propósito de ${length}`,()=>expect(validateReservation({...data,purpose:'a'.repeat(length)},now).purpose).toHaveLength(length));
 for(const length of [9,301])it(`rechaza propósito de ${length}`,()=>expect(()=>validateReservation({...data,purpose:'a'.repeat(length)},now)).toThrow());
});
describe('Solapamientos',()=>{
 it('detecta superposición parcial',()=>expect(overlaps({start:10,end:20},{start:19,end:30})).toBe(true));
 it('detecta contención',()=>expect(overlaps({start:10,end:30},{start:15,end:20})).toBe(true));
 it('permite intervalos contiguos',()=>expect(overlaps({start:10,end:20},{start:20,end:30})).toBe(false));
 it('permite intervalos separados',()=>expect(overlaps({start:10,end:20},{start:30,end:40})).toBe(false));
});
describe('Transiciones y permisos',()=>{
 for(const [action,status,to] of [['approve','REQUESTED','APPROVED'],['reject','REQUESTED','REJECTED'],['checkout','APPROVED','CHECKED_OUT'],['return','CHECKED_OUT','RETURNED'],['cancel','REQUESTED','CANCELLED'],['cancel','APPROVED','CANCELLED']])it(`${status} → ${to}`,()=>expect(canTransition({...r,status},action,admin,action==='checkout'?data.start:now)).toBe(to));
 it('propietario puede cancelar',()=>expect(canTransition(r,'cancel',student,now)).toBe('CANCELLED'));
 for(const action of ['approve','reject','checkout','return'])it(`estudiante no puede ${action}`,()=>expect(()=>canTransition(r,action,student,now)).toThrow(/permiso/));
 it('otro estudiante no puede cancelar',()=>expect(()=>canTransition(r,'cancel',{id:'other',role:'STUDENT'},now)).toThrow(/permiso/));
 it('rechaza acción desconocida',()=>expect(()=>canTransition(r,'delete',admin,now)).toThrow());
 it('rechaza salto a devolución',()=>expect(()=>canTransition(r,'return',admin,now)).toThrow());
 it('no aprueba reserva iniciada',()=>expect(()=>canTransition(r,'approve',admin,data.start)).toThrow());
 it('no cancela reserva iniciada',()=>expect(()=>canTransition(r,'cancel',student,data.start)).toThrow());
 it('entrega a -15 minutos',()=>expect(canTransition({...r,status:'APPROVED'},'checkout',admin,data.start-900000)).toBe('CHECKED_OUT'));
 it('rechaza entrega a -16 minutos',()=>expect(()=>canTransition({...r,status:'APPROVED'},'checkout',admin,data.start-960000)).toThrow());
 it('rechaza entrega al final',()=>expect(()=>canTransition({...r,status:'APPROVED'},'checkout',admin,data.end)).toThrow());
});
describe('Dobles de prueba: aprobación sin base de datos',()=>{
 it('MOCK-01 aprueba cuando equipo está disponible y sin conflictos',async()=>{const repo={equipment:vi.fn().mockResolvedValue({status:'AVAILABLE'}),conflicts:vi.fn().mockResolvedValue([])};await expect(authorizeApproval(repo,r,now)).resolves.toBe(true);expect(repo.conflicts).toHaveBeenCalledWith(r);});
 it('MOCK-02 bloquea mantenimiento sin consultar conflictos',async()=>{const repo={equipment:vi.fn().mockResolvedValue({status:'MAINTENANCE'}),conflicts:vi.fn()};await expect(authorizeApproval(repo,r,now)).rejects.toThrow();expect(repo.conflicts).not.toHaveBeenCalled();});
 it('MOCK-03 bloquea conflicto de agenda',async()=>{const repo={equipment:vi.fn().mockResolvedValue({status:'AVAILABLE'}),conflicts:vi.fn().mockResolvedValue([{id:'other'}])};await expect(authorizeApproval(repo,r,now)).rejects.toThrow(/horario/);});
 it('MOCK-04 propaga error del repositorio',async()=>{const repo={equipment:vi.fn().mockRejectedValue(new Error('DB unavailable'))};await expect(authorizeApproval(repo,r,now)).rejects.toThrow('DB unavailable');});
 it('no aprueba una reserva pasada',async()=>{const repo={equipment:vi.fn().mockResolvedValue({status:'AVAILABLE'}),conflicts:vi.fn()};await expect(authorizeApproval(repo,r,data.start)).rejects.toThrow();});
});
describe('Retraso',()=>{
 for(const [delta,expected] of [[-60000,0],[0,0],[1,1],[60000,1],[60001,2]])it(`retraso de ${delta}ms = ${expected}min`,()=>expect(lateMinutes(data.end,data.end+delta)).toBe(expected));
});
