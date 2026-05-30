const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller');

/**
 * ARQUITECTURA DE ENRUTAMIENTO RESTFUL - URBAN DELIVERY PRO
 * Prefijo global asignado en el servidor: /api/pedidos
 */

// 1. Ruta para registrar una nueva orden de entrega desde el cliente (Frontend)
// POST -> /api/pedidos/guardar
router.post('/guardar', pedidoController.crearPedido);

// 2. Ruta para que la empresa y los operadores recuperen el historial de control de caja
// GET -> /api/pedidos/todos
router.get('/todos', pedidoController.obtenerPedidos);

// 3. Ruta para actualizaciones atómicas de la traza logística por parte de los motorizados
// PATCH -> /api/pedidos/estatus/:id
router.patch('/estatus/:id', pedidoController.actualizarEstatus);

// 4. INYECCIÓN PARA MOTOR DE TENDENCIAS GLOBAL (Se mantiene el orden y estructura original)
// GET -> /api/pedidos/tendencias
router.get('/tendencias', pedidoController.obtenerTendencias);

module.exports = router;