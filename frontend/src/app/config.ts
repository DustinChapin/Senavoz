/**
 * URL base de la API de SeñaVoz (carpeta /backend desplegada, p. ej. en Vercel).
 * Si se deja vacía, la app funciona 100% sin conexión con las frases integradas.
 */
export const API_URL = 'https://senavoz-livid.vercel.app';

/** Idioma de la voz que lee los mensajes. */
export const LANG = 'es-ES';

/**
 * Idioma del reconocimiento de voz. Es 'es-US' porque es el paquete de español sin conexión
 * de Google que más teléfonos tienen disponible; con él funciona con y sin internet.
 */
export const STT_LANG = 'es-US';
