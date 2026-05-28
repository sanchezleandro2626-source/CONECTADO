const mongoose = require('mongoose');

const conectarDB = async () => {
    try {
        // En 2026 leemos la URI directamente desde el archivo .env protegido
        const MONGO_URI = process.env.MONGO_URI;

        if (!MONGO_URI) {
            throw new Error("La variable MONGO_URI no está definida en el archivo .env");
        }

        await mongoose.connect(MONGO_URI);
        
        console.log("Conectado a MongoDB Atlas");

    } catch (error) {
        console.error("❌ Error grave de conexión a Atlas:", error.message);
        process.exit(1);
    }
};

module.exports = conectarDB;