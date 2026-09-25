import {mkdir,writeFile} from 'node:fs/promises';
const base=(process.env.SONAR_HOST_URL||'http://localhost:9000').replace(/\/$/,'');
const key=process.env.SONAR_PROJECT_KEY||'reservalab-dev';const phase=process.argv[2]||'actual';
if(!['inicial','final','actual'].includes(phase))throw new Error('Usa inicial, final o actual.');
if(!process.env.SONAR_TOKEN)throw new Error('Falta SONAR_TOKEN.');
const headers={Authorization:'Bearer '+process.env.SONAR_TOKEN};
async function get(path){const r=await fetch(base+path,{headers});if(!r.ok)throw new Error('Sonar HTTP '+r.status);return r.json();}
const measures=await get('/api/measures/component?component='+encodeURIComponent(key)+'&metricKeys=bugs,vulnerabilities,code_smells,duplicated_lines_density,sqale_index,coverage');
const gate=await get('/api/qualitygates/project_status?projectKey='+encodeURIComponent(key));
let issues=[],page=1,total=Infinity;
while(issues.length<total){const x=await get('/api/issues/search?componentKeys='+encodeURIComponent(key)+'&severities=BLOCKER,CRITICAL&resolved=false&ps=500&p='+page++);issues.push(...(x.issues||[]));total=x.total??x.paging?.total??issues.length;if(!x.issues?.length)break;}
await mkdir('qa/evidencias/sonar',{recursive:true});await writeFile(`qa/evidencias/sonar/${phase}.json`,JSON.stringify({projectKey:key,exportedAt:new Date().toISOString(),measures,gate,openBlockerCritical:issues},null,2));
console.log('Evidencia Sonar exportada: '+phase);
