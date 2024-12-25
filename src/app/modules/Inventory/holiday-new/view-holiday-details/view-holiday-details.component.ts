import { NgIf, NgFor, NgClass, AsyncPipe, DatePipe, JsonPipe, CurrencyPipe, CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
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
import { ActivatedRoute, Router } from '@angular/router';
import { ClassyLayoutComponent } from 'app/layout/layouts/vertical/classy/classy.component';
import { CommanService } from 'app/services/comman.service';
import { HolidayService } from 'app/services/holiday.service';
import { ToasterService } from 'app/services/toaster.service';
import { Linq } from 'app/utils/linq';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { ReplaySubject } from 'rxjs';
import { MatSliderModule } from '@angular/material/slider';
import { CompactLayoutComponent } from 'app/layout/layouts/vertical/compact/compact.component';
import { SelectHolidayPaxComponent } from '../select-holiday-pax/select-holiday-pax.component';
import { HolidayVersionTwoService } from 'app/services/holidayversion2.service ';
import { ImageCarouselComponent } from '../image-carousel/image-carousel.component';


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
  viewAllImage:any = ""

  record: any = {};

  fixedList: any[] = [
    { date: '17 Jan 2023 Monday', dTime: '05 : 30pm', aTime: '10 : 26am' },
    { date: '20 Jan 2023 Monday', dTime: '07 : 30pm', aTime: '11 : 26am' },
    { date: '22 Jan 2023 Monday', dTime: '08 : 30pm', aTime: '12 : 26am' },
    { date: '25 Jan 2023 Monday', dTime: '09 : 30pm', aTime: '9 : 26am' },
  ];

  dayList: any[] = [
    { day: 'Day 1', title: 'Srinagar: Arrival, Sightseeing and Leisure Time', subtitle: 'Srinagar, India', img: 'assets/images/temp_images/holiday/thailand.jpg', text: '  Strolling across the fascinating vistas prevailing in the land of Jammu and Kashmir, crammed with the longstretches of snow-clad mountains gleaming blue water and verdant wavering foliage, this place is aptly entitle ‘Heaven of Earth’. Book a Jammu and Kashmir family package for your next holiday vacation and find yourself amidst the majestic beauty of nature,that’s peaceful and rejuvenating! With an excursion to this exotic tourist  destination, here’s your quest to find a world away from the confines of mundane comes to an end.excursion to this exotic' },
    { day: 'Day 2', title: 'Srinagar: Arrival, Sightseeing and Leisure Time', subtitle: 'Abu, India', img: 'assets/images/temp_images/holiday/dubai.jpg', text: '  Strolling across the fascinating vistas prevailing in the land of Jammu and Kashmir, crammed with the longstretches of snow-clad mountains gleaming blue water and verdant wavering foliage, this place is aptly entitle ‘Heaven of Earth’. Book a Jammu and Kashmir family package for your next holiday vacation and find yourself amidst the majestic beauty of nature,that’s peaceful and rejuvenating! With an excursion to this exotic tourist  destination, here’s your quest to find a world away from the confines of mundane comes to an end.excursion to this exotic' },
    { day: 'Day 3', title: 'Srinagar: Arrival, Sightseeing and Leisure Time', subtitle: 'Rajkot, India', img: 'assets/images/temp_images/holiday/ladakh.jpg', text: '  Strolling across the fascinating vistas prevailing in the land of Jammu and Kashmir, crammed with the longstretches of snow-clad mountains gleaming blue water and verdant wavering foliage, this place is aptly entitle ‘Heaven of Earth’. Book a Jammu and Kashmir family package for your next holiday vacation and find yourself amidst the majestic beauty of nature,that’s peaceful and rejuvenating! With an excursion to this exotic tourist  destination, here’s your quest to find a world away from the confines of mundane comes to an end.excursion to this exotic' },
    { day: 'Day 4', title: 'Srinagar: Arrival, Sightseeing and Leisure Time', subtitle: 'Rajkot, India', img: 'assets/images/temp_images/holiday/ladakh.jpg', text: '  Strolling across the fascinating vistas prevailing in the land of Jammu and Kashmir, crammed with the longstretches of snow-clad mountains gleaming blue water and verdant wavering foliage, this place is aptly entitle ‘Heaven of Earth’. Book a Jammu and Kashmir family package for your next holiday vacation and find yourself amidst the majestic beauty of nature,that’s peaceful and rejuvenating! With an excursion to this exotic tourist  destination, here’s your quest to find a world away from the confines of mundane comes to an end.excursion to this exotic' },
  ];

  slideConfig = {
    slidesToShow: 1, slidesToScroll: 1, dots: false, infinite: true, autoplay: false,
    autoplaySpeed: 3000,
  };

  DisplayDetails: any = {}

  dep_date: string;
  deppDate: DateTime;
  child: number = 0;
  adult: number = 0;
  queryParams: { id: string; date: string; adult: number; child: number; };

  constructor(
    private builder: FormBuilder,
    private holidayService: HolidayVersionTwoService,
    private _route: ActivatedRoute,
    private matDialog: MatDialog,
    private router: Router,
    private toasterService: ToasterService,
    private commanService: CommanService,
    private classy: CompactLayoutComponent,

  ) {
    this.createDetailModel();
  }


  ngOnInit(): void {
    this.classy.toggleNavigation('mainNavigation');

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

    this._route.queryParamMap.subscribe(params => {
      this.id = params.get('id');
      this.dep_date = params.get('date');
      this.adult = JSON.parse(params.get('adult'));
      this.child = JSON.parse(params.get('child'));
      this.deppDate = DateTime.fromFormat(this.dep_date, 'yyyy-MM-dd');
      this.DepatureformGroup.get('date').patchValue(this.dep_date);
      this.DepatureformGroup.get('depDate').patchValue(this.dep_date);
      this.commanService.raiseLoader(true);
      if (this.id) {
        const json = {
          destination_id: params.get('id'),
          departure_date: params.get('date'),
          adult: this.adult,
          child: this.child,
        }

        this.queryParams = {
          id: this.id,
          date: DateTime.fromJSDate(new Date(this.deppDate.toJSDate())).toFormat('yyyy-MM-dd'),
          adult: this.adult,
          child: this.child,
        }
        this.createDetailModel();
        this.holidayService.getHolidaysSearchDetail(json).subscribe({
          next: data => {
            this.commanService.raiseLoader(false);
            this.record = data[0];
            if (this.record.city && this.record.city.length > 0) {
              this.DisplayDetails.CitiesList = this.record.city;
            }
            if (this.record.images?.length > 0) {
              this.DisplayDetails.SecondImageList = this.record.images;
            }
            if (this.record.fix_departure?.length > 0) {
              this.DisplayDetails.FixedDepatureList = this.record.fix_departure;
              this.DisplayDetails.DateList = this.record.fix_departure;
              const date: string = DateTime.fromISO(params.get('date')).toFormat('yyyy-MM-dd');
              const fixDate = this.DisplayDetails.FixedDepatureList.slice().find((x) => DateTime.fromISO(x.departure_date).toFormat('yyyy-MM-dd') === date)
              if (fixDate)
                this.DepatureformGroup.get('date').patchValue(fixDate);
              else
                this.DepatureformGroup.get('date').patchValue(this.DisplayDetails.FixedDepatureList[0]);
            }
            if (this.record.itinerary?.length > 0) {

              let itineraries: any[] = this.record.itinerary;

              itineraries.forEach(x => x.city = null);

              this.DisplayDetails.CitiesList.forEach(city => {
                for (var i = 0; i < city.no_of_days; i++) {
                  if (itineraries.filter(x => !x.city)[0])
                    itineraries.filter(x => !x.city)[0].city = city.display_name;
                }
              })

              this.DisplayDetails.ItineraryList = this.record.itinerary;
            }
            if (this.record.flight?.length > 0) {
              this.DisplayDetails.FlightsList = Linq.groupBy(this.record.flight, (x: any) => x.sector);
              this.tab = 0
            } else {
              this.tab = 1
            }
            if (this.record.inclusion?.length > 0) {
              this.DisplayDetails.CommonInclusionsList = this.record.inclusion;
            }
            if (this.record.exclusion?.length > 0) {
              this.DisplayDetails.ExclusionsList = this.record.exclusion;
            }
            if (this.record.special_notes?.length > 0) {
              this.DisplayDetails.TermsAndConditionsList = this.record.special_notes;
            }
            this.DisplayDetails.CitiesList.forEach(x => {
              this.record.hotel.forEach(h => {
                if (x.city_id == h.city_id) {
                  h.no_of_nights = x.no_of_night;
                  h.order_by_no = x.order_by_no;
                }
              })
              // this.record.transfer.forEach(h => {
              //   if (x.city_id == h.city_id) {
              //     h.no_of_nights = x.no_of_night;
              //     h.order_by_no = x.order_by_no;
              //   }
              // })
              // this.record.activity.forEach(h => {
              //   if (x.city_id == h.city_id) {
              //     h.no_of_nights = x.no_of_night;
              //     h.order_by_no = x.order_by_no;
              //   }
              // })
              // this.record.other_inclusions.forEach(h => {
              //   if (x.city_id == h.city_id) {
              //     h.no_of_nights = x.no_of_night;
              //     h.order_by_no = x.order_by_no;
              //   }
              // })
            })
            if (this.record.hotel?.length > 0) {
              this.record.hotel = this.record.hotel.sort((a, b) => a.order_by_no - b.order_by_no);

              let lastDate: DateTime = this.deppDate;
              this.record.hotel.forEach(x => {
                x.fromDate = lastDate.toFormat('EEE, dd MMM yyyy');
                x.toDate = lastDate.plus({ day: x.no_of_nights }).toFormat('EEE, dd MMM yyyy');
                lastDate = lastDate.plus({ day: x.no_of_nights })
              })
              let hotelGrp: any[] = Linq.groupBy(this.record.hotel, (x: any) => x.city_name);
              this.DisplayDetails.HotelsList = hotelGrp;
            }
            // if (data.transfer.length > 0) {
            //   let transferGrp: any[] = Linq.groupBy(data.transfer.sort((a, b) => a.order_by_no - b.order_by_no), (x: any) => x.city_name);
            //   this.DisplayDetails.TransferList = transferGrp;
            // }
            // if (data.activity.length > 0) {
            //   let activityGrp: any[] = Linq.groupBy(data.activity.sort((a, b) => a.order_by_no - b.order_by_no), (x: any) => x.city_name);
            //   this.DisplayDetails.ActivityList = activityGrp;
            // }
            // if (data.other_inclusions.length > 0) {
            //   let otherGrp: any[] = Linq.groupBy(data.other_inclusions.sort((a, b) => a.order_by_no - b.order_by_no), (x: any) => x.city_name);
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
      TermsAndConditionsList: [],
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
    this.queryParams.date = DateTime.fromJSDate(new Date(data.departure_date)).toFormat('yyyy-MM-dd'),
      this.router.navigate(['/holidays/detail-info'], { queryParams: this.queryParams })
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
    this.queryParams.date = DateTime.fromISO(this.DepatureformGroup.get('depDate').value).toFormat('yyyy-MM-dd'),
      this.router.navigate(['/inventory/holidayv2-products/view-details'], { queryParams: this.queryParams })
  }


  toggleFlightDetails() {
    this.showDetails = !this.showDetails;
  }

  allImages(images): void {
    this.matDialog.open(ImageCarouselComponent, {
      data: images
    });
  }

  downloadQuotation(): void {
    const model: any = {};
    model.product_id = this.record.id;
    model.destination_id = this.record.destination_id;
    model.tour_start_date = this.deppDate;
    model.no_of_adult = Linq.sum(this.record.rooms, (x: any) => x.adult);
    model.no_of_child = Linq.sum(this.record.rooms, (x: any) => x.child_with_bed) + Linq.sum(this.record.rooms, (x: any) => x.child_without_bed) + Linq.sum(this.record.rooms, (x: any) => x.infant);
    model.child_age = 0;
    model.no_of_nights = this.record.no_of_nights;
    model.total_package_cost = this.record.sell_price;
    model.platform = 'B2B Web';

    this.holidayService.downloadQuotation(model).subscribe({
      next: () => {

      }, error: (err) => {
        this.toasterService.showToast('error', err);
      }
    })
  }

  getImages(i, ii): any[] {
    // console.log("getImage reutnr", this.DisplayDetails.SecondImageList.slice(i,ii))
    return this.DisplayDetails.SecondImageList.slice(i, ii)

  }

  // opanChangesDialog() {
  //   this.matDialog.open(HolidaysChangeDialogComponent, {
  //     disableClose: true,
  //     panelClass: 'app-holidays-change-dialog',
  //     backdropClass: 'dark-background',
  //     data: null,
  //     position: { right: '0px', top: '0px' }
  //   })
  // }

  editPax(): void {
    this.matDialog.open(SelectHolidayPaxComponent, {
      data: { adult: this.adult, child: this.child },
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        if (this.adult === res.adult && this.child === res.child)
          return;
        this.adult = res.adult;
        this.child = res.child;
        this.queryParams.adult = this.adult;
        this.queryParams.child = this.child;
        this.router.navigate(['/inventory/holidayv2-products/view-details'], { queryParams: this.queryParams })
      }
    })
  }


}

