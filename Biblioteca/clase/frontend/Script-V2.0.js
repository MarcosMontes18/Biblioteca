/*
 * Copyright (c) [2025] [Marcos Montes]
 * Todos los derechos reservados.

 * Para obtener información sobre licencias adicionales, contacte a:
 * [marcosmontes211@gmail.com]
 * [3144563446]
 */

// Función para agregar un libro en la biblioteca
function agregarLibro(titulo) {
    let biblioteca = document.getElementById("biblioteca"); // Contenedor de los libros

    // Crear una nueva caja
    const nuevoLibro = document.createElement("div"); // Crear un nuevo div en una variable
    nuevoLibro.classList.add("book"); // Agregar la clase "book al div que creamos para darle estilo"
    nuevoLibro.innerHTML = ` <!--Agregar el contenido al div que creamos-->
        <h1>${titulo}</h1>
        <button onclick="verLibro()">Ver Libro</button> 
    `;

    biblioteca.appendChild(nuevoLibro); // Agregar la nueva caja a la biblioteca
}

// Función para ver la información del libro
function verLibro(titulo, autor, año, genero, libroId) {
    let modal = document.getElementById("modal_ver_libro"); // Obtener el modal
    
    // Mostrar la información del libro en el modal
    document.getElementById("modal_titulo").innerText = titulo;
    document.getElementById("modal_autor").innerText = `Autor: ${autor}`;
    document.getElementById("modal_año").innerText = `Año de publicación: ${año}`;
    document.getElementById("modal_genero").innerText = `Género: ${genero}`;

    // Almacenar el ID del libro seleccionado
    libroSeleccionadoId = libroId;

    // Mostrar el modal
    modal.style.display = "block";

    // Cerrar el modal al hacer clic fuera de él
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
}

// Función para cerrar sesión
document.getElementById("cerrarSesion").addEventListener("click", async () => { // Agregar un evento de clic al botón de cerrar sesión
    try {
        const response = await fetch("http://localhost:3000/logout", { // Enviar una solicitud al servidor para cerrar sesión
            method: "POST", // Método POST para enviar datos
            headers: { // Cabeceras para enviar datos en formato JSON
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();
        if (result.success) {
            localStorage.removeItem("usuarioId"); // Eliminar el ID del usuario del localStorage
            localStorage.removeItem("userRole"); // Eliminar el rol del usuario del localStorage
            window.location.href = "login-v2.0.html"; // Redirigir a la página de inicio de sesión
        } else {
            alert("Error al cerrar sesión"); // Mostrar un mensaje de error si la sesión no se cerró correctamente
        }
    } catch (error) { // Manejar errores
        console.error("Error al cerrar sesión:", error); // Mostrar el error en la consola
        alert("Hubo un error al cerrar la sesión."); // Mostrar un mensaje de error
    }
});

// Función para publicar un libro
function publicarLibro() {
    event.preventDefault(); // Evita la recarga de la página
    let modal = document.getElementById("modal_publicar_libro"); // Obtener el modal

    // Mostrar el modal
    modal.style.display = "block";

    // Cerrar el modal al hacer clic fuera de él
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
}

// Guardar nuevo libro
document.getElementById("guarda").addEventListener("click", async () => {
    // Obtener los valores de los inputs en variables y eliminar los espacios en blanco
    const titulo = document.getElementById("titulo").value.trim();
    const autor = document.getElementById("autor").value.trim(); 
    const año = document.getElementById("año").value.trim();
    const genero = document.getElementById("genero").value.trim();
    const usuarioId = localStorage.getItem('usuarioId'); // Obtener el ID del usuario desde el localStorage

    if (!titulo || !autor || !año || !genero) { // Validar que los campos no estén vacíos
        alert("Todos los campos son obligatorios.");
        return;
    }

    try { 
        const response = await fetch("http://localhost:3000/guardar", { // Enviar los datos al servidor
            method: "POST", // Método POST para enviar datos
            headers: {  // Cabeceras para enviar datos en formato JSON
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ titulo, autor, año, genero, usuario_id: usuarioId }), // Convertir los datos a JSON
        });

        const result = await response.text(); // Convertir la respuesta a texto
        alert(result);
        document.querySelector("form").reset(); // Limpia los inputs después de guardar

        // Agregar el libro a la biblioteca después de guardarlo
        agregarLibro(titulo, autor, año, genero);

        let modal = document.getElementById("modal_publicar_libro"); // Obtener el modal
        modal.style.display = "none"; // Cerrar el modal

    } catch (error) { // Manejar errores
        console.error("Error al guardar el libro:", error); // Mostrar el error en la consola
        alert("Hubo un error al guardar el libro."); // Mostrar un mensaje de error
    }
});

//Varibaes globales para almacenar los libros
let libros = []; // Crear un array para almacenar los libros
let libroSeleccionado = null; // Crear una variable para almacenar el libro seleccionado
let librosOpenLib = []; // Crear un array para almacenar los libros de Open Library
let libroSeleccionadoId = null; //Varibale global para almacenar el id del libro seleccionado

// Obtener libros desde el servidor
document.addEventListener("DOMContentLoaded", async () => { // Ejecutar el código cuando la página se cargue
    try {
        const response = await fetch("http://localhost:3000/get-data"); // Obtener los datos del servidor
        libros = await response.json(); // Convertir los datos a JSON
        mostrarLibrosServidor(libros); // Mostrar los libros en la biblioteca
    
    } catch (error) { // Manejar errores
        console.error("Error al obtener los datos:", error); // Mostrar el error en la consola
        alert("Hubo un error al conectar con el servidor."); // Mostrar un mensaje de error
    }

    try {
        // Crear un array de términos de búsqueda aleatorios para obtener libros diferentes
        const searchTerms = ["fiction", "history", "science", "adventure", "mystery", "fantasy", "technology"];
        const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)]; // Elegir un término aleatorio

        // Obtener libros de Open Library mediante una búsqueda aleatoria
        const response = await fetch(`https://openlibrary.org/search.json?q=${randomTerm}&limit=20&page=${Math.floor(Math.random() * 100) + 1}`);
        const data = await response.json(); // Convertir los datos a JSON

        if (data.docs.length > 0) { // Verificar si se encontraron libros
            librosOpenLib = data.docs;
            mostrarLibrosOpenLibrary(librosOpenLib); // Mostrar los libros en la biblioteca
        } else {
            alert("No se encontraron libros en Open Library."); // Mostrar un mensaje si no se encontraron libros
        }
    } catch (error) { // Manejar errores
        console.error("Error al obtener los libros de Open Library:", error); // Mostrar el error en la consola
        alert("Hubo un error al obtener los libros."); // Mostrar un mensaje de error
    }
});

