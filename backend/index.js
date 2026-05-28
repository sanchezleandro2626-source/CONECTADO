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

// Tu ruta de prueba (Esto es lo único que debe hacer el backend)
app.get('/api/prueba', (req, res) => {
    res.json({ mensaje: "Hola desde el backend en JavaScript" });
});

// Vincular las rutas modulares del proyecto
app.use('/api/mensajes', require('./src/routes/mensaje.routes'));

// Puerto dinámico
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor API corriendo en el puerto ${PORT}`);
});