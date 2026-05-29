/**
 * URBAN DELIVERY PRO - MÓDULO DEL CARRITO DE COMPRAS (CON TASA DINÁMICA BCV)
 * Responsabilidad: Gestionar los productos, aplicar límites, persistir datos y calcular montos con tasa real.
 */

let carrito = JSON.parse(localStorage.getItem('urban_cart')) || [];

// TASA RESPALDO: Seteada con el BCV real de hoy 29 de mayo de 2026 para blindar pérdidas
export let TASA_BOLIVARES = 549.37; 
const MAX_CANTIDAD_PERMITIDA = 5;

/**
 * Permite cambiar la tasa de bolívares en tiempo real desde el exterior (API)
 */
export function setTasaBolivares(nuevaTasa) {
    if (nuevaTasa && nuevaTasa > 0) {
        TASA_BOLIVARES = nuevaTasa;
        console.log(`🚀 Ecosistema Urban Delivery Pro: Tasa BCV sincronizada en ${TASA_BOLIVARES} Bs/$`);
    }
}

/**
 * Añade un producto al carrito o aumenta su cantidad.
 */
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

/**
 * Elimina un producto por completo del carrito o reduce su cantidad.
 */
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

/**
 * Renderiza la lista de productos y calcula los montos totales en pantalla.
 */
export function renderizarCarrito(nodosDOM) {
    const { contenedorElementos, txtContador, txtSubtotal, txtTotal, txtTotalBs } = nodosDOM;

    if (carrito.length === 0) {
        if (contenedorElementos) {
            contenedorElementos.innerHTML = `<p class="carrito-vacio" style="color: #666; text-align: center; padding: 20px;">Tu bolsa de compras está vacía.</p>`;
        }
        if (txtContador) txtContador.textContent = "0 artículos";
        if (txtSubtotal) txtSubtotal.textContent = "$0.00";
        if (txtTotal) txtTotal.textContent = "$0.00";
        if (txtTotalBs) txtTotalBs.textContent = "0.00 Bs";

        const badgeContador = document.getElementById('carritoContadorBadge');
        if (badgeContador) badgeContador.textContent = "0";
        return;
    }

    if (contenedorElementos) {
        contenedorElementos.innerHTML = "";

        carrito.forEach(item => {
            const itemHTML = document.createElement("div");
            itemHTML.className = "carrito-item-row";
            itemHTML.style.display = "flex";
            itemHTML.style.justify = "space-between";
            itemHTML.style.alignItems = "center";
            itemHTML.style.marginBottom = "12px";
            itemHTML.style.padding = "10px";
            itemHTML.style.background = "#111";
            itemHTML.style.borderRadius = "6px";
            itemHTML.style.borderBottom = "1px solid #222";

            const precioLimpio = parseFloat(item.precio.replace(/\$/g, '').trim()) || 0;
            const subtotalItem = (precioLimpio * item.cantidad).toFixed(2);

            itemHTML.innerHTML = `
                <div style="flex-grow: 1; padding-right: 10px;">
                    <h5 style="margin:0; color:#fff; font-size:14px; font-family:'Mona Sans', sans-serif;">${item.nombre}</h5>
                    <small style="color:#888;">${item.precio} x ${item.cantidad}</small>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <strong style="color:#d4af37; font-family:'Hubot Sans', sans-serif;">$${subtotalItem}</strong>
                    <button class="btn-eliminar-item" data-id="${item.id}" style="background: none; border: none; color: #ff4d4d; font-weight: bold; cursor: pointer; font-size: 16px; padding: 5px 8px; transition: 0.2s;">
                        ✕
                    </button>
                </div>
            `;
            contenedorElementos.appendChild(itemHTML);
        });
    }

    // Cálculos financieros
    const subtotal = carrito.reduce((acc, item) => {
        const precioNumerico = parseFloat(item.precio.replace(/\$/g, '').trim()) || 0;
        return acc + (precioNumerico * item.cantidad);
    }, 0);

    const delivery = 0.00; // En 0 hasta activar geolocalización
    const totalDolares = subtotal + delivery;
    
    // USAR LA TASA ACTUALIZADA EN TIEMPO REAL
    const totalBolivares = totalDolares * TASA_BOLIVARES;

    const totalArticulos = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    
    if (txtContador) txtContador.textContent = `${totalArticulos} ${totalArticulos === 1 ? 'artículo' : 'artículos'}`;
    if (txtSubtotal) txtSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    
    const nodoDelivery = document.getElementById('resumenDelivery');
    if (nodoDelivery) nodoDelivery.textContent = `$${delivery.toFixed(2)}`;
    
    if (txtTotal) txtTotal.textContent = `$${totalDolares.toFixed(2)}`;
    if (txtTotalBs) txtTotalBs.textContent = `${totalBolivares.toLocaleString("es-VE", { minimumFractionDigits: 2 })} Bs`;

    const badgeContador = document.getElementById('carritoContadorBadge');
    if (badgeContador) {
        badgeContador.textContent = totalArticulos;
    }
}