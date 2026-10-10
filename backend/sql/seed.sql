-- Los media_url son marcadores de posición (placehold.co): reemplázalos por los GIF/MP4 reales (Cloudinary).
INSERT INTO dictionary (keyword, media_url, category) VALUES
 ('hola',      'https://placehold.co/480x360/1d4ed8/ffffff.png?text=HOLA',      'cortesia'),
 ('gracias',   'https://placehold.co/480x360/1d4ed8/ffffff.png?text=GRACIAS',   'cortesia'),
 ('por favor', 'https://placehold.co/480x360/1d4ed8/ffffff.png?text=POR+FAVOR', 'cortesia'),
 ('hospital',  'https://placehold.co/480x360/b91c1c/ffffff.png?text=HOSPITAL',  'medicina'),
 ('doctor',    'https://placehold.co/480x360/b91c1c/ffffff.png?text=DOCTOR',    'medicina'),
 ('dolor',     'https://placehold.co/480x360/b91c1c/ffffff.png?text=DOLOR',     'medicina'),
 ('ayuda',     'https://placehold.co/480x360/c2410c/ffffff.png?text=AYUDA',     'emergencia'),
 ('policia',   'https://placehold.co/480x360/c2410c/ffffff.png?text=POLICIA',   'emergencia'),
 ('agua',      'https://placehold.co/480x360/0f766e/ffffff.png?text=AGUA',      'basico'),
 ('bano',      'https://placehold.co/480x360/0f766e/ffffff.png?text=BANO',      'basico')
ON CONFLICT (keyword) DO NOTHING;

INSERT INTO quick_phrases (display_text, spoken_text, icon_name) VALUES
 ('Necesito ayuda',        'Necesito ayuda, por favor.', 'alert-circle'),
 ('Soy una persona sorda', 'Hola, soy una persona sorda. Por favor hábleme despacio y de frente.', 'ear'),
 ('Repítalo, por favor',   'Disculpe, ¿puede repetirlo, por favor?', 'repeat'),
 ('Gracias',               'Muchas gracias.', 'heart'),
 ('Necesito un médico',    'Necesito un médico, es urgente.', 'medkit'),
 ('¿Dónde está el baño?',  '¿Me puede decir dónde está el baño, por favor?', 'help-circle'),
 ('Escríbalo, por favor',  'Por favor, escríbalo en su celular para que pueda leerlo.', 'create'),
 ('Sí',                    'Sí.', 'checkmark-circle'),
 ('No',                    'No.', 'close-circle')
ON CONFLICT (display_text) DO NOTHING;
