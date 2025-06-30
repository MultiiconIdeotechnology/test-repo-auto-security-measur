import { DateTime } from 'luxon';
import { Linq } from 'app/utils/linq';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnumeratePipe } from 'app/enurable.pipe';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ToasterService } from 'app/services/toaster.service';
import { MatDialog } from '@angular/material/dialog';
// import { FareRuleComponent } from '../fare-rule/fare-rule.component';
import { UserService } from 'app/core/user/user.service';
import { Subject, takeUntil } from 'rxjs';
import { User } from '../../../../core/user/user.types';
import { ViewFareMobileViewComponent } from './view-fare-mobile-view/view-fare-mobile-view.component';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { AuthService } from 'app/core/auth/auth.service';
import { AirlineDashboardService } from 'app/services/airline-dashboard.service';
import { BookNowDailogComponent } from '../book-now-dailog/book-now-dailog.component';
// import { ShareItineraryComponent } from '../../dialogs/share-itinerary/share-itinerary.component';

@Component({
  selector: 'app-one-way',
  templateUrl: './one-way.component.html',
  styles: [`
    table, th, td {
      border: 1px solid var(--border-gray);
    }
  `],
  standalone: true,
  imports: [
    EnumeratePipe,
    FormsModule,
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
    MatTooltipModule,
    CommonModule,
  ]
})
export class OneWayComponent {
  @Input()
  flights: any[] = [];

  @Input() cabinClassSearch: any;

  @Input()
  searchdateTime: any[] = [];

  @Input()
  filename: any;

  @Input()
  trip_type: any;

  @Input()
  offervalue: boolean;

  @Input()
  isShowItinerary: boolean;

  @ViewChild('scrollTarget') scrollTarget: ElementRef;


  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = new MatTableDataSource<any>([
    { name: 'Base Fare(1 Adult)', number: 32100 },
    { name: 'Taxes & Fees(1 Adult)', number: 41167 },
  ]);

  dataSource1 = new MatTableDataSource<any>([
    { type: 'Baggage Type', check: '30 Kgs', cabin: '7 kgs' },
    { type: 'Baggage Type', check: '30 Kgs', cabin: '7 kgs' },
  ]);

  columns = ['fareClassString', 'cabinBaggage', 'checkinBaggage', 'cancellation', 'dateChange', 'fareRule', 'bookNow'];

  columns1 = ['type', 'check', 'cabin'];
  AirLines: any[] = [];
  isFareRuleLoading: boolean = false;
  user: any = {};
  convertedSentence: string;
  fareRuleData: SafeHtml;
  newFare: SafeHtml;
  showFare: any;

