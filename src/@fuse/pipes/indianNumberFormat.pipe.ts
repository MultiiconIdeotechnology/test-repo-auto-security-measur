// indian-number.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'indianNumber',
  standalone:true
})
export class IndianNumberPipe implements PipeTransform {

  transform(value: number | string): string {
    if (value == null || value === '') return '0';

    let [integerPart, decimalPart] = value.toString().split('.');

    // Format integer part in Indian style
    let lastThree = integerPart.slice(-3);
    let otherNumbers = integerPart.slice(0, -3);

    if (otherNumbers !== '') {
      lastThree = ',' + lastThree;
    }

    const indianFormatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

    // Combine with decimal part if present
    return decimalPart ? `${indianFormatted}.${decimalPart}` : indianFormatted;
  }

}
