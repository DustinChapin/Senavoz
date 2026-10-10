import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { API_URL } from './config';
import { FALLBACK_DICTIONARY, FALLBACK_PHRASES } from './fallback-data';
import { DictionaryEntry, QuickPhrase } from './models';

/**
 * Acceso a la API REST. Estrategia: red → caché local → datos integrados,
 * así la app siempre tiene diccionario aunque no haya conexión.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  dictionary$(): Observable<DictionaryEntry[]> {
    return this.load('/api/dictionary', 'senavoz.dictionary', FALLBACK_DICTIONARY);
  }

  phrases$(): Observable<QuickPhrase[]> {
    return this.load('/api/phrases', 'senavoz.phrases', FALLBACK_PHRASES);
  }

  private load<T>(path: string, cacheKey: string, fallback: T[]): Observable<T[]> {
    const cached = this.readCache<T>(cacheKey);
    if (!API_URL) return of(cached ?? fallback);

    return this.http.get<T[]>(API_URL + path).pipe(
      tap((data) => this.writeCache(cacheKey, data)),
      map((data) => (data.length ? data : (cached ?? fallback))),
      catchError(() => of(cached ?? fallback)),
    );
  }

  private readCache<T>(key: string): T[] | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T[]) : null;
    } catch {
      return null;
    }
  }

  private writeCache(key: string, data: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      /* almacenamiento no disponible: se ignora */
    }
  }
}
