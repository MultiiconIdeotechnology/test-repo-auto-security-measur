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
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-pax',
  templateUrl: './pax.component.html',
  styleUrls: ['./pax.component.scss'],
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
export class PaxComponent {

  disableBtn: boolean = false;
  record: any = {};
  readonly: boolean = false;
  fieldList: {};

  recordList: any;
  genderList: string[] = ['Male', 'Female'];


  constructor(
    public matDialogRef: MatDialogRef<PaxComponent>,
    private builder: FormBuilder,
    private flighttabService: FlightTabService,
    protected alertService: ToasterService,
    private matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any[] = []
  ) {
    this.record = data || {};
  }

  formGroup: FormGroup;
  title = "Pax Change"
  btnLabel = 'Save';

  ngOnInit(): void {

    this.formGroup = this.builder.group({
      id: [''],
      first_name: [''],
      last_name: [''],
      gender: [''],
      cabin_baggage: [''],
      checkin_baggage: [''],
      ticket_number: [''],
      prefix: [''],
    });

    this.flighttabService.getPaxDetails(this.record.id).subscribe({
      next: (data: any) => {
        this.recordList = data.data
        this.formGroup.patchValue(this.recordList)
      },
      error: (err) => {
        this.alertService.showToast('error', err);
      },
    });

    if (this.record.data) {
      this.readonly = this.record.readonly;
      if (this.readonly) {
        this.title = "Pax Info"

        this.fieldList = [
          { name: 'Name', value: this.record.data.name },
          { name: 'Gender', value: this.record.data.gender },
          { name: 'Ticket Number', value: this.record.data.ticket_number },
          { name: 'Cabin Baggage', value: this.record.data.cabin_baggage },
          { name: 'Checkin Baggage', value: this.record.data.checkin_baggage },
          { name: 'Birth Date', value: this.record.data.date_of_birth },
          { name: 'Is Cancelled', value: this.record.data.is_cancelled ? 'Yes' : 'No' },
          { name: 'Nationality', value: this.record.data.nationality },
          { name: 'Passport Expiry', value: this.record.data.passport_expiry},
          { name: 'Passport Issue Country', value: this.record.data.passport_issue_country },
          { name: 'Passport No', value: this.record.data.passport_no },
          { name: 'Remark', value: this.record.data.remark },
        ]
      }
    }

  }

  submit(): void {
    this.disableBtn = true;
    const Fdata = this.formGroup.value
    Fdata['id'] = this.record.id

    this.flighttabService.changePaxDetails(Fdata).subscribe({
      next: (data: any) => {
        this.disableBtn = false;
        this.alertService.showToast('success', 'Pax Changed');
        this.matDialogRef.close(true);
      },
      error: (err) => {
        this.disableBtn = false;
        this.alertService.showToast('error', err);
      },
    });
  }

}
