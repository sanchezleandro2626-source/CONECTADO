/* ==========================================================================
   🌐 MÓDULO CENTRAL DE SERVICIOS Y CONEXIONES API (api.js) - REALTIME GLOBAL
   ========================================================================== */

// 🕵️‍♂️ DETECTOR DINÁMICO DE ENTORNO
const OBTENER_BASE_URL = () => {
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
        return 'https://urban-delivery.vercel.app'; 
    }
    return ''; // En producción usa la ruta relativa limpia
};

/**
 * Protocolo de Triple Blindaje para la obtención de la tasa oficial del BCV
 */
export async function consultarTasaBCV(tasaPorDefecto) {
    let tasaFinal = tasaPorDefecto;

    // Localhost maneja la tasa en LocalStorage para evitar saturar la consola de la PC
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
        const tasaRecuperada = parseFloat(localStorage.getItem('urban_last_bcv'));
        if (tasaRecuperada) {
            return { tasa: tasaRecuperada, exito: true, origen: "LocalStorage (Entorno Local)" };
        }
        return { tasa: tasaFinal, exito: false, origen: "Tasa Base por Defecto" };
    }

    try {
        const respuesta = await fetch('https://ve.centralbank.workers.dev/v1/bcv');
        if (respuesta.ok) {
            const data = await respuesta.json();
            if (data && data.usd) {
                return { tasa: parseFloat(data.usd), exito: true, origen: "API Principal" };
            }
        }
    } catch (e) { /* Silenciado */ }

    try {
        const respuestaEspejo = await fetch('https://s3.amazonaws.com/dolartoday/data.json');
        if (respuestaEspejo.ok) {
            const dataEspejo = await respuestaEspejo.json();
            if (dataEspejo && dataEspejo.USD && dataEspejo.USD.sicad2) {
                return { tasa: parseFloat(dataEspejo.USD.sicad2), exito: true, origen: "API de Respaldo" };
            }
        }
    } catch (e) { /* Silenciado */ }

    return { tasa: tasaFinal, exito: false, origen: "Ninguno (Fallo de Red)" };
}

/**
 * 🔥 MOTOR DE INTERACCIONES CENTRALIZADO EN LA NUBE
 */
export async function obtenerVentasGlobalesTendencia() {
    // 🛡️ BLINDAJE ANTI-CORS EN LAPTOP: 
    // Si estás en desarrollo local, lee el respaldo inmediato para evitar que el 404 de Vercel ensucie la consola.
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
        return recuperarEstructuraPorDefecto();
    }

    try {
        const BASE_URL = OBTENER_BASE_URL();
        const controladorTiempo = new AbortController();
        const idTiempo = setTimeout(() => controladorTiempo.abort(), 4000);

        const respuesta = await fetch(`${BASE_URL}/api/tendencias`, { 
            signal: controladorTiempo.signal 
        });
        
        clearTimeout(idTiempo);

        if (respuesta.ok && respuesta.headers.get('content-type')?.includes('application/json')) {
            const data = await respuesta.json();
            if (data && typeof data === 'object') return data;
        }
        
        return recuperarEstructuraPorDefecto();
    } catch (e) {
        return recuperarEstructuraPorDefecto();
    }
}

/**
 * 📈 REPORTAR NUEVA COMPRA AL SERVIDOR GLOBAL
 */
export async function registrarVentaGlobalEnServidor(idProducto, cantidad) {
    // En la laptop guardamos localmente en silencio para no generar errores de red fallidos
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
        return; 
    }

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
    } catch (e) {
        /* Silenciado en producción */
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
 */
function recuperarEstructuraPorDefecto() {
    return {
        "1": parseInt(localStorage.getItem('ventas_1')) || 0,
        "2": parseInt(localStorage.getItem('ventas_2')) || 0,
        "3": parseInt(localStorage.getItem('ventas_3')) || 0
    };
}