import { NgIf, NgFor, NgClass, CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-item-list-dialog',
  templateUrl: './item-list-dialog.component.html',
  styleUrls: ['./item-list-dialog.component.scss'],
  standalone: true,
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
export class ItemListDialogComponent {

  agentsList: any[] = [];
  constructor(
    public matDialogRef: MatDialogRef<ItemListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any[] = []
  ) {
  }
  ngOnInit() {
    this.agentsList = this.data;
  }

}
