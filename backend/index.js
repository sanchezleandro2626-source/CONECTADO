const express = require('express');
const cors = require('cors');
require('dotenv').config();
const conectarDB = require('./src/config/db');

const app = express();

// Conectar a la Base de Datos
conectarDB();

// Middlewares obligatorios
app.use(cors());
app.use(express.json());

app.get('/api/tasa', async (req, res) => {
    try {
        // Aquí llamas a la API desde el servidor (esto SÍ es permitido)
        const response = await fetch('https://ve.centralbank.workers.dev/v1/bcv');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener tasa" });
    }
});

// Tu ruta de prueba (Esto es lo único que debe hacer el backend)
app.get('/api/prueba', (req, res) => {
    res.json({ mensaje: "Hola desde el backend en JavaScript" });
});

// Vincular las rutas modulares del proyecto
app.use('/api/mensajes', require('./src/routes/mensaje.routes'));
app.use('/api/pedidos', require('./src/routes/pedido.routes'));

// ... (resto de tu código igual)

// Puerto dinámico (Solo para desarrollo local)
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Servidor API corriendo en el puerto ${PORT}`);
    });
}

// EXPORTACIÓN CRÍTICA PARA VERCEL
module.exports = app;