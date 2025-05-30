import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Spinner, Alert } from "react-bootstrap";
import axios from "axios";

const Mascotas = () => {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/mascotas-disponibles")
      .then((response) => {
        setMascotas(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener mascotas:", error);
        setError(
          "No se pudieron cargar las mascotas. Verifica que el servidor esté activo."
        );
        setLoading(false);
      });
  }, []);

  const handleAdoptionRequest = (id_mascota) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      axios
        .post("http://localhost:3001/api/solicitudes", {
          id_mascota,
          id_usuario: user.id_usuario,
        })
        .then(() => {
          alert("Solicitud enviada con éxito");
          setMascotas(mascotas.filter((m) => m.id_mascota !== id_mascota));
        })
        .catch((error) => {
          console.error("Error al enviar solicitud:", error);
          alert("Error al enviar la solicitud");
        });
    }
  };

  if (loading)
    return <Spinner animation="border" className="d-block mx-auto my-5" />;
  if (error)
    return (
      <Alert variant="danger" className="text-center">
        {error}
      </Alert>
    );

  return (
    <div>
      <h2 className="text-center mb-4">Mascotas Disponibles</h2>
      <Row className="g-4">
        {mascotas.length > 0 ? (
          mascotas.map((mascota) => (
            <Col md={4} key={mascota.id_mascota}>
              <Card className="h-100">
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <div className="text-center mb-3">
                      <i
                        className={`fas ${
                          mascota.especie === "Perro" ? "fa-dog" : "fa-cat"
                        } fa-3x text-primary`}
                      ></i>
                    </div>
                    <Card.Title className="text-center">
                      {mascota.mascota}
                    </Card.Title>
                    <ul className="list-unstyled">
                      <li>
                        <strong>Especie:</strong> {mascota.especie}
                      </li>
                      <li>
                        <strong>Raza:</strong> {mascota.raza}
                      </li>
                      <li>
                        <strong>Edad:</strong> {mascota.edad} años
                      </li>
                      <li>
                        <strong>Refugio:</strong> {mascota.refugio}
                      </li>
                    </ul>
                  </div>
                  <Button
                    variant="success"
                    className="w-100 mt-3"
                    onClick={() => handleAdoptionRequest(mascota.id_mascota)}
                  >
                    <i className="fas fa-heart me-1"></i> Solicitar Adopción
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p className="text-center text-muted">
            No hay mascotas disponibles en este momento.
          </p>
        )}
      </Row>
    </div>
  );
};

export default Mascotas;
