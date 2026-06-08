// ... (Tus importaciones se mantienen igual)

document.addEventListener('DOMContentLoaded', async () => {
    // ... (Tu lógica de tasa se mantiene igual, es correcta)

    // ==========================================
    // 🔥 MOTOR DE EVALUACIÓN DE TENDENCIAS GLOBAL (Optimizado)
    // ==========================================
    let isUpdating = false; // Bandera para evitar llamadas concurrentes

    const actualizarMedallasTendencia = async () => {
        if (isUpdating || !DOM.productosGrid) return;
        isUpdating = true; // Bloqueamos nuevas llamadas mientras esta corre

        try {
            const tarjetasProductos = Array.from(DOM.productosGrid.querySelectorAll('.producto-item'));
            const ventasGlobales = await obtenerVentasGlobalesTendencia();

            tarjetasProductos.forEach(tarjeta => {
                const id = tarjeta.getAttribute('data-id');
                const ventasActuales = (ventasGlobales && ventasGlobales[id] !== undefined) 
                    ? ventasGlobales[id] 
                    : (parseInt(localStorage.getItem(`ventas_${id}`)) || 0);
                
                const smallContador = tarjeta.querySelector('.interacciones-count');
                if (smallContador) smallContador.textContent = `Interacciones: ${ventasActuales}`;
                tarjeta.setAttribute('data-ventas-temp', ventasActuales);
            });

            tarjetasProductos.sort((a, b) => parseInt(b.getAttribute('data-ventas-temp')) - parseInt(a.getAttribute('data-ventas-temp')));

            let idProductoGanador = tarjetasProductos.length > 0 ? tarjetasProductos[0].getAttribute('data-id') : null;

            tarjetasProductos.forEach(tarjeta => {
                DOM.productosGrid.appendChild(tarjeta);
                const id = tarjeta.getAttribute('data-id');
                const contenedorBadge = tarjeta.querySelector('.badge-tendencia-container');
                
                if (id === idProductoGanador) {
                    if (contenedorBadge && !contenedorBadge.querySelector('.badge-gold-mvp')) {
                        contenedorBadge.innerHTML = `<div class="badge-gold-mvp"><span>⚡</span> Top Tendencia</div>`;
                    }
                    tarjeta.classList.add('tarjeta-mvp-activa');
                } else {
                    if (contenedorBadge) contenedorBadge.innerHTML = "";
                    tarjeta.classList.remove('tarjeta-mvp-activa');
                }
            });
        } catch (error) {
            console.error("Error al actualizar tendencias:", error);
        } finally {
            isUpdating = false; // Liberamos la bandera
        }
    };

    // ... (El resto de tu código de pagos y carrito se mantiene igual)

    // ==========================================
    // 🔄 MOTOR REACTIVO EN TIEMPO REAL (Seguro)
    // ==========================================
    setInterval(actualizarMedallasTendencia, 15000); // Subimos a 15s para ser más amigables con Vercel
});