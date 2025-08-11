import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, any>();

 // private refreshSubject = new Subject<number>();
  //public refresh$ = this.refreshSubject.asObservable();

  constructor() { }

  // notifyRefresh(key: number) {
  //   this.refreshSubject.next(key);
  // }

  get(key: number): any {
    var label = CacheLabel[key];

    if (this.cache.has(label)) {
      return this.cache.get(label);
    }
  }

  getOrAdd(key: number, retrive: Observable<any>): Observable<any> {
    var label = CacheLabel[key];

    if (this.cache.has(label)) {
      return of(this.cache.get(label));
    }
    else {
      return retrive.pipe(
        map(value => { this.cache.set(label, value); return value }),
        switchMap(value => of(value))
      );
    }
  }

  remove(key: number): boolean {
    var label = CacheLabel[key];
    return this.cache.delete(label);
  }

  set(key: number, data: any): void {
    var label = CacheLabel[key];
    this.cache.set(label, data);
  }

  update<T>(key: number, data: T) {
    var label = CacheLabel[key];
    this.cache.set(label, data);
  }

  clear(): void {
    this.cache.clear();
  }
}

export enum CacheLabel {
  getFareypeSupplierBoCombo,
  getCommonFareTypeCombo,
  getAirlineCombo,
  getAirportMstCombo,
  getFareypeSupplierAirlineCombo,
  getFareypeSupplierBusCombo,
  getFareypeSupplierHotelCombo,
  getFareypeSupplierInsuranceCombo,
  getBontonCommonFareTypeCombo

}
