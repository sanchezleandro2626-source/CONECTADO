/* ==========================================================================
   💳 MÓDULO DE CONTROL, CONMUTACIÓN Y VALIDACIÓN DE PAGOS TRADICIONALES
   ========================================================================== */

export function conmutarPanelesPagoVisual(metodoSeleccionado) {
    const paneles = {
        pago_movil: document.getElementById('cajaPagoMovil'),
        zelle: document.getElementById('cajaZelle'),
        efectivo: document.getElementById('cajaEfectivo')
    };

    Object.keys(paneles).forEach(clave => {
        if (paneles[clave]) {
            if (clave === metodoSeleccionado) {
                paneles[clave].classList.remove('hidden');
            } else {
                paneles[clave].classList.add('hidden');
            }
        }
    });
}

export function validarComprobantePago(metodoActivo) {
    if (metodoActivo === 'pago_movil') {
        const refMovil = document.getElementById('pagoRefMovil');
        if (!refMovil || refMovil.value.trim().length < 4) {
            alert("Por favor, introduce los últimos 4 dígitos del número de referencia de tu Pago Móvil.");
            return false;
        }
    }
    
    if (metodoActivo === 'zelle') {
        const refZelle = document.getElementById('pagoRefZelle');
        if (!refZelle || refZelle.value.trim() === "") {
            alert("Por favor, introduce el nombre del titular que ejecutó la transferencia Zelle.");
            return false;
        }
    }

    return true;
}