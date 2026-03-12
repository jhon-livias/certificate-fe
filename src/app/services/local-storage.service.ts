import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private subjects = new Map<string, BehaviorSubject<any>>();

  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
    this.getSubject<T>(key).next(value);
  }

  get<T>(key: string): any {
    const data = localStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  remove(key: string): void {
    localStorage.removeItem(key);
    this.getSubject(key).next(null);
  }

  watch<T>(key: string): Observable<any> {
    return this.getSubject<T>(key).asObservable();
  }

  update<T extends object>(key: string, partial: Partial<T>): void {
    const current = this.get<T>(key) || ({} as T);
    const updated = { ...current, ...partial };
    this.set(key, updated);
  }

  private getSubject<T>(key: string): BehaviorSubject<any> {
    if (!this.subjects.has(key)) {
      const initial = this.get<T>(key);
      this.subjects.set(key, new BehaviorSubject<any>(initial));
    }
    return this.subjects.get(key) as BehaviorSubject<any>;
  }
}
