const express = require('express');
const cors = require('cors');
require('dotenv').config();
const conectarDB = require('./src/config/db');

const app = express();

// 1. Conexión a Base de Datos
conectarDB();

// 2. Middlewares (CORS configurado para permitir todo origen)
app.use(cors());
app.use(express.json());

// 3. Centralización de Rutas (Aquí es donde el servidor sabe dónde buscar cada cosa)
app.use('/api/tasa', require('./src/routes/tasa.routes'));
app.use('/api/mensajes', require('./src/routes/mensaje.routes'));
app.use('/api/pedidos', require('./src/routes/pedido.routes'));

// Ruta de prueba (Mantenida)
app.get('/api/prueba', (req, res) => {
    res.json({ mensaje: "Hola desde el backend en JavaScript - Sistema Activo" });
});

// 4. Gestión de errores 404 (Para que el servidor responda algo si no encuentra la ruta)
app.use((req, res) => {
    res.status(404).json({ status: "error", message: "Ruta no encontrada" });
});

// 5. Puerto dinámico (Solo para desarrollo local)
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Servidor API corriendo en el puerto ${PORT}`);
    });
}

// EXPORTACIÓN CRÍTICA PARA VERCEL
module.exports = app;