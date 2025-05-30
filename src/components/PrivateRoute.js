import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, adminOnly }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <Navigate to="/" />;
  if (adminOnly && user.rol !== "Administrador")
    return <Navigate to="/mascotas" />;
  return children;
};

export default PrivateRoute;
