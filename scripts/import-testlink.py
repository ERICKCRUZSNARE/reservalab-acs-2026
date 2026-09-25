"""Publica resultados locales existentes. No los ejecuta ni inventa resultados en TestLink."""
import os,json,sys,xmlrpc.client
from pathlib import Path
required=['TESTLINK_URL','TESTLINK_DEVKEY','TESTLINK_PROJECT','TESTLINK_PLAN_ID','TESTLINK_BUILD']
missing=[k for k in required if not os.environ.get(k)]
if missing:raise SystemExit('Faltan variables: '+', '.join(missing))
evidence=Path(sys.argv[1] if len(sys.argv)>1 else 'qa/evidencias/funcionales.json')
data=json.loads(evidence.read_text(encoding='utf8'))
api=xmlrpc.client.ServerProxy(os.environ['TESTLINK_URL'],allow_none=True)
results=[]
for case in data['results']:
 name=case['id']+' - '+case['title']
 found=api.tl.getTestCaseIDByName({'devKey':os.environ['TESTLINK_DEVKEY'],'testcasename':name,'testprojectname':os.environ['TESTLINK_PROJECT']})
 if not isinstance(found,list) or len(found)!=1 or 'id' not in found[0]:raise SystemExit('Caso no encontrado o ambiguo: '+name)
 result=api.tl.reportTCResult({'devKey':os.environ['TESTLINK_DEVKEY'],'testcaseid':int(found[0]['id']),'testplanid':int(os.environ['TESTLINK_PLAN_ID']),'buildname':os.environ['TESTLINK_BUILD'],'status':'p' if case['outcome']=='Aprobado' else 'f','notes':f"Ejecución local importada; fecha {case['executed_at']}; commit {data['commit']}; caso {case['id']}; detalle en {evidence.name}. "+(case.get('error') or ''),'overwrite':False})
 if not isinstance(result,list) or not result or not result[0].get('status'):raise SystemExit('TestLink rechazó el resultado de '+name)
 results.append({'case':case['id'],'testlink':result})
 print(case['id'],'registrado')
Path('qa/evidencias/testlink-importacion.json').write_text(json.dumps(results,indent=2),encoding='utf8')
