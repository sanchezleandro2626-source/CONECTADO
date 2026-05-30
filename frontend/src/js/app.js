import { agregarAlCarrito, eliminarDelCarrito, renderizarCarrito, setTasaBolivares, TASA_BOLIVARES } from '../modulos/carrito.js';
// 📍 INYECCIÓN CORREGIDA: Al estar en la misma carpeta js, se importa usando "./"
import { obtenerUbicacionCliente } from './mapa.js';

const DOM = {
    tasaValor: document.getElementById('tasaValor'),
    productosGrid: document.getElementById('productosGrid'),
    carritoElementos: document.getElementById('carritoElementos'),
    carritoContador: document.getElementById('carritoContador'),
    resumenSubtotal: document.getElementById('resumenSubtotal'),
    resumenTotal: document.getElementById('resumenTotal'),
    resumenTotalBs: document.getElementById('resumenTotalBs'),
    
    // NUEVOS ELEMENTOS DE LA INTERFAZ EXTENDIDA
    btnAbrirCarrito: document.getElementById('btnAbrirCarrito'),
    btnCerrarCarrito: document.getElementById('btnCerrarCarrito'),
    carritoOverlay: document.getElementById('carritoOverlay'),
    
    // 📍 INYECCIÓN PASIVA: Elemento para capturar la localización desde el carrito
    btnUbicacion: document.getElementById('btnFijarUbicacion'),

    // 🔍 INYECCIÓN DEL BUSCADOR: Mapeo del input en el objeto DOM
    inputBusqueda: document.getElementById('inputBusqueda')
};

document.addEventListener('DOMContentLoaded', async () => {
    // 1. CARGAR TASA DE EMERGENCIA HISTÓRICA (Última que funcionó en el dispositivo)
    let tasaFinal = parseFloat(localStorage.getItem('urban_last_bcv')) || TASA_BOLIVARES;
    
    // Inicializar la interfaz de inmediato con la tasa recuperada para evitar retrasos visuales
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
    // 🚀 SISTEMA DE TRIPLE BLINDAJE ANTI-PÉRDIDAS (BCV)
    // ==========================================
    let tasaCargadaExitosamente = false;

    // --- INTENTO 1: API Principal ---
    try {
        const respuesta = await fetch('https://ve.centralbank.workers.dev/v1/bcv');
        if (respuesta.ok) {
            const data = await respuesta.json();
            if (data && data.usd) {
                tasaFinal = parseFloat(data.usd);
                tasaCargadaExitosamente = true;
                console.log("✅ API Principal exitosa.");
            }
        }
    } catch (e) {
        console.warn("⚠️ API Principal caída. Activando protocolo de contingencia...");
    }

    // --- INTENTO 2: API de Respaldo (Si el Intento 1 falló) ---
    if (!tasaCargadaExitosamente) {
        try {
            // Usamos una API alternativa de respaldo (DolarToday/BCV espejo)
            const respuestaEspejo = await fetch('https://s3.amazonaws.com/dolartoday/data.json');
            if (respuestaEspejo.ok) {
                const dataEspejo = await respuestaEspejo.json();
                if (dataEspejo && dataEspejo.USD && dataEspejo.USD.sicad2) {
                    tasaFinal = parseFloat(dataEspejo.USD.sicad2); // El campo alterno del BCV
                    tasaCargadaExitosamente = true;
                    console.log("✅ API de Respaldo exitosa.");
                }
            }
        } catch (e) {
            console.warn("⚠️ API de Respaldo también caída. Activando memoria local profunda...");
        }
    }

    // --- VALIDACIÓN Y SALVAGUARDA DE DATOS ---
    if (tasaCargadaExitosamente) {
        // Guardamos la tasa fresca en LocalStorage para el futuro
        localStorage.setItem('urban_last_bcv', tasaFinal);
    } else {
        // Si TODO internet se cayó a nivel global o nacional:
        // Tomamos la última tasa que guardó el teléfono/PC y le metemos un 2% de protección por inflación
        const tasaRecuperada = parseFloat(localStorage.getItem('urban_last_bcv'));
        if (tasaRecuperada) {
            tasaFinal = tasaRecuperada * 1.02; // 2% de colchón de seguridad automática para la empresa
            console.error(`🚨 APOCALIPSIS DE RED: Sin internet. Tasa recuperada con +2% de protección: ${tasaFinal.toFixed(2)}`);
        } else {
            // Si es la primera vez en la vida que abre la app y no hay red, usa el código base
            tasaFinal = TASA_BOLIVARES;
        }
    }

    // 2. APLICAR TASA DEFINITIVA AL SISTEMA
    setTasaBolivares(tasaFinal);
    if (DOM.tasaValor) DOM.tasaValor.textContent = `${tasaFinal.toFixed(2)} Bs/$`;
    
    // Inicializar estado del carrito y recalcular
    renderizarCarrito(nodosInterfazCarrito);

    // ==========================================
    // LÓGICA DE CONTROL DEL PANEL DESPLEGABLE (DRAWER) - CONGELACIÓN ANTI-SCROLL
    // ==========================================
    const abrirMenuCarrito = () => {
        if (DOM.carritoOverlay) {
            DOM.carritoOverlay.style.opacity = "1";
            DOM.carritoOverlay.style.pointerEvents = "auto";
            DOM.carritoOverlay.firstElementChild.style.transform = "translateX(0)";
            
            // 🛑 CONGELAR FONDO: Evita que la tienda se deslice atrás al mover el carrito en móviles
            document.body.style.overflow = "hidden";
            document.body.style.touchAction = "none";
        }
    };

    const cerrarMenuCarrito = () => {
        if (DOM.carritoOverlay) {
            DOM.carritoOverlay.style.opacity = "0";
            DOM.carritoOverlay.style.pointerEvents = "none";
            DOM.carritoOverlay.firstElementChild.style.transform = "translateX(100%)";
            
            // 🔓 LIBERAR FONDO: Devuelve el scroll normal a la tienda al cerrar la bolsa
            document.body.style.overflow = "auto";
            document.body.style.touchAction = "auto";
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
    // 📍 CONFIGURACIÓN ESCUCHA DEL BOTÓN GEOLOCALIZACIÓN RECONECTADO
    // ==========================================
    if (DOM.btnUbicacion) {
        DOM.btnUbicacion.addEventListener('click', () => {
            console.log("⚡ Botón GPS presionado en la Bolsa de Compras.");
            obtenerUbicacionCliente();
        });
    }

    // ==========================================
    // 🔍 MOTOR DE BÚSQUEDA PREDICTIVA Y FILTRADO EN TIEMPO REAL
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
            
            // Notificación visual si el catálogo queda vacío al buscar
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
    
});