import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appOnlyFloat]',
  standalone:true
})
export class OnlyFloatDirective {
  private regex: RegExp = new RegExp(/^\d*\.?\d{0,}$/); // Allows digits and one optional decimal point
  private specialKeys: string[] = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'];

  constructor() {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Allow special keys (e.g., backspace, arrow keys)
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    const current: string = (event.target as HTMLInputElement).value;
    const next: string = current.concat(event.key);

    // Block invalid input
    if (!String(next).match(this.regex)) {
      event.preventDefault();
    }
  }
}
