import { Injectable } from '@angular/core';
import { Capacitor, PluginListenerHandle, registerPlugin } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Observable } from 'rxjs';
import { LANG, STT_LANG } from './config';

/** Plugin propio (android/.../VoiceSetupPlugin.java): abre los ajustes para descargar paquetes de voz. */
interface VoiceSetupPlugin {
  openOfflineSpeech(): Promise<{ exact: boolean }>;
  openTtsInstall(): Promise<{ exact: boolean }>;
}
const VoiceSetup = registerPlugin<VoiceSetupPlugin>('VoiceSetup');

/** Puente con el hardware: micrófono (STT) y altavoz (TTS). */
@Injectable({ providedIn: 'root' })
export class VoiceService {
  private readonly native = Capacitor.isNativePlatform();

  /**
   * Escucha UNA frase: emite el texto reconocido (parcial y final) y completa solo
   * cuando la persona deja de hablar, apagando el micrófono. Al desuscribirse también se detiene.
   */
  startListening(): Observable<string> {
    return new Observable<string>((subscriber) => {
      let active = true;
      let cleanup = () => {};

      const run = this.native ? this.listenNative(subscriber, () => active) : this.listenWeb(subscriber, () => active);
      run.then((fn) => (cleanup = fn)).catch((err) => subscriber.error(err));

      return () => {
        active = false;
        cleanup();
      };
    });
  }

  /** Solo en Android: abre los ajustes para descargar el español sin conexión. */
  readonly canSetupVoice = this.native;

  openOfflineSpeechSetup(): Promise<{ exact: boolean }> {
    return VoiceSetup.openOfflineSpeech();
  }

  openTtsSetup(): Promise<{ exact: boolean }> {
    return VoiceSetup.openTtsInstall();
  }

  async speak(text: string): Promise<void> {
    await TextToSpeech.stop().catch(() => {});
    await TextToSpeech.speak({ text, lang: LANG, rate: 0.95, pitch: 1.0, volume: 1.0, category: 'ambient' });
  }

  // ---- Android / iOS (plugin de Capacitor) ----
  private async listenNative(
    subscriber: { next(v: string): void; error(e: unknown): void; complete(): void },
    isActive: () => boolean,
  ): Promise<() => void> {
    const { available } = await SpeechRecognition.available();
    if (!available) throw new Error('El reconocimiento de voz no está disponible en este dispositivo.');

    const perm = await SpeechRecognition.requestPermissions();
    if (perm.speechRecognition !== 'granted') throw new Error('Permiso de micrófono denegado.');

    const handles: PluginListenerHandle[] = [];

    handles.push(
      await SpeechRecognition.addListener('partialResults', (data) => {
        const text = data.matches?.[0];
        if (text) subscriber.next(text);
      }),
    );
    // Android detiene la escucha solo tras un silencio: se da por terminada la frase.
    // La pequeña espera deja llegar el resultado final antes de cerrar.
    handles.push(
      await SpeechRecognition.addListener('listeningState', (state) => {
        if (state.status === 'stopped') setTimeout(() => isActive() && subscriber.complete(), 400);
      }),
    );

    // Errores que el plugin avisa después de empezar (parche en patches/): red, sin voz, etc.
    handles.push(
      await (SpeechRecognition as any).addListener('error', (e: { message: string }) => {
        if (isActive()) subscriber.error(new Error(e.message));
      }),
    );

    // Se pide siempre el reconocimiento en el dispositivo: con el paquete descargado funciona sin
    // internet (navigator.onLine no sirve: puede decir "en línea" sin conexión real). Si el paquete
    // no está instalado, Google usa internet.
    const options = {
      language: STT_LANG,
      partialResults: true,
      popup: false,
      maxResults: 1,
      preferOffline: true,
    };
    await SpeechRecognition.start(options as any).catch((e) => isActive() && subscriber.error(e));
    return () => {
      handles.forEach((h) => h.remove());
      SpeechRecognition.stop().catch(() => {});
    };
  }

  // ---- Navegador (Web Speech API), útil para probar en el PC ----
  private async listenWeb(
    subscriber: { next(v: string): void; error(e: unknown): void; complete(): void },
    isActive: () => boolean,
  ): Promise<() => void> {
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Ctor) throw new Error('Este navegador no soporta reconocimiento de voz.');

    const rec = new Ctor();
    rec.lang = STT_LANG;
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e: any) => {
      const last = e.results[e.results.length - 1];
      subscriber.next(last[0].transcript);
    };
    rec.onerror = (e: any) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') subscriber.error(new Error(e.error));
    };
    rec.onend = () => isActive() && subscriber.complete();
    rec.start();
    return () => rec.stop();
  }
}
