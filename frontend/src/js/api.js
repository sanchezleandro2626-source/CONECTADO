/**
 * 📈 REPORTAR NUEVA COMPRA AL SERVIDOR GLOBAL (Blindado)
 */
export async function registrarVentaGlobalEnServidor(idProducto, cantidad) {
    // Si estamos en desarrollo, no saturamos el servidor de producción
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') return; 

    try {
        const BASE_URL = OBTENER_BASE_URL();
        
        const response = await fetch(`${BASE_URL}/api/pedidos/tendencias/incrementar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: idProducto, 
                cantidad: cantidad,
                timestamp: new Date().toISOString() // Añadimos marca de tiempo para control
            })
        });

        // Verificamos si la respuesta fue exitosa (200-299)
        if (!response.ok) {
            console.error(`Error al registrar tendencia: ${response.status}`);
        } else {
            console.log("Tendencia sincronizada con éxito");
        }
        
    } catch (e) { 
        // Capturamos fallos de red o de servidor
        console.error("Fallo crítico al conectar con el motor de tendencias:", e.message);
    }
}