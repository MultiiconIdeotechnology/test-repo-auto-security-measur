import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, NgModule, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { flightClass, flightFareType } from 'app/common/const';
import { AirlineDashboardService } from 'app/services/airline-dashboard.service';
import { CommanService } from 'app/services/comman.service';
import { ToasterService } from 'app/services/toaster.service';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { SlickCarouselComponent, SlickCarouselModule } from 'ngx-slick-carousel';
import { debounceTime, distinctUntilChanged, filter, Observable, ReplaySubject, startWith, switchMap, takeUntil } from 'rxjs';
import { TravellersClassComponent } from './travellers-class/travellers-class.component';
import { OneWayComponent } from './one-way/one-way.component';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Linq } from 'app/utils/linq';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { AppConfig } from 'app/config/app-config';
import { cloneDeep } from 'lodash';
import { CommanLoaderService } from 'app/services/comman-loader.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { EnumeratePipe } from 'app/enurable.pipe';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RoundTripComponent } from './round-trip/round-trip.component';
import { PointListComponent } from './point-list/point-list.component';
import { FlightTabService } from 'app/services/flight-tab.service';

@Component({
  selector: 'app-airline',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatDialogModule,
    NgxMatSelectSearchModule,
    SlickCarouselModule,
    MatRippleModule,
    PrimeNgImportsModule,
    OneWayComponent,
    MatCheckboxModule,

    EnumeratePipe,
    MatFormFieldModule,
    MatTableModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    RouterLink,
    MatMenuModule,
    MatProgressBarModule,
    RoundTripComponent
  ],
  templateUrl: './airline.component.html',
  styleUrls: ['./airline.component.css']
})
export class AirlineComponent implements OnInit {
  @ViewChild('slickModal4') slickModal4: SlickCarouselComponent;
  isLoadingProcessing: boolean = false;
  formGroup: FormGroup;
  fareMap: { [key: string]: number } = {}; // Store date-wise fares
  allCity: any[];
  fromCityList = new ReplaySubject<any[]>();
  toCityList = new ReplaySubject<any[]>();
  selectedFromCity: string = '';
  selectedToCity: string = '';
  formDataList: any[] = [];
  isOpenTravellersClass: boolean;

  // bottom
  offervalue: boolean = false;
  isLoading: boolean = true;
  contents: boolean;
  isFirst: boolean = true;
  loading: boolean = false;
  oneWay: boolean;
  roundTrip: boolean;
  priority: any;
  systemTraceId: any;
  groupInquiry: boolean;
  Allflights: any[] = [];
  flights: any[] = [];
  returnDate: Date;
  totalflights = signal<number>(0);
  is_domestic: boolean;
  filename: any;
  trip_type: any;
  currShortCode: string = "";
  selectedLPoints: any[] = [];
  convertCurrencyList: any[] = [];
  currencySymbol: any = {};
  currency = new FormControl('');
  layoverPoints: any[] = [];
  // airport code for filtering
  filterOptions: any = {
    oneway: {
      origin: new Set<string>(),
      destination: new Set<string>()
    },
    roundtrip: {
      departureOrigin: new Set<string>(),
      departureDestination: new Set<string>(),
      returnOrigin: new Set<string>(),
      returnDestination: new Set<string>()
    }
  };
  displayAirportCodeFilters: any = {};
  startThumbValue = 0;
  endThumbValue = 0;
  minSlider = 0;
  maxSlider = 1000;
  AirLines: any[] = [];
  selectedDate: any;
  isRefundable: boolean = false;
  isNonRefundable: boolean = false;
  isHoldAvailable: boolean = false;

  // Get today's date and next year's date
  today = new Date();
  dateList = [];
  nextYear: Date;
  currentDate: Date;

  minDate = new Date();
  Refund: any[] = [];
  activeSort: any = {};
  sliderStep: number = 0;
  search_date_time: any;
  allViaCity: any;
  firstCity: any;
  lastCity: any;
  lPoint: any;
  is_search_complete: boolean = false;
  cabinClassSearch: any;
  unSubscribeAll: ReplaySubject<any> = new ReplaySubject<any>();
  tempFromCityList: any = [];
  tempToCityList: any = [];
  currentURL: string = '';
  isShowItinerary: boolean = false;


  @ViewChild(MatPaginator) public _paginator: MatPaginator;
  @ViewChild('currencyField') currencySelect: MatSelect;
  elementBottom: number = 0;
  scrollPageSize: any;
  isSticky: boolean = false;
  stickyTopSignal = signal<any>('0px');
  public appConfig = AppConfig;
  isReDataFirst: boolean = true;
  FareDateList: any[] = []
  @ViewChild('rt') rt: RoundTripComponent;
  // @ViewChild('md') md: MulticityDetailComponent;
  airlineSliceNum: number = 5;

  actual_markup_roe: any = 1;
  user: any = {};
  arrivalAirportObj: any = {
    arrivalAirport: [],
    retarrivalAirport: [],
  };

