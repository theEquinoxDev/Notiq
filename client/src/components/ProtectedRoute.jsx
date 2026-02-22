import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-bg">
        <Spinner size="md" />
      </div>
    );
  }

  return token ? children : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
