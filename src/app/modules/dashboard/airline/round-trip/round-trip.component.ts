import { DateTime } from 'luxon';
import { Linq } from 'app/utils/linq';
import { Router } from '@angular/router';
import { EnumeratePipe } from 'app/enurable.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule, NgClass, NgFor, NgIf, DatePipe, UpperCasePipe, JsonPipe, NgStyle } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'app/core/user/user.service';
import { Subject, takeUntil } from 'rxjs';
import { User } from 'app/core/user/user.types';
import { CommonUtils } from 'app/utils/commonutils';
import { ViewFareMobileViewComponent } from '../one-way/view-fare-mobile-view/view-fare-mobile-view.component';
import { AuthService } from 'app/core/auth/auth.service';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { FareRuleComponent } from './fare-rule/fare-rule.component';
import { AirlineDashboardService } from 'app/services/airline-dashboard.service';
import { BookingDialogComponent } from './booking-dialog/booking-dialog.component';
import { DetailDialogeComponent } from './detail-dialoge/detail-dialoge.component';
import { BookNowDailogComponent } from '../book-now-dailog/book-now-dailog.component';

@Component({
  selector: 'app-round-trip',
  templateUrl: './round-trip.component.html',
  styles: [`
  table, th, td {
      border: 1px solid var(--border-gray);
    }
  `],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    JsonPipe,
    EnumeratePipe,
    UpperCasePipe,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSliderModule,
    MatDatepickerModule,
    NgStyle
  ]
})
export class RoundTripComponent implements OnChanges {
  data: any;
  // bontonPanel: any = BontonPanel;

  @Input()
  flights: any[] = [];

  @Input()
  allflights: any[] = [];

  @Input() cabinClassSearch: any;

  @Input()
  searchdateTime: any;

  @Input()
  returnDate: any;

  @Input()
  filename: any;

  @Input()
  trip_type: any;

  @Input()
  offervalue: boolean;

  @Input()
  isShowItinerary: boolean;

  @ViewChild('scrollTarget') scrollTarget: ElementRef;

  depFlights: any[] = [];
  retFlights: any[] = [];

  depFlightsObj: any = {};
  retFlightsObj: any = {};

  SelectedDepartureFlight: any = null;
  SelectedReturnFlight: any = null;
  fareRuleData: SafeHtml;
  // newFare: SafeHtml;
  // showFare: any;

  @Input()
  is_domestic: boolean;
  isFareRuleLoading: boolean;

  user: any = {};
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  columns = ['fareClassString', 'cabinBaggage', 'checkinBaggage', 'cancellation', 'dateChange', 'fareRule', 'bookNow'];

