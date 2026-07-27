import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Auth_Login from './Auth/Auth_Login';
import Auth_Register from './Auth/Auth_Register';
import Auth_Forgot from './Auth/Auth_Forgot';
import Auth_Dashboard from './Auth/Auth_Dashboard';
import Project from './Auth/Project';
import Sidebar from './Auth/Sidebar'; 
import WorkCanvas from './Auth/WorkCanvas'; 

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {

    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppLayout() {
  const location = useLocation();
  

  const hideSidebar = ['/login', '/register', '/forgot-password', '/'].includes(location.pathname);

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      {!hideSidebar && <Sidebar />}
      
      <main className={`flex-1 ${!hideSidebar ? 'ml-64' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Auth_Login />} />
          <Route path="/register" element={<Auth_Register />} />
          <Route path="/forgot-password" element={<Auth_Forgot />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Auth_Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/project/:id?" element={
            <ProtectedRoute>
              <Project />
            </ProtectedRoute>
          } />
          
          <Route path="/workspace/:id" element={
            <ProtectedRoute>
              <WorkCanvas />
            </ProtectedRoute>
          } />
          
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;