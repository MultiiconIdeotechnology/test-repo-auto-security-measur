import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FlightTabService } from 'app/services/flight-tab.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-status-update',
  templateUrl: './status-update.component.html',
  styleUrls: ['./status-update.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    AsyncPipe,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatChipsModule,
    NgxMatSelectSearchModule,
  ],
})
export class StatusUpdateComponent {

  disableBtn: boolean = false;
  record: any = {};
  statusList: any;
  isDefault: boolean = true;


  constructor(
    public matDialogRef: MatDialogRef<StatusUpdateComponent>,
    private builder: FormBuilder,
    private flighttabService: FlightTabService,
    protected alertService: ToasterService,
    private matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any[] = []
  ) {
    this.record = data || {};
  }

  formGroup: FormGroup;
  title: any
  btnLabel = 'Update';

  ngOnInit(): void {
    this.title = this.record.title

    this.formGroup = this.builder.group({
      status: [''],
    });

    this.flighttabService.getAirBookngStatus({}).subscribe({
      next: (data: any) => {
        this.statusList = data
      },
      error: (err) => {
        this.alertService.showToast('error', err);
      },
    });

    this.formGroup.get('status').patchValue(this.record.status)
  }

  close() {
    this.btnLabel = 'Update';
    if (this.isDefault) {
      this.matDialogRef.close()
      this.isDefault = false
    }
    else {
      this.isDefault = true
    }
  }

  submit(): void {

    this.disableBtn = true;
    const Fdata = {}
    Fdata['id'] = this.record.id
    Fdata['status'] = this.formGroup.get('status').value

    if (this.isDefault) {
      this.btnLabel = 'Confirm';
      this.isDefault = false
      this.disableBtn = true;
    }
    else {
      if (this.btnLabel == 'Confirm' && this.isDefault == false) {
        this.flighttabService.setBookingStatus(Fdata).subscribe({
          next: (data: any) => {
            this.matDialogRef.close();
            this.disableBtn = false;
            this.alertService.showToast('success', 'Status Changed');
          },
          error: (err) => {
            this.disableBtn = false;
            this.alertService.showToast('error', err);
          },
        });

      }
    }
  }
}
