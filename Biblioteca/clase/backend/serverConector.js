/*
 * Copyright (c) [2025] [Marcos Montes]
 * Todos los derechos reservados.

 * Para obtener información sobre licencias adicionales, contacte a:
 * [marcosmontes211@gmail.com]
 * [3144563446]
 */

// Importar módulos necesarios
const express = require("express"); // Importar el módulo express
const mysql = require("mysql2"); // Importar el módulo mysql2
const cors = require("cors"); // Importar el módulo cors

const app = express(); // Crear una nueva aplicación express
const port = 3000; // Puerto en el que escuchará el servidor

app.use(cors()); // Middleware para permitir peticiones desde otros dominios
app.use(express.json()); // Middleware para parsear JSON

// Configuración de conexión a MySQL
const dbConfig = {
  host: "localhost", // Reemplaza con tu host de MySQL
  user: "root", // Reemplaza con tu usuario de MySQL
  password: "marcos90", // Reemplaza con tu contraseña de MySQL
  database: "biblioteca_final" // Nombre de la base de datos
};

// Configuración de conexión a MySQL desde la nube con AWS
const dbConfig_AWS = {
  host: "database-marcos-aws.cnuq6664o2td.us-east-2.rds.amazonaws.com", // Reemplaza con tu host de MySQL
  user: "admin", // Reemplaza con tu usuario de MySQL
  password: "marcos90", // Reemplaza con tu contraseña de MySQL
  database: "BIBLIOTECA_AWS" // Nombre de la base de datos
};

// Conectar a MySQL
const connection = mysql.createConnection(dbConfig);
connection.connect(err => { // Conectar a MySQL
  if (err) { // Si hay un error al conectar
    console.error("❌ Error al conectar a MySQL:", err); // Imprimir el error
  } else { // Si la conexión es exitosa
    console.log("✅ Conectado a MySQL"); // Imprimir mensaje de éxito
  }
});

app.post("/login", (req, res) => {
  const { username, password, role } = req.body; // Recibe el usuario, contraseña y rol

  const query = "SELECT * FROM usuarios WHERE usua = ? AND pass = ? AND rol = ?"; // Consulta SQL
  connection.query(query, [username, password, role], (err, results) => { // Ejecutar la consulta
    if (err) { // Si hay un error
      console.error("Error al ejecutar la consulta:", err); // Imprimir el error
      return res.status(500).json({ success: false, message: "Error en el servidor." }); // Enviar respuesta de error
    }

    if (results.length === 0) { // Si no hay resultados
      return res.json({ success: false, message: "Usuario, contraseña o rol incorrectos." }); // Enviar respuesta de error
    }

    const user = results[0];
    res.json({ success: true, message: "Inicio de sesión exitoso.", user }); // Enviar respuesta de éxito
  });
});

// Ruta para obtener libros
app.get("/get-data", (req, res) => { // Ruta para obtener los datos
  connection.query("SELECT * FROM libros", (err, results) => { // Consulta SQL
    if (err) { // Si hay un error
      console.error("❌ Error al obtener los datos:", err); // Imprimir el error
      res.status(500).send("Error al obtener los datos."); // Enviar respuesta de error
    } else { // Si la consulta es exitosa
      res.json(results); // Enviar los resultados en formato JSON
    }
  });
});

// Ruta para agregar un libro (protegida)
app.post("/guardar", (req, res) => { // Ruta para guardar un libro
  const { titulo, autor, año, genero, usuario_id } = req.body; // Recibir los datos del libro

  if (!titulo || !autor || !año || !genero || !usuario_id) { // Si algún campo está vacío
    return res.status(400).send("Todos los campos son obligatorios."); // Enviar respuesta de error
  }
  
  const query = "INSERT INTO libros (titulo, autor, anio_publicacion, genero, usuario_id) VALUES (?, ?, ?, ?, ?)"; // Consulta SQL
  connection.query(query, [titulo, autor, año, genero, usuario_id], (err) => { // Ejecutar la consulta
    if (err) { // Si hay un error
      console.error("❌ Error al insertar datos:", err); // Imprimir el error
      res.status(500).send("Error al guardar los datos."); // Enviar respuesta de error
    } else { // Si la consulta es exitosa
      res.send("✅ Libro agregado correctamente."); // Enviar respuesta de éxito
    }
  });
});

