import { Observable, map, mergeMap, scan } from 'rxjs';
import { DictionaryEntry } from './models';

/** Minúsculas, sin tildes ni signos de puntuación. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface State {
  prev: string[];
  /** Palabras de la frase actual que ya se evaluaron. */
  done: number;
  found: DictionaryEntry[];
}

/**
 * Motor reactivo: transforma el flujo de texto del micrófono en el flujo de señas a mostrar.
 * - Normaliza y separa en palabras.
 * - Detecta primero expresiones de dos palabras ("por favor") y luego palabras sueltas.
 * - El reconocimiento emite resultados parciales que crecen ("hola" → "hola necesito"),
 *   por eso solo se evalúan las palabras nuevas y no se repite la misma seña.
 */
export function signsFromSpeech(
  speech$: Observable<string>,
  dictionary: DictionaryEntry[],
): Observable<DictionaryEntry> {
  const index = new Map(dictionary.map((e) => [e.keyword, e]));
  const startsPhrase = new Set(dictionary.filter((e) => e.keyword.includes(' ')).map((e) => e.keyword.split(' ')[0]));

  return speech$.pipe(
    map((text) => normalize(text).split(' ').filter(Boolean)),
    scan<string[], State>(
      (acc, words) => {
        // Si las palabras ya evaluadas cambiaron o la frase se acortó, es una frase nueva.
        const sameUtterance = words.length >= acc.done && acc.prev.slice(0, acc.done).every((w, i) => words[i] === w);
        let i = sameUtterance ? acc.done : 0;
        const found: DictionaryEntry[] = [];

        while (i < words.length) {
          // La última palabra puede ser el inicio de una expresión ("por" → "por favor"): se espera la siguiente.
          if (i === words.length - 1 && startsPhrase.has(words[i]) && !index.has(words[i])) break;
          const pair = i + 1 < words.length ? index.get(`${words[i]} ${words[i + 1]}`) : undefined;
          if (pair) {
            found.push(pair);
            i += 2;
            continue;
          }
          const single = index.get(words[i]);
          if (single) found.push(single);
          i += 1;
        }
        return { prev: words, done: i, found };
      },
      { prev: [], done: 0, found: [] },
    ),
    mergeMap((s) => s.found),
  );
}
