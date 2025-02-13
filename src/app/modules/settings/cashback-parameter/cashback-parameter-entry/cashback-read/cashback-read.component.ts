import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cashback-read',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cashback-read.component.html',
  styleUrls: ['./cashback-read.component.scss']
})
export class CashbackReadComponent {
  @Input() record:any;
  @Input() settingsDrawer:any;
}
