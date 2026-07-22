import { toObservable } from '@angular/core/rxjs-interop';
import { Signal } from '@angular/core';
import { debounceTime, distinctUntilChanged, Observable } from 'rxjs';

/** Signal → Observable con debounce para búsquedas server-side. */
export function debouncedSearch(
  source: Signal<string>,
  ms = 300,
): Observable<string> {
  return toObservable(source).pipe(debounceTime(ms), distinctUntilChanged());
}
