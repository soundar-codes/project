import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout    from './components/Layout';
import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects  from './pages/Projects';
import Analytics from './pages/Analytics';
import Builder   from './pages/Builder';

const isAuth = () => !!localStorage.getItem('ucp_token');

const Protected = ({ children }) =>
  isAuth() ? children : <Navigate to="/login" replace />;

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#12122a', color: '#f0f0ff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '13px' }
      }}/>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Protected><Layout /></Protected>}>
          <Route index                    element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"         element={<Dashboard />} />
          <Route path="projects"          element={<Projects />} />
          <Route path="analytics"         element={<Analytics />} />
          <Route path="builder"           element={<Builder />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
