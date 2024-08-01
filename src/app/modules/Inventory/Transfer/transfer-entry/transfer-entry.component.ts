import { TransferService } from 'app/services/transfer.service';
import { ReplaySubject, debounceTime, distinctUntilChanged, filter, startWith, switchMap } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgClass, DatePipe, AsyncPipe, NgFor } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { CityService } from 'app/services/city.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { DateTime } from 'luxon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-transfer-entry',
  templateUrl: './transfer-entry.component.html',
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
    MatTooltipModule
  ],
})
export class TransferEntryComponent {
  disableBtn: boolean = false
  readonly: boolean = false;
  record: any = {};
  shortList: any[] = [];
  cityList: any[] = [];
  // cityList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  fieldList: {};

  transfer_types: any[] = [
    { value: 'Pickup', viewValue: 'Pickup' },
    { value: 'Dropoff', viewValue: 'Dropoff' },
    { value: 'Round Trip', viewValue: 'Round Trip' },
  ];

  constructor(
    public matDialogRef: MatDialogRef<TransferEntryComponent>,
    private builder: FormBuilder,
    private transferService: TransferService,
    public cityService: CityService,
    public alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
  }

  formGroup: FormGroup;
  title = "Create Transfer"
  btnLabel = "Create"

  first: boolean = true
  keywords = [];

  announcer = inject(LiveAnnouncer);

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      transfer_from: [''],
      city_id: [''],
      city_name: [''],
      is_airport_pickup: [false],
      is_airport_dropoff: [false],
      is_inter_hotel_transfer: [false],
      short_description: [''],
      transfer_to: [''],
      special_notes: [''],
      transfer_type: [''],
      distance_in_km: [0],

      cityfilter: [''],
    });

    this.formGroup.get('cityfilter').valueChanges
      .pipe(
        filter(search => !!search),
        startWith(''),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((value: any) => {
          return this.cityService.getCityCombo(value);
        })
      )
      .subscribe({
        next: data => {
          this.cityList = data;

          if (!this.record.city_id) {
            this.formGroup.get("city_id").patchValue(data[0].id)
            this.first = false;
          }

        }
      });

    if (this.record.id) {
      this.transferService.getTransferActivityRecord(this.record.id).subscribe({
        next: (data) => {
          this.readonly = this.data.readonly;
          if (this.readonly) {
            this.fieldList = [
              { name: 'Transfer From', value: data.transfer_from },
              { name: 'Transfer To', value: data.transfer_to },
              { name: 'City Name', value: data.city_name },
              { name: 'Transfer Type', value: data.transfer_type },
              { name: 'Airport Pickup', value: data.is_airport_pickup ? 'Yes' : 'No' },
              { name: 'Airport Dropoff', value: data.is_airport_dropoff ? 'Yes' : 'No' },
              { name: 'Inter Hotel Transfer', value: data.is_inter_hotel_transfer ? 'Yes' : 'No' },
              { name: 'Distance In Km', value: data.distance_in_km },
              { name: 'Is Audited', value: data.is_audited ? 'Yes' : 'No' },
              { name: 'Audited By Name', value: data.audited_by_name },
              { name: 'Audit Date Time', value: data.audit_date_time ? DateTime.fromISO(data.audit_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
              { name: 'Is Disabled', value: data.is_disabled ? 'Yes' : 'No' },
              { name: 'Disabled By Name', value: data.disabled_by_name },
              { name: 'Disable Date Time', value: data.disable_date_time ? DateTime.fromISO(data.disable_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
              { name: 'Modify By Name', value: data.update_by_name },
              { name: 'Update Date Time', value: data.update_date_time ? DateTime.fromISO(data.update_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
              { name: 'Entry By Name', value: data.entry_by_name },
              { name: 'Entry Date Time', value: data.entry_date_time ? DateTime.fromISO(data.entry_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
              { name: 'Short Description', value: data.short_description },
              { name: 'Special Notes', value: data.special_notes },
            ]
          }
          this.formGroup.patchValue(this.record);
          this.formGroup.get('cityfilter').patchValue(this.record.city_name);
          this.title = this.readonly ? 'Transfer - ' + this.record.city_name : 'Modify Transfer';
          this.btnLabel = this.readonly ? 'Close' : 'Save';
        },
        error: err => {
          this.alertService.showToast('error', err)

        }

      });
    }

    // if (this.record.id) {
    //   this.formGroup.patchValue(this.record);
    //   this.formGroup.get('cityfilter').patchValue(this.record.city_name);

    //   this.readonly = this.data.readonly;
    //   if(this.readonly) {
    //     this.formGroup.get('is_airport_pickup').disable();
    //     this.formGroup.get('is_airport_dropoff').disable();
    //     this.formGroup.get('is_inter_hotel_transfer').disable();
    //   }

    //   this.title = this.readonly ? 'Transfer - ' + this.record.city_name : 'Modify Transfer';
    //   this.btnLabel = this.readonly ? 'Close' : 'Save';
    // }  
  }

  submit(): void {
    if (!this.formGroup.valid) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }

    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    this.transferService.create(json).subscribe({
      next: () => {
        this.matDialogRef.close(true);
        this.disableBtn = false;
      }, error: (err) => {
        this.disableBtn = false;
        this.alertService.showToast('error', err, "top-right", true);
      }
    })
  }
}
