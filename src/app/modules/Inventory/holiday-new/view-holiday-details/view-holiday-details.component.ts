import { NgIf, NgFor, NgClass, AsyncPipe, DatePipe, JsonPipe, CurrencyPipe, CommonModule } from '@angular/common';
import { Component, NgModule, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ClassyLayoutComponent } from 'app/layout/layouts/vertical/classy/classy.component';
import { CommanService } from 'app/services/comman.service';
import { HolidayService } from 'app/services/holiday.service';
import { ToasterService } from 'app/services/toaster.service';
import { Linq } from 'app/utils/linq';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { SlickCarouselComponent, SlickCarouselModule } from 'ngx-slick-carousel';
import { ReplaySubject, takeUntil } from 'rxjs';
import { MatSliderModule } from '@angular/material/slider';
import { CompactLayoutComponent } from 'app/layout/layouts/vertical/compact/compact.component';
import { SelectHolidayPaxComponent } from '../select-holiday-pax/select-holiday-pax.component';
import { HolidayVersionTwoService } from 'app/services/holidayversion2.service ';
import { ImageCarouselComponent } from '../image-carousel/image-carousel.component';
import { CommonUtils } from 'app/utils/commonutils';
import { AuthService } from 'app/core/auth/auth.service';


@Component({
  selector: 'app-view-holiday-details',
  templateUrl: './view-holiday-details.component.html',
  styleUrls: ['./view-holiday-details.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    AsyncPipe,
    DatePipe,
    JsonPipe,
    FormsModule,
    SlickCarouselModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTableModule,
    MatSliderModule,
    MatDatepickerModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    CurrencyPipe,
    CommonModule,
  ]
})
export class ViewHolidayDetailsComponent {

  destinationList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  minDate = new Date();
  places: FormControl;
  filters: FormControl;
  DepatureformGroup: FormGroup;
  tab: number;
  showDetails: boolean = false;
  private id: string;
  holidayDetailAll: any

  record: any = {};

  fixedList: any[] = [
    { date: '17 Jan 2023 Monday', dTime: '05 : 30pm', aTime: '10 : 26am' },
    { date: '20 Jan 2023 Monday', dTime: '07 : 30pm', aTime: '11 : 26am' },
    { date: '22 Jan 2023 Monday', dTime: '08 : 30pm', aTime: '12 : 26am' },
    { date: '25 Jan 2023 Monday', dTime: '09 : 30pm', aTime: '9 : 26am' },
  ];

  slideConfig = {
    slidesToShow: 1, slidesToScroll: 1, dots: false, infinite: false, autoplay: false, arrows: true,
    autoplaySpeed: 3000,
  };

  slideConfigforItenary = {
    slidesToShow: 1, slidesToScroll: 1, dots: false, infinite: false, autoplay: false,
    autoplaySpeed: 3000, arrows: true,
  };

  slideConfigforsightseeing = {
    slidesToShow: 1, slidesToScroll: 1, dots: false, infinite: false, autoplay: false,
    autoplaySpeed: 3000, arrows: true,
  };
  @ViewChildren('slickCarousels') slickCarousels: QueryList<SlickCarouselComponent>;

  DisplayDetails: any = {}

  // bontonPanel = BontonPanel;
  // isMobileView = CommonUtils.isMobileView();

  dep_date: string;
  deppDate: DateTime;
  child: number = 0;
  adult: number = 0;
  queryParams: { id: string; date: string; adult: number; child: number; };
  loading: boolean = false;
  _unsubscribeAll: ReplaySubject<any> = new ReplaySubject<any>();
  isLoggedin: boolean = false;
  params: any;
  priceDetail: any;

  constructor(
    private builder: FormBuilder,
    private holidayService: HolidayVersionTwoService,
    private _route: ActivatedRoute,
    private matDialog: MatDialog,
    private authService: AuthService,
    // private holidayLeadsService: HolidayLeadsService,
    private router: Router,
    private toasterService: ToasterService,
    private commanService: CommanService,
  ) {
    this.createDetailModel();
    // this.authService.loggedIn$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
    //   this.isLoggedin = res;
    // });
  }


