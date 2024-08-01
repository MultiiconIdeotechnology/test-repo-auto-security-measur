import { DateTime } from 'luxon';
import { ReplaySubject } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgClass, DatePipe, AsyncPipe, NgFor } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CityService } from 'app/services/city.service';
import { ToasterService } from 'app/services/toaster.service';
import { VehicleService } from 'app/services/vehicle.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Linq } from 'app/utils/linq';

@Component({
  selector: 'app-vehicle-entry',
  templateUrl: './vehicle-entry.component.html',
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
    MatDatepickerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    NgxMatTimepickerModule,
    NgxMatSelectSearchModule,
  ],
})
export class VehicleEntryComponent {
  disableBtn: boolean = false
  readonly: boolean = false;
  record: any = {};
  shortList: any[] = [];
  cityList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  fieldList: {};

  vehicle_types: any[] = [
    { value: 'Hatchback', viewValue: 'Hatchback' },
    { value: 'Sedan', viewValue: 'Sedan' },
    { value: 'SUV', viewValue: 'SUV' },
    { value: 'BUS', viewValue: 'BUS' },
    { value: 'Tempo', viewValue: 'Tempo' },
  ];

  constructor(
    public matDialogRef: MatDialogRef<VehicleEntryComponent>,
    private builder: FormBuilder,
    private vehicleService: VehicleService,
    public cityService: CityService,
    public alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
  }

  formGroup: FormGroup;
  title = "Create Vehicle"
  btnLabel = "Create"

  keywords = [];

  announcer = inject(LiveAnnouncer);

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      vehicle_name: [''],
      vehicle_type: [''],
      short_description: [''],
      special_notes: [''],
      is_ac_vehicle: [false],
      with_baggage_capacity: [0],
      without_baggage_capacity: [0],
    });

    //   this.formGroup.get('vehicle_name').valueChanges.subscribe(text => {
    //     this.formGroup.get('vehicle_name').patchValue(Linq.convertToTitleCase(text), { emitEvent: false });
    //  }) 

    if (this.record.id) {
      this.vehicleService.getVehicleRecord(this.record.id).subscribe({
        next: (data) => {
          this.readonly = this.data.readonly;
          if (this.readonly) {
            this.fieldList = [
              { name: 'Vehicle Name', value: data.vehicle_name },
              { name: 'Vehicle Type', value: data.vehicle_type },
              { name: 'Short Description', value: data.short_description },
              { name: 'Special Notes', value: data.special_notes },
              { name: 'Is Ac Vehicle', value: data.is_ac_vehicle ? 'Yes' : 'No' },
              { name: 'With Baggage Capacity', value: data.with_baggage_capacity },
              { name: 'Without Baggage Capacity', value: data.without_baggage_capacity },
              { name: 'Is Audited', value: data.is_audited ? 'Yes' : 'No' },
              { name: 'Audited By Name', value: data.audited_by_name },
              { name: 'Audit Date Time', value: data.audit_date_time ? DateTime.fromISO(data.audit_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
              { name: 'Is Disabled', value: data.is_disabled ? 'Yes' : 'No' },
              { name: 'Disabled By Name', value: data.disabled_by_name },
              { name: 'Disable Date Time', value: data.disable_date_time ? DateTime.fromISO(data.disable_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
              { name: 'Entry By Name', value: data.entry_by_name },
              { name: 'Entry Date Time', value: data.entry_date_time ? DateTime.fromISO(data.entry_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
            ]
          }
          this.formGroup.patchValue(data);
          this.title = this.readonly ? 'Vehicle - ' + this.record.vehicle_name : 'Modify Vehicle';
          this.btnLabel = this.readonly ? 'Close' : 'Save';
        },
        error: (err) => {
          this.alertService.showToast('error', err)

        },

      });
    }
  }

  submit(): void {
    if (!this.formGroup.valid) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }

    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    this.vehicleService.create(json).subscribe({
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
