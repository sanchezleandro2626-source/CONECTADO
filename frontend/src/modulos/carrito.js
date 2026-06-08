/**
 * URBAN DELIVERY PRO - MÓDULO DEL CARRITO DE COMPRAS (CON TASA DINÁMICA BCV)
 */

let carrito = JSON.parse(localStorage.getItem('urban_cart')) || [];

// TASA RESPALDO
export let TASA_BOLIVARES = 549.37; 
const MAX_CANTIDAD_PERMITIDA = 5;

// Función auxiliar para asegurar precisión de 2 decimales y evitar errores matemáticos de JS
const formatearMoneda = (valor) => Math.round(valor * 100) / 100;

export function setTasaBolivares(nuevaTasa) {
    if (nuevaTasa && nuevaTasa > 0) {
        TASA_BOLIVARES = nuevaTasa;
        console.log(`🚀 Ecosistema Urban Delivery Pro: Tasa BCV sincronizada en ${TASA_BOLIVARES} Bs/$`);
    }
}

export function agregarAlCarrito(producto, nodosDOM) {
    if (!producto || !producto.id) return;
    const existe = carrito.find(item => item.id === producto.id);

    if (existe) {
        if (existe.cantidad >= MAX_CANTIDAD_PERMITIDA) return;
        existe.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    guardarEnLocalStorage();
    renderizarCarrito(nodosDOM);
}

export function eliminarDelCarrito(id, nodosDOM) {
    const index = carrito.findIndex(item => item.id === id);
    if (index !== -1) {
        if (carrito[index].cantidad > 1) {
            carrito[index].cantidad--;
        } else {
            carrito.splice(index, 1);
        }
    }
    guardarEnLocalStorage();
    renderizarCarrito(nodosDOM);
}

function guardarEnLocalStorage() {
    localStorage.setItem('urban_cart', JSON.stringify(carrito));
}

export function renderizarCarrito(nodosDOM) {
    const { contenedorElementos, txtContador, txtSubtotal, txtTotal, txtTotalBs } = nodosDOM;

    if (carrito.length === 0) {
        if (contenedorElementos) contenedorElementos.innerHTML = `<p class="carrito-vacio" style="color: #666; text-align: center; padding: 20px;">Tu bolsa de compras está vacía.</p>`;
        if (txtContador) txtContador.textContent = "0 artículos";
        if (txtSubtotal) txtSubtotal.textContent = "$0.00";
        if (txtTotal) txtTotal.textContent = "$0.00";
        if (txtTotalBs) txtTotalBs.textContent = "0.00 Bs";
        
        const badge = document.getElementById('carritoContadorBadge');
        if (badge) badge.textContent = "0";
        return;
    }

    if (contenedorElementos) {
        contenedorElementos.innerHTML = "";
        carrito.forEach(item => {
            // Regex mejorado: elimina todo lo que no sea dígito o punto
            const precioLimpio = parseFloat(item.precio.replace(/[^\d.]/g, '')) || 0;
            const subtotalItem = (precioLimpio * item.cantidad);

            const itemHTML = document.createElement("div");
            itemHTML.className = "carrito-item-row";
            itemHTML.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: #111; padding: 10px; margin-bottom: 12px; border-radius: 6px;";
            
            itemHTML.innerHTML = `
                <div style="flex-grow: 1;">
                    <h5 style="margin:0; color:#fff; font-size:14px;">${item.nombre}</h5>
                    <small style="color:#888;">${item.precio} x ${item.cantidad}</small>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <strong style="color:#d4af37;">$${subtotalItem.toFixed(2)}</strong>
                    <button class="btn-eliminar-item" data-id="${item.id}" style="background: none; border: none; color: #ff4d4d; font-weight: bold; cursor: pointer; font-size: 16px;">✕</button>
                </div>
            `;
            contenedorElementos.appendChild(itemHTML);
        });
    }

    // Cálculo final con redondeo preciso
    const subtotal = carrito.reduce((acc, item) => {
        const precio = parseFloat(item.precio.replace(/[^\d.]/g, '')) || 0;
        return acc + (precio * item.cantidad);
    }, 0);

    const totalDolares = formatearMoneda(subtotal);
    const totalBolivares = formatearMoneda(totalDolares * TASA_BOLIVARES);
    const totalArticulos = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    
    // Actualización de UI
    if (txtContador) txtContador.textContent = `${totalArticulos} ${totalArticulos === 1 ? 'artículo' : 'artículos'}`;
    if (txtSubtotal) txtSubtotal.textContent = `$${totalDolares.toFixed(2)}`;
    if (txtTotal) txtTotal.textContent = `$${totalDolares.toFixed(2)}`;
    if (txtTotalBs) txtTotalBs.textContent = `${totalBolivares.toLocaleString("es-VE", { minimumFractionDigits: 2 })} Bs`;
    
    const badge = document.getElementById('carritoContadorBadge');
    if (badge) badge.textContent = totalArticulos;
}