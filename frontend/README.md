# SeñaVoz · Frontend

App Angular 21 empaquetada como APK con Capacitor 8. Las instrucciones completas están en el [README principal](../README.md).

## Comandos

```bash
npm install        # instala dependencias y aplica patches/ (plugin de voz)
npm start          # servidor de desarrollo en http://localhost:4200
npm run build      # compila a dist/frontend/browser
npx cap sync android
```

## Estructura

| Archivo | Función |
|---|---|
| `src/app/app.*` | Pantalla dividida, estados del micrófono y entrada de texto |
| `src/app/voice.service.ts` | Reconocimiento de voz (STT) y lectura en voz alta (TTS) |
| `src/app/api.service.ts` | API con caché local y frases integradas sin conexión |
| `src/app/config.ts` | URL de la API, idiomas y duración de la pantalla de entrada |
| `patches/` | Parche al plugin de voz: modo sin conexión y errores visibles |
| `android/.../VoiceSetupPlugin.java` | Abre los ajustes para descargar el español sin conexión |
| `assets/` | Icono, pantalla de inicio y portada (`node assets/render.js` los regenera) |
