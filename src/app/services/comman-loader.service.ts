import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CommanLoaderService {

    constructor() {
    }

    private loader = new Subject<any>();

    public raiseLoader(loading: any, message?: any): void {
        this.loader.next({ loading, message });
    }

    public onLoader(): Observable<any> {
        return this.loader.asObservable();
    }

    // To Scroll to top
    scrollTotop(){
        window.scroll({
            top: 0, 
            left: 0, 
            behavior: 'smooth' 
           });
    }

}