  fixedFareDateSlideConfig = {
    slidesToShow: 7, slidesToScroll: 1, dots: false, infinite: false, autoplay: false, draggable: false,
    autoplaySpeed: 3000,
    variableWidth: true,
    initialSlide: 0,
    centerMode: false, // Enable center mode
    prevArrow: '<i class="material-icons fixed-depart-left-arrow" style="box-shadow: 7px 0px 24px 0px rgba(0, 0, 0, 0.14);">arrow_back_ios_new</i>',
    nextArrow: '<i class="material-icons fixed-depart-right-arrow" style="box-shadow: -6px 0px 24px 0px rgba(0, 0, 0, 0.14);">arrow_forward_ios</i>',
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          draggable: true,
          slidesToScroll: 1,
          centerMode: false // Ensure centering on mobile too
        }
      }
    ]
  };


  sortBy: any[] = [
    { title: '', name: 'Cheapest', is_selected: false },
    { title: '', name: 'Quickest', is_selected: false },
    { title: 'Earliest', name: 'By Departure', is_selected: false },
    { title: 'Earliest', name: 'By Arrival', is_selected: false },
  ];

  filterList: any[] = [
    { title: 'Stops', maintitle: 'Stops', name: 'Direct', is_selected: false },
    { title: 'Stops', maintitle: 'Stops', name: '1 Stop', is_selected: false },
    { title: 'Stops', maintitle: 'Stops', name: '1+ Stops', is_selected: false },
    { title: 'Departure', maintitle: 'Departure', name: 'Before 6AM', is_selected: false },
    { title: 'Departure', maintitle: 'Departure', name: '6AM - 12PM', is_selected: false },
    { title: 'Departure', maintitle: 'Departure', name: '12PM - 6PM', is_selected: false },
    { title: 'Departure', maintitle: 'Departure', name: 'After 6PM', is_selected: false },
    { title: 'Arrival Time', maintitle: 'Arrival Time', name: 'Before 6AM', is_selected: false },
    { title: 'Arrival Time', maintitle: 'Arrival Time', name: '6AM - 12PM', is_selected: false },
    { title: 'Arrival Time', maintitle: 'Arrival Time', name: '12PM - 6PM', is_selected: false },
    { title: 'Arrival Time', maintitle: 'Arrival Time', name: 'After 6PM', is_selected: false },
    { title: 'Stops', maintitle: 'retStops', name: 'Direct', is_selected: false },
    { title: 'Stops', maintitle: 'retStops', name: '1 Stop', is_selected: false },
    { title: 'Stops', maintitle: 'retStops', name: '1+ Stops', is_selected: false },
    { title: 'Departure', maintitle: 'retDeparture', name: 'Before 6AM', is_selected: false },
    { title: 'Departure', maintitle: 'retDeparture', name: '6AM - 12PM', is_selected: false },
    { title: 'Departure', maintitle: 'retDeparture', name: '12PM - 6PM', is_selected: false },
    { title: 'Departure', maintitle: 'retDeparture', name: 'After 6PM', is_selected: false },
    { title: 'Arrival Time', maintitle: 'retArrival Time', name: 'Before 6AM', is_selected: false },
    { title: 'Arrival Time', maintitle: 'retArrival Time', name: '6AM - 12PM', is_selected: false },
    { title: 'Arrival Time', maintitle: 'retArrival Time', name: '12PM - 6PM', is_selected: false },
    { title: 'Arrival Time', maintitle: 'retArrival Time', name: 'After 6PM', is_selected: false },
  ];

  flightType = [
    { id: 'ow', name: 'One Way' },
    { id: 'rt', name: 'Round Trip' },
    // { id: 'mc', name: 'Multi City' },
    // { id: 'gi', name: 'Group Inquiry' },
  ];

  layoverDurations: any[] = [
    { name: 'Less than 30 Min', isSelected: false },
    { name: '30 Min - 1 Hrs', isSelected: false },
    { name: '1 Hrs - 5 Hrs', isSelected: false },
    { name: '5 Hrs - 10 Hrs', isSelected: false },
    { name: 'More than 10 Hrs', isSelected: false },
  ];

  returnFareMap: any = {}
  supplierList: {
    supplier_name: any; isSelected: boolean; // add a checkbox state for UI
  }[];

  supplierListAll: any[] = [];
  SupplierList: any[] = [];
  allVal = {
    "id": "all",
    "company_name": "All"
  };

  constructor(
    private router: Router,
    private builder: FormBuilder,
    private route: ActivatedRoute,
    private matDialog: MatDialog,
    private alertService: ToasterService,
    private airlineDashboardService: AirlineDashboardService,
    private flighttabService: FlightTabService,
    private cdr: ChangeDetectorRef,
    private commanService: CommanLoaderService,

  ) {
    this.sortBy = Linq.groupBy(this.sortBy, (x: any) => x.title);
    this.filterList = Linq.groupBy(this.filterList, (x: any) => x.maintitle);

    this.commanService.onLoader().pipe(takeUntil(this.unSubscribeAll)).subscribe(res => {
      this.isLoading = res.loading;
    })
    this.getConvertCurrencyCombo();

  }
  vaalchange() {
    var alldt = this.formGroup.get('suppliers').value.filter(x => x.id != "all");
    this.formGroup.get('suppliers').patchValue(alldt);
  }

  ngOnInit() {

    this.formGroup = this.builder.group({
      type: ['ow'],
      fromCity: [''],
      fromCityfilter: [''],
      toCity: [''],
      toCityfilter: [''],
      departureDate: [new Date()],
      returnDate: [null],
      cabinClass: [flightClass.economy],
      fareType: [flightFareType.regular],
      adult: [1],
      child: [0],
      infant: [0],
      device: ['WEB'],
      multiCityObjects: [this.formDataList],
      suppliers: [''],
      supplierfilter: [''],
    });

    /******Supplier Combo*******/
    this.flighttabService.getSupplierBoCombo('Airline').subscribe({
      next: (res) => {
        this.supplierListAll = res;
        this.SupplierList.push(...res);
        // this.formGroup.get('supplier_id').patchValue(this.SupplierList.find(x => x.company_name.includes("All")).id)
        // this.formGroup.get('suppliers').patchValue(this.allVal)
        this.formGroup.get('suppliers').patchValue([this.allVal]);
      },
    });

    this.formGroup.get('supplierfilter').valueChanges.subscribe(data => {
      this.SupplierList = this.supplierListAll
      this.SupplierList = this.supplierListAll.filter(x => x.company_name.toLowerCase().includes(data.toLowerCase()));
    })


    const oldJSON = JSON.parse(
      localStorage.getItem('flight-filters') || '{}'
    );
    if (oldJSON.fromCity) {
      // if (new Date(oldJSON.departureDate) < new Date())
      //     oldJSON.departureDate = DateTime.fromJSDate(new Date()).toFormat('yyyy-MM-dd');
      // this.formGroup.patchValue(oldJSON);

      // Convert departureDate from 'yyyy-MM-dd' to a Date object
      const departureDate = oldJSON.departureDate
        ? new Date(oldJSON.departureDate)
        : new Date(); // Fallback to today if invalid

      // Convert returnDate from 'yyyy-MM-dd' to a Date object, or null if not present
      const returnDate = oldJSON.returnDate
        ? new Date(oldJSON.returnDate)
        : null; // Use null if no return date

      // Ensure the date is not in the past
      if (departureDate < new Date()) {
        oldJSON.departureDate = DateTime.fromJSDate(new Date()).toFormat('yyyy-MM-dd');
      }

      // Patch the form with the converted date
      this.formGroup.patchValue({
        ...oldJSON,
        departureDate: new Date(oldJSON.departureDate), // Convert to Date object
        returnDate: returnDate && !isNaN(returnDate.getTime()) ? returnDate : null, // Convert to Date object
      });
    }

    const departureDate = new Date(oldJSON.departureDate || new Date());

    this.formGroup.patchValue({
      departureDate: departureDate,
    });

    const cityFromId = oldJSON.fromCity;
    const cityToId = oldJSON.toCity;
    this.airlineDashboardService
      .getAirportMstCombo('', cityFromId, cityToId)
      .subscribe({
        next: (res) => {
          this.allCity = res;
          this.fromCityList.next(res);
          this.toCityList.next(res);
          this.formGroup.get('fromCity').patchValue(res[0]);
          this.formGroup.get('toCity').patchValue(res[1]);

          this.selectedFromCity = this.formGroup.value.fromCity.airport_code
          this.selectedToCity = this.formGroup.value.toCity.airport_code
          this.fetchDateWiseFares();

          if (this.formDataList.length < 2) {
            this.formDataList.forEach((x: MulticityDTO) => {
              x.fromListData = res;
              x.toListData = res;
              x.allListData = res;
            });
            // this.addCity(0);
          }
        }, error: (err) => {
          this.alertService.showToast('error', err);
        }
      });

    this.formGroup
      .get('fromCityfilter')
      .valueChanges.pipe(
        filter((x) => !!x),
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value: string) => {
          return value
            ? this.airlineDashboardService.getAirportMstCombo(value)
            : new Observable<any[]>();
          // return this.flightsService.getAirportMstCombo(value);
        })
      )
      .subscribe({
        next: (res) => (res ? this.fromCityList.next(res) : null),
      });

    this.formGroup
      .get('toCityfilter')
      .valueChanges.pipe(
        filter((x) => !!x),
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value: string) => {
          return value
            ? this.airlineDashboardService.getAirportMstCombo(value)
            : new Observable<any[]>();
          // return this.flightsService.getAirportMstCombo(value);
        })
      )
      .subscribe({
        next: (res) => (res ? this.toCityList.next(res) : null),
      });

    this.formGroup.get('type').valueChanges.subscribe((value) => {
      if (value === 'rt')
        this.formGroup
          .get('returnDate')
          .patchValue(this.formGroup.get('departureDate').value);
      else this.formGroup.get('returnDate').patchValue(null);
    });

    this.formGroup.get('departureDate').valueChanges.subscribe((v) => {
      const changedDate = DateTime.fromJSDate(new Date(v)).toFormat('yyyy-MM-dd');
      const returnDateValue = new Date(this.formGroup.get('returnDate').value);
      const toDate = DateTime.fromJSDate(returnDateValue).toFormat('yyyy-MM-dd');

      if (toDate < changedDate && this.formGroup.get('type').value == 'rt') {
        this.formGroup.get('returnDate').patchValue(v);
      }
    });

    let multicityForm: MulticityDTO[] = [];
    const multicity = new MulticityDTO();
    multicityForm.push(multicity);

    this.formDataList = [...multicityForm];

    if (oldJSON.multiCityObjects?.length > 1) {
      this.formDataList = [...oldJSON.multiCityObjects];
      this.formDataList.forEach((x) => {
        if (new Date(x.departureDate) < new Date())
          x.departureDate = DateTime.fromJSDate(new Date()).toFormat(
            'yyyy-MM-dd'
          );
      });
      this.formGroup
        .get('multiCityObjects')
        .patchValue(this.formDataList);
    } else {
      this.formDataList.forEach((x) => {
        x.fromCity = x.fromListData[0];
        x.toCity = x.toListData[0];
        x.departureDate = DateTime.fromJSDate(new Date()).toFormat(
          'yyyy-MM-dd'
        );
      });
      this.formGroup
        .get('multiCityObjects')
        .patchValue(this.formDataList);
    }

    if (this.formGroup.get('type').value != 'mc') {
      this.formGroup.get('multiCityObjects').patchValue([]);
    }
  }

  travellersClass(): void {
    this.isOpenTravellersClass = true;
    const json = this.formGroup.value;
    json.service = 'flight';
    this.matDialog
      .open(TravellersClassComponent, {
        data: json,
        panelClass: ''
      })
      .afterClosed()
      .subscribe({
        next: (res) => {
          this.formGroup.patchValue(this.formGroup.value);
          this.isOpenTravellersClass = false;
        },
      });
  }

  // Convert PrimeNG date object to "YYYY-MM-DD" format
  getFormattedDate(date: any): string {
    const year = date.year;
    const month = (date.month + 1).toString().padStart(2, '0'); // Ensure 2-digit month
    const day = date.day.toString().padStart(2, '0'); // Ensure 2-digit day
    return `${year}-${month}-${day}`;
  }

  // Function to fetch fares when "From" and "To" cities are selected
  fetchDateWiseFares() {
    this.nextYear = new Date(this.today);
    this.nextYear.setFullYear(this.today.getFullYear() + 1);
    this.currentDate = new Date(this.today);

    // if (this.selectedFromCity && this.selectedToCity) {

    //   this.airlineDashboardService.getDateWiseFares(this.selectedFromCity, this.selectedToCity, 'ow').subscribe({
    //     next: (res) => {
    //       if (res) {
    //         this.fareMap = res.data.reduce((acc: any, item: any) => {
    //           acc[item.date] = item.price;
    //           return acc;
    //         }, {});

    //         if (this.isFirst) {
    //           this.FareDateList = this.generateDateList();
    //           this.cdr.detectChanges();
    //         }


    //       } else {
    //         this.fareMap = {}
    //         this.FareDateList = this.generateDateList();
    //       }
    //     }, error: (err) => {
    //       this.fareMap = {}
    //       this.FareDateList = this.generateDateList();
    //     }
    //   });
    // }
  }

  generateDateList(): any[] {
    const startDate = new Date(this.today); // April 1, 2025
    const endDate = new Date(this.nextYear); // April 1, 2026

    const dateList = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const price = this.fareMap[dateString] || "View Details"; // Price or "View Details"
      dateList.push({
        date: dateString,
        price: price
      });
      currentDate.setDate(currentDate.getDate() + 1); // Move to next day
    }

    return dateList;
  }

  // Fetch fares for return (e.g., DEL to BOM)
  fetchReturnDateFares(): void {
    // if (this.formGroup.get('type').value === 'rt' && this.selectedFromCity && this.selectedToCity) {
    //   this.airlineDashboardService.getDateWiseFares(this.selectedToCity, this.selectedFromCity, 'rt').subscribe({
    //     next: (res) => {
    //       if (res) {
    //         this.returnFareMap = res.data.reduce((acc: any, item: any) => {
    //           acc[item.date] = item.price;
    //           return acc;
    //         }, {});
    //       } else {
    //         this.returnFareMap = {};
    //       }
    //     },
    //     error: (err) => (this.returnFareMap = {}),
    //   });
    // }
  }

  optionChange(v: any): void {
    if (v === 'mc') {
      const multicityLength = this.formGroup.get('multiCityObjects').value
      if (multicityLength.length < 1) {
        this.formGroup.get('multiCityObjects').patchValue(this.formDataList)
        this.formDataList[1].fromListData = this.formDataList[0].toListData;
      }

      const add = this.formDataList.length < 2;
      if (add) {
        // this.addCity(0);
      } else {
        this.formGroup.get('multiCityObjects').patchValue([]);
      }

      if (v === 'rt') {
        this.fetchReturnDateFares();
      }
    }


  }

  switch(i?: any): void {
    if (this.formGroup.get('type').value === 'mc') {
      const form = this.formDataList[i].fromCity;
      const to = this.formDataList[i].toCity;
      const fromListData = this.formDataList[i].fromListData;
      const toListData = this.formDataList[i].toListData;
      this.formDataList[i].fromCity = to;
      this.formDataList[i].toCity = form;
      this.formDataList[i].fromListData = toListData;
      this.formDataList[i].toListData = fromListData;
      this.changeValue(this.formDataList[i].toCity, i);
    } else {
      const from = this.formGroup.get('fromCity').value;
      const to = this.formGroup.get('toCity').value;
      const fromCityList = this.fromCityList;
      const toCityList = this.toCityList;
      this.formGroup.get('fromCity').patchValue(to);
      this.formGroup.get('toCity').patchValue(from);
      this.fromCityList = toCityList;
      this.toCityList = fromCityList;

      this.selectedFromCity = to.airport_code
      this.selectedToCity = from.airport_code
      if (this.formGroup.get('type').value === 'ow') {
        this.fetchDateWiseFares()
      }
      else {
        this.fetchReturnDateFares();
      }

    }
  }

  changeValue(v: any, i: any, name?: any): void {
    if (name) {
      if (this.formDataList[i + 1]) {
        this.formDataList[i + 1].fromCity = v;
        this.formDataList[i + 1].filterfrom = v.airport_name;
        this.filterfrom(
          v.airport_name,
          this.formDataList[i + 1],
          'from'
        );
      }
    }
    if (!name) {
      if (this.formDataList[i + 1]) {
        this.formDataList[i + 1].fromCity = v;
        this.formDataList[i + 1].filterfrom = v.display_name;
        this.filterfrom(v.airport_name, this.formDataList[i + 1], 'from');
      }
    }
  }

  filterfrom(value: string, formData: MulticityDTO, name: any) {
    this.airlineDashboardService.getAirportMstCombo(value).subscribe({
      next: (res) => {
        if (res) {
          if (name === 'from') {
            formData.fromListData = res;
          } else if (name === 'to') {
            formData.toListData = res;
          }
          formData.allListData = res;
        }
      },
    });
    const fromFilter = formData.allListData.filter((x) =>
      (
        x.display_name.toLowerCase() ||
        x.airport_name.toLowerCase() ||
        x.country.toLowerCase()
      ).includes(value.toLowerCase())
    );
    if (name === 'from') {
      formData.fromListData = fromFilter;
    } else if (name === 'to') {
      formData.toListData = fromFilter;
    }
  }

  removeCity() {
    if (this.formDataList.length > 1) {
      this.formDataList.pop();
    }
  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

  detail(val?: any): void {
    if (this.formGroup.get('fromCity').value.id === this.formGroup.get('toCity').value.id) {
      this.alertService.showToast('error', 'Both destinations are same, please choose both destinations are different');
    }
    else {
      const json = this.formGroup.getRawValue();
      if (this.formGroup.get('type').value === 'mc') {
        const hasError = json.multiCityObjects.length < 1
        const hasEmptyFields = json.multiCityObjects.some(
          (x) =>
            !x.fromCity ||
            !x.toCity ||
            x.departureDate === 'Invalid DateTime'
        );

        if (hasEmptyFields || hasError) {
          this.alertService.showToast(
            'error',
            'Please fill all the fields.'
          );
          return;
        }
      }
      json.fromCity = json.fromCity.id;
      json.toCity = json.toCity.id;
      json.departureDate = DateTime.fromJSDate(
        new Date(json.departureDate)
      ).toFormat('yyyy-MM-dd');
      json.returnDate = json.returnDate
        ? DateTime.fromJSDate(new Date(json.returnDate)).toFormat('yyyy-MM-dd')
        : null;
      if (json.multiCityObjects) {
        json.multiCityObjects.forEach((x) => {
          x.departureDate = DateTime.fromJSDate(
            new Date(x.departureDate)
          ).toFormat('yyyy-MM-dd');
        });
      }

      let sourceCity = this.formGroup.get('fromCity').value.city_code;
      let destinationCity = this.formGroup.get('toCity').value.city_code;
      if (val?.text === 'recentSearch') {
        json.fromCity = val.origin_id;
        json.toCity = val.destination_id;
        json.departureDate = DateTime.fromJSDate(
          new Date(val.depDate)
        ).toFormat('yyyy-MM-dd');

        sourceCity = val.origin;
        destinationCity = val.destination;

      } else if (val?.text === 'popular') {
        json.fromCity = val.origin_id;
        json.toCity = val.destination_id;
        json.departureDate = json.departure_date_time || json.departureDate;

        sourceCity = val.origin;
        destinationCity = val.destination;
      }
      // this.cacheService.MainFilterChanged(json, 'flight-filters');
      // debugger
      // this.searchFlights(json) 
      // let navigationURL = '/dashboard/airline/flights/detail/' + sourceCity + '/' + destinationCity + '/' + json.departureDate
      // if (json.type == 'rt') {
      //   navigationURL = navigationURL + '/' + json.returnDate;
      // }
      // this.router.navigate([navigationURL]);
    }
  }

  searchFlights(): void {
    if (this.isFirst) {
      this.loading = true;
    }
    // debugger
    this.contents = true;
    const json = this.formGroup.getRawValue();
    json.suppliers = json.suppliers[0].id == 'all' ? null : json.suppliers.map(item => item.id);
    json.systemTraceId = this.systemTraceId || '';
    json.priority = this.priority || 1;
    json.version = 2;

    if (this.formGroup.get('type').value === 'rt' && this.isFirst) {
      this.formDataList[0].fromCity = json.fromCity;  
      this.formDataList[0].toCity = json.toCity;
    }

    json.fromCity = json.fromCity.id;
    json.toCity = json.toCity.id;
    json.departureDate = DateTime.fromJSDate(new Date(json.departureDate)).toFormat('yyyy-MM-dd');
    json.returnDate = json.returnDate ? DateTime.fromJSDate(new Date(json.returnDate)).toFormat('yyyy-MM-dd') : '';
    if (json.multiCityObjects) {
      json.multiCityObjects.forEach(x => {
        x.fromCity = x.fromCity;
        x.toCity = x.toCity;
        x.departureDate = x.departureDate
      }
      )
    }

    if (this.isFirst) {
      this.commanService.raiseLoader(true, 'Fetching Flights...');
    }
    this.isLoadingProcessing = true
    this.airlineDashboardService.flightSearch(json).subscribe({
      next: (res) => {


        if (this.isFirst) {
          this.loading = false;
        }
        if (this.isFirst) {
          this.commanService.raiseLoader(false);
          this.isFirst = false;
        }
        this.contents = false;
        this.oneWay = json.type === 'ow';
        this.roundTrip = json.type === 'rt';
        this.priority = res.priority;
        this.systemTraceId = res.systemTraceId;
        this.search_date_time = res.search_date_time;
        res.flights.forEach(x => {
          x.tab = 0;
          var DataSource: MatTableDataSource<any[]> = new MatTableDataSource<any[]>();
          DataSource.data = x.moreFlights || [];
          x.moreFlights = DataSource;
        });

        let flightData = res.flights;
        
        if (!this.groupInquiry) {
          // Refundable & Non-Refundable Merge Filter To salePrice & purchasePrice Update BN-1205
          flightData = res.flights.filter((flight: any) => flight.refundable_Price > 0 || flight.nonrefundable_Price > 0).map((flight: any) => {
            const isRefundableBetter = flight.refundable_Price > 0 && (flight.nonrefundable_Price === 0 || flight.refundable_Price < flight.nonrefundable_Price);
            return {
              ...flight,
              salePrice: isRefundableBetter ? flight.refundable_Price : flight.nonrefundable_Price,
              purchasePrice: isRefundableBetter ? flight.refundable_offer_Price : flight.nonrefundable_offer_Price
            };
          });
        }

        this.Allflights = flightData;
        this.flights = flightData;
        

        this.returnDate = res.return_date_time;
        this.totalflights.set(res.count);
        this.is_domestic = res.is_domestic;
        this.filename = res.filename;
        this.trip_type = res.trip_type;
        // this.totalflights = res.count;


        let lypoints = []

        //   this.currency.patchValue(this.user.currencyId)
        this.currShortCode = this.convertCurrencyList.find(x => x.id == this.currency.value)?.currency_short_code
        this.currencySymbol = this.convertCurrencyList.find(x => x.id == this.currency.value);
        this.flights.forEach(y => {
          lypoints.push(...y.flightStopSegments);
          y.tempSalePrice = y.salePrice;
          y.tempPurchasePrice = y.purchasePrice;
          y.tempCurrency = y.currency;
          y?.moreFlights?.data?.forEach(x => {
            x.tempSalePrice = x.salePrice;
            x.tempPurchasePrice = x.purchasePrice;
            x.tempCurrency = x.currency;
          });
        });
        this.layoverPoints = Linq.groupBy(lypoints, x => x.layoverAt).filter(item => item.key !== '');
        this.layoverPoints.sort((a, b) => a.key?.localeCompare(b.key));



        this.supplierList = Array.from(
          new Set(this.flights.map(flight => flight.supplier_name).filter(Boolean))
        ).map(name => ({
          supplier_name: name,
          isSelected: false
        }));


        // to get the list for airport code to filter (departure and arrival)
        this.Allflights.forEach(flight => {
          const segs = flight.displaySegments;

          if (segs.length === 1) {
            this.filterOptions.oneway.origin.add(segs[0].originCityCode);
            this.filterOptions.oneway.destination.add(segs[0].destinationCityCode);
          } else if (segs.length === 2) {
            const [dep, ret] = segs;
            this.filterOptions.roundtrip.departureOrigin.add(dep.originCityCode);
            this.filterOptions.roundtrip.departureDestination.add(dep.destinationCityCode);
            this.filterOptions.roundtrip.returnOrigin.add(ret.originCityCode);
            this.filterOptions.roundtrip.returnDestination.add(ret.destinationCityCode);
          }
        });

        this.displayAirportCodeFilters = {
          oneway: {
            origin: Array.from(this.filterOptions.oneway.origin).map(code => ({
              code,
              isSelected: false
            })),
            destination: Array.from(this.filterOptions.oneway.destination).map(code => ({
              code,
              isSelected: false
            }))
          },
          roundtrip: {
            departureOrigin: Array.from(this.filterOptions.roundtrip.departureOrigin).map(code => ({
              code,
              isSelected: false
            })),
            departureDestination: Array.from(this.filterOptions.roundtrip.departureDestination).map(code => ({
              code,
              isSelected: false
            })),
            returnOrigin: Array.from(this.filterOptions.roundtrip.returnOrigin).map(code => ({
              code,
              isSelected: false
            })),
            returnDestination: Array.from(this.filterOptions.roundtrip.returnDestination).map(code => ({
              code,
              isSelected: false
            }))
          }
        };

        const allSegments = this.Allflights.flatMap(flight => flight.flightStopSegments);
        this.AirLines = Linq.groupBy(allSegments, seg => seg.airlineCode)
          .map(group => ({
            ...group,
            checked: false, // add a checkbox state for UI
          }));

        this.minSlider = Math.min(...this.Allflights.map(x => x.tempSalePrice));
        this.maxSlider = Math.max(...this.Allflights.map(x => x.tempSalePrice));
        this.startThumbValue = this.minSlider;
        this.endThumbValue = this.maxSlider;

        this.DataFilter(false, null, 'priceRange');

        if (this.oneWay || this.roundTrip) {
          this.addArrivalAirpor();
        }

        // if (this.rt) {
        //   this.rt.SelectedDepartureFlight = null;
        //   this.rt.SelectedReturnFlight = null;
        // }
        this.is_search_complete = res.is_search_complete;

        if (!res.is_search_complete) {
          this.searchFlights();
          this.priority = 1;
          this.systemTraceId = '';

          this.isLoadingProcessing = true;
        }
        else {
          this.priority = 1;
          this.isLoadingProcessing = false;
          // this.isReDataFirst = true;
        }
        this._paginator.length = this.totalflights();

      }, error: (err) => {
        this.alertService.showToast('error', err);
        this.loading = false;
        this.commanService.raiseLoader(false);
        this.contents = false;
        this.isLoadingProcessing = false
      }
    })

    let navigateStr = '/flights/detail/' + this.formGroup.get('fromCity').value.city_code + '/' + this.formGroup.get('toCity').value.city_code + '/' + json.departureDate;
    if (json.type == 'rt') {
      navigateStr = navigateStr + '/' + json.returnDate;
    }

    if (this.currentURL !== navigateStr && ([0, 1, undefined].includes(this.priority))) {
      // this.location.replaceState(navigateStr);
    }

  }

  supplierFilter(selected: any): void {
    // debugger
    // Deselect all first
    this.supplierList.forEach(supplier => supplier.isSelected = false);

    // Select only the clicked one
    selected.isSelected = true;

    this.DataFilter(false, null, 'priceRange');

    // Update flight count, paginator, and filters
    //this.totalflights.set(this.flights.length);
    // this._paginator.length = this.flights.length;
  }




  // botom
  toggleby(event: MatSlideToggleChange) {
    this.offervalue = event.checked;
  }

  scrollTotTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  sortByChange(sorter): void {
    this.sortBy.forEach(x => {
      x.value.map(y => y.is_selected = false);
    });
    sorter.is_selected = true;
    this.activeSort = sorter;

    this.DataFilter();
  }

  Points(v?): void {
    this.matDialog.open(PointListComponent, {
      data: { layoverPoints: this.layoverPoints, name: v },
      panelClass: '',
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (v === 'layover') {
        this.selectedLPoints = res;
        this.lPoint = this.selectedLPoints;
      }
      this.DataFilter(false, null, 'priceRange');
    })
  }

  DataFilter(isPaginatorEvent?: boolean, event?: any, key?: string): void {
    // if (key !== 'priceRange') {
    //   this.scrollTotTop();
    // }

    if (isPaginatorEvent) {
      this.scrollPageSize = event?.pageSize;
    }
    let AllFlights: any = cloneDeep(this.Allflights);

    let stopFilters: string[] = [];
    let DepFilters: string[] = [];
    let ArrFilters: string[] = [];
    let retstopFilters: string[] = [];
    let retDepFilters: string[] = [];
    let retArrFilters: string[] = [];
    let LayoverFilters: string[] = [];
    let originFilters: string[] = [];
    let destinationsFilters: string[] = [];
    let LayoverDurationFilters: string[] = [];

    this.filterList[0].value.forEach(y => {
      if (y.is_selected)
        stopFilters.push(y.name);
    })

    this.filterList[1].value.forEach(y => {
      if (y.is_selected)
        DepFilters.push(y.name);
    })

    this.filterList[2].value.forEach(y => {
      if (y.is_selected)
        ArrFilters.push(y.name);
    })

    this.filterList[3].value.forEach(y => {
      if (y.is_selected)
        retstopFilters.push(y.name);
    })

    this.filterList[4].value.forEach(y => {
      if (y.is_selected)
        retDepFilters.push(y.name);
    })

    this.filterList[5].value.forEach(y => {
      if (y.is_selected)
        retArrFilters.push(y.name);
    })

    this.layoverPoints.forEach(y => {
      if (y.isSelected)
        LayoverFilters.push(y.key);
    })
    this.selectedLPoints = Array.from(new Set(LayoverFilters));

    this.layoverDurations.forEach(y => {
      if (y.isSelected)
        LayoverDurationFilters.push(y.name);
    })

    if (stopFilters && stopFilters.length > 0) {
      let filteredItems = [];

      if (stopFilters.includes('Direct')) {
        const flights = AllFlights.filter((flight: any) => flight?.stops < 1);
        // return flight.displaySegments.some(v => (!v.isreturn && (v.layoverData.length < 1)) || ((this.formGroup.get('type').value === 'rt' && this.is_domestic) || (this.formGroup.get('type').value === 'gi' && this.is_domestic && this.trip_type === 'RETURN') ? v.isreturn : ''));
        if (flights.length > 0)
          filteredItems.push(...flights);
      }
      if (stopFilters.includes('1 Stop')) {
        const flights = AllFlights.filter((flight: any) => flight?.stops === 1);
        if (flights.length > 0)
          filteredItems.push(...flights);
      }

      if (stopFilters.includes('1+ Stops')) {
        const flights = AllFlights.filter((flight: any) => flight?.stops > 1);
        // const flights = AllFlights.filter(flight => {
        //   return flight.displaySegments.some(v => (!v.isreturn && ((v.layoverData.length) > 1)) || ((this.formGroup.get('type').value === 'rt' && this.is_domestic) || (this.formGroup.get('type').value === 'gi' && this.is_domestic && this.trip_type === 'RETURN') ? v.isreturn : ''));
        // });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }
      AllFlights = filteredItems;
    }

    if (DepFilters && DepFilters.length > 0) {
      let filteredItems = [];
      if (DepFilters.includes('Before 6AM')) {
        const flights = AllFlights.filter(flight => {
          return flight.displaySegments.some(v => (!v.isreturn && (new Date(v.depTime).getHours() <= 6)) || ((this.formGroup.get('type').value === 'rt' && this.is_domestic) || (this.formGroup.get('type').value === 'gi' && this.is_domestic && this.trip_type === 'RETURN') ? v.isreturn : ''));
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }
      if (DepFilters.includes('6AM - 12PM')) {
        const flights = AllFlights.filter(flight => {
          return flight.displaySegments.some(v => (!v.isreturn && (new Date(v.depTime).getHours() >= 6 && new Date(v.depTime).getHours() <= 12)) || ((this.formGroup.get('type').value === 'rt' && this.is_domestic) || (this.formGroup.get('type').value === 'gi' && this.is_domestic && this.trip_type === 'RETURN') ? v.isreturn : ''));
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }
      if (DepFilters.includes('12PM - 6PM')) {
        const flights = AllFlights.filter(flight => {
          return flight.displaySegments.some(v => (!v.isreturn && (new Date(v.depTime).getHours() >= 12 && new Date(v.depTime).getHours() <= 18)) || ((this.formGroup.get('type').value === 'rt' && this.is_domestic) || (this.formGroup.get('type').value === 'gi' && this.is_domestic && this.trip_type === 'RETURN') ? v.isreturn : ''));
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }
      if (DepFilters.includes('After 6PM')) {
        const flights = AllFlights.filter(flight => {
          return flight.displaySegments.some(v => (!v.isreturn && (new Date(v.depTime).getHours() >= 18)) || ((this.formGroup.get('type').value === 'rt' && this.is_domestic) || (this.formGroup.get('type').value === 'gi' && this.is_domestic && this.trip_type === 'RETURN') ? v.isreturn : ''));
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }
      AllFlights = filteredItems;
    }

    if (ArrFilters && ArrFilters.length > 0) {
      let filteredItems = [];

      if (ArrFilters.includes('Before 6AM')) {
        const flights = AllFlights.filter(flight => {
          return flight.displaySegments.some(v => (!v.isreturn && (new Date(v.arrTime).getHours() <= 6)) || ((this.formGroup.get('type').value === 'rt' && this.is_domestic) || (this.formGroup.get('type').value === 'gi' && this.is_domestic && this.trip_type === 'RETURN') ? v.isreturn : ''));
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }
      if (ArrFilters.includes('6AM - 12PM')) {
        const flights = AllFlights.filter(flight => {
          return flight.displaySegments.some(v => (!v.isreturn && (new Date(v.arrTime).getHours() >= 6 && new Date(v.arrTime).getHours() <= 12)) || ((this.formGroup.get('type').value === 'rt' && this.is_domestic) || (this.formGroup.get('type').value === 'gi' && this.is_domestic && this.trip_type === 'RETURN') ? v.isreturn : ''));
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }
      if (ArrFilters.includes('12PM - 6PM')) {
        const flights = AllFlights.filter(flight => {
          return flight.displaySegments.some(v => (!v.isreturn && (new Date(v.arrTime).getHours() >= 12 && new Date(v.arrTime).getHours() <= 18)) || ((this.formGroup.get('type').value === 'rt' && this.is_domestic) || (this.formGroup.get('type').value === 'gi' && this.is_domestic && this.trip_type === 'RETURN') ? v.isreturn : ''));
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }
      if (ArrFilters.includes('After 6PM')) {
        const flights = AllFlights.filter(flight => {
          return flight.displaySegments.some(v => (!v.isreturn && (new Date(v.arrTime).getHours() >= 18)) || ((this.formGroup.get('type').value === 'rt' && this.is_domestic) || (this.formGroup.get('type').value === 'gi' && this.is_domestic && this.trip_type === 'RETURN') ? v.isreturn : ''));
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }

      AllFlights = filteredItems;
    }

    AllFlights = this.filterByAirport(AllFlights, this.displayAirportCodeFilters, this.formGroup.get('type')?.value);

    if (retstopFilters && retstopFilters.length > 0) {
      let filteredItems = [];

      if (retstopFilters.includes('Direct')) {
        const flights = AllFlights.filter(flight => {
          return flight.displaySegments.some(v => (v.isreturn && (v.layoverData.length < 1)) || ((this.formGroup.get('type').value === 'rt' && this.is_domestic) || (this.formGroup.get('type').value === 'gi' && this.is_domestic && this.trip_type === 'RETURN') ? !v.isreturn : ''));
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }
      if (retstopFilters.includes('1 Stop')) {
        const flights = AllFlights.filter(flight => {
          return flight.displaySegments.some(v => (v.isreturn && ((v.layoverData.length) === 1)) || ((this.formGroup.get('type').value === 'rt' && this.is_domestic) || (this.formGroup.get('type').value === 'gi' && this.is_domestic && this.trip_type === 'RETURN') ? !v.isreturn : ''));
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }
      if (retstopFilters.includes('1+ Stops')) {
        const flights = AllFlights.filter(flight => {
          return flight.displaySegments.some(v => (v.isreturn && ((v.layoverData.length) > 1)) || ((this.formGroup.get('type').value === 'rt' && this.is_domestic) || (this.formGroup.get('type').value === 'gi' && this.is_domestic && this.trip_type === 'RETURN') ? !v.isreturn : ''));
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }
      AllFlights = filteredItems;
    }

    if (retDepFilters && retDepFilters.length > 0) {
      let filteredItems = [];
      if (retDepFilters.includes('Before 6AM')) {
        const flights = AllFlights.filter(flight => {
          return flight.displaySegments.some(v => (v.isreturn && (new Date(v.depTime).getHours() <= 6)) || ((this.formGroup.get('type').value === 'rt' && this.is_domestic) || (this.formGroup.get('type').value === 'gi' && this.is_domestic && this.trip_type === 'RETURN') ? !v.isreturn : ''));
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }
      if (retDepFilters.includes('6AM - 12PM')) {
        const flights = AllFlights.filter(flight => {
          return flight.displaySegments.some(v => (v.isreturn && (new Date(v.depTime).getHours() >= 6 && new Date(v.depTime).getHours() <= 12)) || ((this.formGroup.get('type').value === 'rt' && this.is_domestic) || (this.formGroup.get('type').value === 'gi' && this.is_domestic && this.trip_type === 'RETURN') ? !v.isreturn : ''));
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }
      if (retDepFilters.includes('12PM - 6PM')) {
        const flights = AllFlights.filter(flight => {
          return flight.displaySegments.some(v => (v.isreturn && (new Date(v.depTime).getHours() >= 12 && new Date(v.depTime).getHours() <= 18)) || ((this.formGroup.get('type').value === 'rt' && this.is_domestic) || (this.formGroup.get('type').value === 'gi' && this.is_domestic && this.trip_type === 'RETURN') ? !v.isreturn : ''));
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }
      if (retDepFilters.includes('After 6PM')) {
        const flights = AllFlights.filter(flight => {
          return flight.displaySegments.some(v => (v.isreturn && (new Date(v.depTime).getHours() >= 18)) || ((this.formGroup.get('type').value === 'rt' && this.is_domestic) || (this.formGroup.get('type').value === 'gi' && this.is_domestic && this.trip_type === 'RETURN') ? !v.isreturn : ''));
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }
      AllFlights = filteredItems;
    }

    if (retArrFilters && retArrFilters.length > 0) {
      let filteredItems = [];

      if (retArrFilters.includes('Before 6AM')) {
        const flights = AllFlights.filter(flight => {
          return flight.displaySegments.some(v => (v.isreturn && (new Date(v.arrTime).getHours() <= 6)) || ((this.formGroup.get('type').value === 'rt' && this.is_domestic) || (this.formGroup.get('type').value === 'gi' && this.is_domestic && this.trip_type === 'RETURN') ? !v.isreturn : ''));
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }
      if (retArrFilters.includes('6AM - 12PM')) {
        const flights = AllFlights.filter(flight => {
          return flight.displaySegments.some(v => (v.isreturn && (new Date(v.arrTime).getHours() >= 6 && new Date(v.arrTime).getHours() <= 12)) || ((this.formGroup.get('type').value === 'rt' && this.is_domestic) || (this.formGroup.get('type').value === 'gi' && this.is_domestic && this.trip_type === 'RETURN') ? !v.isreturn : ''));
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }
      if (retArrFilters.includes('12PM - 6PM')) {
        const flights = AllFlights.filter(flight => {
          return flight.displaySegments.some(v => (v.isreturn && (new Date(v.arrTime).getHours() >= 12 && new Date(v.arrTime).getHours() <= 18)) || ((this.formGroup.get('type').value === 'rt' && this.is_domestic) || (this.formGroup.get('type').value === 'gi' && this.is_domestic && this.trip_type === 'RETURN') ? !v.isreturn : ''));
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }
      if (retArrFilters.includes('After 6PM')) {
        const flights = AllFlights.filter(flight => {
          return flight.displaySegments.some(v => (v.isreturn && (new Date(v.arrTime).getHours() >= 18)) || ((this.formGroup.get('type').value === 'rt' && this.is_domestic) || (this.formGroup.get('type').value === 'gi' && this.is_domestic && this.trip_type === 'RETURN') ? !v.isreturn : ''));
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }

      AllFlights = filteredItems;
    }

    if (this.selectedLPoints && this.selectedLPoints?.length > 0) {
      let filteredItems = [];
      const flights = AllFlights.filter(flight => {
        return flight.flightStopSegments.some(point => this.selectedLPoints.includes(point.layoverAt));
      });
      if (flights.length > 0)
        filteredItems.push(...flights);

      AllFlights = filteredItems;
    }

    if (LayoverDurationFilters && LayoverDurationFilters.length > 0) {
      let filteredItems = [];

      if (LayoverDurationFilters.includes('Less than 30 Min')) {
        const flights = AllFlights.filter(flight => {
          return flight.flightStopSegments.some(v => v.layoverMin > 0 && v.layoverMin < 30);
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }

      if (LayoverDurationFilters.includes('30 Min - 1 Hrs')) {
        const flights = AllFlights.filter(flight => {
          return flight.flightStopSegments.some(v => v.layoverMin >= 30 && v.layoverMin <= 60);
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }

      if (LayoverDurationFilters.includes('1 Hrs - 5 Hrs')) {
        const flights = AllFlights.filter(flight => {
          return flight.flightStopSegments.some(v => v.layoverMin > 60 && v.layoverMin <= 300);
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }
      if (LayoverDurationFilters.includes('5 Hrs - 10 Hrs')) {
        const flights = AllFlights.filter(flight => {
          return flight.flightStopSegments.some(v => v.layoverMin > 300 && v.layoverMin <= 600);
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }
      if (LayoverDurationFilters.includes('More than 10 Hrs')) {
        const flights = AllFlights.filter(flight => {
          return flight.flightStopSegments.some(v => v.layoverMin > 600);
        });
        if (flights.length > 0)
          filteredItems.push(...flights);
      }

      AllFlights = filteredItems;
    }


    // const airLines = this.AirLines.filter(x => x.checked).map(x => x.key) || [];

    // if (airLines && airLines.length > 0) {
    //   AllFlights = AllFlights.filter(flight => {
    //     return flight.displaySegments.some((displayFlight: any) => airLines.includes(displayFlight.airlineCode));
    //   });
    // }

    const airLines = this.AirLines.filter(x => x.checked).map(x => x.key);

    if (airLines && airLines.length > 0) {
      AllFlights = AllFlights.filter(flight =>
        flight.flightStopSegments.some((segment: any) =>
          airLines.includes(segment.airlineCode)
        )
      );
    }

    // Arrival Airport Filter
    const filterByArrivalAirport = (flights: any[], airports: any[], isReturn: boolean) => {
      const selectedAirports = airports.filter((x: any) => x.is_selected).map((x: any) => x.code);
      if (selectedAirports.length) {
        return flights.filter((flight: any) =>
          flight.displaySegments.some((displayFlight: any) =>
            displayFlight.isreturn === isReturn && selectedAirports.includes(displayFlight.destinationAirportCode)
          )
        );
      }
      return flights;
    };

    if (this.arrivalAirportObj?.arrivalAirport?.length) {
      AllFlights = filterByArrivalAirport(AllFlights, this.arrivalAirportObj.arrivalAirport, false);
    }

    if (this.arrivalAirportObj?.retarrivalAirport?.length) {
      AllFlights = filterByArrivalAirport(AllFlights, this.arrivalAirportObj.retarrivalAirport, true);
    }

    if (this.groupInquiry) { // GroupInquiry Time Defult sort by Quickest
      this.activeSort = this.activeSort.name ? this.activeSort : this.sortBy[0].value[1];
    } else {
      this.activeSort = this.activeSort.name ? this.activeSort : this.sortBy[0].value[0];
    }
    this.activeSort.is_selected = true;

    if (this.isRefundable && !this.groupInquiry) { // Refundable Filter
      AllFlights = AllFlights.filter(x => x.refundable_Price > 0);
      AllFlights.forEach((flight: any) => {
        flight.salePrice = flight.refundable_Price;
        flight.purchasePrice = flight.refundable_offer_Price;
        flight.tempSalePrice = flight.refundable_Price;
        flight.tempPurchasePrice = flight.refundable_offer_Price;
        flight.moreFlights.data = flight.moreFlights.data.filter((moreFlight: any) => moreFlight.is_refundable);
      });
    }

    if (this.isNonRefundable && !this.groupInquiry) { // Non-Refundable Filter
      AllFlights = AllFlights.filter(x => x.nonrefundable_Price > 0);
      AllFlights.forEach((flight: any) => {
        flight.salePrice = flight.nonrefundable_Price;
        flight.purchasePrice = flight.nonrefundable_offer_Price;
        flight.tempSalePrice = flight.nonrefundable_Price;
        flight.tempPurchasePrice = flight.nonrefundable_offer_Price;
        flight.moreFlights.data = flight.moreFlights.data.filter((moreFlight: any) => !moreFlight.is_refundable);
      });
    }

    if (!this.isRefundable && !this.isNonRefundable && !this.groupInquiry) { // Refundable & Non-Refundable Merge Filter To salePrice & purchasePrice Update BN-1205
      AllFlights.forEach((flight: any) => {
        const isRefundableBetter = flight.refundable_Price > 0 && (flight.nonrefundable_Price === 0 || flight.refundable_Price < flight.nonrefundable_Price);
        flight.salePrice = isRefundableBetter ? flight.refundable_Price : flight.nonrefundable_Price;
        flight.purchasePrice = isRefundableBetter ? flight.refundable_offer_Price : flight.nonrefundable_offer_Price;
        flight.tempSalePrice = isRefundableBetter ? flight.refundable_Price : flight.nonrefundable_Price;
        flight.tempPurchasePrice = isRefundableBetter ? flight.refundable_offer_Price : flight.nonrefundable_offer_Price;
      });
    }

    AllFlights = AllFlights.filter(x => x.tempSalePrice >= this.startThumbValue && x.tempSalePrice <= this.endThumbValue)

    // This code is When Hold Flight live that time enable Please do not remove this code
    if (this.isHoldAvailable && (this.oneWay || (this.roundTrip && !this.is_domestic))) {
      try {
        AllFlights = AllFlights.filter(x => x.isHold);
        AllFlights.forEach(flight => {
          flight.moreFlights.data = flight.moreFlights.data.filter((moreFlight: any) => moreFlight.isHold);
        });
      } catch (error) {
        console.error('Error filtering hold flights:', error);
      }
    }

    let sortByDefult = this.groupInquiry ? 'Quickest' : 'Cheapest';
    switch (this.activeSort.name || sortByDefult) {
      case 'Cheapest':
        AllFlights = AllFlights.sort((a, b) => a.tempSalePrice - b.tempSalePrice);
        break;
      case 'Quickest':
        AllFlights = AllFlights.sort((a, b) => a.totalDuration - b.totalDuration);
        break;
      case 'By Departure':
        AllFlights = AllFlights.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        break;
      case 'By Arrival':
        AllFlights = AllFlights.sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime());
        break;
    }

    this.currShortCode = this.convertCurrencyList.find(x => x.id == this.currency.value)?.currency_short_code
    this.currencySymbol = this.convertCurrencyList.find(x => x.id == this.currency.value);
    AllFlights.forEach(y => {
      y.salePrice = (Number(y.tempSalePrice.toString()) * Number(this.actual_markup_roe.toString())).toFixed(0);
      y.purchasePrice = (Number(y.tempPurchasePrice.toString()) * Number(this.actual_markup_roe.toString())).toFixed(0);
      y.currency = this.currShortCode;

      y?.moreFlights?.data?.forEach(x => {
        x.salePrice = (Number(x.tempSalePrice.toString()) * Number(this.actual_markup_roe.toString())).toFixed(0);
        x.purchasePrice = (Number(x.tempPurchasePrice.toString()) * Number(this.actual_markup_roe.toString())).toFixed(0);
        x.currency = this.currShortCode;
      });
    });

    var supplier = this.supplierList.find(supplier => supplier.isSelected);

    if (supplier && supplier?.supplier_name) {
      AllFlights = AllFlights.filter(flight =>
        flight.supplier_name === supplier.supplier_name
      );
    }

    if ((this.formGroup.get('type').value === 'rt' && this.is_domestic) || (this.formGroup.get('type').value === 'gi' && this.is_domestic && this.trip_type === 'RETURN')) {

      // This condition is remove becouse same id flight is not showing.
      this.flights = AllFlights;
      // const uniqueFlightIds = new Set();

      // this.flights = AllFlights.filter(flight => {
      //   if (!uniqueFlightIds.has(flight.id)) {
      //     uniqueFlightIds.add(flight.id);
      //     return true;
      //   } else {
      //     return false;
      //   }
      // });
    } else {
      this._paginator.length = AllFlights.length;
      this.totalflights.set(AllFlights?.length);
      if (!isPaginatorEvent)
        this._paginator.pageIndex = 0;
      this.setPaginator(AllFlights);
    }


    // if ((this.is_domestic && this.formGroup.get('type').value === 'rt' || this.is_domestic) && this.formGroup.get('type').value === 'gi') {
    // } else {
    //   const page = (AllFlights.length / this.pageSize).toString().split('.');
    //   this.pages = page.length > 1 ? (Number.parseInt(page[0]) + 1) : Number.parseInt(page[0]);

    //   AllFlights = AllFlights.slice(this.PageIndex * this.pageSize, (this.PageIndex + 1) * this.pageSize)
    // }
  }

  setPaginator(filterdData?): void {
    const index = this._paginator?.pageIndex || 0;
    const size = this._paginator?.pageSize;
    let data: any[] = filterdData ? filterdData : this.Allflights;
    this.flights = data.slice(index * size, (index * size) + size);
  }

  // filtering logic for airport code
  filterByAirport(allFlights: any[], filters: any, trip_type: string): any[] {
    const hasSelection =
      [...(filters?.oneway?.origin || []), ...(filters?.oneway?.destination || []),
      ...(filters?.roundtrip?.departureOrigin || []), ...(filters?.roundtrip?.departureDestination || []),
      ...(filters?.roundtrip?.returnOrigin || []), ...(filters?.roundtrip?.returnDestination || [])]
        .some(item => item?.isSelected);

    if (!hasSelection) return allFlights;

    if (trip_type === 'ow') {
      const selectedOrigins = (filters?.oneway?.origin || []).filter(x => x.isSelected).map(x => x.code);
      const selectedDestinations = (filters?.oneway?.destination || []).filter(x => x.isSelected).map(x => x.code);

      return allFlights.filter(flight =>
        flight.displaySegments.some(seg => {
          const originMatch = selectedOrigins.length === 0 || selectedOrigins.includes(seg.originAirportCode);
          const destMatch = selectedDestinations.length === 0 || selectedDestinations.includes(seg.destinationAirportCode);
          return originMatch && destMatch;
        })
      );
    }

    if (trip_type === 'rt') {
      const depOrigin = (filters?.roundtrip?.departureOrigin || []).filter(x => x.isSelected).map(x => x.code);
      const depDest = (filters?.roundtrip?.departureDestination || []).filter(x => x.isSelected).map(x => x.code);
      const retOrigin = (filters?.roundtrip?.returnOrigin || []).filter(x => x.isSelected).map(x => x.code);
      const retDest = (filters?.roundtrip?.returnDestination || []).filter(x => x.isSelected).map(x => x.code);

      return allFlights.filter(flight => {
        const onward = flight.displaySegments?.[0];
        const ret = flight.displaySegments?.[1];

        const onwardOriginMatch = depOrigin.length === 0 || depOrigin.includes(onward.originAirportCode);
        const onwardDestMatch = depDest.length === 0 || depDest.includes(onward.destinationAirportCode);

        const returnOriginMatch = retOrigin.length === 0 || retOrigin.includes(ret.originAirportCode);
        const returnDestMatch = retDest.length === 0 || retDest.includes(ret.destinationAirportCode);

        return (onwardOriginMatch && onwardDestMatch) && (returnOriginMatch && returnDestMatch);
      });
    }

    return allFlights;
  }

  RefundableChange(from: string) {
    if (from == 'isRefundable') {
      if (this.isRefundable) {
        this.isNonRefundable = false
      }
    }
    else {
      if (this.isNonRefundable) {
        this.isRefundable = false
      }
    }
  }

  ClearFilter(): void {
    this.filterList.forEach(x => {
      x.value.forEach(y => {
        y.is_selected = false;
      })
    });

    // this.RefundableChange('');

    this.isRefundable = false
    this.isNonRefundable = false
    this.isHoldAvailable = false

    this.AirLines.forEach(x => {
      x.checked = false;
    });

    this.layoverPoints.forEach(x => {
      x.isSelected = false;
    });

    this.layoverDurations.forEach(x => {
      x.isSelected = false;
    })

    if (this.arrivalAirportObj) {
      this.arrivalAirportObj.arrivalAirport?.forEach((x: any) => x.is_selected = false);
      this.arrivalAirportObj.retarrivalAirport?.forEach((x: any) => x.is_selected = false);
    }

    this.clearAirportCodeFilters();

    // clearing airport code selection
    // this.uniqueOrigins.forEach(x => {
    //   x.isSelected = false;
    // })

    // this.uniqueDestinations.forEach(x => {
    //   x.isSelected = false;
    // }) //-- end

    this.DataFilter();
  }

  clearAirportCodeFilters() {
    const rt = this.displayAirportCodeFilters.roundtrip;
    const ow = this.displayAirportCodeFilters.oneway;

    // Reset roundtrip
    ['departureOrigin', 'departureDestination', 'returnOrigin', 'returnDestination'].forEach(key => {
      rt[key] = rt[key].map(item => ({ ...item, isSelected: false }));
    });

    // Reset oneway
    ['origin', 'destination'].forEach(key => {
      ow[key] = ow[key].map(item => ({ ...item, isSelected: false }));
    });

  }

  // Filter mobile view Dialog
  filterMobileView() {
    let dataObj = {
      sortBy: this.sortBy,
      activeSort: this.activeSort,
      filterList: this.filterList,
      trip_type: this.trip_type,
      layoverPoints: this.layoverPoints,
      layoverDurations: this.layoverDurations,
      groupInquiry: this.groupInquiry,
      minSlider: this.minSlider,
      maxSlider: this.maxSlider,
      sliderStep: this.sliderStep,
      startThumbValue: this.startThumbValue,
      endThumbValue: this.endThumbValue,
      AirLines: this.AirLines,
      selectedLPoints: this.selectedLPoints,
      formDataList: this.formDataList,
      lPoint: this.lPoint,
      currencySymbol: this.currencySymbol,
      currShortCode: this.currShortCode,
      convertCurrencyList: this.convertCurrencyList,
      currencyc: this.currency.value,
      isRefundable: this.isRefundable,
      isNonRefundable: this.isNonRefundable,
      arrivalAirportObj: this.arrivalAirportObj,
      actual_markup_roe: this.actual_markup_roe,
      displayAirportCodeFilters: this.displayAirportCodeFilters,
      isDomestic: this.is_domestic,
    }

    // this.matDialog.open(FlightsSerachFilterComponent, {
    //   data: JSON.stringify(dataObj),
    //   panelClass: ['full-screen-model']
    //   // disableClose: true
    // }).afterClosed().subscribe(res => {
    //   if (res && res.data) {
    //     var isCallGetCurrencyData = false;
    //     if (this.currency.value != res.data.currencyc)
    //       isCallGetCurrencyData = true;
    //     Object.assign(this, res.data)
    //     this.DataFilter();
    //     if (isCallGetCurrencyData) {
    //       this.currency.patchValue(res.data.currencyc);
    //       this.getCurrencyData();
    //     }
    //   }
    // });
  }

  addArrivalAirpor() {
    try {
      let AllFlights: any = cloneDeep(this.Allflights);

      const uniqueArrivalAirports = new Map<string, { code: string; name: string }>();
      const uniqueRetArrivalAirports = new Map<string, { code: string; name: string }>();

      AllFlights.forEach(flight => {
        flight.displaySegments.forEach((displayFlight: any) => {
          if (displayFlight.destinationAirportCode && displayFlight.destinationAirportName) {
            const airport = { code: displayFlight.destinationAirportCode, name: displayFlight.destinationAirportName };
            if (displayFlight.isreturn && this.trip_type == 'RETURN') {
              uniqueRetArrivalAirports.set(displayFlight.destinationAirportCode, airport);
            } else {
              uniqueArrivalAirports.set(displayFlight.destinationAirportCode, airport);
            }
          }
        });
      });

      this.arrivalAirportObj = {
        arrivalAirport: Array.from(uniqueArrivalAirports.values()),
        retarrivalAirport: Array.from(uniqueRetArrivalAirports.values()),
      };

    } catch (error) {
      console.error('Error in addArrivalAirpor:', error);
    }
  }


  getConvertCurrencyCombo() {
    this.airlineDashboardService.getConvertCurrencyCombo().subscribe((res: any) => {
      this.convertCurrencyList = res;

      this.currShortCode = this.convertCurrencyList.find(x => x.id == this.currency.value)?.currency_short_code
      this.currencySymbol = this.convertCurrencyList.find(x => x.id == this.currency.value);
    });
  }

  getCurrencyData() {
    this.currShortCode = this.convertCurrencyList.find(x => x.id == this.currency.value)?.currency_short_code
    this.currencySymbol = this.convertCurrencyList.find(x => x.id == this.currency.value);

    this.airlineDashboardService.getActualMarkupROE({ from_currency_id: this.user.currencyId || 'Tir0JeaB0$DpcSqJjaA0$2Yc5u7waC0$aC0$', to_currency_id: this.currency.value }).subscribe({
      next: (res: any) => {
        this.actual_markup_roe = res.actual_markup_roe;

        this.flights.forEach(y => {
          y.salePrice = (Number(y.tempSalePrice.toString()) * Number(this.actual_markup_roe.toString())).toFixed(0);
          y.purchasePrice = (Number(y.tempPurchasePrice.toString()) * Number(this.actual_markup_roe.toString())).toFixed(0);
          y.currency = this.currShortCode;

          y?.moreFlights?.data?.forEach(x => {
            x.salePrice = (Number(x.tempSalePrice.toString()) * Number(this.actual_markup_roe.toString())).toFixed(0);
            x.purchasePrice = (Number(x.tempPurchasePrice.toString()) * Number(this.actual_markup_roe.toString())).toFixed(0);
            x.currency = this.currShortCode;
          });

        });
      }, error: (err) => {
        this.alertService.showToast('error', err);
      },
    });
  }

  @HostListener('window:scroll', [])
  onScroll() {
    if (!this.isSticky) {
      this.updateStickyTop();
    }
  }

  updateStickyTop() {
    const scrollTop = window.scrollY;
    const offset = -(scrollTop - 500);
    this.stickyTopSignal.set(`${offset}px`);
  }

  resetPriceRange() {
    this.startThumbValue = this.minSlider;
    this.endThumbValue = this.maxSlider;
    this.DataFilter(false, "", 'priceRange');
  }

  cancelReturnDate() {
    this.formGroup.get('returnDate').setValue(null);
    if (this.formGroup.get('type').value == "rt")
      this.formGroup.get('type').setValue('ow');
  }


  // Called when "From" city is selected
  onFromCitySelectionChange(selectedCity: any) {
    this.selectedFromCity = selectedCity.airport_code; // Use city ID or code
    this.fetchDateWiseFares();
  }

  // Called when "To" city is selected
  onToCitySelectionChange(selectedCity: any) {
    this.selectedToCity = selectedCity.airport_code; // Use city ID or code
    this.fetchDateWiseFares();
  }

  // Function to format date for binding prices
  getFormattedDateNew(date: any): string {
    return `${date.year}-${String(date.month + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
  }

}

class MulticityDTO {
  fromCity: any;
  toCity: any;
  departureDate: string = '';
  fromListData: any[] = [];
  fromfilter: string = '';
  toListData: any[] = [];
  tofilter: string = '';
  allListData: any[];
}