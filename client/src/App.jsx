import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import Login from './pages/Login';
import ChatDashboard from './pages/ChatDashboard';
import Register from './pages/Register';

const ProtectedRoute = ({ children }) => {
  const {isAuthenticated, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Načítání aplikace...</div>;

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Veřejná cesta pro přihlášení */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          
          {/* Změnil jsem hlavní cestu na /chat*/}
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <ChatDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Přesměrování z / rovnou na /chat */}
          <Route path="/" element={<Navigate to="/chat" />} />

          {/* Cokoliv jiného hodí zpátky na login (nebo ukáže 404) */}
          <Route path="*" element={<Navigate to="/auth/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App