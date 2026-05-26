import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import Login from './pages/Login';
import ChatDashboard from './pages/ChatDashboard';

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
          <Route path="/login" element={<Login />} />
          
          {/* Změnil jsem hlavní cestu na /chat*/}
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <ChatDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Přesměrování z kořene (/) rovnou na /chat */}
          <Route path="/" element={<Navigate to="/chat" />} />

          {/* ZÁCHYTNÁ SÍŤ: Cokoliv jiného hodí zpět na login (nebo ukáže 404) */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App