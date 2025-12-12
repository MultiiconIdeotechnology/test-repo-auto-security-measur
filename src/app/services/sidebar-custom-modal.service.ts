import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})


export class SidebarCustomModalService {
  private modalSubject = new BehaviorSubject<{ type: string; data?: any } | null>(null);
  private closeSubject = new BehaviorSubject<{ type: string; data?: any } | null>(null);

  openModal(type: string, data?: any): void {
    this.modalSubject.next({ type, data });
  }

  closeModal(): void {
    this.modalSubject.next(null);
  }

  close(data: any) {
    this.modalSubject.next(data);
  }

  CloseSubject(data: any) {
    this.closeSubject.next(data);
  }

  onCloseSubjectChange(): Observable<any> {
    return this.closeSubject.asObservable();
  }

  onModalChange(): Observable<{ type: string; data?: any } | null> {
    return this.modalSubject.asObservable();
  }
}