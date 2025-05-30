import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Spinner,
  Tabs,
  Tab,
  Modal,
  Form,
  Alert,
} from "react-bootstrap";
import axios from "axios";

const AdminPanel = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [auditorias, setAuditorias] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [refugios, setRefugios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedMascota, setSelectedMascota] = useState({
    id_mascota: "",
    nombre: "",
    especie: "",
    raza: "",
    edad: "",
    id_refugio: "",
    estado: "Disponible",
  });
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user && user.rol === "Administrador") {
      console.log("Cargando datos para el administrador...");
      let isMounted = true;

      const fetchData = async () => {
        try {
          const [solicitudesResp, auditoriasResp, mascotasResp, refugiosResp] =
            await Promise.all([
              axios.get("http://localhost:3001/api/solicitudes-admin"),
              axios.get("http://localhost:3001/api/auditoria-admin"),
              axios.get("http://localhost:3001/api/mascotas"),
              axios.get("http://localhost:3001/api/refugios").catch((err) => {
                console.error("Error al obtener refugios:", err);
                return { data: [] }; // Devuelve un array vacío si falla
              }),
            ]);

          if (isMounted) {
            console.log("Solicitudes recibidas:", solicitudesResp.data);
            console.log("Auditorías recibidas:", auditoriasResp.data);
            console.log("Mascotas recibidas:", mascotasResp.data);
            console.log("Refugios recibidos:", refugiosResp.data);
            setSolicitudes(solicitudesResp.data);
            setAuditorias(auditoriasResp.data);
            setMascotas(mascotasResp.data);
            setRefugios(refugiosResp.data);
            setLoading(false);
          }
        } catch (error) {
          console.error(
            "Error general al obtener datos:",
            error.response ? error.response.data : error.message
          );
          if (isMounted) {
            setError(
              "No se pudieron cargar algunos datos. Verifica que el servidor esté activo en http://localhost:3001. Detalle: " +
                (error.response ? error.response.data : error.message)
            );
            setLoading(false);
          }
        }
      };

      fetchData();

      return () => {
        isMounted = false;
      };
    } else {
      setLoading(false);
      setError("No tienes permisos de administrador o no estás autenticado.");
    }
  }, [user]);

  const handleApprove = (id_solicitud) => {
    axios
      .put(`http://localhost:3001/api/solicitudes/${id_solicitud}`, {
        estado: "Aprobada",
        comentario: "Aprobada por el administrador",
      })
      .then(() => {
        setSolicitudes(
          solicitudes.map((s) =>
            s.id_solicitud === id_solicitud
              ? {
                  ...s,
                  estado: "Aprobada",
                  comentario: "Aprobada por el administrador",
                }
              : s
          )
        );
        axios
          .post("http://localhost:3001/api/auditoria", {
            id_solicitud,
            id_usuario: user.id_usuario,
            accion: "Aprobación",
            detalle: `Solicitud aprobada por ${user.email}`,
          })
          .then(() => {
            axios
              .get("http://localhost:3001/api/auditoria-admin")
              .then((response) => {
                console.log("Auditorías actualizadas:", response.data);
                setAuditorias(response.data);
              });
          });
        axios.get("http://localhost:3001/api/mascotas").then((response) => {
          console.log("Mascotas actualizadas:", response.data);
          setMascotas(response.data);
        });
      })
      .catch((error) => {
        console.error("Error al aprobar:", error);
        setError("Error al aprobar la solicitud.");
      });
  };

  const handleReject = (id_solicitud) => {
    axios
      .put(`http://localhost:3001/api/solicitudes/${id_solicitud}`, {
        estado: "Rechazada",
        comentario: "Rechazada por el administrador",
      })
      .then(() => {
        setSolicitudes(
          solicitudes.map((s) =>
            s.id_solicitud === id_solicitud
              ? {
                  ...s,
                  estado: "Rechazada",
                  comentario: "Rechazada por el administrador",
                }
              : s
          )
        );
        axios
          .post("http://localhost:3001/api/auditoria", {
            id_solicitud,
            id_usuario: user.id_usuario,
            accion: "Rechazo",
            detalle: `Solicitud rechazada por ${user.email}`,
          })
          .then(() => {
            axios
              .get("http://localhost:3001/api/auditoria-admin")
              .then((response) => {
                console.log("Auditorías actualizadas:", response.data);
                setAuditorias(response.data);
              });
          });
      })
      .catch((error) => {
        console.error("Error al rechazar:", error);
        setError("Error al rechazar la solicitud.");
      });
  };

  const handleAddMascota = () => {
    setModalType("add");
    setSelectedMascota({
      id_mascota: "",
      nombre: "",
      especie: "",
      raza: "",
      edad: "",
      id_refugio: refugios.length > 0 ? refugios[0].id_refugio : "",
      estado: "Disponible",
    });
    setShowModal(true);
  };

  const handleEditMascota = (mascota) => {
    setModalType("edit");
    setSelectedMascota({
      ...mascota,
      id_refugio:
        mascota.id_refugio ||
        (refugios.length > 0 ? refugios[0].id_refugio : ""),
    });
    setShowModal(true);
  };

  const handleDeleteMascota = (id_mascota) => {
    if (window.confirm("¿Estás seguro de eliminar esta mascota?")) {
      axios
        .delete("http://localhost:3001/api/mascotas", { data: { id_mascota } })
        .then(() => {
          setMascotas(mascotas.filter((m) => m.id_mascota !== id_mascota));
        })
        .catch((error) => {
          console.error("Error al eliminar:", error);
          setError("Error al eliminar la mascota.");
        });
    }
  };

  const handleSaveMascota = () => {
    if (modalType === "add") {
      axios
        .post("http://localhost:3001/api/mascotas", selectedMascota)
        .then(() => {
          axios.get("http://localhost:3001/api/mascotas").then((response) => {
            console.log(
              "Mascotas actualizadas después de agregar:",
              response.data
            );
            setMascotas(response.data);
          });
          setShowModal(false);
        })
        .catch((error) => {
          console.error("Error al agregar mascota:", error);
          setError("Error al agregar la mascota.");
        });
    } else if (modalType === "edit") {
      axios
        .put("http://localhost:3001/api/mascotas", selectedMascota)
        .then(() => {
          axios.get("http://localhost:3001/api/mascotas").then((response) => {
            console.log(
              "Mascotas actualizadas después de editar:",
              response.data
            );
            setMascotas(response.data);
          });
          setShowModal(false);
        })
        .catch((error) => {
          console.error("Error al editar mascota:", error);
          setError("Error al editar la mascota.");
        });
    }
  };

  if (loading)
    return <Spinner animation="border" className="d-block mx-auto my-5" />;
  if (user && user.rol !== "Administrador") {
    return (
      <p className="text-center text-danger">
        No tienes permisos de administrador.
      </p>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Panel de Administración</h2>
      {error && (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      )}
      <Tabs defaultActiveKey="mascotas" id="admin-tabs" className="mb-4">
        <Tab eventKey="mascotas" title="Mascotas">
          <Button variant="primary" className="mb-3" onClick={handleAddMascota}>
            <i className="fas fa-plus me-1"></i> Agregar Mascota
          </Button>
          {mascotas.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Especie</th>
                  <th>Raza</th>
                  <th>Edad</th>
                  <th>Refugio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mascotas.map((mascota) => (
                  <tr key={mascota.id_mascota}>
                    <td>{mascota.id_mascota}</td>
                    <td>{mascota.nombre}</td>
                    <td>{mascota.especie}</td>
                    <td>{mascota.raza || "N/A"}</td>
                    <td>{mascota.edad}</td>
                    <td>
                      {refugios.find((r) => r.id_refugio === mascota.id_refugio)
                        ?.nombre || "Sin refugio"}
                    </td>
                    <td>
                      <Button
                        variant="warning"
                        className="me-2"
                        onClick={() => handleEditMascota(mascota)}
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteMascota(mascota.id_mascota)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-center text-muted">
              No hay mascotas registradas.
            </p>
          )}
        </Tab>
        <Tab eventKey="solicitudes" title="Solicitudes">
          {solicitudes.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mascota</th>
                  <th>Usuario</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Comentario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((solicitud) => (
                  <tr key={solicitud.id_solicitud}>
                    <td>{solicitud.id_solicitud}</td>
                    <td>{solicitud.mascota}</td>
                    <td>{solicitud.usuario}</td>
                    <td>
                      {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                    </td>
                    <td>{solicitud.estado}</td>
                    <td>{solicitud.comentario || "N/A"}</td>
                    {solicitud.estado === "Pendiente" && (
                      <td>
                        <Button
                          variant="success"
                          className="me-2"
                          onClick={() => handleApprove(solicitud.id_solicitud)}
                        >
                          <i className="fas fa-check"></i> Aprobar
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleReject(solicitud.id_solicitud)}
                        >
                          <i className="fas fa-times"></i> Rechazar
                        </Button>
                      </td>
                    )}
                    {solicitud.estado !== "Pendiente" && <td>N/A</td>}
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-center text-muted">
              No hay solicitudes registradas.
            </p>
          )}
        </Tab>
        <Tab eventKey="auditorias" title="Auditorías">
          {auditorias.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Acción</th>
                  <th>Usuario</th>
                  <th>Fecha</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                {auditorias.map((auditoria) => (
                  <tr key={auditoria.id_auditoria}>
                    <td>{auditoria.id_auditoria}</td>
                    <td>{auditoria.accion}</td>
                    <td>{auditoria.usuario || "Desconocido"}</td>
                    <td>
                      {new Date(auditoria.fecha_accion).toLocaleDateString()}
                    </td>
                    <td>{auditoria.detalle || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-center text-muted">
              No hay registros de auditoría.
            </p>
          )}
        </Tab>
      </Tabs>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "add" ? "Agregar Mascota" : "Editar Mascota"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formNombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={selectedMascota.nombre}
                onChange={(e) =>
                  setSelectedMascota({
                    ...selectedMascota,
                    nombre: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formEspecie">
              <Form.Label>Especie</Form.Label>
              <Form.Control
                type="text"
                value={selectedMascota.especie}
                onChange={(e) =>
                  setSelectedMascota({
                    ...selectedMascota,
                    especie: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formRaza">
              <Form.Label>Raza</Form.Label>
              <Form.Control
                type="text"
                value={selectedMascota.raza || ""}
                onChange={(e) =>
                  setSelectedMascota({
                    ...selectedMascota,
                    raza: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formEdad">
              <Form.Label>Edad</Form.Label>
              <Form.Control
                type="number"
                value={selectedMascota.edad}
                onChange={(e) =>
                  setSelectedMascota({
                    ...selectedMascota,
                    edad: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formRefugio">
              <Form.Label>Refugio</Form.Label>
              <Form.Control
                as="select"
                value={selectedMascota.id_refugio}
                onChange={(e) =>
                  setSelectedMascota({
                    ...selectedMascota,
                    id_refugio: e.target.value,
                  })
                }
                required
              >
                {refugios.length > 0 ? (
                  refugios.map((refugio) => (
                    <option key={refugio.id_refugio} value={refugio.id_refugio}>
                      {refugio.nombre}
                    </option>
                  ))
                ) : (
                  <option value="">No hay refugios disponibles</option>
                )}
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formEstado">
              <Form.Label>Estado</Form.Label>
              <Form.Control
                as="select"
                value={selectedMascota.estado}
                onChange={(e) =>
                  setSelectedMascota({
                    ...selectedMascota,
                    estado: e.target.value,
                  })
                }
              >
                <option value="Disponible">Disponible</option>
                <option value="Adoptado">Adoptado</option>
                <option value="En Proceso">En Proceso</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveMascota}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminPanel;
