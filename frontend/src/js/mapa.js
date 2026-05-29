/**
 * URBAN DELIVERY PRO - MÓDULO DE GEOLOCALIZACIÓN Y MAPAS
 * Responsabilidad: Solicitar permisos, rastrear la ubicación exacta del cliente y retornar coordenadas puras.
 */

/**
 * Solicita permiso al usuario y obtiene su ubicación GPS exacta de forma asíncrona.
 * @returns {Promise<{lat: number, lng: number}>} Coordenadas de latitud y longitud.
 */
export function obtenerUbicacionCliente() {
    return new Promise((resolve, reject) => {
        // 1. Verificar si el navegador del cliente soporta Geolocalización
        if (!navigator.geolocation) {
            return reject(new Error("Lo sentimos, tu navegador o dispositivo no soporta geolocalización."));
        }

        // Configuración de alta precisión ideal para entregas de motorizados en ruta
        const opcionesGps = {
            enableHighAccuracy: true, // Fuerza al teléfono a usar el GPS satelital, no solo el WiFi
            timeout: 10000,           // Máximo 10 segundos esperando la señal
            maximumAge: 0             // No usar ubicaciones guardadas en caché, queremos la de este instante
        };

        console.log("📡 Solicitando permisos de ubicación en tiempo real al cliente...");

        // 2. Disparar la solicitud nativa del sistema operativo
        navigator.geolocation.getCurrentPosition(
            (posicion) => {
                const coordenadas = {
                    lat: posicion.coords.latitude,
                    lng: posicion.coords.longitude,
                    precision: posicion.coords.accuracy // Margen de error en metros
                };

                console.log(`✅ Ubicación obtenida con éxito (Precisión: ${coordenadas.precision} metros):`, coordenadas);
                resolve(coordenadas);
            },
            (error) => {
                // Control quirúrgico de errores según la respuesta del cliente
                let mensajeError = "Error desconocido al obtener la ubicación.";
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        mensajeError = "Permiso denegado. El cliente rechazó compartir su ubicación GPS.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        mensajeError = "La señal GPS no está disponible en este momento. Intenta en un espacio abierto.";
                        break;
                    case error.TIMEOUT:
                        mensajeError = "Se agotó el tiempo de espera para obtener una señal GPS precisa.";
                        break;
                }
                
                console.warn(`❌ Error Geolocalización: ${mensajeError}`);
                reject(new Error(mensajeError));
            },
            opcionesGps
        );
    });
}