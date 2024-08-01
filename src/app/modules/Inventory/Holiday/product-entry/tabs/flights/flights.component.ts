import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Observable, ReplaySubject, debounceTime, distinctUntilChanged, filter, startWith, switchMap } from 'rxjs';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { holidayProductDTO } from '../../product-entry.component';
import { HolidayProductService } from 'app/services/holiday-product.service';
import { DateTime } from 'luxon';
import { CommonUtils } from 'app/utils/commonutils';
import { FlightTabService } from 'app/services/flight-tab.service';
import { ProductFixDepartureService } from 'app/services/product-fix-departure.service';
import { tripType } from 'app/common/const';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-flights',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatMenuModule,
    NgxMatTimepickerModule,
  ],
  templateUrl: './flights.component.html',
  styleUrls: ['./flights.component.scss']
})
export class FlightsComponent implements OnInit {

  formGroup: FormGroup;
  @Input()
  data: holidayProductDTO;
  @Output() dataEvent = new EventEmitter<any>();
  tripTypes: string[] = [];
  airLineFilter = new FormControl();
  DepCityFilter = new FormControl();
  ArrCityFilter = new FormControl();

  // AirlineList = new ReplaySubject<any[]>();
  DepCityList = new ReplaySubject<any[]>();
  ArrCityList = new ReplaySubject<any[]>();

  AllAirline: any[] = [];
  AirlineList: any[] = [];


  constructor(
    private builder: FormBuilder,
    private flightService: FlightTabService,
    private fixDepartureService: ProductFixDepartureService,
    private productService: HolidayProductService,
    private alertService: ToasterService,
  ) {
    this.tripTypes = CommonUtils.valuesArray(tripType);
  }

  ngOnInit(): void {

    this.flightService.getAirportMstCombo('').subscribe(data => {
      this.DepCityList.next(data);
      this.ArrCityList.next(data);
    })

    this.formGroup = this.builder.group({
      id: [''],
      product_id: [''],
      airline_id: [''],
      trip_type: [tripType.Departure],
      departure_city_id: [''],
      departure_date_time: [''],
      departure_time: [''],
      arrival_city_id: [''],
      arrival_date_time: [''],
      arrival_time: [''],
      cabin_baggage: [7],
      checkin_baggage: [30],
      remark: [''],
    });

    // this.airLineFilter.valueChanges.pipe(
    //   filter(search => !!search),
    //   startWith(''),
    //   debounceTime(200),
    //   distinctUntilChanged(),
    //   switchMap((value: string) => {
    //     return this.fixDepartureService.getAirlineCombo(value)
    //   })
    // ).subscribe(data => {
    //   this.AirlineList.next(data);
    // })
    this.fixDepartureService.getAirlineCombo('').subscribe({
      next: (res) => {
          this.AllAirline = res;
          this.AirlineList = res;
      }, error: (err) => {
          this.alertService.showToast('error', err);
      }
  });

    this.DepCityFilter.valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value: string) => {
        if (value)
          return this.flightService.getAirportMstCombo(value)
        else return new Observable<any[]>()
      })
    ).subscribe(data => {
      this.DepCityList.next(data);
    })

    this.ArrCityFilter.valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value: string) => {
        if (value)
          return this.flightService.getAirportMstCombo(value)
        else return new Observable<any[]>()
      })
    ).subscribe(data => {
      this.ArrCityList.next(data);
    })

    this.formGroup.get('departure_date_time').valueChanges.subscribe(val => {
      if (!this.formGroup.get('id').value)
        this.formGroup.get('arrival_date_time').patchValue(val);
    })

  }

  filterAirline(val): void {
    const value = this.AllAirline.filter(x => x.airline_name.toLowerCase().includes(val.toLowerCase()) || x.short_code.toLowerCase().includes(val.toLowerCase()))
    this.AirlineList = value;
}

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

  add(): void {
    const json = this.formGroup.getRawValue();
    const reqJson = this.formGroup.getRawValue();
    reqJson.product_id = this.data.basic_detail.id;
    reqJson.airline_id = reqJson.airline_id.id;
    reqJson.departure_city_id = reqJson.departure_city_id.id;
    reqJson.arrival_city_id = reqJson.arrival_city_id.id;
    reqJson.departure_date_time = DateTime.fromJSDate(new Date(reqJson.departure_date_time)).toFormat('yyyy-MM-dd') + 'T' + reqJson.departure_time
    reqJson.arrival_date_time = DateTime.fromJSDate(new Date(reqJson.arrival_date_time)).toFormat('yyyy-MM-dd') + 'T' + reqJson.arrival_time

    json.departure_date_time = DateTime.fromJSDate(new Date(json.departure_date_time)).toFormat('yyyy-MM-dd') + 'T' + json.departure_time
    json.arrival_date_time = DateTime.fromJSDate(new Date(json.arrival_date_time)).toFormat('yyyy-MM-dd') + 'T' + json.arrival_time

    this.productService.createProductFlightDetails(reqJson).subscribe({
      next: (res) => {
        if (json.id) {
          var data = this.data.flights.find(x => x.id == json.id);
          Object.assign(data, json);
        } else {
          json.id = res.id;
          this.data.flights.push(json)
        }
        this.resetForm();
      }, error: err => this.alertService.showToast('error', err)
    })
  }

  edit(data): void {
    this.formGroup.patchValue(data);
    this.airLineFilter.patchValue(data.airline_id.airline_name)
    this.DepCityFilter.patchValue(data.departure_city_id.airport_name)
    this.ArrCityFilter.patchValue(data.arrival_city_id.airport_name)
  }

  delete(data): void {
    this.productService.deleteProductFlightDetails(data.id).subscribe({
      next: () => {
        const index = this.data.flights.indexOf(this.data.flights.find(x => x.id == data.id));
        this.data.flights.splice(index, 1);
      },
      error: (err) => {
        this.alertService.showToast('error',err,'top-right',true);
            },
    })
  }

  resetForm(): void {
    const json = this.formGroup.getRawValue();

    this.formGroup.get('id').patchValue('');
    if (this.formGroup.get('trip_type').value == tripType.Departure) {
      this.formGroup.get('trip_type').patchValue(tripType.Return);
      this.formGroup.get('departure_city_id').patchValue(json.arrival_city_id);
      this.DepCityFilter.patchValue(json.arrival_city_id.airport_name);
      this.formGroup.get('arrival_city_id').patchValue(json.departure_city_id);
      this.ArrCityFilter.patchValue(json.departure_city_id.airport_name);

      var departureDate: Date = new Date();
      departureDate.setDate(new Date(json.departure_date_time).getDate() + this.data.basic_detail.no_of_nights)
      this.formGroup.get('departure_date_time').patchValue(departureDate);
      this.formGroup.get('arrival_date_time').patchValue(departureDate);
    }
    else {
      this.formGroup.get('trip_type').patchValue(tripType.Departure);
      this.formGroup.get('departure_date_time').patchValue('');
      this.formGroup.get('arrival_date_time').patchValue('');
    }
    this.formGroup.get('departure_time').patchValue('');
    this.formGroup.get('arrival_time').patchValue('');
    this.formGroup.get('remark').patchValue('');

  }
}
