import { agregarAlCarrito, eliminarDelCarrito, renderizarCarrito, setTasaBolivares, TASA_BOLIVARES } from '../modulos/carrito.js';
// 📍 Importación de geolocalización
import { obtenerUbicacionCliente } from './mapa.js';
// 💳 Importación de controladores de pago
import { conmutarPanelesPagoVisual, validarComprobantePago } from '../modulos/pagos.js';

// 🆕 INYECCIÓN DEL NUEVO MÓDULO DE APIS DESCENTRALIZADO CON EL REGISTRO GLOBAL
import { consultarTasaBCV, enviarMensajeWhatsApp, obtenerVentasGlobalesTendencia, registrarVentaGlobalEnServidor } from './api.js';

const DOM = {
    tasaValor: document.getElementById('tasaValor'),
    productosGrid: document.getElementById('productosGrid'),
    carritoElementos: document.getElementById('carritoElementos'),
    carritoContador: document.getElementById('carritoContador'),
    resumenSubtotal: document.getElementById('resumenSubtotal'),
    resumenTotal: document.getElementById('resumenTotal'),
    resumenTotalBs: document.getElementById('resumenTotalBs'),
    
    btnAbrirCarrito: document.getElementById('btnAbrirCarrito'),
    btnCerrarCarrito: document.getElementById('btnCerrarCarrito'),
    carritoOverlay: document.getElementById('carritoOverlay'),
    btnUbicacion: document.getElementById('btnFijarUbicacion'),
    inputBusqueda: document.getElementById('inputBusqueda'),
    btnProcederPago: document.getElementById('btnProcederPago'),
    tarjetasMetodosPago: document.querySelectorAll('.opcion-pago-card')
};

