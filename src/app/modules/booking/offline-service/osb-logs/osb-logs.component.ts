import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-osb-logs',
  templateUrl: './osb-logs.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    AsyncPipe,
    MatTooltipModule,
    MatDividerModule
  ],
})
export class OsbLogsComponent {

  record: any = {};
  logList: any[] = [];
  title = "OSB Status Logs"

  constructor(
    public matDialogRef: MatDialogRef<OsbLogsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data;
  }

  ngOnInit(): void {
    if (this.record.id) {
      this.logList = this.data.logs;
    }
  }
}
