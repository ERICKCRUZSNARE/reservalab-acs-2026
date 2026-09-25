import http from 'k6/http';
import {check,sleep,fail} from 'k6';
const base=(__ENV.BASE_URL||'').replace(/\/$/,'');
export const options={scenarios:{laboratorio:{executor:'ramping-vus',startVUs:0,stages:[{duration:'1m',target:50},{duration:'5m',target:50},{duration:'30s',target:0}],gracefulRampDown:'15s'}},thresholds:{'http_req_duration{endpoint:catalogo}':['p(95)<2000'],'http_req_duration{endpoint:resumen}':['p(95)<2000'],http_req_failed:['rate<0.01'],checks:['rate>0.99']},summaryTrendStats:['avg','min','med','max','p(90)','p(95)']};
export function setup(){
 if(!base.startsWith('https://')&&!__ENV.ALLOW_LOCAL)fail('BASE_URL debe ser la URL HTTPS del backend QA desplegado.');
 if(!__ENV.EMAIL||!__ENV.PASSWORD)fail('Define EMAIL y PASSWORD de una cuenta de prueba.');
 const r=http.post(base+'/api/auth/login',JSON.stringify({email:__ENV.EMAIL,password:__ENV.PASSWORD}),{headers:{'Content-Type':'application/json'},tags:{endpoint:'login'}});
 if(r.status!==200)fail('No se pudo autenticar la prueba de carga.');return {token:r.json('token')};
}
export default function({token}){
 const headers={Authorization:'Bearer '+token};
 const a=http.get(base+'/api/equipment',{headers,tags:{endpoint:'catalogo'}});check(a,{'catálogo HTTP 200':r=>r.status===200});
 const b=http.get(base+'/api/dashboard',{headers,tags:{endpoint:'resumen'}});check(b,{'resumen HTTP 200':r=>r.status===200});sleep(1);
}
export function handleSummary(data){return {'qa/evidencias/carga-k6.json':JSON.stringify({executedAt:new Date().toISOString(),target:base,profile:'0→50 en 1m; 50 VU por 5m; 50→0 en 30s',...data},null,2),stdout:JSON.stringify(data.metrics,null,2)+'\n'};}