// Ruta para modificar un libro (protegida)
app.put("/modificar/:id", (req, res) => { // Ruta para modificar un libro
  const { id } = req.params; // Recibir el ID del libro
  const { titulo, autor, año, genero } = req.body; // Recibir los datos del libro

  if (!titulo || !autor || !año || !genero) { // Si algún campo está vacío
    return res.status(400).send("Todos los campos son obligatorios."); // Enviar respuesta de error
  }

  const query = "UPDATE libros SET titulo = ?, autor = ?, anio_publicacion = ?, genero = ? WHERE id = ?"; // Consulta SQL
  connection.query(query, [titulo, autor, año, genero, id], (err) => { // Ejecutar la consulta
    if (err) { // Si hay un error
      console.error("❌ Error al modificar el libro:", err); // Imprimir el error
      res.status(500).send("Error al modificar el libro."); // Enviar respuesta de error
    } else { // Si la consulta es exitosa
      res.send("✅ Libro modificado correctamente."); // Enviar respuesta de éxito
    }
  });
});

// Ruta para eliminar un libro 
app.delete("/eliminar/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM libros WHERE id = ?";
  connection.query(query, [id], (err) => {
    if (err) {
      console.error("❌ Error al eliminar el libro:", err);
      res.status(500).send("Error al eliminar el libro.");
    } else {
      res.send("✅ Libro eliminado correctamente.");
    }
  });
});

// Ruta para buscar por título o autor 
app.get("/buscar", (req, res) => { // Ruta para buscar libros
  const searchTerm = req.query.query; // Recibir el término de búsqueda

  if (!searchTerm) { // Si no se proporciona un término de búsqueda
    return res.status(400).json({ error: "Debe proporcionar un término de búsqueda." }); // Enviar respuesta de error
  }

  // Consulta SQL
  const queryString = `
    SELECT * FROM libros 
    WHERE titulo LIKE ? OR autor LIKE ?
  `;

  connection.query(queryString, [`%${searchTerm}%`, `%${searchTerm}%`], (err, results) => { // Ejecutar la consulta
    if (err) { // Si hay un error
      console.error("⚠️ Error en la consulta SQL:", err); // Imprimir el error
      return res.status(500).json({ error: "Error al realizar la búsqueda." }); // Enviar respuesta de error
    }

    res.json(results); // Enviar los resultados en formato JSON
  });
});


// Endpoint para obtener los datos de los usuarios
app.get('/datos_usuarios/:id', (req, res) => {
  const usuarioId = req.params.id; // Recibir el ID del usuario

  connection.query('SELECT * FROM usuarios WHERE id = ?', [usuarioId], (err, results) => { // Consulta SQL
      if (err) return res.status(500).json({ error: 'Error en el servidor' }); // Enviar respuesta de error
      if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' }); // Enviar respuesta de error
      res.json(results[0]); // Enviar los resultados en formato JSON
  });
});

// Endpoint para cerrar sesión
app.post('/logout', (req, res) => {
    // Aquí puedes realizar cualquier acción necesaria para cerrar la sesión, como invalidar tokens, etc.
    res.json({ success: true, message: 'Sesión cerrada correctamente' });
});

// Endpoint para obtener los datos de un libro junto con la información del usuario que lo publicó
app.get('/libro/:id', (req, res) => {
  const libroId = req.params.id;

  const query = `
      SELECT 
          usuarios.id AS usuario_id, 
          usuarios.nombre, 
          usuarios.email, 
          usuarios.telefono, 
          usuarios.genero, 
          usuarios.descripcion
      FROM usuarios
      JOIN libros ON usuarios.id = libros.usuario_id
      WHERE libros.id = ?
  `;
  connection.query(query, [libroId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en el servidor' });
    if (results.length === 0) return res.status(404).json({ error: 'Libro no encontrado' });
    res.json(results[0]);
  });
});

// Iniciar el servidor
app.listen(port, () => { // Iniciar el servidor en el puerto especificado
  console.log(`Servidor corriendo en http://localhost:${port}`); // Imprimir mensaje de éxito
});