document.addEventListener('DOMContentLoaded', async () => {
    // 1. RECUPERAR TASA HISTÓRICA INICIAL PARA EVITAR RETRASOS VISUALES
    let tasaFinal = parseFloat(localStorage.getItem('urban_last_bcv')) || TASA_BOLIVARES;
    setTasaBolivares(tasaFinal);
    if (DOM.tasaValor) DOM.tasaValor.textContent = `${tasaFinal.toFixed(2)} Bs/$`;

    const nodosInterfazCarrito = {
        contenedorElementos: DOM.carritoElementos,
        txtContador: DOM.carritoContador,
        txtSubtotal: DOM.resumenSubtotal,
        txtTotal: DOM.resumenTotal,
        txtTotalBs: DOM.resumenTotalBs
    };

    // ==========================================
    // 🚀 CONTROL DE TASA MEDIANTE MÓDULO API DE TRIPLE BLINDAJE
    // ==========================================
    const resultadoBCV = await consultarTasaBCV(TASA_BOLIVARES);

    if (resultadoBCV.exito) {
        tasaFinal = resultadoBCV.tasa;
        localStorage.setItem('urban_last_bcv', tasaFinal);
        console.log(`✅ Tasa cargada desde ${resultadoBCV.origen}: ${tasaFinal.toFixed(2)}`);
    } else {
        const tasaRecuperada = parseFloat(localStorage.getItem('urban_last_bcv'));
        if (tasaRecuperada) {
            tasaFinal = tasaRecuperada * 1.02; // Colchón del 2% de protección empresarial
            console.error(`🚨 APOCALIPSIS DE RED: Sin internet. Tasa recuperada con +2% de protección: ${tasaFinal.toFixed(2)}`);
        } else {
            tasaFinal = TASA_BOLIVARES;
        }
    }

    // Aplicar la tasa definitiva obtenida de forma limpia
    setTasaBolivares(tasaFinal);
    if (DOM.tasaValor) DOM.tasaValor.textContent = `${tasaFinal.toFixed(2)} Bs/$`;
    
    renderizarCarrito(nodosInterfazCarrito);

    // ==========================================
    // 🔥 MOTOR DE EVALUACIÓN DE TENDENCIAS GLOBAL CON REORDENAMIENTO FÍSICO Y GARANTÍA 24/7
    // ==========================================
    const actualizarMedallasTendencia = async () => {
        if (!DOM.productosGrid) return;

        // 1. Capturar todas las tarjetas de productos actuales en el DOM
        const tarjetasProductos = Array.from(DOM.productosGrid.querySelectorAll('.producto-item'));
        
        // Solicitar los datos unificados del servidor/módulo
        const ventasGlobales = await obtenerVentasGlobalesTendencia();

        // 2. Mapear y actualizar el texto de interacciones en cada tarjeta antes de ordenar
        tarjetasProductos.forEach(tarjeta => {
            const id = tarjeta.getAttribute('data-id');
            const ventasActuales = ventasGlobales && ventasGlobales[id] !== undefined 
                ? ventasGlobales[id] 
                : (parseInt(localStorage.getItem(`ventas_${id}`)) || 0);
            
            const smallContador = tarjeta.querySelector('.interacciones-count');
            if (smallContador) smallContador.textContent = `Interacciones: ${ventasActuales}`;
            
            // Guardamos temporalmente el número en el elemento para facilitar el ordenamiento
            tarjeta.setAttribute('data-ventas-temp', ventasActuales);
        });

        // 3. ALGORITMO DE ORDENAMIENTO: Organizar el Array de mayor a menor interacción
        tarjetasProductos.sort((tarjetaA, tarjetaB) => {
            const ventasA = parseInt(tarjetaA.getAttribute('data-ventas-temp')) || 0;
            const ventasB = parseInt(tarjetaB.getAttribute('data-ventas-temp')) || 0;
            return ventasB - ventasA; // Orden descendente (Mayor a Menor)
        });

        // 4. DETERMINAR EL GANADOR INDISCUTIBLE PARA CORONARLO 24/7
        let idProductoGanador = null;
        if (tarjetasProductos.length > 0) {
            idProductoGanador = tarjetasProductos[0].getAttribute('data-id');
        }

        // 5. REINYECCIÓN EN EL DOM Y ASIGNACIÓN DE MEDALLA MVP
        tarjetasProductos.forEach(tarjeta => {
            DOM.productosGrid.appendChild(tarjeta); 

            const id = tarjeta.getAttribute('data-id');
            const contenedorBadge = tarjeta.querySelector('.badge-tendencia-container');
            
            if (id === idProductoGanador) {
                if (contenedorBadge && !contenedorBadge.querySelector('.badge-gold-mvp')) {
                    contenedorBadge.innerHTML = `
                        <div class="badge-gold-mvp">
                            <span>⚡</span> Top Tendencia
                        </div>
                    `;
                }
                tarjeta.classList.add('tarjeta-mvp-activa');
            } else {
                if (contenedorBadge) contenedorBadge.innerHTML = "";
                tarjeta.classList.remove('tarjeta-mvp-activa');
            }
        });
    };

    // Ejecución inicial al cargar la aplicación
    await actualizarMedallasTendencia();

    // ==========================================
    // 💳 CONTROLADOR REACTIVO DE LA PASARELA DE PAGOS
    // ==========================================
    let metodoSeleccionadoActivo = 'pago_movil';

    if (DOM.tarjetasMetodosPago) {
        DOM.tarjetasMetodosPago.forEach(tarjeta => {
            tarjeta.addEventListener('click', (e) => {
                const clickTarget = e.currentTarget;
                DOM.tarjetasMetodosPago.forEach(t => t.classList.remove('active'));
                clickTarget.classList.add('active');
                metodoSeleccionadoActivo = clickTarget.getAttribute('data-metodo');
                conmutarPanelesPagoVisual(metodoSeleccionadoActivo);
            });
        });
    }

    // ==========================================
    // LÓGICA DE CONTROL DEL PANEL DESPLEGABLE (DRAWER) - REPARADO PARA SCROLL MÓVIL
    // ==========================================
    const abrirMenuCarrito = () => {
        if (DOM.carritoOverlay) {
            DOM.carritoOverlay.style.opacity = "1";
            DOM.carritoOverlay.style.pointerEvents = "auto";
            DOM.carritoOverlay.firstElementChild.style.transform = "translateX(0)";
            document.body.style.overflow = "hidden";
        }
    };

    const cerrarMenuCarrito = () => {
        if (DOM.carritoOverlay) {
            DOM.carritoOverlay.style.opacity = "0";
            DOM.carritoOverlay.style.pointerEvents = "none";
            DOM.carritoOverlay.firstElementChild.style.transform = "translateX(100%)";
            document.body.style.overflow = "auto";
        }
    };

    if (DOM.btnAbrirCarrito) DOM.btnAbrirCarrito.addEventListener('click', abrirMenuCarrito);
    if (DOM.btnCerrarCarrito) DOM.btnCerrarCarrito.addEventListener('click', cerrarMenuCarrito);
    
    if (DOM.carritoOverlay) {
        DOM.carritoOverlay.addEventListener('click', (e) => {
            if (e.target === DOM.carritoOverlay) cerrarMenuCarrito();
        });
    }

    // ==========================================
    // CAPTURA DE CLICS EN PRODUCTOS Y BORRADO
    // ==========================================
    if (DOM.productosGrid) {
        DOM.productosGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-agregar-carrito')) {
                const boton = e.target;
                const tarjetaProducto = boton.closest('.producto-item');
                
                const productoParaCarrito = {
                    id: boton.getAttribute('data-id'),
                    nombre: tarjetaProducto.querySelector('h3').textContent,
                    precio: tarjetaProducto.querySelector('.producto-precio').textContent
                };

                agregarAlCarrito(productoParaCarrito, nodosInterfazCarrito);
            }
        });
    }

    if (DOM.carritoElementos) {
        DOM.carritoElementos.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-eliminar-item')) {
                const idProducto = e.target.getAttribute('data-id');
                eliminarDelCarrito(idProducto, nodosInterfazCarrito);
            }
        });
    }

    // ==========================================
    // 📍 BOTÓN GEOLOCALIZACIÓN RECONECTADO
    // ==========================================
    if (DOM.btnUbicacion) {
        DOM.btnUbicacion.addEventListener('click', () => {
            console.log("⚡ Botón GPS presionado en la Bolsa de Compras.");
            obtenerUbicacionCliente();
        });
    }

    // ==========================================
    // 🔍 MOTOR DE BÚSQUEDA PREDICTIVA Y FILTRADO
    // ==========================================
    if (DOM.inputBusqueda && DOM.productosGrid) {
        DOM.inputBusqueda.addEventListener('input', (e) => {
            const terminoBusqueda = e.target.value.toLowerCase().trim();
            const tarjetasProductos = DOM.productosGrid.querySelectorAll('.producto-item');
            
            tarjetasProductos.forEach(tarjeta => {
                const nombreProducto = tarjeta.querySelector('h3').textContent.toLowerCase();
                
                if (nombreProducto.includes(terminoBusqueda)) {
                    tarjeta.classList.remove('hidden');
                } else {
                    tarjeta.classList.add('hidden');
                }
            });
            
            const productosVisibles = DOM.productosGrid.querySelectorAll('.producto-item:not(.hidden)');
            let mensajeVacio = document.getElementById('búsquedaVacíaMensaje');
            
            if (productosVisibles.length === 0) {
                if (!mensajeVacio) {
                    mensajeVacio = document.createElement('p');
                    mensajeVacio.id = 'búsquedaVacíaMensaje';
                    mensajeVacio.textContent = 'No encontramos modelos que coincidan con tu búsqueda.';
                    mensajeVacio.style.color = '#888';
                    mensajeVacio.style.textAlign = 'center';
                    mensajeVacio.style.gridColumn = '1 / -1';
                    mensajeVacio.style.padding = '40px 20px';
                    mensajeVacio.style.fontFamily = "'Mona Sans', sans-serif";
                    DOM.productosGrid.appendChild(mensajeVacio);
                }
            } else {
                if (mensajeVacio) mensajeVacio.remove();
            }
        });
    }

    // ==========================================
    // 💳 DETONADOR DE COMPRA - DISPARO E INCREMENTO DE TENDENCIAS CENTRALIZADAS
    // ==========================================
    if (DOM.btnProcederPago) {
        DOM.btnProcederPago.addEventListener('click', async () => {
            // Capturamos los elementos del contenedor de la interfaz del carrito
            const itemsEnBolsa = DOM.carritoElementos.querySelectorAll('.carrito-item, [data-id]');
            
            if (itemsEnBolsa.length === 0) {
                alert("Tu bolsa de compras está vacía. Agrega productos para procesar la orden.");
                return;
            }

            if (!validarComprobantePago(metodoSeleccionadoActivo)) {
                return; 
            }

            console.log(`🛒 Procesando orden mediante: ${metodoSeleccionadoActivo}. Incrementando interacciones a nivel global.`);

            // 🆕 LLAMADA PASIVA AL MÓDULO DE WHATSAPP
            enviarMensajeWhatsApp(itemsEnBolsa);

            // 🔥 INYECCIÓN CRÍTICA: Reportar y guardar las compras en el servidor para sincronizar todo
            for (const item of itemsEnBolsa) {
                const id = item.getAttribute('data-id');
                if (!id) continue; // Salto de seguridad si no tiene ID asignado

                // Optimización del selector para asegurar la lectura real del input numérico
                const selectorInput = item.querySelector('.carrito-item-cantidad') || item.querySelector('input[type="number"]') || item.querySelector('input');
                const cantidadComprada = selectorInput ? parseInt(selectorInput.value) || 1 : 1;

                // 1. Mantenemos tu respaldo local en LocalStorage intacto
                const ventasAnteriores = parseInt(localStorage.getItem(`ventas_${id}`)) || 0;
                localStorage.setItem(`ventas_${id}`, ventasAnteriores + cantidadComprada);

                // 2. 📡 COMUNICACIÓN GLOBAL: Enviamos el ID y la cantidad directo al servidor unificado (Vercel -> MongoDB Atlas)
                await registrarVentaGlobalEnServidor(id, cantidadComprada);
            }

            // Re-ejecutar el algoritmo de reordenamiento e inyección de medallas al instante
            await actualizarMedallasTendencia();

            alert("¡Pedido Procesado Exitosamente! Su pago está siendo verificado y el motorizado en Caracas va en camino. Las interacciones de tendencia han sido actualizadas globalmente.");
            cerrarMenuCarrito();
        });
    }
    
    // ==========================================
    // 🔄 MOTOR REACTIVO EN TIEMPO REAL GLOBAL (Cada 10 segundos)
    // ==========================================
    // Esto mantendrá a todos los usuarios sincronizados al mismo tiempo
    setInterval(async () => {
        console.log("📡 Sincronizando tendencias globales con MongoDB Atlas...");
        await actualizarMedallasTendencia();
    }, 10000); // 10000 milisegundos = 10 segundos
    
});