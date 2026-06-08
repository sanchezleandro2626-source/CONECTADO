const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        // Añadimos un timeout para que no se quede colgado esperando la API
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const response = await fetch('https://ve.centralbank.workers.dev/v1/bcv', { 
            signal: controller.signal 
        });

        clearTimeout(timeout);

        if (!response.ok) throw new Error("API BCV no disponible");

        const data = await response.json();
        
        // Validación de estructura: Aseguramos que data.usd exista
        if (data && data.usd) {
            return res.json({ 
                usd: data.usd, 
                fecha: new Date().toISOString(),
                origen: "BCV-Proxy" 
            });
        }
        
        throw new Error("Estructura de datos inválida");

    } catch (error) {
        console.error("Error en Proxy Tasa:", error.message);
        // En lugar de enviar un 500, enviamos un valor seguro o un error más descriptivo
        res.status(502).json({ 
            error: "No se pudo obtener la tasa en este momento", 
            detalle: error.message 
        });
    }
});

module.exports = router;