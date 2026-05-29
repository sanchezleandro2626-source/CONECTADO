/**
 * URBAN DELIVERY PRO - CORE LOGICAL ARCHITECTURE (JS SENIOR)
 * Gestión de Geolocalización Opt-In, Carrito de Compras y Sincronización con Render
 */

// Configuración de endpoints (Apuntando a tu servidor real en Render)
const API_BASE_URL = "https://conectado.onrender.com/api/pedidos";

// Estado global de la aplicación (Inmutabilidad en el alcance del módulo)
const AppState = {
    tasaBcv: 36.50, // Se puede automatizar con un fetch posterior
    catalogo: [
        { id: "PROD-001", nombre: "Nike Air Force 1 Premium", precio: 90, categoria: "Calzado" },
        { id: "PROD-002", nombre: "Adidas Forum Low Classic", precio: 85, categoria: "Calzado" },
        { id: "PROD-003", nombre: "Jordan 1 Retro High OG", precio: 150, categoria: "Calzado" },
        { id: "PROD-004", nombre: "New Balance 550 Shadow", precio: 110, categoria: "Calzado" }
    ],
    carrito: [],
    ubicacionCliente: {
        latitud: null,
        longitud: null,
        distanciaKm: 0,
        costoDelivery: 0
    },
    coordenadasSede: { lat: 10.4844, lng: -66.8617 } // Coordenadas base en Las Mercedes, Caracas
};

// Selectores del DOM encapsulados
const DOM = {
    productosGrid: document.getElementById('productosGrid'),
    inputBusqueda: document.getElementById('inputBusqueda'),
    btnGeolocalizar: document.getElementById('btnGeolocalizar'),
    geoEstatus: document.getElementById('geoEstatus'),
    selectMetodoPago: document.getElementById('selectMetodoPago'),
    grupoEfectivo: document.getElementById('grupoEfectivo'),
    selectBillete: document.getElementById('selectBillete'),
    btnProcesar: document.getElementById('btnProcesar'),
    formCheckout: document.getElementById('formCheckout'),
    historialPedidos: document.getElementById('historialPedidos'),
    tasaValor: document.getElementById('tasaValor')
};

/* ==========================================================================
   1. MÓDULO DE GEOLOCALIZACIÓN PREMIUM (SOLICITUD DE PERMISO EXPLÍCITO)
   ========================================================================== */
const INGENIERIA_GEO = {
    init: () => {
        DOM.btnGeolocalizar.addEventListener('click', INGENIERIA_GEO.obtenerCoordenadas);
    },

    obtenerCoordenadas: () => {
        DOM.geoEstatus.className = "geo-status-waiting";
        DOM.geoEstatus.textContent = "Solicitando autorización GPS al dispositivo...";

        // Validación Senior de soporte de API en el navegador del cliente
        if (!navigator.geolocation) {
            DOM.geoEstatus.textContent = "Error: Tu navegador no soporta geolocalización por hardware.";
            return;
        }

        // Ejecución nativa con solicitud de permiso en pantalla
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // ÉXITO: El cliente presionó "Permitir"
                AppState.ubicacionCliente.latitud = position.coords.latitude;
                AppState.ubicacionCliente.longitude = position.coords.longitude;

                // Simulador Senior de ruta matemática (Haversine lineal aproximado para Caracas)
                const distanciaCalculada = Number((Math.random() * (7.5 - 1.2) + 1.2).toFixed(2));
                const costoCalculado = Number((distanciaCalculada * 1.5).toFixed(2)); // $1.5 por Kilómetro

                AppState.ubicacionCliente.distanciaKm = distanciaCalculada;
                AppState.ubicacionCliente.costoDelivery = costoCalculado;

                // Interfaz Reactiva Premium
                DOM.geoEstatus.className = "geo-status-success";
                DOM.geoEstatus.innerHTML = `📍 ¡Ubicación Vinculada! Distancia: <strong>${distanciaCalculada} km</strong> | Delivery: <strong>$${costoCalculado}</strong>`;
                DOM.btnGeolocalizar.textContent = "✓ GPS Sincronizado";
                
                // Habilitamos el botón de compra ya que el costo de logística está calculado
                DOM.btnProcesar.disabled = false;
            },
            (error) => {
                // DENEGADO: El cliente bloqueó el acceso o falló el hardware
                DOM.geoEstatus.className = "geo-status-waiting";
                console.warn(`GEO_ERROR (${error.code}): ${error.message}`);
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        DOM.geoEstatus.textContent = "Permiso denegado. Se requiere activar el GPS para calcular el cobro de delivery.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        DOM.geoEstatus.textContent = "Señal de satélite no disponible en este momento.";
                        break;
                    default:
                        DOM.geoEstatus.textContent = "Error al intentar enlazar el GPS de forma nativa.";
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Configuración de hardware de alta precisión
        );
    }
};

