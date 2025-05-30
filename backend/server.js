const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connection = require("./db"); // Asegúrate de que este archivo exista y esté configurado

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Puerto del frontend (ajústalo si usas otro puerto)
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send(
    "¡Backend de Adopción de Mascotas funcionando! - " +
      new Date().toLocaleString("es-ES", { timeZone: "America/Bogota" })
  );
});

// **Ruta para login**
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son requeridos" });
  }
  const query =
    "SELECT * FROM usuarios WHERE email = ? AND contraseña_hash = ?";
  connection.query(query, [email, password], (err, results) => {
    if (err) {
      console.error("Error al intentar iniciar sesión:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    console.log("Login exitoso para:", email);
    res.json({
      id_usuario: results[0].id_usuario,
      rol: results[0].rol,
      email: results[0].email,
      nombre: results[0].nombre,
      telefono: results[0].telefono,
    });
  });
});

// **Ruta para registrar un nuevo usuario**
app.post("/api/register", (req, res) => {
  const { nombre, email, telefono, password } = req.body;
  if (!nombre || !email || !password) {
    return res
      .status(400)
      .json({ error: "Nombre, email y contraseña son requeridos" });
  }
  const query =
    "INSERT INTO usuarios (nombre, email, telefono, contraseña_hash, rol) VALUES (?, ?, ?, ?, ?)";
  connection.query(
    query,
    [nombre, email, telefono || null, password, "Cliente"],
    (err, result) => {
      if (err) {
        console.error("Error al registrar usuario:", err);
        return res
          .status(500)
          .json({
            error:
              "Error al registrar usuario. El email ya puede estar en uso.",
          });
      }
      console.log("Usuario registrado con éxito:", nombre);
      res
        .status(201)
        .json({ message: "Usuario registrado con éxito", id: result.insertId });
    }
  );
});

// **Ruta para obtener mascotas disponibles (clientes)**
app.get("/api/mascotas-disponibles", (req, res) => {
  const query = "SELECT * FROM vista_mascotas_disponibles_clientes";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener mascotas disponibles:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    console.log("Mascotas disponibles enviadas:", results.length);
    res.json(results);
  });
});

// **Ruta para obtener todas las mascotas (admin)**
app.get("/api/mascotas", (req, res) => {
  const query = "SELECT * FROM mascotas";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener todas las mascotas:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    console.log("Mascotas enviadas:", results.length);
    res.json(results);
  });
});

// **Ruta para obtener todos los refugios**
app.get("/api/refugios", (req, res) => {
  const query = "SELECT id_refugio, nombre FROM refugios";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener refugios:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    console.log("Refugios enviados:", results.length);
    res.json(results);
  });
});

// **Ruta para agregar una nueva mascota**
app.post("/api/mascotas", (req, res) => {
  const { nombre, especie, raza, edad, id_refugio } = req.body;
  if (!nombre || !especie || !edad || !id_refugio) {
    return res
      .status(400)
      .json({ error: "Todos los campos requeridos deben estar presentes" });
  }
  const query =
    "INSERT INTO mascotas (nombre, especie, raza, edad, id_refugio) VALUES (?, ?, ?, ?, ?)";
  connection.query(
    query,
    [nombre, especie, raza || null, edad, id_refugio],
    (err, result) => {
      if (err) {
        console.error("Error al agregar mascota:", err);
        return res.status(500).json({ error: "Error al agregar mascota" });
      }
      console.log("Mascota agregada:", nombre);
      res
        .status(201)
        .json({ message: "Mascota agregada con éxito", id: result.insertId });
    }
  );
});

// **Ruta para editar una mascota**
app.put("/api/mascotas", (req, res) => {
  const { id_mascota, nombre, especie, raza, edad, id_refugio, estado } =
    req.body;
  if (!id_mascota || !nombre || !especie || !edad || !id_refugio) {
    return res
      .status(400)
      .json({ error: "Todos los campos requeridos deben estar presentes" });
  }
  const query =
    "UPDATE mascotas SET nombre = ?, especie = ?, raza = ?, edad = ?, id_refugio = ?, estado = ? WHERE id_mascota = ?";
  connection.query(
    query,
    [nombre, especie, raza || null, edad, id_refugio, estado, id_mascota],
    (err) => {
      if (err) {
        console.error("Error al editar mascota:", err);
        return res.status(500).json({ error: "Error al editar mascota" });
      }
      console.log("Mascota editada:", id_mascota);
      res.json({ message: "Mascota editada con éxito" });
    }
  );
});

// **Ruta para eliminar una mascota**
app.delete("/api/mascotas", (req, res) => {
  const { id_mascota } = req.body;
  if (!id_mascota) {
    return res.status(400).json({ error: "ID de mascota requerido" });
  }
  const query = "DELETE FROM mascotas WHERE id_mascota = ?";
  connection.query(query, [id_mascota], (err) => {
    if (err) {
      console.error("Error al eliminar mascota:", err);
      return res.status(500).json({ error: "Error al eliminar mascota" });
    }
    console.log("Mascota eliminada:", id_mascota);
    res.json({ message: "Mascota eliminada con éxito" });
  });
});