// Mostrar libros obtenidos del servidor
function mostrarLibrosServidor(libros) { // Función para mostrar los libros en la caja biblioteca
    const biblioteca = document.getElementById("biblioteca"); // Obtener el contenedor de los libros

    libros.forEach(libro => { // Recorrer los libros
        const nuevoLibro = document.createElement("div"); // Crear un nuevo div en una variable
        nuevoLibro.classList.add("book"); // Agregar la clase "book" al div que creamos para darle estilo
        nuevoLibro.innerHTML = ` <!--Agregar el contenido al div que creamos-->
            <h1>${libro.titulo}</h1>
            <button onclick="verLibro('${libro.titulo}', '${libro.autor}', '${libro.anio_publicacion}', '${libro.genero}', ${libro.id})">Ver Libro</button>
        `;
        biblioteca.appendChild(nuevoLibro); // Agregar la nueva caja a la biblioteca
    });
}

// Mostrar libros obtenidos de Open Library
function mostrarLibrosOpenLibrary(libros) { // Función para mostrar los libros de open lobrary en la caja biblioteca
    const biblioteca = document.getElementById("biblioteca"); // Obtener el contenedor de los libros

    libros.forEach(libro => { // Recorrer los libros
        const nuevoLibro = document.createElement("div");   // Crear un nuevo div en una variable
        nuevoLibro.classList.add("book"); // Agregar la clase "book" al div que creamos para darle estilo
        nuevoLibro.innerHTML = ` <!--Agregar el contenido al div que creamos-->
            <h1>${libro.title}</h1>
            <button onclick="verLibro('${libro.title}', '${libro.author_name ? libro.author_name.join(', ') : 'Desconocido'}', '${libro.first_publish_year}', '${libro.subject ? libro.subject.join(', ') : 'Desconocido'}')">Ver Libro</button>
        `;
        biblioteca.appendChild(nuevoLibro);   // Agregar la nueva caja a la biblioteca
    });
}

