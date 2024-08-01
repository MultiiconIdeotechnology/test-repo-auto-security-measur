import { NgIf, NgFor, NgClass, CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-cancellation-policy',
  templateUrl: './cancellation-policy.component.html',
  styleUrls: ['./cancellation-policy.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    CommonModule,
    RouterOutlet,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
  ]
})
export class CancellationPolicyComponent {

  dataList: any[] = [];

  constructor(
    public matDialogRef: MatDialogRef<CancellationPolicyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit() {
    this.dataList = this.data;
  }

}
