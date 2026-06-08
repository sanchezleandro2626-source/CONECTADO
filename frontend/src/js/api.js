/* ==========================================================================
   🌐 MÓDULO CENTRAL DE SERVICIOS Y CONEXIONES API (api.js) - REALTIME GLOBAL
   ========================================================================== */

const OBTENER_BASE_URL = () => {
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
        return 'https://urban-delivery.vercel.app'; 
    }
    return ''; 
};

/**
 * Protocolo de Triple Blindaje (MANTENIDO)
 * Ahora añadimos una opción: si falla, intenta a través del Proxy del Servidor
 */
export async function consultarTasaBCV(tasaPorDefecto) {
    // 1. Prioridad: LocalStorage (No se toca, mantiene tu lógica local)
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
        const tasaRecuperada = parseFloat(localStorage.getItem('urban_last_bcv'));
        if (tasaRecuperada) return { tasa: tasaRecuperada, exito: true, origen: "LocalStorage (Entorno Local)" };
        return { tasa: tasaPorDefecto, exito: false, origen: "Tasa Base por Defecto" };
    }

    // 2. NUEVA CAPA: Proxy a través de tu propio servidor (Evita CORS)
    try {
        const resProxy = await fetch('/api/tasa');
        if (resProxy.ok) {
            const data = await resProxy.json();
            if (data && data.usd) return { tasa: parseFloat(data.usd), exito: true, origen: "Proxy Servidor (BCV)" };
        }
    } catch (e) { /* Silenciado */ }

    // 3. Respaldo original (Mantenemos tus 2 APIs originales intactas)
    try {
        const respuesta = await fetch('https://ve.centralbank.workers.dev/v1/bcv');
        if (respuesta.ok) {
            const data = await respuesta.json();
            if (data && data.usd) return { tasa: parseFloat(data.usd), exito: true, origen: "API Principal" };
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

    return { tasa: tasaPorDefecto, exito: false, origen: "Ninguno (Fallo de Red)" };
}

/**
 * 🔥 MOTOR DE INTERACCIONES CENTRALIZADO (MANTENIDO)
 */
export async function obtenerVentasGlobalesTendencia() {
    try {
        const BASE_URL = OBTENER_BASE_URL();
        const controladorTiempo = new AbortController();
        const idTiempo = setTimeout(() => controladorTiempo.abort(), 4000);

        const respuesta = await fetch(`${BASE_URL}/api/pedidos/tendencias`, { 
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
 * 📈 REPORTAR NUEVA COMPRA AL SERVIDOR GLOBAL (MANTENIDO)
 */
export async function registrarVentaGlobalEnServidor(idProducto, cantidad) {
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') return; 

    try {
        const BASE_URL = OBTENER_BASE_URL();
        await fetch(`${BASE_URL}/api/tendencias/incrementar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: idProducto, cantidad: cantidad })
        });
    } catch (e) { /* Silenciado */ }
}

export async function enviarMensajeWhatsApp(datosOrden) {
    console.log("⚡ Orden enviada a control de despacho de Urban Delivery Pro:", datosOrden);
}

function recuperarEstructuraPorDefecto() {
    return {
        "1": parseInt(localStorage.getItem('ventas_1')) || 0,
        "2": parseInt(localStorage.getItem('ventas_2')) || 0,
        "3": parseInt(localStorage.getItem('ventas_3')) || 0
    };
}