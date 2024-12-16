const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/auth/sign-in" replace />;
    }
  
    const userRole = getUserRole(); // Mendapatkan role pengguna dari localStorage atau state
  
    // Cek apakah role pengguna diizinkan
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  
    return children;
  };
  