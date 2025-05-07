import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/unauth-page" />;
  }

  if (location.pathname.includes("admin") && user?.role !== "admin") {
    return <Navigate to="/unauth-page" />;
  }

  return children;
}

export default CheckAuth;
