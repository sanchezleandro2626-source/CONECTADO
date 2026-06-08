const Pedido = require('../models/Pedido');

const pedidoController = {
    
    // 1. CREAR PEDIDO: Añadimos validación de que los productos no vengan vacíos
    crearPedido: async (req, res) => {
        try {
            const { cliente, ubicacion, productos, financiero } = req.body;

            // Validación de integridad básica
            if (!cliente || !productos || productos.length === 0 || !financiero) {
                return res.status(400).json({ status: "error", message: "Datos del pedido incompletos" });
            }

            // Lógica de caja (Mantenemos tu lógica senior)
            if (financiero.metodoPago === 'EFECTIVO_DIVISAS') {
                if (!financiero.pagaConBilleteDe || financiero.pagaConBilleteDe < financiero.totalDolares) {
                    return res.status(400).json({ status: "error", message: "Denominación de billete inválida o insuficiente." });
                }
                financiero.vueltoRequeridoDolares = Number((financiero.pagaConBilleteDe - financiero.totalDolares).toFixed(2));
            } else {
                financiero.pagaConBilleteDe = null;
                financiero.vueltoRequeridoDolares = 0;
            }

            const nuevoPedido = new Pedido({
                cliente, ubicacion, productos, financiero, estatus: 'PENDIENTE'
            });

            const pedidoGuardado = await nuevoPedido.save();
            return res.status(201).json({ status: "success", data: pedidoGuardado });

        } catch (error) {
            return res.status(500).json({ status: "error", message: "Error al registrar pedido", error: error.message });
        }
    },

    // 2. OBTENER PEDIDOS: Se mantiene igual, es correcto.
    obtenerPedidos: async (req, res) => {
        try {
            const pedidos = await Pedido.find().sort({ createdAt: -1 });
            return res.status(200).json({ status: "success", resultados: pedidos.length, data: pedidos });
        } catch (error) {
            return res.status(500).json({ status: "error", message: "Error al recuperar historial" });
        }
    },

    // 3. ACTUALIZAR ESTATUS: Blindado contra IDs mal formados
    actualizarEstatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { nuevoEstatus } = req.body;

            const estatusValidos = ['PENDIENTE', 'PREPARANDO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'];
            if (!estatusValidos.includes(nuevoEstatus)) {
                return res.status(400).json({ status: "error", message: "Estatus no válido" });
            }

            const pedidoActualizado = await Pedido.findByIdAndUpdate(
                id,
                { estatus: nuevoEstatus },
                { new: true, runValidators: true }
            );

            if (!pedidoActualizado) return res.status(404).json({ status: "error", message: "Pedido no encontrado" });

            return res.status(200).json({ status: "success", data: pedidoActualizado });

        } catch (error) {
            return res.status(500).json({ status: "error", message: "Error al actualizar estatus", error: error.message });
        }
    },

    // 4. OBTENER TENDENCIAS: Optimizado para evitar errores si la colección está vacía
    obtenerTendencias: async (req, res) => {
        try {
            const tendencias = await Pedido.aggregate([
                { $unwind: "$productos" },
                { $group: { _id: "$productos.id", totalVentas: { $sum: 1 } }},
                { $sort: { totalVentas: -1 } }
            ]);

            const mapaTendencias = tendencias.reduce((acc, item) => {
                acc[item._id] = item.totalVentas;
                return acc;
            }, {});

            return res.status(200).json(mapaTendencias || {});
        } catch (error) {
            return res.status(500).json({ status: "error", message: "Error al calcular tendencias" });
        }
    }
};

module.exports = pedidoController;