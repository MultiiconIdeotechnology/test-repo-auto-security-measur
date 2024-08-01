import { NgIf, NgFor, NgClass, CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-cities-list-dialog',
  templateUrl: './cities-list-dialog.component.html',
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
    CommonModule,
    RouterOutlet,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
  ]
  
})
export class CitiesListDialogComponent {

  agentsList: any[] = [];
  constructor(
    public matDialogRef: MatDialogRef<CitiesListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any[] = []
  ) {
  }
  ngOnInit() {
    this.agentsList = this.data;
  }

}
