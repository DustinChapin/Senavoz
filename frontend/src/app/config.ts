/**
 * URL base de la API de SeñaVoz (carpeta /backend desplegada, p. ej. en Vercel o Render).
 * Si se deja vacía, la app funciona 100% sin conexión con el diccionario integrado.
 * Ejemplo: 'https://senavoz-api.vercel.app'
 */
export const API_URL = 'https://senavoz-livid.vercel.app';

/** Idioma de reconocimiento y síntesis de voz. */
export const LANG = 'es-ES';

/** Tiempo (ms) que se muestra cada seña antes de pasar a la siguiente. */
export const SIGN_DISPLAY_MS = 2800;
