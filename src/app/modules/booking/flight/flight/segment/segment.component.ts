import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FlightTabService } from 'app/services/flight-tab.service';
import { ProductFixDepartureService } from 'app/services/product-fix-departure.service';
import { ToasterService } from 'app/services/toaster.service';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { ReplaySubject, filter, startWith, debounceTime, distinctUntilChanged, switchMap, Observable } from 'rxjs';

@Component({
  selector: 'app-segment',
  templateUrl: './segment.component.html',
  styleUrls: ['./segment.component.scss'],
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
    NgxMatTimepickerModule,
    MatDatepickerModule

  ],
})
export class SegmentComponent {

  disableBtn: boolean = false;
  record: any = {};
  mainid: any = {};
  recordList: any = {};
  title: any


  // airLineFilter = new FormControl();
  // opratingFilter = new FormControl();
  // AirlineListCarrier = new ReplaySubject<any[]>();
  // AirlineListOpratingCarrier = new ReplaySubject<any[]>();

  AirlineListCarrier: any[] = [];
  AllAirlineC: any[] = [];
  AllAirlineO: any[] = [];
  AirlineListOpratingCarrier: any[] = [];
  fromList: any[] = [];
  toList: any[] = [];

  constructor(
    public matDialogRef: MatDialogRef<SegmentComponent>,
    private builder: FormBuilder,
    private flighttabService: FlightTabService,
    private fixDepartureService: ProductFixDepartureService,
    protected alertService: ToasterService,
    private matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any[] = []
  ) {
    this.record = data || {};
    this.mainid = this.record.mainId
    this.recordList = this.record?.data

  }

  formGroup: FormGroup;
  isfirst: boolean = true;


