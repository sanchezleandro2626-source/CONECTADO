/**
 * URBAN DELIVERY PRO - MÓDULO DE CATÁLOGO INTELIGENTE
 */

export function incrementarInteraccionYReordenar(id, contenedorGrid) {
    const tarjetas = Array.from(contenedorGrid.querySelectorAll('.producto-item'));
    const tarjetaClicada = tarjetas.find(item => item.getAttribute('data-id') === id);

    if (tarjetaClicada) {
        let ventasActuales = parseInt(tarjetaClicada.getAttribute('data-ventas') || '0', 10);
        ventasActuales++;
        tarjetaClicada.setAttribute('data-ventas', ventasActuales);

        const txtContador = tarjetaClicada.querySelector('.interacciones-count');
        if (txtContador) txtContador.textContent = `Interacciones: ${ventasActuales}`;
    }

    // 1. Obtener puntaje máximo actual
    const maxVentas = Math.max(...tarjetas.map(t => parseInt(t.getAttribute('data-ventas') || '0', 10)));

    // 2. Ordenar el Array (no el DOM todavía)
    tarjetas.sort((a, b) => {
        const vA = parseInt(a.getAttribute('data-ventas') || '0', 10);
        const vB = parseInt(b.getAttribute('data-ventas') || '0', 10);
        return vB - vA;
    });

    // 3. Reordenar en el DOM sin destruir los elementos (appendChild mueve el nodo existente)
    tarjetas.forEach((tarjeta, index) => {
        const ventasTarjeta = parseInt(tarjeta.getAttribute('data-ventas') || '0', 10);
        const contenedorBadge = tarjeta.querySelector('.badge-tendencia-container');

        if (contenedorBadge) {
            if (ventasTarjeta === maxVentas && maxVentas > 0) {
                contenedorBadge.innerHTML = `
                    <div class="items-badge-gold" style="position: absolute; top: 10px; left: 10px; z-index: 10; background: #050505; box-shadow: 0 4px 12px rgba(212,175,55,0.4); border: 1px solid #d4af37; padding: 4px 8px; border-radius: 4px; font-weight: bold; color: #d4af37; font-size: 11px;">
                        🔥 LO MÁS DESTACADO
                    </div>`;
            } else {
                contenedorBadge.innerHTML = '';
            }
        }
        contenedorGrid.appendChild(tarjeta); 
    });

    return tarjetaClicada ? tarjetaClicada.querySelector('h3').textContent : '';
}

export function filtrarCatalogo(textoBusqueda, contenedorGrid) {
    const query = textoBusqueda.toLowerCase().trim();
    const tarjetas = contenedorGrid.querySelectorAll('.producto-item');

    tarjetas.forEach(tarjeta => {
        const nombreProducto = tarjeta.querySelector('h3').textContent.toLowerCase();
        // Usamos la propiedad hidden o display para filtrar sin destruir elementos
        tarjeta.style.display = nombreProducto.includes(query) ? "" : "none";
    });
}