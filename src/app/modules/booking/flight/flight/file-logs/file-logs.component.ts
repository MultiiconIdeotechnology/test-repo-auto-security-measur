import { Component, Inject } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FlightTabService } from 'app/services/flight-tab.service';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-file-logs',
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
  ],
  templateUrl: './file-logs.component.html',
  styleUrls: ['./file-logs.component.scss']
})
export class FileLogsComponent {

  record: any = {};
  dataList: any[] = [];

  constructor(
    public matDialogRef: MatDialogRef<FileLogsComponent>,
    private builder: FormBuilder,
    private flighttabService: FlightTabService,
    protected alertService: ToasterService,
    private matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.record = data 
  }

  ngOnInit(): void {

    const Fdata = {
      id: this.record.id,
      service: this.record.send,
    } 

    this.flighttabService.getBookingFileLog(Fdata).subscribe({
      next: (res) => {
        this.dataList = res
      }, error: (err) => {
        this.alertService.showToast('error', err)
      }
    })

  }


}
