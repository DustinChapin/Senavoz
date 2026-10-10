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
    this.listening$ = this.voice.startListening().subscribe({
      next: (text) => this.transcript.set(text),
      error: (e) => {
        this.error.set(e instanceof Error ? e.message : 'No se pudo usar el micrófono.');
        this.stop();
      },
    });
    this.listening.set(true);
  }

  private stop(): void {
    this.listening$?.unsubscribe();
    this.listening$ = undefined;
    this.listening.set(false);
  }
}