  constructor(
    private matDialog: MatDialog,
    private router: Router,
    public sanitizer: DomSanitizer,
    private airlineDashboardService: AirlineDashboardService,
    private _userService: UserService,
    public authService: AuthService
  ) {
    this._userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user: User) => {
        this.user = user;
      });
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const flightChange = changes.flights;

    if (flightChange) {
      this.depFlights = this.flights.filter(x => !x.isReturn);
      this.retFlights = this.flights.filter(x => x.isReturn);

      this.depFlightsObj = this.allflights.find(x => !x.isReturn);
      this.retFlightsObj = this.allflights.find(x => x.isReturn);
    }
  }

  // sendDetail(SelectedDepartureFlight, SelectedReturnFlight): void {
  //   this.matDialog.open(ShareItineraryComponent, {
  //     data: { data: [SelectedDepartureFlight, SelectedReturnFlight], type: 'roundtrip' },
  //   })
  // }

  // sendDetailInternation(data): void {
  //   this.matDialog.open(ShareItineraryComponent, {
  //     data: { data: [data], type: 'roundtrip' },
  //   })
  // }

  booking(flight: any, retflight?: any): void {
    const json = {
      adultCount: flight.adultCount,
      childCount: flight.childCount,
      infantCount: flight.infantCount,
      traceId: flight.traceId,
      resultIndex: flight.resultIndex, // This key to get resultIndex in detail page
      is_domestic: flight.is_domestic,
      provider_id_enc: flight.provider_id_enc,
      returnId: '', // retflight?.id this is store in local data
      cabin_class: flight.cabinClass,
      trip_type: this.trip_type,
      caching_file_name: flight.caching_file_name,
      return_caching_file_name: retflight?.caching_file_name,
      purchasePrice: flight.tempSalePrice
    };

    this.matDialog
      .open(BookNowDailogComponent, {
        data: { data: json, supplier: flight.supplier_name },
        disableClose: true,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          // this.refreshItems();
        }
      });


    // let queryParams: any = {
    //   flight: JSON.stringify(json),
    //   searchdateTime: DateTime.fromISO(this.searchdateTime.toString()).toFormat('yyyy-MM-dd'),
    //   returnDate: DateTime.fromISO(this.returnDate.toString()).toFormat('yyyy-MM-dd'),
    //   filename: this.filename,
    //   travellClass: this.cabinClassSearch,
    //   caching_file_name: flight.caching_file_name || '',
    //   return_caching_file_name: retflight?.caching_file_name || '',
    // };

    // let baggageDetail = [];
    // baggageDetail.push({
    //   adultBaggage: flight?.checkinBaggageStr || "0",
    //   adultCabinBaggage: flight?.cabinBaggageStr || "0",
    //   childBaggage: "0",
    //   childCabinBaggage: "0",
    //   isRefundable: flight?.is_refundable || false,
    // },
    //   {
    //     adultBaggage: retflight?.checkinBaggageStr || "0",
    //     adultCabinBaggage: retflight?.cabinBaggageStr || "0",
    //     childBaggage: "0",
    //     childCabinBaggage: "0",
    //     isRefundable: retflight?.is_refundable || false,
    //   });
    // const selectedflightData = {
    //   baggageDetail: baggageDetail,
    //   flightType: 'rt'
    // };
    // // this.cacheService.MainFilterChanged(selectedflightData, 'selected-flight');
    // this.airlineDashboardService.addFlightRecord(json.resultIndex, flight.resultIndex, retflight?.id);
    // Linq.recirect('/flights/detail/booking', queryParams)
  }

  getReturnSegment(segments: any[]): any {
    return segments.find(x => x.isreturn);
  }

  toggleFlightDetails(flight): void {
    this.matDialog.open(DetailDialogeComponent, {
      data: { data: flight, searchFileName: this.filename, travellClass: this.cabinClassSearch },
      disableClose: true,
      panelClass: ''
    }).afterClosed().subscribe(res => {
    });
  }

  toggleViewFare(flight: any) {
    // Open the dialog and cast the MatDialogRef to the specific component type
    const dialogRef = this.matDialog.open(ViewFareMobileViewComponent, {
      data: flight,
      disableClose: true,
      panelClass: '',
    });

    // Explicitly cast the dialogRef to the type of the dialog component
    (dialogRef.componentInstance as ViewFareMobileViewComponent).bookEvent.subscribe((fare: any) => {
      if (fare) {
        this.booking(fare);
      }
    });

    // Optionally handle the close event (if the user manually closes the dialog)
    dialogRef.afterClosed().subscribe(res => { });
  }

  bookingDetails(depflight, retflight): void {

    const json = {
      adultCount: depflight.adultCount,
      childCount: depflight.childCount,
      traceId: depflight.traceId,
      resultIndex: depflight.resultIndex, // This key to get resultIndex in detail page
      infantCount: depflight.infantCount,
      is_domestic: depflight.is_domestic,
      provider_id_enc: depflight.provider_id_enc,
      returnId: retflight.resultIndex, // this.selectedRetFlight[0].id this is store in local data
      cabin_class: depflight.cabinClass,
      // trip_type: this.data.trip_type,
      returnDate: DateTime.fromISO(retflight.flightStopSegments[0].depTime.toString()).toFormat('yyyy-MM-dd'),
      returnProviderId: retflight.provider_id_enc,
      returnTraceId: retflight.traceId,
      returnWayFilename: depflight.oneWayfilename,
      purchasePrice: depflight.tempSalePrice + retflight.tempSalePrice,
      caching_file_name: depflight.caching_file_name,
      return_caching_file_name: retflight.caching_file_name
    };

    this.matDialog
      .open(BookNowDailogComponent, {
        data: { data: json, supplier: depflight.supplier_name },
        disableClose: true,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          // this.refreshItems();
        }
      });

    // this.matDialog.open(BookingDialogComponent, {
    //   data: { depflight: depflight, retflight: retflight, searchdateTime: this.searchdateTime, trip_type: this.trip_type, filename: this.filename, offervalue: this.offervalue, travellClass: this.cabinClassSearch },
    //   disableClose: true,
    //   panelClass: ''
    // }).afterClosed().subscribe(res => {
    // });
  }

  isSamePlanes(plan1, plan2): boolean {
    return `${plan1.airlineCode}${plan1.fareClass}${plan1.flightNumber}` === `${plan2.airlineCode}${plan2.fareClass}${plan2.flightNumber}`
  }

  tabChanged(tab: number, flight): void {
    flight.tab = tab;

    if (tab === 3 && !flight.fareRules) {
      this.loadFareRules(flight)
    }
  }

  getTooltip(data): string {
    let tooltipString = data.join('\n--------------------------------\n');
    return tooltipString;
  }

  loadFareRules(flight, isMiniFareRule: boolean = true, scrollToID?: any): void {

    const model = {
      traceId: flight.traceId,
      providerId: flight.provider_id_enc,
      resultIndex: flight.resultIndex,
      origin: flight.origin,
      destination: flight.destination,
      searchFileName: this.filename,
      cachingFileName: flight.caching_file_name,
      is_mini_farerule: isMiniFareRule
    }
    this.isFareRuleLoading = true;

    this.airlineDashboardService.fareRules(model).subscribe({
      next: res => {
        flight.fareRules = res.data;

        if (res && res.data) {
          let data = res?.data.trim();

          if (data.startsWith('{')) {
            let fareData = JSON.parse(data);
            flight.isMoreShowFare = fareData.long_fare_rules_available;

            const sanitizedData = fareData?.data?.trim() ? this.sanitizer.bypassSecurityTrustHtml(fareData.data) : "";

            if (isMiniFareRule) {
              flight.fareRuleData = sanitizedData;
            } else {
              flight.newFare = sanitizedData;
            }

          } else {
            const sanitizedData = data ? this.sanitizer.bypassSecurityTrustHtml(data) : "";

            if (isMiniFareRule) {
              flight.fareRuleData = sanitizedData;
            } else {
              flight.newFare = sanitizedData;
            }
          }
        }
        if (scrollToID) {
          this.scrollToSection(scrollToID);
        }
      }, error: () => {
        this.isFareRuleLoading = false;
      }, complete: () => {
        this.isFareRuleLoading = false;
      }
    })
  }

  scrollToSection(sectionId: string) {
    setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }

  fareRule(dest, origin, val): void {
    this.matDialog.open(FareRuleComponent, {
      data: { data: val, destination: dest, origin: origin },
      disableClose: true,
      panelClass: ['remove-dialog-pading']
    }).afterClosed().subscribe(res => {
    });
  }

  scrollTonewFare() {
    this.scrollTarget.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  addData(ReturnSalePrice, DepartureSalePrice) {
    return (Number(ReturnSalePrice || 0) + Number(DepartureSalePrice || 0)).toFixed(2)
  }

}