// Función para buscar libros
async function buscarLibros(query) {
    try {
        // Buscar libros en el servidor
        const responseServidor = await fetch(`http://localhost:3000/buscar?query=${query}`); // Enviar la búsqueda al servidor
        const librosServidor = await responseServidor.json(); // Convertir la respuesta a JSON

        // Buscar libros en Open Library
        const responseOpenLibrary = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=10`); // Enviar la búsqueda a Open Library
        const dataOpenLibrary = await responseOpenLibrary.json(); // Convertir la respuesta a JSON
        const librosOpenLibrary = dataOpenLibrary.docs; // Obtener los libros de la respuesta

        // Combinar los resultados de ambas búsquedas
        const libros = [...librosServidor, ...librosOpenLibrary]; // usa el operador spread (...) para combinar dos arreglos en uno solo

        // Mostrar los libros combinados
        mostrarLibrosBusqueda(libros);
    } catch (error) { // Manejar errores
        console.error("Error al buscar libros:", error); // Mostrar el error en la consola
        alert("Hubo un error al buscar los libros."); // Mostrar un mensaje de error
    }
}

// Función para mostrar los libros de la búsqueda
function mostrarLibrosBusqueda(libros) {
    const biblioteca = document.getElementById("biblioteca"); // Obtener el contenedor de los libros
    biblioteca.innerHTML = ""; // Limpiar contenido existente

    libros.forEach(libro => { // Recorrer los libros
        const nuevoLibro = document.createElement("div"); // Crear un nuevo div en una variable
        nuevoLibro.classList.add("book"); // Agregar la clase "book" al div que creamos para darle estilo

        // Verificar si el libro proviene del servidor o de Open Library
        if (libro.titulo) {
            // Libro del servidor
            nuevoLibro.innerHTML = ` <!--Agregar el contenido al div que creamos-->
                <h1>${libro.titulo}</h1>
                <button onclick="verLibro('${libro.titulo}', '${libro.autor}', '${libro.anio_publicacion}', '${libro.genero}', ${libro.id})">Ver Libro</button>
            `;
        } else {
            // Libro de Open Library
            nuevoLibro.innerHTML = ` <!--Agregar el contenido al div que creamos-->
                <h1>${libro.title}</h1>
                <button onclick="verLibro('${libro.title}', '${libro.author_name ? libro.author_name.join(', ') : 'Desconocido'}', '${libro.first_publish_year}', '${libro.subject ? libro.subject.join(', ') : 'Desconocido'}')">Ver Libro</button>
            `;
        }

        biblioteca.appendChild(nuevoLibro); // Agregar la nueva caja a la biblioteca
    });
}

// Añadir evento input a la barra de búsqueda
document.getElementById("buscar_libro").addEventListener("input", (event) => { // Agregar un evento de entrada a la barra de búsqueda
    const query = event.target.value.trim(); // Obtener el valor de la barra de búsqueda y eliminar los espacios en blanco
    if (query) { // Verificar si la barra de búsqueda no está vacía
        buscarLibros(query); // Buscar libros con el término ingresado
    } else {
        // Si la barra de búsqueda está vacía, mostrar todos los libros
        mostrarLibrosServidor(libros); // Mostrar los libros del servidor
        mostrarLibrosOpenLibrary(librosOpenLib); // Mostrar los libros de Open Library
    }
});

//modal para ver perfil de usuario
async function verPerfil() {
    const usuarioId = localStorage.getItem('usuarioId'); // Obtener el ID del usuario desde el localStorage
    let modal = document.getElementById("modalPerfil"); // Obtener el modal

    try {
        const response = await fetch(`http://localhost:3000/datos_usuarios/${usuarioId}`); // Obtener los datos del usuario desde el servidor
        const usuario = await response.json(); // Convertir la respuesta a JSON

        // Mostrar los datos del usuario en el modal
        document.getElementById("perfil_nombre").innerText = `${usuario.nombre}`;
        document.getElementById("perfil_email").innerText = `${usuario.email}`;
        document.getElementById("perfil_telefono").innerText = `${usuario.telefono}`;
        document.getElementById("perfil_genero").innerText = `${usuario.genero}`;
        document.getElementById("perfil_descripcion").innerText = `Descripción: ${usuario.descripcion}`;

        // Mostrar el modal
        modal.style.display = "block";

        // Cerrar el modal al hacer clic fuera de él
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        };
    } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        alert('Hubo un error al obtener los datos del usuario.');
    }
}

//funciones para abrir y cerrar modales uno dentro del otro
function openModal(id) { // Función para abrir un modal
    document.getElementById(id).style.display = "flex"; // Mostrar el modal
}
function closeModal(id) { // Función para cerrar un modal
    document.getElementById(id).style.display = "none"; // Ocultar el modal
}


// Función para ver el perfil del usuario que publicó un libro
async function verPerfilLibro() {
    let modal = document.getElementById("modalPerfil-libro"); // Obtener el modal

    try {
        const response = await fetch(`http://localhost:3000/libro/${libroSeleccionadoId}`); // Obtener los datos del libro desde el servidor
        const libro = await response.json(); // Convertir la respuesta a JSON

        // Mostrar los datos del usuario en el modal
        document.getElementById("modalPerfil-libro-nombre").innerText = libro.nombre;
        document.getElementById("modalPerfil-libro-email").innerText = libro.email;
        document.getElementById("modalPerfil-libro-telefono").innerText = libro.telefono;
        document.getElementById("modalPerfil-libro-genero").innerText = libro.genero;
        document.getElementById("modalPerfil-libro-descripcion").innerText = libro.descripcion;

        // Mostrar el modal
        modal.style.display = "block";

    } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        alert('Hubo un error al obtener los datos del usuario.');
    }
}

