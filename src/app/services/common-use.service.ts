import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class commonUseService {
 private currentThemeSubject = new BehaviorSubject<any>('');
 currentTheme$ = this.currentThemeSubject.asObservable();
 
 setTheme(theme:any){
  this.currentThemeSubject.next(theme);
 }

 getTheme(){
   return this.currentThemeSubject.getValue()
 }

}
