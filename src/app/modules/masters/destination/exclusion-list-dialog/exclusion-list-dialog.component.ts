import { NgIf, NgFor, NgClass, CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-exclusion-list-dialog',
  templateUrl: './exclusion-list-dialog.component.html',
  standalone: true,
  styles: [
    `
     .width-content{
            width: max-content;
        }
    `
  ],
  imports: [
    NgIf,
    NgFor,
    NgClass,
    RouterOutlet,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
    CommonModule
  ]
})
export class ExclusionListDialogComponent {

  agentsList: any[] = [];
  constructor(
    public matDialogRef: MatDialogRef<ExclusionListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any[] = []
  ) {
  }
  ngOnInit() {
    this.agentsList = this.data;
  }

}
