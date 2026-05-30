/* ==========================================================================
   🌐 MÓDULO CENTRAL DE SERVICIOS Y CONEXIONES API (api.js) - COMPLETO
   ========================================================================== */

/**
 * Protocolo de Triple Blindaje para la obtención de la tasa oficial del BCV
 * Realiza las peticiones de red y gestiona los respaldos en caso de caídas.
 * @param {number} tasaPorDefecto - Tasa base del sistema por si todo falla de origen
 * @returns {Promise<{tasa: number, exito: boolean}>} Objeto con la tasa final y el estatus de carga
 */
export async function consultarTasaBCV(tasaPorDefecto) {
    let tasaFinal = tasaPorDefecto;
    let tasaCargadaExitosamente = false;

    // --- INTENTO 1: API Principal ---
    try {
        const respuesta = await fetch('https://ve.centralbank.workers.dev/v1/bcv');
        if (respuesta.ok) {
            const data = await respuesta.json();
            if (data && data.usd) {
                return {
                    tasa: parseFloat(data.usd),
                    exito: true,
                    origen: "API Principal"
                };
            }
        }
    } catch (e) {
        console.warn("⚠️ API Principal caída en módulo api.js. Activando respaldo...");
    }

    // --- INTENTO 2: API de Respaldo (DolarToday/BCV espejo) ---
    try {
        const respuestaEspejo = await fetch('https://s3.amazonaws.com/dolartoday/data.json');
        if (respuestaEspejo.ok) {
            const dataEspejo = await respuestaEspejo.json();
            if (dataEspejo && dataEspejo.USD && dataEspejo.USD.sicad2) {
                return {
                    tasa: parseFloat(dataEspejo.USD.sicad2),
                    exito: true,
                    origen: "API de Respaldo"
                };
            }
        }
    } catch (e) {
        console.warn("⚠️ API de Respaldo caída en módulo api.js.");
    }

    // Si ambas APIs fallaron, devolvemos el valor por defecto para que app.js maneje el LocalStorage
    return {
        tasa: tasaFinal,
        exito: false,
        origen: "Ninguno (Fallo de Red)"
    };
}

/**
 * 🔥 INYECCIÓN DE DATOS UNIFICADOS: Sincroniza PC y móvil al mismo tiempo
 * @returns {Promise<Object>} Diccionario con el ID del producto y sus ventas compartidas
 */
export async function obtenerVentasGlobalesTendencia() {
    try {
        // En un futuro, aquí conectarás tu servidor real.
        // Por ahora, dejamos estos datos fijos idénticos para que se sincronicen todos los equipos:
        return {
            "1": 120, // Tu producto ID 1 tendrá 120 interacciones y será el rey indiscutible (Top 1 arriba)
            "2": 45,  // Tu producto ID 2 tendrá 45 interacciones
            "3": 85   // Tu producto ID 3 tendrá 85 interacciones
        };
    } catch (e) {
        console.warn("⚠️ Error al consultar tendencias globales en api.js:", e);
        return null;
    }
}

/**
 * 📝 Espacio preparado para la API de WhatsApp (Urban Delivery Pro)
 * Aquí centralizarás los endpoints o llamadas futuras a tu pasarela de mensajería.
 */
export async function enviarMensajeWhatsApp(datosOrden) {
    console.log("⚡ Servicio API de WhatsApp preparado para recibir datos de la orden:", datosOrden);
    // Aquí meterás tu fetch de WhatsApp o la construcción del link en el futuro
}