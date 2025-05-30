import React, { useState, useEffect } from "react";
import { Form, Button, Card, Alert, Container } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Perfil = () => {
  const [user, setUser] = useState({ nombre: "", email: "", telefono: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false); // Estado para controlar el modo edición
  const loggedUser = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedUser || !loggedUser.id_usuario) {
      setError("Usuario no autenticado. Serás redirigido al login.");
      setTimeout(() => navigate("/"), 3000);
      return;
    }

    // Cargar datos del perfil al iniciar
    axios
      .get(`http://localhost:3001/api/perfil/${loggedUser.id_usuario}`)
      .then((response) => {
        setUser({
          nombre: response.data.nombre || "",
          email: response.data.email || "",
          telefono: response.data.telefono || "",
        });
      })
      .catch((error) => {
        console.error("Error al cargar el perfil:", error);
        setError(
          "No se pudo cargar el perfil. Verifica que el servidor esté activo."
        );
      });
  }, [loggedUser, navigate]);

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!loggedUser || !loggedUser.id_usuario) {
      setError("Usuario no autenticado.");
      return;
    }
    axios
      .put(`http://localhost:3001/api/perfil/${loggedUser.id_usuario}`, user)
      .then(() => {
        setSuccess("Perfil actualizado con éxito");
        localStorage.setItem(
          "user",
          JSON.stringify({ ...loggedUser, ...user })
        );
        setIsEditing(false); // Desactivar el modo edición tras guardar
        setTimeout(() => setSuccess(""), 3000);
      })
      .catch((error) => {
        console.error("Error al actualizar el perfil:", error);
        setError("Error al actualizar el perfil.");
      });
  };

  const handleEdit = () => {
    setIsEditing(true); // Activar el modo edición
  };

  const handleCancel = () => {
    // Restaurar los datos originales y desactivar el modo edición
    axios
      .get(`http://localhost:3001/api/perfil/${loggedUser.id_usuario}`)
      .then((response) => {
        setUser({
          nombre: response.data.nombre || "",
          email: response.data.email || "",
          telefono: response.data.telefono || "",
        });
        setIsEditing(false);
      })
      .catch((error) => {
        console.error("Error al cargar el perfil:", error);
        setError("Error al cargar el perfil original.");
      });
  };

  if (error && error.includes("Usuario no autenticado")) {
    return (
      <Alert variant="danger" className="text-center">
        {error}
      </Alert>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="text-center mb-4">Mi Perfil</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleUpdate}>
            <Form.Group className="mb-3" controlId="formNombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={user.nombre}
                onChange={(e) => setUser({ ...user, nombre: e.target.value })}
                required
                disabled={!isEditing} // Habilitar campo solo en modo edición
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                required
                disabled={!isEditing} // Habilitar campo solo en modo edición
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formTelefono">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                value={user.telefono}
                onChange={(e) => setUser({ ...user, telefono: e.target.value })}
                disabled={!isEditing} // Habilitar campo solo en modo edición
              />
            </Form.Group>
            {isEditing ? (
              <>
                <Button variant="primary" type="submit" className="w-100 mb-2">
                  <i className="fas fa-save me-1"></i> Guardar Cambios
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  className="w-100"
                >
                  <i className="fas fa-times me-1"></i> Cancelar
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                onClick={handleEdit}
                className="w-100"
              >
                <i className="fas fa-edit me-1"></i> Editar
              </Button>
            )}
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Perfil;