  constructor(
    private airlineDashboardService: AirlineDashboardService,
    private router: Router,
    private alertService: ToasterService,
    private matDialog: MatDialog,
    private _userService: UserService,
    public sanitizer: DomSanitizer,
    public authService: AuthService,
  ) {
    this._userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user: User) => {
        this.user = user;
      });
  }

  ngOnInit(): void {
    console.log("flightsssssss", this.flights);
    
  }

  sendDetail(record: any): void {
    // this.matDialog.open(ShareItineraryComponent, {
    //   data: { data: [record], type:  'oneway' }
    // })
  }


  getTooltipFair(datalist) {
    // Replace <b> tags with empty string
    const withoutBTags = datalist?.replace(/<b[^>]*>/g, '').replace(/<\/b>/g, ',');

    // Replace multiple spaces with a single space
    const withoutMultipleSpaces = withoutBTags?.replace(/\s{2,}/g, ' ');

    // Replace comma-space with comma
    this.convertedSentence = withoutMultipleSpaces?.replace(/, /g, ', ');
    return this.convertedSentence;
  }


  isSamePlanes(plan1, plan2): boolean {
    return `${plan1.airlineCode}${plan1.fareClass}${plan1.flightNumber}` === `${plan2?.airlineCode}${plan2?.fareClass}${plan2?.flightNumber}`
  }

  getTooltip(data): string {
    let tooltipString = data.join('\n--------------------------------\n');
    return tooltipString;
  }


  tabChanged(tab: number, flight): void {
    flight.tab = tab;

    if (tab === 3 && !flight.fareRules) {
      this.loadFareRules(flight)
    }
  }

  loadFareRules(flight, isMiniFareRule: boolean = true, scrollToID?: any): void {
    const model = {
      traceId: flight.traceId,
      providerId: flight.provider_id_enc,
      resultIndex: flight.resultIndex,
      origin: flight.origin,
      destination: flight.destination,
      cachingFileName: flight.caching_file_name,
      searchFileName: this.filename,
      is_mini_farerule: isMiniFareRule
    }
    this.isFareRuleLoading = true;

    this.airlineDashboardService.fareRules(model).subscribe({
      next: res => {
        flight.fareRules = res?.data;

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

        this.isFareRuleLoading = false;
      }, error: (err) => {
        this.alertService.showToast('error', err);
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

  fareruleNew(flight): void {
    this.loadFareRules(flight, false);
  }

  toggleFlightDetails(flight: any) {
    flight.showDetails = !flight.showDetails;
  }

  // View Fair
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

  booking(flight: any): void {
    console.log("flight", flight);
    
    const json = {
      adultCount: flight.adultCount,
      childCount: flight.childCount,
      traceId: flight.traceId,
      infantCount: flight.infantCount,
      resultIndex: flight.resultIndex, // This key to get resultIndex in detail page
      // resultIndex: this.airlineDashboardService.generateUniqueKey(), // This key to get resultIndex in detail page
      ret_searchCachingFileName: flight.return_caching_file_name,
      is_domestic: flight.is_domestic,
      provider_id_enc: flight.provider_id_enc,
      cabin_class: flight.cabinClass,
      trip_type: this.trip_type,
      origin: flight.origin,
      destination: flight.destination,
      purchasePrice: flight.tempSalePrice,
      caching_file_name: flight.caching_file_name,
      searchdateTime: DateTime.fromISO(this.searchdateTime.toString()).toFormat('yyyy-MM-dd'),
      filename: this.filename,
      travellClass: this.cabinClassSearch,
    };
    console.log("json", json);

    this.matDialog
      .open(BookNowDailogComponent, {
        data: json,
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
    //   filename: this.filename,
    //   travellClass: this.cabinClassSearch,
    //   caching_file_name: flight.caching_file_name || '',
    // };


    // let baggageDetail = [];
    // if(flight.flightStopSegments !== undefined) {
    //   baggageDetail.push({
    //     adultBaggage: flight.flightStopSegments[0]?.adultBaggage || "0",
    //     adultCabinBaggage: flight.flightStopSegments[0]?.adultCabinBaggage || "0",
    //     childBaggage: flight.flightStopSegments[0]?.childBaggage || "0",
    //     childCabinBaggage: flight.flightStopSegments[0]?.childCabinBaggage || "0",
    //     isRefundable: flight.flightStopSegments[0].isRefundable,
    //   });
    // }
    // else {
    //   baggageDetail.push({
    //     adultBaggage: flight?.checkinBaggageStr || "0",
    //     adultCabinBaggage: flight?.cabinBaggageStr || "0",
    //     childBaggage: "0",
    //     childCabinBaggage: "0",
    //     isRefundable: flight.is_refundable,
    //   });
    // }
    // const selectedflightData = {
    //   baggageDetail:baggageDetail,
    //   flightType: 'ow'
    // };
    // // this.cacheService.MainFilterChanged(selectedflightData, 'selected-flight');
    // this.airlineDashboardService.addFlightRecord(json.resultIndex, flight.resultIndex);
    // Linq.recirect('/flights/detail/booking', queryParams)
  }

  fareRule(dest: any, origin: any, val: any): void {
    // this.matDialog.open(FareRuleComponent, {
    //   data: { data: val, destination: dest, origin: origin },
    //   disableClose: true,
    //   panelClass: ["remove-dialog-pading"]
    // }).afterClosed().subscribe(res => {

    // });
  }


  public Sum(property: string): number {
    if (!this.dataSource) {
      return 0;
    }

    return Linq.sum(this.dataSource.data, (val: any) => val[property]);
  }
}
