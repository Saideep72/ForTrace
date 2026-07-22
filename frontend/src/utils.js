/**
 * Shared utility functions and global state buffers
 */

// Centralized API response log buffer for the System Console
export const apiLogs = [];
const maxLogSize = 100;

export function addApiLog(title, data) {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] === ${title} ===\n${JSON.stringify(data, null, 2)}\n\n`;
  apiLogs.unshift(logEntry); // Add to the top of logs console
  if (apiLogs.length > maxLogSize) {
    apiLogs.pop();
  }
  // Trigger a custom event to notify SystemConsole to re-render if active
  window.dispatchEvent(new CustomEvent('ft-new-api-log'));
}

export async function apiFetch(path, { method = 'GET', body = null, params = {}, headers = {} } = {}) {
  const token = localStorage.getItem('access_token');
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const url = new URL(`${apiBase}/api/v1/${path}`);
  
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.append(k, v);
    }
  });
  
  const opts = {
    method,
    headers: { ...headers }
  };
  
  if (token) {
    opts.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (body) {
    if (body instanceof FormData) {
      opts.body = body; // Browser sets Content-Type boundary automatically
    } else if (body instanceof URLSearchParams) {
      opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      opts.body = body;
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
  }
  
  try {
    const resp = await fetch(url, opts);
    
    if (resp.status === 401) {
      handleLogout("Your authentication session has expired. Please log in again.");
      throw new Error("Unauthorized");
    }
    
    // Check if it's a blob (for PDF report download)
    const contentType = resp.headers.get('content-type') || '';
    if (contentType.includes('application/pdf')) {
      const blob = await resp.blob();
      addApiLog(`${method} ${path} (PDF Received)`, { sizeBytes: blob.size });
      return blob;
    }
    
    const data = await resp.json().catch(() => ({}));
    
    if (!resp.ok) {
      const errMsg = data.detail || resp.statusText;
      addApiLog(`${method} ${path} (FAILED - HTTP ${resp.status})`, data);
      throw new Error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    }
    
    addApiLog(`${method} ${path} (HTTP ${resp.status})`, data);
    return data;
  } catch (err) {
    if (err.message !== "Unauthorized") {
      addApiLog(`${method} ${path} (Connection Error)`, { error: err.message });
    }
    throw err;
  }
}

export function handleLogout(message = '') {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_role');
  
  if (message) {
    alert(message);
  }
  
  // Hard redirect to login screen
  window.location.href = '/login';
}

/**
 * Extracts and safely maps the user role from the Supabase JWT payload.
 */
export function getUserRole() {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Safely check common Supabase JWT locations for the role claim
    return payload?.role || payload?.user_metadata?.role || payload?.app_metadata?.role || '';
  } catch (e) {
    return localStorage.getItem('user_role') || '';
  }
}

/**
 * Role-Based Access Control Visibility Matrix
 * Maps roles to accessible view/component identifiers.
 */
export const RBAC_MAP = {
  Plant_Manager: ['Dashboard', 'Documents Dashboard', 'AI Agent Chat', 'Network Analysis', 'Reports & Audit', 'Expert Advice'],
  Maintenance_Engineer: ['Dashboard', 'Documents Dashboard', 'AI Agent Chat', 'Network Analysis'],
  Admin: ['Dashboard', 'Documents Dashboard', 'AI Agent Chat', 'Network Analysis', 'Reports & Audit', 'Expert Advice'],
  Field_Technician: ['Dashboard', 'AI Agent Chat', 'Network Analysis'],
  Auditor: ['Dashboard', 'Network Analysis', 'Reports & Audit'],
  Safety_Officer: ['Dashboard', 'AI Agent Chat', 'Network Analysis', 'Reports & Audit'],
  Expert_Engineer: ['Dashboard', 'AI Agent Chat', 'Network Analysis', 'Expert Advice']
};

/**
 * Verifies if the current user has access to a specific view based on their role.
 */
export function hasAccess(viewName) {
  const role = getUserRole();
  if (!role || !RBAC_MAP[role]) return false;
  return RBAC_MAP[role].includes(viewName);
}
