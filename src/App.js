import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import Login from "./components/Login";
import Mascotas from "./components/Mascotas";
import Solicitudes from "./components/Solicitudes";
import AdminPanel from "./components/AdminPanel";
import PrivateRoute from "./components/PrivateRoute";
import Perfil from "./components/Perfil";
import Registro from "./components/Registro";

function App() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user && window.location.pathname === "/") {
      navigate(user.rol === "Administrador" ? "/admin" : "/mascotas");
    }
  }, [user, navigate]);

  return (
    <div className="min-vh-100">
      <NavBar />
      <div className="container py-4">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Registro />} />
          <Route
            path="/mascotas"
            element={
              <PrivateRoute>
                <Mascotas />
              </PrivateRoute>
            }
          />
          <Route
            path="/solicitudes"
            element={
              <PrivateRoute>
                <Solicitudes />
              </PrivateRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <Perfil />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly>
                <AdminPanel />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
