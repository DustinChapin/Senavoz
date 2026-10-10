import { Injectable } from '@angular/core';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Observable } from 'rxjs';
import { LANG } from './config';

/** Puente con el hardware: micrófono (STT) y altavoz (TTS). */
@Injectable({ providedIn: 'root' })
export class VoiceService {
  private readonly native = Capacitor.isNativePlatform();

  /**
   * Escucha de forma continua y emite el texto reconocido (parcial y final).
   * Al desuscribirse se detiene el micrófono.
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

  async speak(text: string): Promise<void> {
    await TextToSpeech.stop().catch(() => {});
    await TextToSpeech.speak({ text, lang: LANG, rate: 0.95, pitch: 1.0, volume: 1.0, category: 'ambient' });
  }

  // ---- Android / iOS (plugin de Capacitor) ----
  private async listenNative(
    subscriber: { next(v: string): void; error(e: unknown): void },
    isActive: () => boolean,
  ): Promise<() => void> {
    const { available } = await SpeechRecognition.available();
    if (!available) throw new Error('El reconocimiento de voz no está disponible en este dispositivo.');

    const perm = await SpeechRecognition.requestPermissions();
    if (perm.speechRecognition !== 'granted') throw new Error('Permiso de micrófono denegado.');

    const handles: PluginListenerHandle[] = [];
    const begin = () =>
      SpeechRecognition.start({ language: LANG, partialResults: true, popup: false, maxResults: 1 }).catch((e) => {
        if (isActive()) subscriber.error(e);
      });

    handles.push(
      await SpeechRecognition.addListener('partialResults', (data) => {
        const text = data.matches?.[0];
        if (text) subscriber.next(text);
      }),
    );
    // Android corta la escucha tras un silencio: se reinicia para simular escucha continua.
    handles.push(
      await SpeechRecognition.addListener('listeningState', (state) => {
        if (state.status === 'stopped' && isActive()) setTimeout(() => isActive() && begin(), 250);
      }),
    );

    await begin();
    return () => {
      handles.forEach((h) => h.remove());
      SpeechRecognition.stop().catch(() => {});
    };
  }

  // ---- Navegador (Web Speech API), útil para probar en el PC ----
  private async listenWeb(
    subscriber: { next(v: string): void; error(e: unknown): void },
    isActive: () => boolean,
  ): Promise<() => void> {
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Ctor) throw new Error('Este navegador no soporta reconocimiento de voz.');

    const rec = new Ctor();
    rec.lang = LANG;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e: any) => {
      const last = e.results[e.results.length - 1];
      subscriber.next(last[0].transcript);
    };
    rec.onerror = (e: any) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') subscriber.error(new Error(e.error));
    };
    rec.onend = () => isActive() && rec.start();
    rec.start();
    return () => rec.stop();
  }
}
