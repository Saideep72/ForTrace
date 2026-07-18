import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NetworkAnalysis from './pages/NetworkAnalysis';
import AIChat from './pages/AIChat';
import Settings from './pages/Settings';
import OperationsCenter from './pages/OperationsCenter';
import { getUserRole, checkAccess } from './utils';

const ProtectedRoute = ({ viewName, children }) => {
  const role = getUserRole();
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  
  if (!checkAccess(viewName)) {
    if (viewName === 'Dashboard') {
      // Prevent infinite loop if they don't even have access to Dashboard
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--c-text)' }}>
          <h2>Access Denied</h2>
          <p>You do not have permissions to view this page. Please <a href="/login" style={{ color: 'var(--c-primary)' }}>login with a different account</a>.</p>
        </div>
      );
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute viewName="Dashboard">
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/network" element={
          <ProtectedRoute viewName="NetworkAnalysis">
            <NetworkAnalysis />
          </ProtectedRoute>
        } />
        
        <Route path="/ai" element={
          <ProtectedRoute viewName="AIChat">
            <AIChat />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute viewName="SystemConsole">
            <Settings />
          </ProtectedRoute>
        } />
        
        <Route path="/operations" element={
          <ProtectedRoute viewName="OperationsCenter">
            <OperationsCenter />
          </ProtectedRoute>
        } />
        
        {/* Legacy routes mapped to operations safely guarded */}
        <Route path="/assets" element={<Navigate to="/operations" replace />} />
        <Route path="/documents" element={<Navigate to="/operations" replace />} />
        <Route path="/reports" element={<Navigate to="/operations" replace />} />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
