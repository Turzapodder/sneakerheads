import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

export default function ProtectedRoute({ children }: any) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <div>Loading...</div>;

  if (!isSignedIn) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}
