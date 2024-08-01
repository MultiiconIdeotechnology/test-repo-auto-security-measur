import { Component, Inject } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AirlineService } from 'app/services/airline.service';
import { FlightTabService } from 'app/services/flight-tab.service';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap, Observable } from 'rxjs';
import { ProductFixDepartureService } from 'app/services/product-fix-departure.service';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-hotel-filter',
  standalone: true,
  imports: [
    CommonModule,
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
    NgxMatSelectSearchModule,
    MatSnackBarModule,],
  templateUrl: './hotel-filter.component.html',
  styleUrls: ['./hotel-filter.component.scss']
})
export class HotelFilterComponent {

  record: any = {};
  isfirst: boolean = true;


  formGroup: FormGroup;
  btnLabel = "Apply"
  title = "Filter Criteria"

  fromcityList: any[] = [];
  tocityList: any[] = [];

  AllAirline: any[] = [];
  AirlineList: any[] = [];

  yearList: any[] = [];
  monthList: any[] = [];

  valueList = [
    'Confirmed Count',
    'Failed Count',
    'Confirmed Failed Count',
    'Confirm Volume',
    'Failed Volume',
    'Pax Count',
    'Markup',
  ];

  typeList = [
    'Month Wise',
    'Day Wise',
  ]

  tripList = [
    'Both',
    'Domestic',
    'International',
  ]

  constructor(
    public matDialogRef: MatDialogRef<HotelFilterComponent>,
    private builder: FormBuilder,
    private confirmService: FuseConfirmationService,
    private router: Router,
    private fixDepartureService: ProductFixDepartureService,
    private airlineService: AirlineService,
    private flighttabService: FlightTabService,
    private matDialog: MatDialog,
    private alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    if (data)
      this.record = data;
  }

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      Type: [''],
      Year: [''],
      Month: [''],
      status: [''],
      tripType: [''],
      fromCity: [''],
      fromcityfilter: [''],
      toCity: [''],
      tocityfilter: [''],
      Airline: [''],
      airLineFilter: [''],
    });



    this.fixDepartureService.getAirlineCombo('').subscribe({
      next: (res) => {
        this.AllAirline = res;
        this.AirlineList = [];
        this.AirlineList.unshift({ "id": "All", "airline_name": "All" })
        this.AirlineList.push(...res)
        if (!this.record.Airline)
          this.formGroup.get("Airline").patchValue(this.AirlineList[0]);
      }, error: (err) => {
        this.alertService.showToast('error', err);
      }
    });

    this.flighttabService.getAirportMstCombo("").subscribe((data) => {
      // this.fromcityList = data;

      this.fromcityList = []
      this.fromcityList.push({ "id": "All", "display_name": "All" })
      this.fromcityList.push(...data)
      if (!this.record.fromCity)
        this.formGroup.get("fromCity").patchValue(this.fromcityList[0]);
      // else
      // this.formGroup.get("fromCity").patchValue(this.record.fromCity);


      this.tocityList = [];
      this.tocityList.push({ "id": "All", "display_name": "All" })
      this.tocityList.push(...data)
      if (!this.record.toCity)
        this.formGroup.get("toCity").patchValue(this.tocityList[0]);

    });

    this.formGroup
      .get('fromcityfilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value: any) => {
          if (this.isfirst == true) {
            return new Observable<any[]>();
          } else
            return this.flighttabService.getAirportMstCombo(value);
        })
      )
      .subscribe((data) => {
        this.fromcityList = data;
      });

    this.formGroup
      .get('tocityfilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value: any) => {
          if (this.isfirst == true) {
            this.isfirst = false;
            return new Observable<any[]>();
          } else
            return this.flighttabService.getAirportMstCombo(value);
        })
      )
      .subscribe((data) => {
        this.tocityList = data
      });

    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 2017; y--) {
      this.yearList.push(y);
    }

    if (this.record) {
      this.formGroup.patchValue(this.record)
      this.formGroup.get("fromcityfilter").patchValue(this.record.fromCity.display_name);
      this.formGroup.get("fromCity").patchValue(this.record.fromCity);
      this.formGroup.get("tocityfilter").patchValue(this.record.toCity.display_name);
      // this.formGroup.get('supplier_id').patchValue(this.record.supplier_id);
    }

  }

  filterAirline(val): void {
    const value = this.AllAirline.filter(x => x.airline_name.toLowerCase().includes(val.toLowerCase()) || x.short_code.toLowerCase().includes(val.toLowerCase()))
    this.AirlineList = value;
  }

  apply() {
    const json = this.formGroup.getRawValue();
    this.matDialogRef.close(json);
  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

}
