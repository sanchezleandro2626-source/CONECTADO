const API_BASE_URL = "http://localhost:5000/api/mensajes";

const btnEnviar = document.getElementById('btnEnviar');
const inputAutor = document.getElementById('inputAutor');
const inputContenido = document.getElementById('inputContenido');
const listaMensajes = document.getElementById('listaMensajes');

// 1. FUNCIÓN PARA OBTENER LOS DATOS DE MONGODB Y PINTARLOS
const cargarHistorial = () => {
    fetch(`${API_BASE_URL}/todos`)
        .then(res => res.json())
        .then(response => {
            listaMensajes.innerHTML = ""; // Limpiamos el cargando
            if(response.data.length === 0) {
                listaMensajes.innerHTML = "<p>No hay reportes en la base de datos todavía.</p>";
                return;
            }
            // Recorremos los datos que vinieron de MongoDB
            response.data.forEach(item => {
                const div = document.createElement('div');
                div.className = 'mensaje-item';
                div.innerHTML = `
                    <p><strong>${item.autor}:</strong> ${item.contenido}</p>
                    <small>Fecha: ${new Date(item.fechaCreation || item.fechaCreacion).toLocaleString()}</small>
                `;
                listaMensajes.appendChild(div);
            });
        })
        .catch(err => {
            console.error("Error al cargar historial:", err);
            listaMensajes.innerHTML = "<p style='color:red;'>Error al conectar con la API.</p>";
        });
};

// 2. EVENTO PARA MANDAR DATOS AL HACER CLIC EN EL BOTÓN
btnEnviar.addEventListener('click', () => {
    const autor = inputAutor.value.trim();
    const contenido = inputContenido.value.trim();

    if(!contenido) {
        alert("El campo de reporte no puede estar vacío");
        return;
    }

    // Objeto con la estructura del modelo
    const datosEnvio = {
        autor: autor || "Desarrollador Anónimo",
        contenido: contenido
    };

    // Petición POST a la API
    fetch(`${API_BASE_URL}/guardar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosEnvio)
    })
    .then(res => res.json())
    .then(response => {
        if(response.status === "success") {
            inputContenido.value = ""; // Limpiamos el cuadro de texto
            cargarHistorial(); // Volvemos a leer la BD para que aparezca el nuevo en la lista
        } else {
            alert("Error del servidor al guardar");
        }
    })
    .catch(err => console.error("Error al guardar:", err));
});

// Cargar el historial automáticamente apenas abra la página
document.addEventListener('DOMContentLoaded', cargarHistorial);