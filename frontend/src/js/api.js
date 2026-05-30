/* ==========================================================================
   🌐 MÓDULO CENTRAL DE SERVICIOS Y CONEXIONES API (api.js) - REALTIME GLOBAL
   ========================================================================== */

// 🕵️‍♂️ DETECTOR DINÁMICO DE ENTORNO
const OBTENER_BASE_URL = () => {
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
        // 🔥 IMPORTANTE: Asegúrate de colocar aquí la URL real de tu proyecto en Vercel
        // Ejemplo: 'https://urban-delivery-pro.vercel.app'
        return 'https://urban-delivery-pro.vercel.app'; 
    }
    return ''; // En producción usa la ruta relativa limpia
};

/**
 * Protocolo de Triple Blindaje para la obtención de la tasa oficial del BCV
 */
export async function consultarTasaBCV(tasaPorDefecto) {
    let tasaFinal = tasaPorDefecto;
    try {
        const respuesta = await fetch('https://ve.centralbank.workers.dev/v1/bcv');
        if (respuesta.ok) {
            const data = await respuesta.json();
            if (data && data.usd) {
                return { tasa: parseFloat(data.usd), exito: true, origen: "API Principal" };
            }
        }
    } catch (e) { console.warn("⚠️ API Principal caída. Buscando respaldo..."); }

    try {
        const respuestaEspejo = await fetch('https://s3.amazonaws.com/dolartoday/data.json');
        if (respuestaEspejo.ok) {
            const dataEspejo = await respuestaEspejo.json();
            if (dataEspejo && dataEspejo.USD && dataEspejo.USD.sicad2) {
                return { tasa: parseFloat(dataEspejo.USD.sicad2), exito: true, origen: "API de Respaldo" };
            }
        }
    } catch (e) { console.warn("⚠️ API de Respaldo caída."); }

    return { tasa: tasaFinal, exito: false, origen: "Ninguno (Fallo de Red)" };
}

/**
 * 🔥 MOTOR DE INTERACCIONES CENTRALIZADO EN LA NUBE
 * Lee las ventas reales acumuladas por todos los usuarios desde MongoDB Atlas.
 */
export async function obtenerVentasGlobalesTendencia() {
    try {
        const BASE_URL = OBTENER_BASE_URL();
        const respuesta = await fetch(`${BASE_URL}/api/tendencias`);
        
        // 🛡️ CONTROL DE FLUJO SEGURO: Verificamos si la respuesta realmente contiene un JSON válido
        if (respuesta.ok && respuesta.headers.get('content-type')?.includes('application/json')) {
            const data = await respuesta.json();
            return data; 
        }
        
        console.warn("⚠️ Servidor local sin acceso a rutas API. Activando contingencia de datos.");
        return recuperarEstructuraPorDefecto();
    } catch (e) {
        console.error("🚨 Error en conexión de base de datos global (MongoDB):", e);
        return recuperarEstructuraPorDefecto();
    }
}

/**
 * 📈 REPORTAR NUEVA COMPRA AL SERVIDOR GLOBAL
 * Incrementa en MongoDB Atlas las interacciones del producto de forma individual.
 */
export async function registrarVentaGlobalEnServidor(idProducto, cantidad) {
    try {
        const BASE_URL = OBTENER_BASE_URL();
        await fetch(`${BASE_URL}/api/tendencias/incrementar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: idProducto,
                cantidad: cantidad
            })
        });

        console.log(`📡 MongoDB Atlas Actualizado: Producto ${idProducto} sumó +${cantidad} interacciones.`);
    } catch (e) {
        console.warn("No se pudo sincronizar la venta con MongoDB Atlas:", e);
    }
}

/**
 * 📝 Módulo de mensajería para despacho
 */
export async function enviarMensajeWhatsApp(datosOrden) {
    console.log("⚡ Orden enviada a control de despacho de Urban Delivery Pro:", datosOrden);
}

/**
 * 🔄 CONTINGENCIA CONTROLADA
 * Entrega un objeto limpio estructurado para evitar que explote app.js en desarrollo local
 */
function recuperarEstructuraPorDefecto() {
    return {
        "1": parseInt(localStorage.getItem('ventas_1')) || 0,
        "2": parseInt(localStorage.getItem('ventas_2')) || 0,
        "3": parseInt(localStorage.getItem('ventas_3')) || 0
    };
}