  slickNext(index: number) {
    this.slickCarousels.toArray()[index].slickNext();
  }

  slickPrev(index: number) {
    this.slickCarousels.toArray()[index].slickPrev();
  }

  toggleContent(item: any): void {
    item.expanded = !item.expanded;
  }

  ngOnInit(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);

    this.minDate = tomorrow;

    this.DepatureformGroup = this.builder.group({
      datefilter: [''],
      date: [''],
      depDate: [],
      child: [0],
      adult: [0],
    });

    this._route.queryParams.subscribe(resp => {
      if (resp && resp["user"]) {

        this.params = JSON.parse(resp["user"]);

        this.id = this.params.id;
        this.dep_date = this.params.date;
        this.adult = JSON.parse(this.params.adult);
        this.child = JSON.parse(this.params.child);
        this.deppDate = DateTime.fromFormat(this.dep_date, 'yyyy-MM-dd');
        this.DepatureformGroup.get('date').patchValue(this.dep_date);
        this.DepatureformGroup.get('depDate').patchValue(this.dep_date);
        this.commanService.raiseLoader(true);

        if (this.id) {
          const json:any = {
            destination_id: this.params.id,
            departure_date: this.params.date,
            departureDate: this.params.date,
            adult: this.adult,
            child: this.child,
            filter: this.params.filter
          }

          this.queryParams = {
            id: this.id,
            date:DateTime.now().toFormat('yyyy-MM-dd'),
            adult: this.adult,
            child: this.child,
            // filter: this.filter
          }
          this.createDetailModel();
          this.holidayService.getHolidaysSearchDetail(json).subscribe({
            next: data => {
              this.depDates()
              this.holidayDetailAll = data
              this.commanService.raiseLoader(false);
              this.loading = true;
              this.record = data.product || {};
              if (data?.hotel?.length > 0) {
                this.DisplayDetails.HotelsList = data.hotel;
              }
              if (data.city?.length > 0) {
                // this.DisplayDetails.CitiesList = data.city;
                this.DisplayDetails.CitiesList = data.city.sort((a, b) => a.order_by_no - b.order_by_no);
              }
              if (data.images?.length > 0) {
                this.DisplayDetails.SecondImageList = data.images;
              }
              // Sort dataList by order_by_no
              // if (data[0].fix_departure?.length > 0) {
              //   this.DisplayDetails.FixedDepatureList = data[0].fix_departure;
              //   this.DisplayDetails.DateList = data[0].fix_departure;
              //   const date: string = DateTime.fromISO(params.date).toFormat('yyyy-MM-dd');
              //   const fixDate = this.DisplayDetails.FixedDepatureList.slice().find((x) => DateTime.fromISO(x.departure_date).toFormat('yyyy-MM-dd') === date)
              //   if (fixDate)
              //     this.DepatureformGroup.get('date').patchValue(fixDate);
              //   else
              //     this.DepatureformGroup.get('date').patchValue(this.DisplayDetails.FixedDepatureList[0]);
              // }
              if (data.itinerary?.length > 0) {

                let itineraries: any[] = data.itinerary;

                itineraries.forEach(x => x.city = null);

                this.DisplayDetails.CitiesList.forEach(city => {
                  for (var i = 0; i < city.no_of_days; i++) {
                    if (itineraries.filter(x => !x.city)[0])
                      itineraries.filter(x => !x.city)[0].city = city.display_name;
                  }
                })

                this.DisplayDetails.ItineraryList = data.itinerary;
              }
              if (data.flight?.length > 0) {
                this.DisplayDetails.FlightsList = Linq.groupBy(data.flight, (x: any) => x.trip_type);
                this.tab = 0
              } else {
                this.tab = 1
              }
              if (data.flight?.length > 0) {
                this.DisplayDetails.FlightList = data.flight;
              }

              if (data.sightseeing?.length > 0) {
                this.DisplayDetails.sightseeingList = data.sightseeing;
              }
              if (data.inclusion?.length > 0) {
                this.DisplayDetails.CommonInclusionsList = data.inclusion;
              }
              if (data.exclusion?.length > 0) {
                this.DisplayDetails.ExclusionsList = data.exclusion;
              }
              if (data.specialNote?.length > 0) {
                this.DisplayDetails.SpecialNoteList = data.specialNote;
              }
              if (data.cancellationPolicy?.length > 0) {
                this.DisplayDetails.CancellationPolicyList = data.cancellationPolicy;
              }
              // this.DisplayDetails.CitiesList.forEach(x => {
              //   data[0].hotel.forEach(h => {
              //     if (x.city_id == h.city_id) {
              //       // h.no_of_nights = x.no_of_night;
              //       h.order_by_no = x.order_by_no;
              //     }
              //   })
              //   data[0].transfer?.forEach(h => {
              //     if (x.city_id == h.city_id) {
              //       h.no_of_nights = x.no_of_night;
              //       h.order_by_no = x.order_by_no;
              //     }
              //   })
              //   data.activity?.forEach(h => {
              //     if (x.city_id == h.city_id) {
              //       h.no_of_nights = x.no_of_night;
              //       h.order_by_no = x.order_by_no;
              //     }
              //   })
              //   data.other_inclusions?.forEach(h => {
              //     if (x.city_id == h.city_id) {
              //       h.no_of_nights = x.no_of_night;
              //       h.order_by_no = x.order_by_no;
              //     }
              //   })
              // })
              // if (data[0].hotel?.length > 0) {
              //   data[0].hotel = data[0].hotel.sort((a, b) => a.order_by_no - b.order_by_no);

              //   let lastDate: DateTime = this.deppDate;
              //   data[0].hotel.forEach(x => {
              //     x.fromDate = lastDate.toFormat('EEE, dd-MM-yyyy');
              //     x.toDate = lastDate.plus({ day: x.no_of_nights }).toFormat('EEE, dd-MM-yyyy');
              //     lastDate = lastDate.plus({ day: x.no_of_nights })
              //   })
              //   let hotelGrp: any[] = Linq.groupBy(data[0].hotel.sort((a, b) => a.order_by_no - b.order_by_no), (x: any) => x.city_name);
              //   this.DisplayDetails.HotelsList = hotelGrp;
              // }
              // if (data[0].transfer?.length > 0) {
              //   let transferGrp: any[] = Linq.groupBy(data[0].transfer.sort((a, b) => a.order_by_no - b.order_by_no), (x: any) => x.city_name);
              //   this.DisplayDetails.TransferList = transferGrp;
              // }
              // if (data[0].activity?.length > 0) {
              //   let activityGrp: any[] = Linq.groupBy(data[0].activity.sort((a, b) => a.order_by_no - b.order_by_no), (x: any) => x.city_name);
              //   this.DisplayDetails.ActivityList = activityGrp;
              // }
              // if (data[0].other_inclusions?.length > 0) {
              //   let otherGrp: any[] = Linq.groupBy(data[0].other_inclusions.sort((a, b) => a.order_by_no - b.order_by_no), (x: any) => x.city_name);
              //   this.DisplayDetails.OtherInclusionList = otherGrp;

              //   // this.DisplayDetails.OtherInclusionList = data.other_inclusions.sort((a, b) => a.order_by_no - b.order_by_no);
              // }
            },
            error: err => {
              this.createDetailModel();
              this.toasterService.showToast('error', err);
              this.commanService.raiseLoader(false);
              this.record = {};
            },
          });

        }
      }
    });

  }

  createDetailModel(): void {
    this.DisplayDetails = {
      CitiesList: [],
      SecondImageList: [],
      FixedDepatureList: [],
      DateList: [],
      ItineraryList: [],
      FlightsList: [],
      ExclusionsList: [],
      FlightList: [],
      SpecialNoteList: [],
      CancellationPolicyList: [],
      sightseeingList: [],
      HotelsList: [],
      TransferList: [],
      ActivityList: [],
      OtherInclusionList: []
    };
  }

  windowResize(): void {
    window.dispatchEvent(new Event('resize'));
  }

  changeFixedDepature(data: any) {
    this.DepatureformGroup.get('date').patchValue(data);
    this.queryParams.date = DateTime.fromJSDate(new Date(data.departure_date)).toFormat('yyyy-MM-dd');

    // Update query parma
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "user": JSON.stringify(this.queryParams)
      }
    };

    this.router.navigate(['/holidays/detail-info'], navigationExtras);
  }

  tabChanged(tab: number): void {
    this.tab = tab;
  }

  getStar(num: number) {
    var dt = [];
    for (var i = 0; i < num; i++) {
      dt.push({});
    }
    return dt;
  }

  depDates(): void {
    this.queryParams.date =DateTime.now().toFormat('yyyy-MM-dd');
    this.params.date = DateTime.now().toFormat('yyyy-MM-dd');
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "user": JSON.stringify(this.queryParams)
      }
    };

    
    this.router.navigate(['/inventory/holidayv2-products/view-details'], navigationExtras);
    // this.router.navigate(['/holidays/detail-info'], navigationExtras);
    this.queryParams = {
      id: this.id,
      date: DateTime.fromJSDate(new Date(this.deppDate.toJSDate())).toFormat('yyyy-MM-dd'),
      adult: this.adult,
      child: this.child,
      // filter: this.filter
    }

    const Fdata = {
      destination_id: this.id,
      departure_date:DateTime.now().toFormat('yyyy-MM-dd'),
      adult: this.adult,
      child: this.child,
    }

    // this.holidayService.getProductPricing(Fdata).subscribe({
    //   next: data => {
    //     this.priceDetail = data.pricing
    //   },
    //   error: err => {
    //     this.toasterService.showToast('error', err);
    //     this.commanService.raiseLoader(false);
    //   }
    // })
  }

  editPax(): void {
    this.matDialog.open(SelectHolidayPaxComponent, {
      data: { adult: this.adult, child: this.child, max_pax: this.record.max_pax || 0 },
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        if (this.adult === res.adult && this.child === res.child)
          return;
        this.adult = res.adult;
        this.child = res.child;
        this.queryParams.adult = this.adult;
        this.queryParams.child = this.child;

        let navigationExtras: NavigationExtras = {
          queryParams: {
            "user": JSON.stringify(this.queryParams)
          }
        };

        this.router.navigate(['/inventory/holidayv2-products/view-details'], navigationExtras);

        const Fdata = {
          destination_id: this.id,
          departure_date: DateTime.now().toFormat('yyyy-MM-dd'),
          adult: this.adult,
          child: this.child,
        }

        // this.holidayService.getProductPricing(Fdata).subscribe({
        //   next: data => {
        //     this.priceDetail = data.pricing
        //   },
        //   error: err => {
        //     this.toasterService.showToast('error', err);
        //     this.commanService.raiseLoader(false);
        //   }
        // })
      }
    })
  }


  toggleFlightDetails() {
    this.showDetails = !this.showDetails;
  }

  allImages(images, img): void {
    this.matDialog.open(ImageCarouselComponent, {
      data: { list: images, img: img },
      panelClass:'full-with-dialog'
    });
  }

  downloadQuotation(): void {
    // if (!this.isLoggedin && this.bontonPanel.isB2C()) {
    //   this.authService.openSignInDialog();
    //   return;
    // }

    this.matDialog.open(SelectHolidayPaxComponent, {
      data: { product: this.holidayDetailAll.product, departure_date: this.params.date, adult: this.adult, child: this.child, },
      disableClose: true,
      panelClass:'full-screen-model'
    }).afterClosed().subscribe(res => {
      // const model: any = {};
      // model.product_id = this.record.id;
      // model.destination_id = this.record.destination_id;
      // model.lead_pax_name = res.lead_pax_name;
      // model.lead_pax_contact = res.lead_pax_contact;
      // model.lead_pax_email = res.lead_pax_email;
      // model.nationality = res.nationality;
      // model.inquiry_remark = res.inquiry_remark;
      // model.tour_start_date = this.deppDate;
      // model.no_of_adult = this.adult;
      // model.no_of_child = this.child;
      // model.child_age = 0;
      // model.no_of_nights = this.record?.no_of_nights;
      // model.total_package_cost = this.record.sell_price + this.record.tax;
      // model.purchase_price = this.record.purchase_price;
      // model.markup = this.record.markup;
      // model.tax = this.record.tax;
      // model.platform = 'B2B Web';
      // model.rooms = this.record.rooms;
      // model.category_wise_pax_price = this.record.category_wise_pax_price;
      // // model.callApi = true;
      // this.commanService.raiseLoader(true);

      // this.holidayLeadsService.downloadQuotation(model).subscribe({
      //   next: (res) => {
      //     this.commanService.raiseLoader(false);

      //     const json = model;
      //     json.copy = res.copy;
      //     json.customer_copy = res.customer_copy;
      //     Object.assign(json, this.record)
      //     this.matDialog.open(DownloadQuotationComponent, {
      //       panelClass: [this.isMobileView ? 'full-screen-model' : ''],
      //       data: json,
      //       disableClose: true
      //     });
      //   }, error: (err) => {
      //     this.toasterService.showToast('error', err);
      //   }
      // })
    });
  }



  bookNow(): void {
    // let child_ages = [];

    // this.matDialog.open(LeadPaxInfoComponent, {
    //   disableClose: true
    // }).afterClosed().subscribe(res => {
    //   const model: any = {};
    //   model.product_id = this.record.id;
    //   model.tour_start_date = this.deppDate;
    //   model.lead_pax_name = res.lead_pax_name;
    //   model.lead_pax_contact = res.lead_pax_contact;
    //   model.lead_pax_email = res.lead_pax_email;
    //   model.nationality = res.nationality;
    //   model.inquiry_remark = res.inquiry_remark;
    //   model.no_of_adult = Linq.sum(this.rooms, (x: any) => x.adult);
    //   model.no_of_child = Linq.sum(this.rooms, (x: any) => x.child_with_bed) + Linq.sum(this.rooms, (x: any) => x.child_without_bed) + Linq.sum(this.rooms, (x: any) => x.infant);
    //   model.child_age = child_ages.join(',');
    //   model.product_city_ids = this.record.cities.map(x => x.id);
    //   model.product_exclusion_ids = this.record.exclusions.map(x => x.id);
    //   model.product_flight_ids = this.record.flights.map(x => x.id);
    //   model.product_inclusion_ids = [];
    //   this.record.hotels.forEach(x => {
    //     model.product_inclusion_ids.push(...x.inclusions.map(i => i.id));
    //   });
    //   this.record.activity.forEach(x => {
    //     model.product_inclusion_ids.push(...x.inclusions.map(i => i.id));
    //   });
    //   this.record.transfer.forEach(x => {
    //     model.product_inclusion_ids.push(...x.inclusions.map(i => i.id));
    //   });
    //   model.product_itinerary_ids = this.record.itinerary.map(x => x.id);
    //   model.product_note_ids = this.record.special_notes.map(x => x.id);
    //   model.product_price_ids = [];

    //   this.holidayInquiryService.bookHoliday(model).subscribe({
    //     next: () => {

    //     }, error: (err) => {
    //       this.toasterService.showToast('error', err);
    //     }
    //   })
    // });
  }

  getImages(i, ii): any[] {
    return this.DisplayDetails.SecondImageList.slice(i, ii)
  }

  opanChangesDialog() {
    // this.matDialog.open(HolidaysChangeDialogComponent, {
    //   disableClose: true,
    //   panelClass: 'app-holidays-change-dialog',
    //   backdropClass: 'dark-background',
    //   data: null,
    //   position: { right: '0px', top: '0px' }
    // })
  }




  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.unsubscribe();
  }


}

