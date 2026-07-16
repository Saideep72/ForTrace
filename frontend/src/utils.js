/**
 * Shared utility functions
 */

export async function apiFetch(path, {method='GET', body=null, params={}}={}){
  const token = localStorage.getItem('access_token');
  const url = new URL(`http://127.0.0.1:8000/api/v1/${path}`);
  
  Object.entries(params).forEach(([k,v])=>url.searchParams.append(k,v));
  
  const opts = {method, headers:{'Authorization':`Bearer ${token}`} };
  
  if(body){
    if(body instanceof FormData){
      opts.body = body;
    } else {
      opts.headers['Content-Type']='application/json';
      opts.body = JSON.stringify(body);
    }
  }
  
  const resp = await fetch(url, opts);
  if(!resp.ok){
    const err = await resp.json().catch(() => ({ detail: resp.statusText }));
    throw new Error(err.detail || resp.statusText);
  }
  return resp.json();
}

export function getUserRole(){
  const token = localStorage.getItem('access_token');
  if(!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch (e) {
    return null;
  }
}
