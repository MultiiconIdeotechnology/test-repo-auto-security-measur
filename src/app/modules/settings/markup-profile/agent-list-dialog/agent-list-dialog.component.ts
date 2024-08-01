import { Component, Inject } from '@angular/core';
import { NgIf, NgFor, NgClass, CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-agent-list-dialog',
  templateUrl: './agent-list-dialog.component.html',
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
export class AgentListDialogComponent {
  agentsList: any[] = [];
  constructor(
    public matDialogRef: MatDialogRef<AgentListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any[] = []
  ) {
  }
  ngOnInit() {
    this.agentsList = this.data;
  }
}
