import { QuickPhrase } from './models';

/** Frases integradas: se usan si no hay API ni caché. Espeja backend/sql/seed.sql. */
export const FALLBACK_PHRASES: QuickPhrase[] = [
  { id: '1', display_text: 'Necesito ayuda', spoken_text: 'Necesito ayuda, por favor.', icon_name: 'alert-circle' },
  { id: '2', display_text: 'Soy una persona sorda', spoken_text: 'Hola, soy una persona sorda. Por favor hábleme despacio y de frente.', icon_name: 'ear' },
  { id: '3', display_text: 'Repítalo, por favor', spoken_text: 'Disculpe, ¿puede repetirlo, por favor?', icon_name: 'repeat' },
  { id: '4', display_text: 'Gracias', spoken_text: 'Muchas gracias.', icon_name: 'heart' },
  { id: '5', display_text: 'Necesito un médico', spoken_text: 'Necesito un médico, es urgente.', icon_name: 'medkit' },
  { id: '6', display_text: '¿Dónde está el baño?', spoken_text: '¿Me puede decir dónde está el baño, por favor?', icon_name: 'help-circle' },
  { id: '7', display_text: 'Escríbalo, por favor', spoken_text: 'Por favor, escríbalo en su celular para que pueda leerlo.', icon_name: 'create' },
  { id: '8', display_text: 'Sí', spoken_text: 'Sí.', icon_name: 'checkmark-circle' },
  { id: '9', display_text: 'No', spoken_text: 'No.', icon_name: 'close-circle' },
];
