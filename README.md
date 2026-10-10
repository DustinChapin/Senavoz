# SeñaVoz

Aplicación Android de accesibilidad que facilita la conversación entre una persona **sorda** y una persona **oyente** usando una **pantalla dividida**:

- **Mitad superior (rotada 180°) – persona oyente:** toca el micrófono y habla. La app transcribe su voz en tiempo real.
- **Mitad inferior – persona sorda:** ve el texto de lo que se dijo y, cuando detecta una palabra clave del diccionario (p. ej. *hospital*, *ayuda*, *por favor*), muestra la **seña** correspondiente. También dispone de **tarjetas de frases rápidas** que la app lee en voz alta (TTS).

## Arquitectura

```
Frontend (Angular 21 + Capacitor 8)  ⇄  API REST (Node.js + Express)  ⇄  PostgreSQL (Neon / local)
 · STT: speech-recognition                · GET /api/dictionary[?word=]            · dictionary
 · TTS: text-to-speech                    · GET /api/dictionary/:word              · quick_phrases
 · Motor reactivo con RxJS                · GET /api/phrases
```

| Capa | Tecnología |
|---|---|
| UI | Angular 21 (standalone + signals), SCSS puro |
| Nativo | Capacitor 8, Android 7+ (minSdk 24) |
| Voz | `@capacitor-community/speech-recognition`, `@capacitor-community/text-to-speech` |
| Reactividad | RxJS: `scan`, `mergeMap`, `concatMap` |
| Backend | Node.js, Express, `pg` — listo para Vercel (`backend/api/index.js`) |
| Datos | PostgreSQL (esquema en `backend/sql/`) |

### Motor reactivo de señas

`frontend/src/app/sign-engine.ts` convierte el flujo del micrófono en señas:

1. Normaliza el texto (minúsculas, sin tildes ni puntuación).
2. Evalúa solo las palabras **nuevas** de cada resultado parcial para no repetir señas.
3. Reconoce expresiones de dos palabras (*por favor*) antes que palabras sueltas.
4. Las señas detectadas hacen cola y se muestran unos segundos cada una.

### Funciona sin conexión

`ApiService` usa la estrategia **red → caché local → diccionario integrado**, así la app siempre tiene datos.

## Instalar el APK

Descarga `entrega/SenaVoz.apk`, cópialo al teléfono y ábrelo (habilita “instalar apps desconocidas”). Al primer uso, concede el permiso de micrófono. Requiere el servicio de voz de Google (reconocimiento en español).

## Desarrollo

### Backend

```bash
cd backend
cp .env.example .env      # completa los datos de PostgreSQL (o DATABASE_URL de Neon)
npm install
npm run db:init           # crea tablas e inserta 10 palabras y 9 frases de ejemplo
npm run dev               # http://localhost:3000
```

Despliegue en Vercel: importar la carpeta `backend`, definir `DATABASE_URL` y `CORS_ORIGIN`.

### Frontend

```bash
cd frontend
npm install
npm start                 # http://localhost:4200 (el micrófono funciona en Chrome)
```

Para conectar la app a la API, edita `API_URL` en `frontend/src/app/config.ts`.

### Generar el APK

Requiere JDK 17+ y Android SDK.

```bash
cd frontend
npm run build
npx cap sync android
cd android
./gradlew assembleDebug   # APK en app/build/outputs/apk/debug/
```

## Contenido de las señas

Las imágenes del diccionario son **marcadores de posición**. Para usar señas reales, sube GIF/MP4 (p. ej. a Cloudinary) y actualiza `media_url` en la tabla `dictionary`.

## Hoja de ruta

- Señas reales en video para un vocabulario más amplio.
- Selector de idioma y frases personalizables por el usuario.
- Panel de administración del diccionario.
