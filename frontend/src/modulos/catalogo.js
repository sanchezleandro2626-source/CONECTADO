/**
 * URBAN DELIVERY PRO - MÓDULO DE CATÁLOGO INTELIGENTE
 * Responsabilidad: Leer productos del DOM, procesar búsquedas y ejecutar el algoritmo de tendencias.
 */

/**
 * Registra un clic en el producto, aumenta su contador y reordena la grilla.
 * @param {string} id - ID del producto clicado.
 * @param {HTMLElement} contenedorGrid - El nodo contenedor del HTML (#productosGrid).
 */
export function incrementarInteraccionYReordenar(id, contenedorGrid) {
    // 1. Buscar la tarjeta del producto específico en el HTML
    const tarjetas = Array.from(contenedorGrid.querySelectorAll('.producto-item'));
    const tarjetaClicada = tarjetas.find(item => item.getAttribute('data-id') === id);

    if (tarjetaClicada) {
        // Aumentar el contador almacenado en el atributo personalizado del HTML
        let ventasActuales = parseInt(tarjetaClicada.getAttribute('data-ventas') || '0', 10);
        ventasActuales++;
        tarjetaClicada.setAttribute('data-ventas', ventasActuales);

        // Actualizar el texto visual del contador de interacciones en esa tarjeta
        const txtContador = tarjetaClicada.querySelector('.interacciones-count');
        if (txtContador) txtContador.textContent = `Interacciones: ${ventasActuales}`;
    }

    // 2. ALGORITMO DE TENDENCIAS: Determinar cuál es el puntaje más alto actual
    const todasLasVentas = tarjetas.map(item => parseInt(item.getAttribute('data-ventas') || '0', 10));
    const maxVentas = Math.max(...todasLasVentas);

    // 3. Reordenar físicamente los elementos en el DOM (De mayor a menor)
    tarjetas.sort((a, b) => {
        const ventasA = parseInt(a.getAttribute('data-ventas') || '0', 10);
        const ventasB = parseInt(b.getAttribute('data-ventas') || '0', 10);
        return ventasB - ventasA; // Descendente
    });

    // 4. LIMPIAR EL CONTENEDOR Y VOLVER A INYECTAR EN EL ORDEN CORRECTO
    contenedorGrid.innerHTML = ""; 

    tarjetas.forEach(tarjeta => {
        const contenedorBadge = tarjeta.querySelector('.badge-tendencia-container');
        const ventasTarjeta = parseInt(tarjeta.getAttribute('data-ventas') || '0', 10);

        if (contenedorBadge) {
            // Si es el líder absoluto en clics y tiene al menos 1 clic, le ponemos la corona premium
            if (ventasTarjeta === maxVentas && maxVentas > 0) {
                contenedorBadge.innerHTML = `
                    <div class="items-badge-gold" style="position: absolute; top: 10px; left: 10px; z-index: 10; background: #050505; box-shadow: 0 4px 12px rgba(212,175,55,0.4); border: 1px solid #d4af37; padding: 4px 8px; border-radius: 4px; font-weight: bold; color: #d4af37; font-size: 11px;">
                        🔥 LO MÁS DESTACADO
                    </div>`;
            } else {
                contenedorBadge.innerHTML = ''; 
            }
        }
        
        // Se inyecta ordenadamente en el DOM limpio
        contenedorGrid.appendChild(tarjeta);
    });

    // Retornamos el nombre del producto modificado para usarlo en notificaciones si es necesario
    return tarjetaClicada ? tarjetaClicada.querySelector('h3').textContent : '';
}

/**
 * Filtra los productos en pantalla basándose en el texto del buscador.
 * @param {string} textoBusqueda - Criterio ingresado por el usuario.
 * @param {HTMLElement} contenedorGrid - El nodo contenedor (#productosGrid).
 */
export function filtrarCatalogo(textoBusqueda, contenedorGrid) {
    const query = textoBusqueda.toLowerCase().trim();
    const tarjetas = contenedorGrid.querySelectorAll('.producto-item');

    tarjetas.forEach(tarjeta => {
        const nombreProducto = tarjeta.querySelector('h3').textContent.toLowerCase();
        
        if (nombreProducto.includes(query)) {
            tarjeta.style.display = ""; 
        } else {
            tarjeta.style.display = "none"; 
        }
    });
}