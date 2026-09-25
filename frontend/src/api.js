const base=(import.meta.env.VITE_API_URL || '').replace(/\/$/,'');
export async function api(path,{token,method='GET',body}={}) {
 const res=await fetch(base+'/api'+path,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const data=await res.json();if(!res.ok){const e=new Error(data.message||'No fue posible completar la operación.');e.status=res.status;throw e;}return data;
}