// **Ruta para obtener solicitudes de un cliente**
app.get("/api/solicitudes/:id_usuario", (req, res) => {
  const id_usuario = req.params.id_usuario;
  if (!id_usuario || isNaN(id_usuario)) {
    return res.status(400).json({ error: "ID inválido" });
  }
  const query = `
    SELECT s.id_solicitud, m.nombre AS mascota, s.fecha_solicitud, s.estado, s.comentario
    FROM solicitudes s
    JOIN mascotas m ON s.id_mascota = m.id_mascota
    WHERE s.id_usuario = ?
  `;
  connection.query(query, [id_usuario], (err, results) => {
    if (err) {
      console.error("Error al obtener solicitudes:", err);
      return res
        .status(500)
        .json({ error: "Error interno del servidor", details: err.message });
    }
    console.log(
      "Solicitudes enviadas para usuario:",
      id_usuario,
      results.length
    );
    res.json(results);
  });
});

// **Ruta para crear una solicitud**
app.post("/api/solicitudes", (req, res) => {
  const { id_mascota, id_usuario } = req.body;
  if (!id_mascota || !id_usuario) {
    return res.status(400).json({ error: "Datos inválidos" });
  }
  const query =
    "INSERT INTO solicitudes (id_mascota, id_usuario) VALUES (?, ?)";
  connection.query(query, [id_mascota, id_usuario], (err) => {
    if (err) {
      console.error("Error al crear solicitud:", err);
      return res.status(500).json({ error: "Error al crear solicitud" });
    }
    console.log("Solicitud creada para mascota:", id_mascota);
    res.json({ message: "Solicitud creada con éxito" });
  });
});

// **Ruta para obtener todas las solicitudes (admin)**
app.get("/api/solicitudes-admin", (req, res) => {
  const query = "SELECT * FROM vista_solicitudes_admin";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener solicitudes (admin):", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    console.log("Solicitudes (admin) enviadas:", results.length);
    res.json(results);
  });
});

// **Ruta para actualizar el estado de una solicitud (admin)**
app.put("/api/solicitudes/:id_solicitud", (req, res) => {
  const { estado, comentario } = req.body;
  const id_solicitud = req.params.id_solicitud;
  if (!estado || !["Pendiente", "Aprobada", "Rechazada"].includes(estado)) {
    return res.status(400).json({ error: "Estado inválido" });
  }
  const query =
    "UPDATE solicitudes SET estado = ?, comentario = ? WHERE id_solicitud = ?";
  connection.query(query, [estado, comentario || null, id_solicitud], (err) => {
    if (err) {
      console.error("Error al actualizar solicitud:", err);
      return res.status(500).json({ error: "Error al actualizar solicitud" });
    }
    if (estado === "Aprobada") {
      connection.query(
        "UPDATE mascotas SET estado = ? WHERE id_mascota = (SELECT id_mascota FROM solicitudes WHERE id_solicitud = ?)",
        ["Adoptado", id_solicitud],
        (err) => {
          if (err) console.error("Error al actualizar estado de mascota:", err);
        }
      );
    }
    console.log("Solicitud actualizada:", id_solicitud);
    res.json({ message: "Estado actualizado con éxito" });
  });
});

// **Ruta para crear una entrada de auditoría**
app.post("/api/auditoria", (req, res) => {
  const { id_solicitud, id_usuario, accion, detalle } = req.body;
  const query =
    "INSERT INTO auditoria_solicitudes (id_solicitud, id_usuario, accion, detalle) VALUES (?, ?, ?, ?)";
  connection.query(
    query,
    [id_solicitud, id_usuario, accion, detalle],
    (err) => {
      if (err) {
        console.error("Error al registrar auditoría:", err);
        return res.status(500).json({ error: "Error al registrar auditoría" });
      }
      console.log("Auditoría registrada para solicitud:", id_solicitud);
      res.json({ message: "Auditoría registrada con éxito" });
    }
  );
});

// **Ruta para obtener auditorías (admin)**
app.get("/api/auditoria-admin", (req, res) => {
  const query = "SELECT * FROM vista_auditoria_admin";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener auditorías:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    console.log("Auditorías enviadas:", results.length);
    res.json(results);
  });
});

// **Ruta para obtener perfil de usuario**
app.get("/api/perfil/:id_usuario", (req, res) => {
  const id_usuario = req.params.id_usuario;
  if (!id_usuario || isNaN(id_usuario)) {
    return res.status(400).json({ error: "ID inválido" });
  }
  const query =
    "SELECT id_usuario, nombre, email, telefono FROM usuarios WHERE id_usuario = ?";
  connection.query(query, [id_usuario], (err, results) => {
    if (err) {
      console.error("Error al obtener perfil:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    console.log("Perfil enviado para usuario:", id_usuario);
    res.json(results[0]);
  });
});

// **Ruta para actualizar perfil de usuario**
app.put("/api/perfil/:id_usuario", (req, res) => {
  const id_usuario = req.params.id_usuario;
  const { nombre, email, telefono } = req.body;
  if (!nombre || !email) {
    return res.status(400).json({ error: "Nombre y email son requeridos" });
  }
  const query =
    "UPDATE usuarios SET nombre = ?, email = ?, telefono = ? WHERE id_usuario = ?";
  connection.query(
    query,
    [nombre, email, telefono || null, id_usuario],
    (err) => {
      if (err) {
        console.error("Error al actualizar perfil:", err);
        return res.status(500).json({ error: "Error al actualizar perfil" });
      }
      console.log("Perfil actualizado para usuario:", id_usuario);
      res.json({ message: "Perfil actualizado con éxito" });
    }
  );
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res
    .status(404)
    .json({ error: "Ruta no encontrada", requestedPath: req.path });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(
    `Servidor corriendo en el puerto ${PORT} - ${new Date().toLocaleString(
      "es-ES",
      { timeZone: "America/Bogota" }
    )}`
  );
});

module.exports = app;
