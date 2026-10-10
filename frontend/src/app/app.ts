import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Subscription, concat, concatMap, forkJoin, map, of, share, timer } from 'rxjs';
import { ApiService } from './api.service';
import { SIGN_DISPLAY_MS } from './config';
import { DictionaryEntry, QuickPhrase } from './models';
import { signsFromSpeech } from './sign-engine';
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

  protected readonly dictionary = signal<DictionaryEntry[]>([]);
  protected readonly phrases = signal<QuickPhrase[]>([]);
  protected readonly listening = signal(false);
  protected readonly transcript = signal('');
  protected readonly sign = signal<DictionaryEntry | null>(null);
  protected readonly imageFailed = signal(false);
  protected readonly error = signal('');
  protected readonly speakingId = signal<string | null>(null);

  ngOnInit(): void {
    forkJoin({ dictionary: this.api.dictionary$(), phrases: this.api.phrases$() }).subscribe(({ dictionary, phrases }) => {
      this.dictionary.set(dictionary);
      this.phrases.set(phrases);
    });
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
    try {
      await this.voice.speak(phrase.spoken_text);
    } catch {
      this.error.set('No se pudo reproducir la voz en este dispositivo.');
    } finally {
      this.speakingId.set(null);
    }
  }

  private start(): void {
    this.error.set('');
    this.transcript.set('');
    const speech$ = this.voice.startListening().pipe(share());

    const text = speech$.subscribe({
      next: (t) => this.transcript.set(t),
      error: (e) => this.fail(e),
    });

    // Cada seña detectada se muestra SIGN_DISPLAY_MS y luego se limpia; si llegan varias, hacen cola.
    const signs = signsFromSpeech(speech$, this.dictionary())
      .pipe(
        concatMap((entry) => concat(of(entry), timer(SIGN_DISPLAY_MS).pipe(map(() => null)))),
      )
      .subscribe((entry) => {
        this.imageFailed.set(false);
        this.sign.set(entry);
      });

    this.listening$ = new Subscription();
    this.listening$.add(text);
    this.listening$.add(signs);
    this.listening.set(true);
  }

  private stop(): void {
    this.listening$?.unsubscribe();
    this.listening$ = undefined;
    this.listening.set(false);
    this.sign.set(null);
  }

  private fail(e: unknown): void {
    this.error.set(e instanceof Error ? e.message : 'No se pudo usar el micrófono.');
    this.stop();
  }
}
