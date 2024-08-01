import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FlightTabService } from 'app/services/flight-tab.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    NgxMatSelectSearchModule,
  ]
})
export class LogsComponent {

  record: any = {};
  dataList: any[] = [];

  constructor(
    public matDialogRef: MatDialogRef<LogsComponent>,
    private builder: FormBuilder,
    private flighttabService: FlightTabService,
    protected alertService: ToasterService,
    private matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.record = data 
  }

  ngOnInit(): void {

    this.flighttabService.getStatusLog(this.data.data, this.record.service).subscribe({
      next: (res) => {
        this.dataList = res.data
      }, error: (err) => {
        this.alertService.showToast('error', err)
      }
    })

  }

}
