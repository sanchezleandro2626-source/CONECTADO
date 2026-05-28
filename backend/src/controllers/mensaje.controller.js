const Mensaje = require('../models/Mensaje'); // Importamos el molde

// 1. Función para GUARDAR un nuevo mensaje en MongoDB
exports.crearMensaje = async (req, res) => {
    try {
        const { contenido, autor } = req.body;
        
        // Creamos el nuevo documento usando el modelo
        const nuevoMensaje = new Mensaje({ contenido, autor });
        
        // Lo guardamos en MongoDB
        await nuevoMensaje.save();
        
        res.status(201).json({ status: "success", data: nuevoMensaje });
    } catch (error) {
        res.status(500).json({ status: "error", mensaje: error.message });
    }
};

// 2. Función para OBTENER todos los mensajes guardados
exports.obtenerMensajes = async (req, res) => {
    try {
        const mensajes = await Mensaje.find().sort({ fechaCreacion: -1 }); // Trae los más recientes primero
        res.status(200).json({ status: "success", data: mensajes });
    } catch (error) {
        res.status(500).json({ status: "error", mensaje: error.message });
    }
};