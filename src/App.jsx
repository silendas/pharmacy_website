import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { BarangKeluar } from "./pages/dashboard";

function App() {
  const isAuthenticated = () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  };
  

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/auth/sign-in" replace />;
    }
    return children;
  };

  return (
    <Routes>
      <Route path="/auth/*" element={<Auth />} />
      <Route path="/custumer" element={<Dashboard />} />
    
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
    </Routes>
  );
}

export default App;