import { DictionaryEntry, QuickPhrase } from './models';

/** Imagen de marcador generada localmente (SVG) para que funcione sin internet. */
function placeholder(label: string, color: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">` +
    `<rect width="480" height="360" fill="${color}"/>` +
    `<text x="240" y="195" font-family="Arial,sans-serif" font-size="54" font-weight="700" ` +
    `fill="#fff" text-anchor="middle">${label}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const entry = (keyword: string, label: string, color: string, category: string): DictionaryEntry => ({
  keyword,
  media_url: placeholder(label, color),
  category,
});

/** Diccionario integrado: se usa si no hay API ni caché. Espeja backend/sql/seed.sql. */
export const FALLBACK_DICTIONARY: DictionaryEntry[] = [
  entry('hola', 'HOLA', '#1d4ed8', 'cortesia'),
  entry('gracias', 'GRACIAS', '#1d4ed8', 'cortesia'),
  entry('por favor', 'POR FAVOR', '#1d4ed8', 'cortesia'),
  entry('hospital', 'HOSPITAL', '#b91c1c', 'medicina'),
  entry('doctor', 'DOCTOR', '#b91c1c', 'medicina'),
  entry('dolor', 'DOLOR', '#b91c1c', 'medicina'),
  entry('ayuda', 'AYUDA', '#c2410c', 'emergencia'),
  entry('policia', 'POLICÍA', '#c2410c', 'emergencia'),
  entry('agua', 'AGUA', '#0f766e', 'basico'),
  entry('bano', 'BAÑO', '#0f766e', 'basico'),
];

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
