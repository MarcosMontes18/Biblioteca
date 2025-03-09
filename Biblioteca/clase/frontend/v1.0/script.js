document.addEventListener("DOMContentLoaded", () => {
    let libros = [];
    let libroSeleccionado = null;
  
    // Obtener libros desde el servidor
    document.getElementById("fetchData").addEventListener("click", async () => {
      try {
        const response = await fetch("http://localhost:3000/get-data");
        libros = await response.json();
        mostrarLibros(libros);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        alert("Hubo un error al conectar con el servidor.");
      }
    });
  
    // Mostrar libros en la tabla
    function mostrarLibros(listaLibros) {
      const tableBody = document.querySelector("#dataTable tbody");
      tableBody.innerHTML = "";
  
      listaLibros.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.titulo}</td>
          <td>${item.autor}</td>
          <td>${item.anio_publicacion}</td>
          <td>${item.genero}</td>
          <td>
            <button class="btn-secondary" onclick="seleccionarLibro(${item.id})">Modificar</button>
            <button class="btn-primary" onclick="eliminarLibro(${item.id})">Eliminar</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    }
  
    // Seleccionar libro para modificar
    window.seleccionarLibro = (id) => {
      libroSeleccionado = libros.find(libro => libro.id === id);
      if (libroSeleccionado) {
        document.getElementById("titulo_mod").value = libroSeleccionado.titulo;
        document.getElementById("autor_mod").value = libroSeleccionado.autor;
        document.getElementById("año_mod").value = libroSeleccionado.anio_publicacion;
        document.getElementById("genero_mod").value = libroSeleccionado.genero;
      }
    };
  
    // Modificar libro
    document.getElementById("modifica").addEventListener("click", async () => {
      if (!libroSeleccionado) {
        alert("Selecciona un libro para modificar.");
        return;
      }
  
      const titulo = document.getElementById("titulo_mod").value.trim();
      const autor = document.getElementById("autor_mod").value.trim();
      const año = document.getElementById("año_mod").value.trim();
      const genero = document.getElementById("genero_mod").value.trim();
  
      if (!titulo || !autor || !año || !genero) {
        alert("Todos los campos son obligatorios.");
        return;
      }
  
      try {
        const response = await fetch(`http://localhost:3000/modificar/${libroSeleccionado.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ titulo, autor, año, genero }),
        });
  
        const result = await response.text();
        alert(result);
        libroSeleccionado = null;
        document.querySelector("form").reset();
        document.getElementById("fetchData").click();
      } catch (error) {
        console.error("Error al modificar el libro:", error);
        alert("Hubo un error al modificar el libro.");
      }
    });
  
    // Eliminar libro
    window.eliminarLibro = async (id) => {
      if (confirm("¿Estás seguro de que quieres eliminar este libro?")) {
        try {
          const response = await fetch(`http://localhost:3000/eliminar/${id}`, {
            method: "DELETE",
          });
  
          const result = await response.text();
          alert(result);
          document.getElementById("fetchData").click();
        } catch (error) {
          console.error("Error al eliminar el libro:", error);
          alert("Hubo un error al eliminar el libro.");
        }
      }
    };
  
    // Guardar nuevo libro
    document.getElementById("guarda").addEventListener("click", async () => {
          const titulo = document.getElementById("titulo").value.trim();
          const autor = document.getElementById("autor").value.trim();
          const año = document.getElementById("año").value.trim();
          const genero = document.getElementById("genero").value.trim();
  
          if (!titulo || !autor || !año || !genero) {
            alert("Todos los campos son obligatorios.");
            return;
          }
  
          try {
            const response = await fetch("http://localhost:3000/guardar", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ titulo, autor, año, genero }),
            });
  
            const result = await response.text();
            alert(result);
            document.querySelector("form").reset(); // Limpia los inputs después de guardar
          } catch (error) {
            console.error("Error al guardar el libro:", error);
            alert("Hubo un error al guardar el libro.");
          }
        });
  
    // Buscar libros por título o autor
    document.getElementById("buscar").addEventListener("click", async () => {
    const query = document.getElementById("busca").value.trim();
    if (!query) {
      alert("Por favor, ingresa un título o autor para buscar.");
      return;
    }
  
    try {
      // 1️⃣ Buscar en la base de datos local
      const responseLocal = await fetch(`http://localhost:3000/buscar?query=${query}`);
      const librosLocal = await responseLocal.json();
  
      // 2️⃣ Buscar en Open Library
      const responseOpenLib = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=5`);
      const dataOpenLib = await responseOpenLib.json();
      const librosOpenLib = dataOpenLib.docs;
  
      // 3️⃣ Mostrar resultados combinados
      mostrarResultadosBusqueda(librosLocal, librosOpenLib);
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      alert("Hubo un error al realizar la búsqueda.");
    }
  });
  
  function mostrarResultadosBusqueda(librosLocal, librosOpenLib) {
    const tableBody = document.querySelector("#dataTable_B tbody");
    tableBody.innerHTML = ""; // Limpiar tabla antes de mostrar resultados
  
    // 🔹 Mostrar libros de la base de datos local
    librosLocal.forEach(libro => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${libro.titulo}</td>
        <td>${libro.autor}</td>
        <td>${libro.anio_publicacion}</td>
        <td>${libro.genero}</td>
      `;
      tableBody.appendChild(row);
    });
  
    // 🔹 Mostrar libros de Open Library
    librosOpenLib.forEach(libro => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${libro.title}</td>
        <td>${libro.author_name ? libro.author_name.join(", ") : "Desconocido"}</td>
        <td>${libro.first_publish_year || "Desconocido"}</td>
        <td>${libro.subject ? libro.subject[0] : "Desconocido"}</td>
      `;
      tableBody.appendChild(row);
    });
  
    if (librosLocal.length === 0 && librosOpenLib.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4">No se encontraron resultados.</td></tr>`;
    }
  }
      
        document.getElementById("fetchData_op_li").addEventListener("click", async () => {
    try {
      // Crear un array de términos de búsqueda aleatorios para obtener libros diferentes
      const searchTerms = ["fiction", "history", "science", "adventure", "mystery", "fantasy", "technology"];
      const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)]; // Elegir un término aleatorio
  
      const response = await fetch(`https://openlibrary.org/search.json?q=${randomTerm}&limit=10&page=${Math.floor(Math.random() * 100) + 1}`);
      const data = await response.json();
  
      if (data.docs.length > 0) {
        mostrarLibrosOpenLibrary(data.docs);
      } else {
        alert("No se encontraron libros en Open Library.");
      }
    } catch (error) {
      console.error("Error al obtener los libros de Open Library:", error);
      alert("Hubo un error al obtener los libros.");
    }
  });
  
  function mostrarLibrosOpenLibrary(libros) {
    const tableBody = document.querySelector("#dataTable tbody");
    tableBody.innerHTML = ""; // Limpiar tabla antes de mostrar nuevos datos
  
    libros.forEach(libro => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${libro.title}</td>
        <td>${libro.author_name ? libro.author_name.join(", ") : "Desconocido"}</td>
        <td>${libro.first_publish_year || "Desconocido"}</td>
        <td>${libro.subject ? libro.subject[0] : "Desconocido"}</td>
        <td>📚 API Open Library</td>
      `;
      tableBody.appendChild(row);
    });
  }
  
  });
  