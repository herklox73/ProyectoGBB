import React, { useState } from "react";
import { Form, Button, Card, Alert, Container } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/api/login", {
        email,
        password,
      });
      localStorage.setItem("user", JSON.stringify(response.data));
      const user = response.data;
      navigate(user.rol === "Administrador" ? "/admin" : "/mascotas");
    } catch (err) {
      setError("Error en el login. Verifica tus credenciales.");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card
        style={{ maxWidth: "400px", width: "100%", padding: "20px" }}
        className="shadow-sm"
      >
        <Card.Body>
          <div className="text-center mb-4">
            <i className="fas fa-paw fa-3x text-primary"></i>
            <h2 className="mt-2">Iniciar Sesión</h2>
            <p className="text-muted">Bienvenido a Adopción de Mascotas</p>
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu email"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              <i className="fas fa-sign-in-alt me-1"></i> Iniciar Sesión
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
