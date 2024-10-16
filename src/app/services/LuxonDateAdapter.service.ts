import { Injectable } from '@angular/core';
import { LuxonDateAdapter } from '@angular/material-luxon-adapter';
import { DateTime } from 'luxon';

@Injectable({
  providedIn: 'root'
})
export class LuxonDateAdapterService extends LuxonDateAdapter {
  format(date: DateTime, displayFormat: any): string {
    if (displayFormat === 'input') {
      return date.toFormat('dd MMM yy');
    } else {
      return date.toFormat('dd MMM yy');
    }
  }
}
