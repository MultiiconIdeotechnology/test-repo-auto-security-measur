import { ReplaySubject, debounceTime, distinctUntilChanged, filter, startWith, switchMap } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, NgClass, DatePipe, AsyncPipe, NgFor } from '@angular/common';
import { AfterViewInit, Component, Inject, inject } from '@angular/core';
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
import { VehicleService } from 'app/services/vehicle.service';
import { DateTime } from 'luxon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToasterService } from 'app/services/toaster.service';
import { HotelService } from 'app/services/hotel.service';

@Component({
  selector: 'app-hotel-entry',
  templateUrl: './hotel-entry.component.html',
  styleUrls: ['./hotel-entry.component.scss'],
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
  ]
})
export class HotelEntryComponent {

  disableBtn: boolean = false
  readonly: boolean = false;
  record: any = {};
  shortList: any[] = [];
  CitytList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  fieldList: {};

  SupplierList: ReplaySubject<any[]> = new ReplaySubject<any[]>();

  constructor(
    public matDialogRef: MatDialogRef<HotelEntryComponent>,
    private builder: FormBuilder,
    private hotelService: HotelService,
    public cityService: CityService,
    public alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
  }

  formGroup: FormGroup;
  title = "Create Hotel"
  btnLabel = "Create"

  keywords = [];

  announcer = inject(LiveAnnouncer);

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      hotel_name: [''],
      city_id: [''],
      cityFilter: [''],
      star_category: [''],
      hotel_address: [''],
      location: [''],
      longitude: [''],
      latitude: [''],
      contact_number: [''],
      email_address: [''],
      booking_policy: [''],
      cancellation_policy: [''],
      hotel_amenities: [''],

    });

    this.formGroup.get('cityFilter').valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.cityService.getCityCombo(value);
      })
    ).subscribe(data => this.CitytList.next(data))

    // if (this.record.id) {
    //   this.hotelService.getHotelRecord(this.record.id).subscribe({
    //     next: (data) => {
    //       this.readonly = this.data.readonly;
          
    //       this.formGroup.patchValue(data);
    //       this.formGroup.get('cityFilter').patchValue(data.city_name)
    //       if (this.readonly)
    //         this.formGroup.get('city_id').patchValue(data.city_name)
    //       this.title = this.readonly ? 'Hotel - ' + this.record.hotel_name : 'Modify Hotel';
    //       this.btnLabel = this.readonly ? 'Close' : 'Save';
    //     }

    //   });
    // }

    if (this.record.id) {
      this.hotelService.getHotelRecord(this.record.id).subscribe({
        next:(data)=> {
          this.readonly = this.data.readonly;
          if(this.readonly) {
            this.fieldList = [
              { name: 'Hotel Name', value: data.hotel_name},
              { name: 'City Name', value: data.city_name },
              { name: 'Star Category', value: data.star_category},
              { name: 'Hotel Address', value: data.hotel_address},
              { name: 'Location', value: data.location},
              { name: 'Longitude', value: data.longitude},
              { name: 'Latitude', value: data.latitude},
              { name: 'Contact Number', value: data.contact_number },
              { name: 'Email Address', value: data.email_address},
              { name: 'Booking Policy', value: data.booking_policy},
              { name: 'Cancellation Policy', value: data.cancellation_policy },
              { name: 'Hotel Amenities', value: data.hotel_amenities},
              { name: 'Entry By Name', value: data.entry_by_name},
              { name: 'Entry Date Time', value: data.entry_date_time? DateTime.fromISO(data.entry_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString():'' },
            ]
          }
          this.formGroup.patchValue(data);
          this.formGroup.get('cityFilter').patchValue(data.city_name)
          if (this.readonly)
          this.formGroup.get('city_id').patchValue(data.city_name)
          this.formGroup.patchValue(this.record);
          this.title = this.readonly ? 'Hotel Info' : 'Modify Hotel';
          this.btnLabel = this.readonly ? 'Close' : 'Save';
        }
        , error: err => this.alertService.showToast('error', err)
        
    });
    }

  }

  submit(): void {
    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    this.hotelService.create(json).subscribe({
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

