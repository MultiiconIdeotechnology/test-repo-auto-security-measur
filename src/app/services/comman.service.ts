import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommanService {

  constructor() { }

  private loader = new Subject<any>();

  public raiseLoader(loading, message?): void {
    this.loader.next({loading, message});
  }

  public onLoader(): Observable<any> {
    return this.loader.asObservable();
  }
}
