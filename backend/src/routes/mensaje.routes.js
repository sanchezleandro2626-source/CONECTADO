const express = require('express');
const router = express.Router();
const mensajeController = require('../controllers/mensaje.controller');

// Definimos los endpoints que llamará el frontend
router.post('/guardar', mensajeController.crearMensaje);  // URL: /api/mensajes/guardar
router.get('/todos', mensajeController.obtenerMensajes);  // URL: /api/mensajes/todos

module.exports = router;