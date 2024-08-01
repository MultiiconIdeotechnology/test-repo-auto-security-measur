import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-applied-on-dialog',
  templateUrl: './applied-on-dialog.component.html',
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
export class AppliedOnDialogComponent {

  agentsList: any[] = [];
  
  constructor(
    public matDialogRef: MatDialogRef<AppliedOnDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit() {
    this.agentsList = this.data.assignedToList;
  }
}
