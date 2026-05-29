const Pedido = require('../models/Pedido');

/**
 * CONTROLADOR AVANZADO DE PEDIDOS (URBAN DELIVERY PRO)
 * Manejo de lógica de negocio, cuadre de caja y persistencia.
 */
const pedidoController = {
    
    // 1. CREAR UN NUEVO PEDIDO CON VALIDACIÓN DE ESCENARIOS REALES
    crearPedido: async (req, res) => {
        try {
            const { cliente, ubicacion, productos, financiero } = req.body;

            // LÓGICA SENIOR: Validación estricta del flujo de caja de efectivo
            if (financiero.metodoPago === 'EFECTIVO_DIVISAS') {
                if (!financiero.pagaConBilleteDe) {
                    return res.status(400).json({
                        status: "error",
                        message: "Para pagos en efectivo es obligatorio indicar la denominación del billete."
                    });
                }
                
                if (financiero.pagaConBilleteDe < financiero.totalDolares) {
                    return res.status(400).json({
                        status: "error",
                        message: `El billete registrado ($${financiero.pagaConBilleteDe}) es insuficiente para cubrir el total de $${financiero.totalDolares}.`
                    });
                }

                // Cálculo automático del vuelto en el backend para evitar alteraciones en el cliente
                financiero.vueltoRequeridoDolares = Number((financiero.pagaConBilleteDe - financiero.totalDolares).toFixed(2));
            } else {
                // Si es Pago Móvil o Zelle, reiniciamos los campos de efectivo por seguridad
                financiero.pagaConBilleteDe = null;
                financiero.vueltoRequeridoDolares = 0;
            }

            // Instanciar el nuevo documento con los datos procesados y validados
            const nuevoPedido = new Pedido({
                cliente,
                ubicacion,
                productos,
                financiero,
                estatus: 'PENDIENTE'
            });

            // Persistencia asíncrona en MongoDB Atlas
            const pedidoGuardado = await nuevoPedido.save();

            return res.status(201).json({
                status: "success",
                message: "Pedido procesado y registrado en el sistema con éxito",
                data: pedidoGuardado
            });

        } catch (error) {
            console.error("CRITICAL ERROR [crearPedido]:", error);
            return res.status(500).json({
                status: "error",
                message: "Error interno del servidor al procesar la orden de entrega",
                error: error.message
            });
        }
    },

    // 2. OBTENER EL HISTORIAL COMPLETO (Para la vista de control de la empresa)
    obtenerPedidos: async (req, res) => {
        try {
            // Buscamos todos los pedidos ordenados del más reciente al más antiguo
            const pedidos = await Pedido.find().sort({ createdAt: -1 });
            
            return res.status(200).json({
                status: "success",
                resultados: pedidos.length,
                data: pedidos
            });
        } catch (error) {
            console.error("CRITICAL ERROR [obtenerPedidos]:", error);
            return res.status(500).json({
                status: "error",
                message: "Error al recuperar el historial de entregas de la base de datos",
                error: error.message
            });
        }
    },

    // 3. ACTUALIZAR EL ESTATUS EN TIEMPO REAL (Uso exclusivo de los motorizados/subordinados)
    actualizarEstatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { nuevoEstatus } = req.body;

            // Validar que el estatus enviado pertenezca a los flujos permitidos de la app
            const estatusValidos = ['PENDIENTE', 'PREPARANDO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'];
            if (!estatusValidos.includes(nuevoEstatus)) {
                return res.status(400).json({
                    status: "error",
                    message: "El estatus proporcionado no pertenece al flujo de logística válido."
                });
            }

            // Actualización atómica en la base de datos
            const pedidoActualizado = await Pedido.findByIdAndUpdate(
                id,
                { estatus: nuevoEstatus },
                { new: true, runValidators: true } // Nos retorna el documento nuevo modificado y ejecuta validaciones
            );

            if (!pedidoActualizado) {
                return res.status(404).json({
                    status: "error",
                    message: "El pedido solicitado no existe en los registros actuales."
                });
            }

            return res.status(200).json({
                status: "success",
                message: `El estatus de la orden mutó a: ${nuevoEstatus}`,
                data: pedidoActualizado
            });

        } catch (error) {
            console.error("CRITICAL ERROR [actualizarEstatus]:", error);
            return res.status(500).json({
                status: "error",
                message: "Error al actualizar la traza logística del pedido",
                error: error.message
            });
        }
    }
};

module.exports = pedidoController;