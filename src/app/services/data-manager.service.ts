import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataManagerService {
  private dataList = new BehaviorSubject<any>([]);
  dataList$ = this.dataList.asObservable();

  constructor() {}

  // Set initial data
  setInitialData(data:any) {
    this.dataList.next(data);
  }

  // Add new item
  addItem(newItem: any) {
    const current = this.dataList.getValue();
    this.dataList.next([newItem, ...current]);
    console.log("newItem", newItem)
  }

  // Update existing item
  updateItem(updatedItem: any) {
    const updatedList = this.dataList.getValue().map(item =>
      item.id === updatedItem.id ? updatedItem : item
    );
    this.dataList.next(updatedList);
  }

  // Get current value (optional)
  getCurrentData(): any {
    return this.dataList.getValue();
  }
}