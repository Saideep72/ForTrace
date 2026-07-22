import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import DocumentsDashboard from './pages/DocumentsDashboard';
import AIChat from './pages/AIChat';
import NetworkAnalysis from './pages/NetworkAnalysis';
import ReportsAudit from './pages/ReportsAudit';
import ExpertAdvice from './pages/ExpertAdvice';
import HeaderBar from './components/HeaderBar';
import { getUserRole, hasAccess } from './utils';

// Shared layout component wrapping all authenticated dashboard sections
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f0f0f0]">
      <HeaderBar />
      <main className="flex-grow w-full bg-transparent relative">
        {children}
      </main>
    </div>
  );
};

// Route security guard enforcing JWT logins and RBAC claims
const ProtectedRoute = ({ viewName, children }) => {
  const role = getUserRole();
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  
  if (!hasAccess(viewName)) {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Unauthenticated authentication routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Authenticated section-wise pages */}
        <Route path="/home" element={
          <ProtectedRoute viewName="Dashboard">
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/documents" element={
          <ProtectedRoute viewName="Documents Dashboard">
            <Layout>
              <DocumentsDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/ai" element={
          <ProtectedRoute viewName="AI Agent Chat">
            <Layout>
              <AIChat />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/network" element={
          <ProtectedRoute viewName="Network Analysis">
            <Layout>
              <NetworkAnalysis />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute viewName="Reports & Audit">
            <Layout>
              <ReportsAudit />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/expert-advice" element={
          <ProtectedRoute viewName="Expert Advice">
            <Layout>
              <ExpertAdvice />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Global route fallbacks */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
