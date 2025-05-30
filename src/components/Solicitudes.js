import React, { useState, useEffect } from "react";
import { Card, ListGroup, Spinner, Alert } from "react-bootstrap";
import axios from "axios";

const Solicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adoptedMessage, setAdoptedMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user) {
      axios
        .get(`http://localhost:3001/api/solicitudes/${user.id_usuario}`)
        .then((response) => {
          setSolicitudes(response.data);
          setLoading(false);
          const adopted = response.data.find((s) => s.estado === "Aprobada");
          if (
            adopted &&
            !sessionStorage.getItem(`adopted_${adopted.id_solicitud}`)
          ) {
            setAdoptedMessage(
              `¡Felicidades! Has adoptado a ${adopted.mascota}.`
            );
            sessionStorage.setItem(`adopted_${adopted.id_solicitud}`, "true");
            setTimeout(() => setAdoptedMessage(""), 5000);
          }
        })
        .catch((error) => {
          console.error("Error al obtener solicitudes:", error);
          setError(
            "No se pudieron cargar las solicitudes. Verifica que el servidor esté activo."
          );
          setLoading(false);
        });
    } else {
      setError("Usuario no autenticado. Inicia sesión nuevamente.");
      setLoading(false);
    }
  }, [user]);

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
      <h2 className="text-center mb-4">Mis Solicitudes</h2>
      {adoptedMessage && (
        <Alert variant="success" className="text-center">
          {adoptedMessage}
        </Alert>
      )}
      {solicitudes.length > 0 ? (
        <Card>
          <Card.Body>
            <ListGroup variant="flush">
              {solicitudes.map((solicitud) => (
                <ListGroup.Item key={solicitud.id_solicitud} className="mb-2">
                  <div className="d-flex align-items-center">
                    <i
                      className={`fas fa-${
                        solicitud.estado === "Aprobada"
                          ? "check-circle text-success"
                          : solicitud.estado === "Rechazada"
                          ? "times-circle text-danger"
                          : "hourglass-half text-warning"
                      } me-3`}
                    ></i>
                    <div>
                      <h5>{solicitud.mascota}</h5>
                      <p className="text-muted mb-0">
                        <strong>Fecha:</strong>{" "}
                        {new Date(
                          solicitud.fecha_solicitud
                        ).toLocaleDateString()}
                        <br />
                        <strong>Estado:</strong> {solicitud.estado}
                        <br />
                        <strong>Comentario:</strong>{" "}
                        {solicitud.comentario || "Sin comentarios"}
                      </p>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      ) : (
        <p className="text-center text-muted">
          No tienes solicitudes en este momento.
        </p>
      )}
    </div>
  );
};

export default Solicitudes;
