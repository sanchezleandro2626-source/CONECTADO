const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
    // 1. Identificación y Control de Flujo
    codigoPedido: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        default: () => `UDP-${Math.floor(100000 + Math.random() * 900000)}` // Código único automatizado para control interno
    },
    cliente: {
        nombre: { type: String, required: [true, 'El nombre del cliente es obligatorio'], trim: true },
        telefono: { type: String, required: [true, 'El teléfono de contacto es obligatorio'], trim: true }
    },

    // 2. Logística de Entrega (Geolocalización Opt-In)
    ubicacion: {
        direccionTexto: { type: String, required: [true, 'La dirección de referencia es obligatoria'], trim: true },
        coordenadas: {
            latitud: { type: Number, required: [true, 'La latitud geográfica es requerida'] },
            longitud: { type: Number, required: [true, 'La longitud geográfica es requerida'] }
        },
        distanciaKm: { type: Number, default: 0 },
        costoDelivery: { type: Number, required: true, default: 0 }
    },

    // 3. Estructura de Carrito Financiero
    productos: [{
        productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
        nombre: { type: String, required: true },
        cantidad: { type: Number, required: true, min: [1, 'La cantidad mínima es 1'] },
        precioUnitario: { type: Number, required: true }
    }],

    // 4. Pasarela Monetaria Dinámica (Escenario cambiario de Caracas)
    financiero: {
        subtotalDolares: { type: Number, required: true },
        totalDolares: { type: Number, required: true },
        tasaBcvAplicada: { type: Number, required: true }, // Almacena la tasa exacta del BCV del segundo en que se cerró la orden
        totalBolivares: { type: Number, required: true },
        metodoPago: { 
            type: String, 
            required: true, 
            enum: ['EFECTIVO_DIVISAS', 'PAGO_MOVIL', 'ZELLE'] 
        },
        // Gestión de cuadre de caja de efectivo
        pagaConBilleteDe: { type: Number, default: null }, 
        vueltoRequeridoDolares: { type: Number, default: 0 }
    },

    // 5. Trazabilidad de Estados en Tiempo Real
    estatus: {
        type: String,
        required: true,
        enum: ['PENDIENTE', 'PREPARANDO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'],
        default: 'PENDIENTE'
    }
}, {
    timestamps: true // Genera automáticamente createdAt y updatedAt con precisión milimétrica
});

// Índices optimizados para búsquedas rápidas en la base de datos por parte de los subordinados
PedidoSchema.index({ codigoPedido: 1 });
PedidoSchema.index({ estatus: 1 });

module.exports = mongoose.model('Pedido', PedidoSchema);