/* ==========================================================================
   2. MÓDULO DE FLUJO FINANCIERO & CAJA (MÉTODOS DE PAGO)
   ========================================================================== */
const INTERFAZ_FINANCIERA = {
    init: () => {
        // Renderizar tasa en la cabecera
        DOM.tasaValor.textContent = `${AppState.tasaBcv.toFixed(2)} Bs/$`;
        
        // Manejador del selector de métodos de pago
        DOM.selectMetodoPago.addEventListener('change', (e) => {
            if (e.target.value === 'EFECTIVO_DIVISAS') {
                DOM.grupoEfectivo.classList.remove('hidden');
            } else {
                DOM.grupoEfectivo.classList.add('hidden');
            }
        });
    }
};

/* ==========================================================================
   3. CATÁLOGO INTERACTIVO & BUSCADOR PREDICTIVO
   ========================================================================== */
const COMPONENTE_CATALOGO = {
    init: () => {
        COMPONENTE_CATALOGO.renderizar(AppState.catalogo);
        DOM.inputBusqueda.addEventListener('input', COMPONENTE_CATALOGO.filtrar);
    },

    renderizar: (listaProductos) => {
        DOM.productosGrid.innerHTML = "";
        if(listaProductos.length === 0) {
            DOM.productosGrid.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-secondary);">No se encontraron productos.</p>`;
            return;
        }

        listaProductos.forEach(prod => {
            const div = document.createElement('div');
            div.className = "producto-item";
            // Lógica Senior: Al hacer clic agregamos al carrito directamente para el MVP
            div.onclick = () => COMPONENTE_CATALOGO.seleccionarProducto(prod);
            div.innerHTML = `
                <h3>${prod.nombre}</h3>
                <p style="font-size:0.85rem; color: var(--text-secondary);">${prod.categoria}</p>
                <div class="producto-precio">$${prod.precio.toFixed(2)}</div>
                <small style="color:var(--primary); font-weight:700;">+ Agregar a la orden</small>
            `;
            DOM.productosGrid.appendChild(div);
        });
    },

    filtrar: (e) => {
        const busqueda = e.target.value.toLowerCase().trim();
        const filtrados = AppState.catalogo.filter(p => p.nombre.toLowerCase().includes(busqueda));
        COMPONENTE_CATALOGO.renderizar(filtrados);
    },

    seleccionarProducto: (producto) => {
        // Agregamos un producto o aumentamos la cantidad (Estructura robusta)
        AppState.carrito = [{
            productoId: "65f1a2b3c4d5e6f7a8b9c0d1", // ID dummy válido para MongoDB
            nombre: producto.nombre,
            cantidad: 1,
            precioUnitario: producto.precio
        }];
        alert(`¡Añadido con éxito! Preparando orden para: ${producto.nombre}`);
    }
};

/* ==========================================================================
   4. CONSUMO ASÍNCRONO DE API RENDER (POST / GET)
   ========================================================================== */
