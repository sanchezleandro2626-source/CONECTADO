/**
 * URBAN DELIVERY PRO - MÓDULO DE INTERFAZ DE USUARIO (UI)
 * Responsabilidad: Manejo de menús laterales, modales, transiciones y notificaciones.
 */

/**
 * Controla la apertura y cierre de un panel lateral (Sidebar)
 * @param {HTMLElement} sidebar Elemento del menú
 * @param {HTMLElement} btnAbrir Botón de apertura
 * @param {HTMLElement} btnCerrar Botón de cierre
 */
export function configurarSidebar(sidebar, btnAbrir, btnCerrar) {
    if (sidebar && btnAbrir && btnCerrar) {
        btnAbrir.addEventListener('click', () => sidebar.classList.remove('hidden'));
        btnCerrar.addEventListener('click', () => sidebar.classList.add('hidden'));
    }
}

/**
 * Lanza un mensaje elegante emergente en pantalla con diseño Premium
 * @param {HTMLElement} elemento Contenedor del Toast
 * @param {string} mensaje Texto a mostrar
 */
export function lanzarNotificacion(elemento, mensaje) {
    if (elemento) {
        elemento.textContent = mensaje;
        elemento.classList.remove('hidden');
        
        // Desaparece automáticamente tras 2.2 segundos de manera sutil
        setTimeout(() => {
            elemento.classList.add('hidden');
        }, 2200);
    }
}