const Mensaje = require('../models/Mensaje'); // Importamos el molde

// 1. Función para GUARDAR un nuevo mensaje en MongoDB (Reforzada)
exports.crearMensaje = async (req, res) => {
    try {
        const { contenido, autor } = req.body;
        
        // Validación Proactiva: Evita guardar documentos basura en MongoDB
        if (!contenido || !autor || contenido.trim() === "" || autor.trim() === "") {
            return res.status(400).json({ 
                status: "error", 
                mensaje: "El contenido y el autor son campos obligatorios y no pueden estar vacíos" 
            });
        }
        
        // Creamos el nuevo documento usando el modelo
        const nuevoMensaje = new Mensaje({ 
            contenido: contenido.trim(), 
            autor: autor.trim() 
        });
        
        // Lo guardamos en MongoDB
        await nuevoMensaje.save();
        
        res.status(201).json({ status: "success", data: nuevoMensaje });
    } catch (error) {
        res.status(500).json({ status: "error", mensaje: "Error interno al guardar el mensaje: " + error.message });
    }
};

// 2. Función para OBTENER todos los mensajes guardados (Optimizada)
exports.obtenerMensajes = async (req, res) => {
    try {
        // Obtenemos los mensajes y aseguramos que si no hay nada, devuelva un array vacío
        const mensajes = await Mensaje.find().sort({ fechaCreacion: -1 }); 
        
        res.status(200).json({ 
            status: "success", 
            count: mensajes.length,
            data: mensajes 
        });
    } catch (error) {
        res.status(500).json({ status: "error", mensaje: "Error al recuperar los mensajes: " + error.message });
    }
};