import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from './api.service';
import { QuickPhrase } from './models';
import { VoiceService } from './voice.service';

const ICONS: Record<string, string> = {
  'alert-circle': '🆘',
  ear: '🦻',
  repeat: '🔁',
  heart: '❤️',
  medkit: '🏥',
  'help-circle': '❓',
  create: '✍️',
  'checkmark-circle': '✅',
  'close-circle': '❌',
};

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly voice = inject(VoiceService);
  private listening$?: Subscription;

  protected readonly phrases = signal<QuickPhrase[]>([]);
  protected readonly listening = signal(false);
  protected readonly transcript = signal('');
  protected readonly finished = signal(false);
  protected readonly error = signal('');
  protected readonly speakingId = signal<string | null>(null);
  protected readonly draft = signal('');
  protected readonly speakingDraft = signal(false);

  ngOnInit(): void {
    this.api.phrases$().subscribe((phrases) => this.phrases.set(phrases));
  }

  ngOnDestroy(): void {
    this.stop();
  }

  protected icon(name: string | null): string {
    return (name && ICONS[name]) || '💬';
  }

  protected toggleListening(): void {
    this.listening() ? this.stop() : this.start();
  }

  protected async say(phrase: QuickPhrase): Promise<void> {
    this.speakingId.set(phrase.id);
    await this.speak(phrase.spoken_text);
    this.speakingId.set(null);
  }

  /** Lee en voz alta lo que la persona sorda escribió. */
  protected async speakDraft(): Promise<void> {
    const text = this.draft().trim();
    if (!text || this.speakingDraft()) return;
    this.speakingDraft.set(true);
    await this.speak(text);
    this.speakingDraft.set(false);
    this.draft.set('');
  }

  protected onDraft(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  protected readonly canSetupVoice = this.voice.canSetupVoice;
  protected readonly showSetup = signal(false);

  protected toggleSetup(): void {
    this.showSetup.update((v) => !v);
  }

  protected setupOfflineSpeech(): void {
    this.voice.openOfflineSpeechSetup().catch((e) => this.error.set(this.micError(e)));
  }

  protected setupTts(): void {
    this.voice.openTtsSetup().catch((e) => this.error.set(this.micError(e)));
  }

  private async speak(text: string): Promise<void> {
    try {
      await this.voice.speak(text);
    } catch {
      this.error.set('No se pudo reproducir la voz en este dispositivo.');
    }
  }

  private start(): void {
    this.error.set('');
    this.transcript.set('');
    this.finished.set(false);
    this.listening$ = this.voice.startListening().subscribe({
      next: (text) => this.transcript.set(text),
      // La persona dejó de hablar: el micrófono ya se apagó solo.
      complete: () => {
        this.finished.set(!!this.transcript());
        this.stop();
      },
      error: (e) => {
        this.error.set(this.micError(e));
        this.stop();
      },
    });
    this.listening.set(true);
  }

  private micError(e: unknown): string {
    const base = e instanceof Error && e.message ? e.message : 'No se pudo usar el micrófono.';
    return navigator.onLine
      ? base
      : `${base} Sin internet, instala el español sin conexión: Ajustes › Google › Voz › Reconocimiento de voz sin conexión.`;
  }

  private stop(): void {
    this.listening$?.unsubscribe();
    this.listening$ = undefined;
    this.listening.set(false);
  }
}
