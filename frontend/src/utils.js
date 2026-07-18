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

/**
 * Extracts and safely maps the user role from the Supabase JWT payload.
 */
export function getUserRole(){
  const token = localStorage.getItem('access_token');
  if(!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Safely check common Supabase JWT locations for the role claim
    return payload?.app_metadata?.role || payload?.user_metadata?.role || payload?.role || null;
  } catch (e) {
    return null;
  }
}

/**
 * Role-Based Access Control Visibility Matrix
 */
export const RBAC_MAP = {
  Plant_Manager: ['Dashboard', 'OperationsCenter', 'NetworkAnalysis', 'FailureTable', 'CausalGraph', 'SystemConsole', 'AIChat', 'Documents'],
  Maintenance_Engineer: ['Dashboard', 'OperationsCenter', 'NetworkAnalysis', 'FailureTable', 'CausalGraph', 'SystemConsole', 'AIChat', 'Documents'],
  Admin: ['Dashboard', 'OperationsCenter', 'NetworkAnalysis', 'FailureTable', 'CausalGraph', 'SystemConsole', 'AIChat', 'Documents'],
  Field_Technician: ['Dashboard', 'OperationsCenter', 'NetworkAnalysis', 'FailureTable', 'CausalGraph', 'AIChat'],
  Auditor: ['Dashboard', 'OperationsCenter', 'NetworkAnalysis', 'FailureTable', 'CausalGraph']
};

/**
 * Verifies if the current user has access to a specific view based on their role.
 */
export function checkAccess(viewName) {
  const role = getUserRole();
  if (!role || !RBAC_MAP[role]) return false;
  return RBAC_MAP[role].includes(viewName);
}