  ngOnInit(): void {
    this.title = this.record.status + ' ' + "Segment Information"

    this.formGroup = this.builder.group({
      id: this.mainid,
      segmentId: [''],
      existingSegmentId: [''],
      carrier: [''],
      cabin_class: [''],
      flight_number: [''],
      from: [''],
      to: [''],
      operating_carrier: [''],
      origin_terminal: [''],
      destination_terminal: [''],
      depTime: [new Date()],
      arrTime: [new Date()],
      // equipment: [''],

      fromfilter: [''],
      tofilter: [''],

      depTime_time: DateTime.fromISO(this.recordList?.arrTime).toFormat('HH:mm'),
      arrTime_time: [''],

      airLineFilter: [''],
      opratingFilter: ['']
    });

    this.formGroup.get('cabin_class').patchValue('Economy')


    /******AirLine*******/
    // this.airLineFilter.valueChanges.pipe(
    //   filter(search => !!search),
    //   startWith(''),
    //   debounceTime(200),
    //   distinctUntilChanged(),
    //   switchMap((value: string) => {
    //     return this.fixDepartureService.getAirlineCombo(value)
    //   })
    // ).subscribe(data => {
    //   this.AirlineListCarrier.next(data);
    // })

    // this.formGroup
    //   .get('airLineFilter')
    //   .valueChanges.pipe(
    //     filter((search) => !!search),
    //     startWith(''),
    //     debounceTime(400),
    //     distinctUntilChanged(),
    //     switchMap((value: any) => {
    //       // if (this.isfirst == true) {
    //       //   return new Observable<any[]>();
    //       // } else
    //       return this.fixDepartureService.getAirlineCombo(value);
    //     })
    //   )
    //   .subscribe((data) => {
    //     this.AirlineListCarrier = data;
    //     if (this.record.status != 'Edit' && this.isfirst == true) {
    //       this.formGroup.get("carrier").patchValue(this.AirlineListCarrier[0].id);
    //       this.isfirst = false
    //     }
    //   });
    this.fixDepartureService.getAirlineCombo('').subscribe({
      next: (res) => {
        this.AllAirlineC = res;
        this.AllAirlineO = res;
        this.AirlineListCarrier = res;
        this.AirlineListOpratingCarrier = res;
        
        if (this.record.status != 'Edit' && this.isfirst == true) {
          this.formGroup.get("carrier").patchValue(this.AirlineListCarrier[0].id);
          this.formGroup.get("operating_carrier").patchValue(this.AirlineListOpratingCarrier[0].id);
          this.isfirst = false
        }
        // if (this.record.status != 'Edit' && this.isfirst == true) {
         
        //   this.isfirst = false
        // }
      }, error: (err) => {
        this.alertService.showToast('error', err);
      }
    });

    /******Optrating AirLine*******/
    // this.opratingFilter.valueChanges.pipe(
    //   filter(search => !!search),
    //   startWith(''),
    //   debounceTime(200),
    //   distinctUntilChanged(),
    //   switchMap((value: string) => {
    //     return this.fixDepartureService.getAirlineCombo(value)
    //   })
    // ).subscribe(data => {
    //   this.AirlineListOpratingCarrier.next(data);
    // })

    // this.formGroup
    //   .get('opratingFilter')
    //   .valueChanges.pipe(
    //     filter((search) => !!search),
    //     startWith(''),
    //     debounceTime(400),
    //     distinctUntilChanged(),
    //     switchMap((value: any) => {
    //       // if (this.isfirst == true) {
    //       //   return new Observable<any[]>();
    //       // } else
    //       return this.fixDepartureService.getAirlineCombo(value);
    //     })
    //   )
    //   .subscribe((data) => {
    //     this.AirlineListOpratingCarrier = data;
    //     this.formGroup.get("operating_carrier").patchValue(this.AirlineListOpratingCarrier[0].id);

    //   });

    /******Airport*******/
    // this.flighttabService.getAirportMstCombo("").subscribe((data) => {

    //   this.fromList = []
    //   this.fromList.push(...data)
    //   // if (!this.record.from)
    //     // this.formGroup.get("from").patchValue(this.fromList[0]);

    //   this.toList = [];
    //   this.toList.push(...data)
    //   // if (!this.record.to)
    //     // this.formGroup.get("to").patchValue(this.toList[0]);

    // });

    this.formGroup
      .get('fromfilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value: any) => {
          // if (this.isfirst == true) {
          //   return new Observable<any[]>();
          // } else

          return this.flighttabService.getAirportMstCombo(value);
        })
      )
      .subscribe((data) => {
        this.fromList = data;
        this.formGroup.get("from").patchValue(this.fromList[0].city_code);
      });

    this.formGroup
      .get('tofilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value: any) => {
          // if (this.isfirst == true) {
          //   this.isfirst = false;
          //   return new Observable<any[]>();
          // } else
          return this.flighttabService.getAirportMstCombo(value);
        })
      )
      .subscribe((data) => {
        this.toList = data
        this.formGroup.get("to").patchValue(this.toList[0].city_code);
      });

    if (this.record.status === 'Edit') {
      if (this.recordList.carrierId) {
        // this.formGroup.get('airLineFilter').patchValue(this.recordList?.carrier)
        this.formGroup.get('carrier').patchValue(this.recordList?.carrierId)
      }
      // this.formGroup.get('opratingFilter').patchValue(this.recordList?.operating_carrier)
      this.formGroup.get('operating_carrier').patchValue(this.recordList?.operatingcarrierId)

      this.formGroup.get('cabin_class').patchValue(this.recordList?.cabinClass);
      this.formGroup.get('flight_number').patchValue(this.recordList?.flightNumber);
      this.formGroup.get('origin_terminal').patchValue(this.recordList?.originTerminal);
      this.formGroup.get('destination_terminal').patchValue(this.recordList?.destinationTerminal);
      this.formGroup.get('depTime').patchValue(this.recordList?.depTime)
      this.formGroup.get('arrTime').patchValue(this.recordList?.arrTime)
      this.formGroup.get('depTime_time').patchValue(DateTime.fromISO(this.recordList?.depTime).toFormat('HH:mm'))
      this.formGroup.get('arrTime_time').patchValue(DateTime.fromISO(this.recordList?.arrTime).toFormat('HH:mm'))
      this.formGroup.get('fromfilter').patchValue(this.recordList?.originAirportName)
      this.formGroup.get('from').patchValue(this.recordList?.originId)
      this.formGroup.get('tofilter').patchValue(this.recordList?.destinationAirportName)
      this.formGroup.get('to').patchValue(this.recordList?.destinationId)


    }

  }

  filterAirlineCarrier(val): void {
    const value = this.AllAirlineC.filter(x => x.airline_name.toLowerCase().includes(val.toLowerCase()) || x.short_code.toLowerCase().includes(val.toLowerCase()))
    this.AirlineListCarrier = value;
  }

  filterAirlineOparatingCarrier(val): void {
    const value = this.AllAirlineO.filter(x => x.airline_name.toLowerCase().includes(val.toLowerCase()) || x.short_code.toLowerCase().includes(val.toLowerCase()))
    this.AirlineListOpratingCarrier = value;
  }

  submit(): void {
    this.disableBtn = true;

    // const carrier = this.formGroup.get('carrier').value
    // const newCarrier = carrier.id

    const from = this.formGroup.get('from').value
    const newFrom = from.city_code

    const to = this.formGroup.get('to').value
    const newTo = to.city_code

    // const oprating = this.formGroup.get('operating_carrier').value
    // const newOprating = oprating.id

    const Fdata = this.formGroup.getRawValue()
    Fdata['segmentId'] = this.recordList.id
    Fdata['operating_carrier'] = Fdata.operating_carrier ? Fdata.operating_carrier : '';

    if (this.record.status !== 'Edit') {
      Fdata['existingSegmentId'] = this.recordList.id
      Fdata['segmentId'] = " "
    }
    else {
      Fdata['existingSegmentId'] = " "
      Fdata['segmentId'] = this.recordList.id
    }

    // Fdata['from'] = newFrom
    // Fdata['to'] = newTo
    Fdata['depTime'] = DateTime.fromISO(this.formGroup.get('depTime').value).toFormat('yyyy-MM-dd') + 'T' + this.formGroup.get('depTime_time').value
    Fdata['arrTime'] = DateTime.fromISO(this.formGroup.get('arrTime').value).toFormat('yyyy-MM-dd') + 'T' + this.formGroup.get('arrTime_time').value
    this.flighttabService.createSegment(Fdata).subscribe({
      next: (data: any) => {
        this.matDialogRef.close(true);
        this.disableBtn = false;
        this.alertService.showToast('success', this.record.status + ' Segment Information');
      },
      error: (err) => {
        this.disableBtn = false;
        this.alertService.showToast('error', err);
      },
    });
  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

}


