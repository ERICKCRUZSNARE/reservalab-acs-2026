import {it,expect,vi,afterEach} from 'vitest';
import {api} from '../src/api.js';
afterEach(()=>vi.unstubAllGlobals());
it('cliente envía token, cuerpo JSON y método',async()=>{const mock=vi.fn().mockResolvedValue({ok:true,json:async()=>({id:'r1'})});vi.stubGlobal('fetch',mock);await expect(api('/reservations',{token:'secret',method:'POST',body:{purpose:'Práctica'}})).resolves.toEqual({id:'r1'});expect(mock.mock.calls[0][1]).toMatchObject({method:'POST',headers:{Authorization:'Bearer secret','Content-Type':'application/json'},body:'{"purpose":"Práctica"}'});});
it('cliente conserva mensaje y status del API',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status:409,json:async()=>({message:'Horario ocupado'})}));await expect(api('/reservations')).rejects.toMatchObject({message:'Horario ocupado',status:409});});
it('cliente presenta error genérico si no viene mensaje',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status:500,json:async()=>({})}));await expect(api('/equipment')).rejects.toThrow('No fue posible');});