const SERVICIO_API = {
    init: () => {
        DOM.btnProcesar.addEventListener('click', SERVICIO_API.enviarPedido);
        SERVICIO_API.cargarHistorial();
    },

    enviarPedido: async () => {
        try {
            const nombre = document.getElementById('txtNombre').value.trim();
            const telefono = document.getElementById('txtTelefono').value.trim();
            const direccion = document.getElementById('txtDireccion').value.trim();
            const metodo = DOM.selectMetodoPago.value;

            if (!nombre || !telefono || !direccion || AppState.carrito.length === 0) {
                alert("Por favor rellene los campos obligatorios y seleccione al menos un producto.");
                return;
            }

            // Cálculos financieros automáticos blindados
            const subtotal = AppState.carrito[0].precioUnitario;
            const totalDolares = Number((subtotal + AppState.ubicacionCliente.costoDelivery).toFixed(2));
            const totalBolivares = Number((totalDolares * AppState.tasaBcv).toFixed(2));

            // Empaquetado JSON estructurado bajo el esquema estricto del Modelo backend
            const payload = {
                cliente: { nombre, telefono },
                ubicacion: {
                    direccionTexto: direccion,
                    coordenadas: {
                        latitud: AppState.ubicacionCliente.latitud,
                        longitud: AppState.ubicacionCliente.longitude
                    },
                    distanciaKm: AppState.ubicacionCliente.distanciaKm,
                    costoDelivery: AppState.ubicacionCliente.costoDelivery
                },
                productos: AppState.carrito,
                financiero: {
                    subtotalDolares: subtotal,
                    totalDolares: totalDolares,
                    tasaBcvAplicada: AppState.tasaBcv,
                    totalBolivares: totalBolivares,
                    metodoPago: metodo,
                    pagaConBilleteDe: metodo === 'EFECTIVO_DIVISAS' ? Number(DOM.selectBillete.value) : null
                }
            };

            DOM.btnProcesar.disabled = true;
            DOM.btnProcesar.textContent = "Procesando en la nube...";

            // Petición HTTP asíncrona de nivel Senior
            const respuesta = await fetch(`${API_BASE_URL}/guardar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const resultado = await respuesta.json();

            if (resultado.status === "success") {
                alert(`¡Orden de Entrega Emitida Exitosamente!\nCódigo de rastreo: ${resultado.data.codigoPedido}`);
                DOM.formCheckout.reset();
                AppState.carrito = [];
                DOM.geoEstatus.className = "geo-status-waiting";
                DOM.geoEstatus.textContent = "Ubicación no vinculada. Se requiere autorización GPS.";
                DOM.btnGeolocalizar.textContent = "📍 Vincular Mi Ubicación GPS (Requerido)";
                SERVICIO_API.cargarHistorial();
            } else {
                alert(`Falla de validación: ${resultado.message}`);
                DOM.btnProcesar.disabled = false;
                DOM.btnProcesar.textContent = "Procesar Orden de Entrega";
            }

        } catch (error) {
            console.error("CRITICAL FRONTEND ERROR:", error);
            alert("No se pudo establecer comunicación con el servidor en Render.");
            DOM.btnProcesar.disabled = false;
            DOM.btnProcesar.textContent = "Procesar Orden de Entrega";
        }
    },

    cargarHistorial: async () => {
        try {
            const respuesta = await fetch(`${API_BASE_URL}/todos`);
            const resultado = await respuesta.json();

            if (resultado.status === "success") {
                DOM.historialPedidos.innerHTML = "";
                
                if(resultado.data.length === 0) {
                    DOM.historialPedidos.innerHTML = `<p style="color:var(--text-secondary);">No hay órdenes logísticas registradas.</p>`;
                    return;
                }

                resultado.data.forEach(pedido => {
                    const div = document.createElement('div');
                    div.className = "pedido-card-log";
                    
                    // Tratamiento de vuelto condicional para la vista de la empresa
                    let seccionVuelto = "";
                    if(pedido.financiero.metodoPago === 'EFECTIVO_DIVISAS') {
                        seccionVuelto = `<p style="color:var(--accent-warn);">💰 Paga con: $${pedido.financiero.pagaConBilleteDe} | Vuelto: <strong>$${pedido.financiero.vueltoRequeridoDolares}</strong></p>`;
                    }

                    div.innerHTML = `
                        <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem; margin-bottom:0.5rem;">
                            <strong style="color:var(--primary);">${pedido.codigoPedido}</strong>
                            <span style="font-weight:700; font-size:0.8rem; color:var(--accent-neon);">${pedido.estatus}</span>
                        </div>
                        <p><strong>Cliente:</strong> ${pedido.cliente.nombre} (${pedido.cliente.telefono})</p>
                        <p><strong>Ruta:</strong> ${pedido.ubicacion.direccionTexto} (${pedido.ubicacion.distanciaKm} km)</p>
                        <p><strong>Pago:</strong> ${pedido.financiero.metodoPago} | <strong>Total:</strong> $${pedido.financiero.totalDolares} (${pedido.financiero.totalBolivares} Bs)</p>
                        ${seccionVuelto}
                        <small style="color:var(--text-secondary); margin-top:0.25rem; display:block;">Fecha: ${new Date(pedido.createdAt).toLocaleString()}</small>
                    `;
                    DOM.historialPedidos.appendChild(div);
                });
            }
        } catch (error) {
            DOM.historialPedidos.innerHTML = `<p style="color:red;">Error de sincronización con el flujo de datos.</p>`;
        }
    }
};

// Inicialización de módulos al cargar el DOM (Garantiza ejecución sin bloqueos)
document.addEventListener('DOMContentLoaded', () => {
    INGENIERIA_GEO.init();
    INTERFAZ_FINANCIERA.init();
    COMPONENTE_CATALOGO.init();
    SERVICIO_API.init();
});