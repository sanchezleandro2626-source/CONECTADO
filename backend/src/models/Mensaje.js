const mongoose = require('mongoose');

// Definimos el esquema (el molde) de lo que aceptará la base de datos
const MensajeSchema = new mongoose.Schema({
    contenido: {
        type: String,
        required: [true, "El contenido del mensaje es obligatorio"],
        trim: true
    },
    autor: {
        type: String,
        default: "Anónimo"
    },
    fechaCreacion: {
        type: Date,
        default: Date.now // Guarda la hora y fecha exacta automáticamente
    }
});

// Exportamos el modelo para usarlo en los controladores
module.exports = mongoose.model('Mensaje', MensajeSchema);