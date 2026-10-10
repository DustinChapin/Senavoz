import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { API_URL } from './config';
import { FALLBACK_PHRASES } from './fallback-data';
import { QuickPhrase } from './models';

const CACHE_KEY = 'senavoz.phrases';

/**
 * Acceso a la API REST. Estrategia: red → caché local → frases integradas,
 * así la app siempre tiene tarjetas aunque no haya conexión.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  phrases$(): Observable<QuickPhrase[]> {
    const cached = this.readCache();
    if (!API_URL) return of(cached ?? FALLBACK_PHRASES);

    return this.http.get<QuickPhrase[]>(`${API_URL}/api/phrases`).pipe(
      tap((data) => this.writeCache(data)),
      map((data) => (data.length ? data : (cached ?? FALLBACK_PHRASES))),
      catchError(() => of(cached ?? FALLBACK_PHRASES)),
    );
  }

  private readCache(): QuickPhrase[] | null {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? (JSON.parse(raw) as QuickPhrase[]) : null;
    } catch {
      return null;
    }
  }

  private writeCache(data: QuickPhrase[]): void {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
      /* almacenamiento no disponible: se ignora */
    }
  }
}
