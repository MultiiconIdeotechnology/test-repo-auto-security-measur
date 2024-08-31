import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AmendmentRequestsService } from 'app/services/amendment-requests.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';

@Component({
  selector: 'app-status-log',
  templateUrl: './status-log.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    NgClass,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    AsyncPipe,
    NgxMatSelectSearchModule,
    MatDatepickerModule,
    NgxMatTimepickerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDividerModule
  ],
})
export class StatusLogComponent {
  record: any = {};
  logList: any[] = [];
  splitFormat = "<<split>>";
  replaceFormat = "<<replace>>";
  imageFormat = "<<image>>";
  isLoading: boolean = false;

  constructor(
    public matDialogRef: MatDialogRef<StatusLogComponent>,
    public alertService: ToasterService,
    public amendmentRequestsService: AmendmentRequestsService,
    private matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data;
  }

  title = "Status Logs"

  keywords = [];


  ngOnInit(): void {
    if (this.record.id) {
      this.isLoading = true;
      this.amendmentRequestsService.getAmendmentStatusLog(this.record.id).subscribe({
        next: (data) => {
          if (data) {
            for (let str of data.data) {
              var title = str.split(this.splitFormat)[0];
              var desc = '';
              var image = '';
              if (str.split(this.splitFormat).length > 1)
                desc = str.split(this.splitFormat)[1].replaceAll(this.replaceFormat, ' | ');

              if (str.split(this.splitFormat).length > 2)
                image = str.split(this.splitFormat)[2].replaceAll(this.replaceFormat, ' | ');

              this.logList.push({ title, desc, image });
            }

            // this.logList = data.data;
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.alertService.showToast('error', err)
          this.isLoading = false;
        },
      });
    }
  }

  openImage(data: any) {
    if (!data.image) return;
    window.open(data.image, '_blank')
  }
}
