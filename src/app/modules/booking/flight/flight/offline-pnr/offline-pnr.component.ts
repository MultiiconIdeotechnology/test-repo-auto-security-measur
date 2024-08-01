import {
    NgIf,
    NgFor,
    DatePipe,
    CommonModule,
    NgClass,
    AsyncPipe,
} from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterOutlet } from '@angular/router';
import { Routes } from 'app/common/const';
import { AgentService } from 'app/services/agent.service';
import { CityService } from 'app/services/city.service';
import { FlightTabService } from 'app/services/flight-tab.service';
import { MarkupprofileService } from 'app/services/markupprofile.service';
import { ProductFixDepartureService } from 'app/services/product-fix-departure.service';
import { SupplierService } from 'app/services/supplier.service';
import { ToasterService } from 'app/services/toaster.service';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    Observable,
    of,
    ReplaySubject,
    startWith,
    switchMap,
} from 'rxjs';
// import moment from 'moment';

@Component({
    selector: 'app-offline-pnr',
    templateUrl: './offline-pnr.component.html',
    styleUrls: ['./offline-pnr.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatInputModule,
        MatButtonModule,
        MatTooltipModule,
        NgClass,
        RouterOutlet,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        NgxMatSelectSearchModule,
        MatTabsModule,
        MatSlideToggleModule,
        AsyncPipe,
        NgxMatTimepickerModule,
    ],
})
export class OfflinePnrComponent {
    disableBtn: boolean = false;
    SupplierList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    agentList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    agentListSub: any[] = [];
    carrierList: any[] = [];
    carrierListAll: any[] = [];
    carrierListAllR: any[] = [];
    carrierListR: any[] = [];
    originList: any[] = [];
    destinationList: any[] = [];
    countryList: any[] = [];
    tempcountryList: any[] = [];
    stops: any;
    return_stops: any;
    adult: any;
    child: any;
    infant: any;
    address: any;
    formDataList: any[] = [];
    formDataListReturn: any[] = [];
    // formDataListAdult: any[] = [];
    formDataListAdult: any[] = [];
    formDataSSRs: dtoSsrs[] = [];
    formDataListChild: any[] = [];
    formDataListInfant: any[] = [];

    combinedArray: any[];
    conbinessr: any[];
    isFirsAgent: boolean = true;
    isFirstSubAgent: boolean = true;
    isSaveOfflinePNR: boolean = false;

    // agentList: ReplaySubject<any[]> = new ReplaySubject<any[]>();

    tripList: any[] = [
        { value: 'Oneway Trip', viewValue: 'Oneway Trip' },
        { value: 'Round Trip', viewValue: 'Round Trip' },
    ];

    tripRegionList: any[] = [
        { value: 'Domestic', viewValue: 'Domestic' },
        { value: 'International', viewValue: 'International' },
    ];

    flightType: any[] = [
        { value: 'Economy', viewValue: 'Economy' },
        { value: 'Business', viewValue: 'Business' },
        { value: 'Premium Economy', viewValue: 'Premium Economy' },
    ];

    UserType: any[] = [
        { value: 'B2B', viewValue: 'B2B' },
        { value: 'B2C', viewValue: 'B2C' },
    ];

    airlineType: any[] = [
        { value: 'LCC', viewValue: 'LCC' },
        { value: 'GDS', viewValue: 'GDS' },
    ];

    stopsList: any[] = [
        { value: 0, viewValue: 'Non-Stop' },
        { value: 1, viewValue: '1 Stop' },
        { value: 2, viewValue: '2 Stop' },
        { value: 3, viewValue: '3 Stop' },
    ];

    refNonList: any[] = [
        { value: true, viewValue: 'Refundable' },
        { value: false, viewValue: 'Non-Refundable' },
    ];

    titleType: any[] = [
        { value: 'Mr', viewValue: 'Mr' },
        { value: 'Ms', viewValue: 'Ms' },
        { value: 'Mrs', viewValue: 'Mrs' },
    ];

    title2Type: any[] = [
        { value: 'Miss', viewValue: 'Miss' },
        { value: 'Mstr', viewValue: 'Mstr' },
    ];
    isFirsTime: boolean = true;

    constructor(
        private builder: FormBuilder,
        private flighttabService: FlightTabService,
        protected alertService: ToasterService,
        private supplierService: SupplierService,
        private markupprofileService: MarkupprofileService,
        private cityService: CityService,
        private router: Router,
        private fixDepartureService: ProductFixDepartureService,
        private matDialog: MatDialog
    ) { }

    formGroup: FormGroup;

    ngOnInit(): void {
        this.formGroup = this.builder.group({
            id: [''],
            emp_id: [''],
            pnr: [''],
            gds_pnr: [''],
            trip_type: [''],
            trip_region: [''],
            supplier_id: [''],
            supplierFilter: [''],
            flight_type: [''],
            airline_type: [''],
            booking_date: new Date(),
            departure_date: new Date(),
            return_date: new Date(),
            adult: [0],
            child: [0],
            infant: [0],
            stops: [0],
            return_stops: [0],
            user_type: [''],
            baseFare: ['0'],
            commission: ['0'],
            airlineTax: ['0'],

            return_baseFare: ['0'],
            return_commission: ['0'],
            return_airlineTax: ['0'],
            return_pnr:[''],
            return_gds_pnr:[''],
            return_flight_type:[''],
            return_airline_type:[''],
            is_return_refundable:[false],

            is_refundable: [''],
            agent_id: [''],
            agentfilter: [''],
            agentfilterSub: [''],

            address: [''],
            phone_number: ['', Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")],
            email: ['', Validators.email],
            // phone_number: [''],
            // email: [''],
            check_in_baggage: [''],
            cabin_baggage: [''],
            is_passport_required: [false],

            // traveller: this.formDataListTraveller,

            segments: [this.formDataList],
            return_segments: [this.formDataListReturn],
            carrier: [''],
            carrierFilter: [''],
            flight_number: [''],
            origin: [''],
            destination: [''],
            originfilter: [''],
            destinationfilter: [''],
            departure_date_seg: new Date(),
            return_date_seg: new Date(),
            origin_terminal: [''],
            destination_terminal: [''],

            travellers: [
                this.formDataListAdult,
                this.formDataListChild,
                this.formDataListInfant,
            ],
            title: [''],
            first_name: [''],
            last_name: [''],
            ticket_no: [''],
            return_ticket_no: [''],
            passport_no: [''],
            baseFare_trvl: [''],
            tax: [''],
            dob: [''],
            passport_expiry_date: [''],
            passport_issuing_country: [''],
            countryfilter: [''],
        });

        this.formGroup.get('user_type').patchValue('B2B');
        this.formGroup.get('trip_type').patchValue('Oneway Trip');
        this.formGroup.get('trip_region').patchValue('Domestic');
        this.formGroup.get('flight_type').patchValue('Economy');
        this.formGroup.get('airline_type').patchValue('LCC');
        this.formGroup.get('is_refundable').patchValue(true);

        this.formGroup.get('return_flight_type').patchValue('Economy');
        this.formGroup.get('return_airline_type').patchValue('LCC');
        this.formGroup.get('is_return_refundable').patchValue(false);
        // this.formGroup.get('title').patchValue('Mr');
        this.formDataList = [
            {
                carrier: '',
                flight_number: '',
                origin: '',
                destination: '',
                dp_date: this.formGroup.get('departure_date').value,
                dep_time: '',
                rt_date: this.formGroup.get('return_date').value,
                arr_time: '',
                origin_terminal: '',
                destination_terminal: '',
                isReturn: false,
                sSRs: [new dtoSsrs()],
            },
        ];

        this.formDataListReturn = [
            {
                carrier: '',
                flight_number: '',
                origin: '',
                destination: '',
                departure_date: new Date(),
                dpR_time: '',
                rtR_date: new Date(),
                arrR_time: '',
                origin_terminal: '',
                destination_terminal: '',
                isReturn: true,
                sSRs: [new dtoSsrs()],
            },
        ];

        this.formDataListAdult = [new dtoAdult()];
        // this.formDataListAdult = [{
        //   title: '',
        //   first_name: '',
        //   last_name: '',
        //   ticket_no: '',
        //   passport_no: '',
        //   baseFare: '',
        //   tax: '',
        //   dob: new Date(),
        //   passport_expiry_date: new Date(),
        //   passport_issuing_country: ''
        // }]
        this.formDataListChild = [
            new dtoAdult(),
            // title: '',
            // first_name: '',
            // last_name: '',
            // ticket_no: '',
            // passport_no: '',
            // baseFare: '',
            // tax: '',
            // dob: new Date(),
            // passport_expiry_date: new Date(),
            // passport_issuing_country: ''
        ];
        this.formDataListInfant = [
            new dtoAdult(),
            // title: '',
            // first_name: '',
            // last_name: '',
            // ticket_no: '',
            // passport_no: '',
            // baseFare: '',
            // tax: '',
            // dob: new Date(),
            // passport_expiry_date: new Date(),
            // passport_issuing_country: ''
        ];

        this.formDataSSRs = [new dtoSsrs()];

        // Value change event
        this.formGroup.get('stops').valueChanges.subscribe((value) => {
            this.getStopWiseFormData(value);
        });

        this.formGroup.get('departure_date').valueChanges.subscribe((value) => {
            this.formDataList.forEach(x => {
                x.dp_date = value,
                x.rt_date = value
            })
        });

        this.formGroup.get('return_date').valueChanges.subscribe((value) => {
            this.formDataListReturn.forEach(x => {
                x.dpR_date = value,
                x.rtR_date = value
            })
        });

        this.formGroup.get('return_stops').valueChanges.subscribe((value) => {
            // this.return_stops = value;
            // this.formDataListReturn = [];
            // for (let i = 0; i <= value; i++) {
            //   this.formDataListReturn.push({})
            // }
            this.getReturenWiseFormData(value);
        });

        this.formGroup.get('adult').valueChanges.subscribe((value) => {
            // this.adult = value;
            // this.formDataListAdult = [];
            // for (let i = 1; i <= value; i++) {
            //   this.formDataListAdult.push(new dtoAdult())
            // }
            this.getAdultFormData(value);
        });

        this.formGroup.get('child').valueChanges.subscribe((value) => {
            // this.child = value;
            // this.formDataListChild = [];
            // for (let i = 1; i <= value; i++) {
            //   this.formDataListChild.push(new dtoAdult())
            this.getChildFormData(value);
            // }
        });

        this.formGroup.get('infant').valueChanges.subscribe((value) => {
            // this.infant = value;
            // this.formDataListInfant = [];
            // for (let i = 1; i <= value; i++) {
            //   this.formDataListInfant.push(new dtoAdult())
            // }
            this.getInfantFormData(value);
        });

        /*************supplier combo**************/
        this.formGroup
            .get('supplierFilter')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(400),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    return this.supplierService.getSupplierComboOfflinePNR(value, 'Airline');
                })
            )
            .subscribe({
                next: (data) => {
                    this.SupplierList = data;
                    this.formGroup
                        .get('supplier_id')
                        .patchValue(this.SupplierList[0].id);
                },
            });

        /*************master combo**************/
        this.formGroup
            .get('agentfilter')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(400),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    return this.flighttabService.getAgentCombo({
                        filter: value,
                        MasterAgentId: '',
                        is_master_agent: true,
                    });
                })
            )
            .subscribe({
                next: (data: any) => {
                    this.agentList.next(data);
                    if (this.isFirsAgent == true) {
                        this.formGroup.get('agent_id').patchValue(data[0].id);
                        this.isFirsAgent = false;
                        this.subagentComboCall();
                    }
                },
            });


        this.formGroup
            .get('agentfilterSub')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(200),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    if (this.isFirstSubAgent) {
                        this.isFirstSubAgent = false;
                        return new Observable<any[]>();
                    } else
                        return this.flighttabService.getAgentCombo({
                            filter: value,
                            MasterAgentId: this.formGroup.get('agent_id').value,
                            is_master_agent: false,
                        });
                })
            )
            .subscribe({
                next: (data) => {
                    if (!this.isFirstSubAgent) this.agentListSub = data;
                    // this.formGroup.get("agent_id").patchValue(this.agentList[0].id);
                },
            });

        this.formGroup.get('agent_id').valueChanges.subscribe((value) => {
            this.subagentComboCall();
        });

        /*************airport combo from to to**************/

        this.flighttabService.getAirportMstCombo('').subscribe((data) => {
            this.formDataList.map((x) => {
                this.destinationList = data;
                x.destinationList = data;
                x.destination = data[0].city_code;
            });

            this.formDataList.map((x) => {
                this.originList = data;
                x.originList = data;
                x.origin = data[0].city_code;
            });

            this.formDataListReturn.map((x) => {
                this.destinationList = data;
                x.destinationList = data;
                x.destination = data[0].city_code;
            });

            this.formDataListReturn.map((x) => {
                this.originList = data;
                x.originList = data;
                x.origin = data[0].city_code;
            });
        });

        /*************country combo**************/

        this.cityService.getCountryCombo('').subscribe((data) => {
            this.formDataListAdult.map((x) => {
                this.countryList = data;
                x.countryList = data;
                x.passport_issuing_country = data[0];
            });
            this.formDataListChild.map((x) => {
                this.countryList = data;
                x.countryList = data;
                x.passport_issuing_country = data[0].id;
            });
            this.formDataListInfant.map((x) => {
                this.countryList = data;
                x.countryList = data;
                x.passport_issuing_country = data[0].id;
            });
        });

        this.fixDepartureService.getAirlineCombo('').subscribe({
            next: (data) => {
                // this.AllAirlineC = res;
                // this.AllAirlineO = res;
                // this.AirlineListCarrier = res;
                // this.AirlineListOpratingCarrier = res;

                // if (this.record.status != 'Edit' && this.isfirst == true) {
                //   this.formGroup.get("carrier").patchValue(this.AirlineListCarrier[0].id);
                //   this.formGroup.get("operating_carrier").patchValue(this.AirlineListOpratingCarrier[0].id);
                //   this.isfirst = false
                // }
                this.carrierListAll = data;
                this.carrierListAllR = data;


                this.formDataList.map((x) => {
                    this.carrierList = data;
                    x.carrierList = data;
                    x.carrier = data[0].short_code;
                });

                this.formDataListReturn.map((x) => {
                    this.carrierListR = data;
                    x.carrierListR = data;
                    x.carrier = data[0].short_code;
                });
            }
        });

        this.markupprofileService.getMarkupDetailsDefaultRecord().subscribe({
            next: (data: any) => { },
        });
    }

    isValidEmail(email: string): boolean {
        const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(email);
    }

    special_char(e) {
        var k;
        document.all ? (k = e.keyCode) : (k = e.which);
        return (
            (k > 64 && k < 91) ||
            (k > 96 && k < 123) ||
            k == 8 ||
            k == 32 ||
            (k >= 48 && k <= 57)
        );
    }

    subagentComboCall() {
        this.flighttabService
            .getAgentCombo({
                filter: '',
                MasterAgentId: this.formGroup.get('agent_id').value,
                is_master_agent: false,
            })
            .subscribe({
                next: (value: any) => {
                    this.agentListSub = value;
                },
            });
    }

    /**************Segment and Returen search carrier & Origin & Destination*******************/
    searchCarrier(val, formData): void {
        const value = this.carrierListAll.filter(x => x.airline_name.toLowerCase().includes(val.toLowerCase()) || x.short_code.toLowerCase().includes(val.toLowerCase()))
        formData.carrierList = value;
        // if (event)
        //     this.fixDepartureService
        //         .getAirlineCombo(event)
        //         .subscribe((data) => {
        //             formData.carrierList = data;
        //         });
    }

    searchReturnCarrier(val, formDataR): void {
        const value = this.carrierListAllR.filter(x => x.airline_name.toLowerCase().includes(val.toLowerCase()) || x.short_code.toLowerCase().includes(val.toLowerCase()))
        formDataR.carrierListR = value;
        // if (event)
        //     this.fixDepartureService
        //         .getAirlineCombo(event)
        //         .subscribe((data) => {
        //             formDataR.carrierListR = data;
        //         });
    }

    searchOrigin(event, formData): void {
        if (event)
            this.flighttabService
                .getAirportMstCombo(event)
                .subscribe((data) => {
                    formData.originList = data;
                });
    }

    searchDestination(event, formData): void {
        if (event)
            this.flighttabService
                .getAirportMstCombo(event)
                .subscribe((data) => {
                    formData.destinationList = data;
                });
    }

    searchOriginR(event, formDataR): void {
        if (event)
            this.flighttabService
                .getAirportMstCombo(event)
                .subscribe((data) => {
                    formDataR.originList = data;
                });
    }

    searchDestinationR(event, formDataR): void {
        if (event)
            this.flighttabService
                .getAirportMstCombo(event)
                .subscribe((data) => {
                    formDataR.destinationList = data;
                });
    }

    /*************Adult Country combo search***********/
    searchAdult(event, formData): void {
        if (event)
            this.cityService.getCountryCombo(event).subscribe((data) => {
                formData.countryList = data;
            });
    }

    /*************Child Country combo search***********/
    searchChild(event, formData): void {
        if (event)
            this.cityService.getCountryCombo(event).subscribe((data) => {
                formData.countryList = data;
            });
    }

    /*************Infant Country combo search***********/
    searchinfant(event, formData): void {
        if (event)
            this.cityService.getCountryCombo(event).subscribe((data) => {
                formData.countryList = data;
            });
    }

    /**************Segment*******************/
    getStopWiseFormData(value): void {
        this.stops = value;
        this.formDataList = [];
        for (let i = 0; i <= value; i++) {
            this.formDataList.push({
                carrier: '',
                flight_number: '',
                origin: '',
                destination: '',
                dp_date: this.formGroup.get('departure_date').value,
                rt_date: this.formGroup.get('departure_date').value,
                origin_terminal: '',
                destination_terminal: '',
                isReturn: false,
                sSRs: [new dtoSsrs()],
            });
        }

        this.formDataList.map((x) => {
            if (!x.carrier) x.carrierList = this.carrierList;
            x.carrier = this.carrierList[0].short_code;
        });

        this.formDataList.map((x) => {
            if (!x.destination) x.destinationList = this.destinationList;
            x.destination = this.destinationList[0].city_code;
        });

        this.formDataList.map((x) => {
            if (!x.origin) x.originList = this.originList;
            x.origin = this.originList[0].city_code;
        });
    }

    /**************Returen Segment*******************/
    getReturenWiseFormData(value): void {
        this.return_stops = value;
        this.formDataListReturn = [];
        for (let i = 0; i <= value; i++) {
            this.formDataListReturn.push({
                carrier: '',
                flight_number: '',
                origin: '',
                destination: '',
                dpR_date:  this.formGroup.get('return_date').value,
                rtR_date:  this.formGroup.get('return_date').value,
                origin_terminal: '',
                destination_terminal: '',
                isReturn: true,
                sSRs: [new dtoSsrsR()],
            });
        }
        this.formDataListReturn.map((x) => {
            if (!x.carrier) x.carrierListR = this.carrierListR;
            x.carrier = this.carrierListR[0].short_code;
        });

        this.formDataListReturn.map((x) => {
            if (!x.destination) x.destinationList = this.destinationList;
            x.destination = this.destinationList[0].city_code;
        });

        this.formDataListReturn.map((x) => {
            if (!x.origin) x.originList = this.originList;
            x.origin = this.originList[0].city_code;
        });
    }

    /**************Adult*******************/
    getAdultFormData(value): void {
        this.adult = value;
        this.formDataListAdult = [];
        for (let i = 1; i <= value; i++) {
            this.formDataListAdult.push({
                title: this.titleType[0].value,
                first_name: '',
                last_name: '',
                ticket_no: '',
                return_ticket_no: '',
                passport_no: '',
                baseFare: '',
                return_baseFare: '',

                tax: '',
                // dob: new Date(),
                passport_expiry_date: new Date(),
                passport_issuing_country: '',
            });
        }
        this.formDataListAdult.map((x) => {
            if (!x.passport_issuing_country) x.countryList = this.countryList;
            x.passport_issuing_country = this.countryList[0];
        });
    }

    /**************Child*******************/
    getChildFormData(value): void {
        this.child = value;
        this.formDataListChild = [];
        for (let i = 1; i <= value; i++) {
            this.formDataListChild.push({
                title: this.title2Type[0].value,
                first_name: '',
                last_name: '',
                ticket_no: '',
                return_ticket_no: '',
                passport_no: '',
                baseFare: '',
                return_baseFare: '',
                tax: '',
                dob: new Date(),
                passport_expiry_date: new Date(),
                passport_issuing_country: '',
            });
        }
        this.formDataListChild.map((x) => {
            if (!x.passport_issuing_country) x.countryList = this.countryList;
            x.passport_issuing_country = this.countryList[0];
        });
    }

    /**************Infant*******************/
    getInfantFormData(value): void {
        this.infant = value;
        this.formDataListInfant = [];
        for (let i = 1; i <= value; i++) {
            this.formDataListInfant.push({
                title: this.title2Type[0].value,
                first_name: '',
                last_name: '',
                ticket_no: '',
                return_ticket_no: '',
                passport_no: '',
                baseFare: '',
                return_baseFare: '',
                tax: '',
                dob: new Date(),
                passport_expiry_date: new Date(),
                passport_issuing_country: '',
            });
        }
        this.formDataListInfant.map((x) => {
            if (!x.passport_issuing_country) x.countryList = this.countryList;
            x.passport_issuing_country = this.countryList[0];
        });
    }

    /*****************Add & Remove btn*****************/
    addSSR(data: any) {
        data.sSRs.push(new dtoSsrs());
    }

    addSSRR(data: any) {
        data.sSRs.push(new dtoSsrsR());
    }

    removeSSR(data: any) {
        if (data.sSRs.length > 1) {
            data.sSRs.pop();
        }
    }

    public compareWith(v1: any, v2: any) {
        return v1 && v2 && v1.id === v2.id;
    }

    save() {

        if (this.formGroup.get('trip_type').value == 'Oneway Trip') {
            // Segment validation
            for (let dt of this.formDataList) {
                if (
                    dt.carrier == null || dt.carrier.trim() == '' ||
                    dt.flight_number == null || dt.flight_number.trim() == '' ||
                    dt.origin == null || dt.origin.trim() == '' ||
                    dt.destination == null || dt.destination.trim() == '' ||
                    dt.dp_date == null ||
                    dt.dep_time == null ||
                    dt.rt_date == null ||
                    dt.arr_time == null ||
                    dt.origin_terminal == null || dt.origin_terminal.trim() == '' ||
                    dt.destination_terminal == null || dt.destination_terminal.trim() == ''
                ) {
                    this.alertService.showToast('error', 'Please fill required segment details.', 'top-right', true);
                    return;
                }
            }
        }
        else {
            //Return Segment validation
            for (let dt of this.formDataListReturn) {
                if (
                    dt.carrier == null || dt.carrier.trim() == '' ||
                    dt.flight_number == null || dt.flight_number.trim() == '' ||
                    dt.origin == null || dt.origin.trim() == '' ||
                    dt.destination == null || dt.destination.trim() == '' ||
                    dt.dpR_date == null ||
                    dt.depR_time == null ||
                    dt.rtR_date == null ||
                    dt.arrR_time == null ||
                    dt.origin_terminal == null || dt.origin_terminal.trim() == '' ||
                    dt.destination_terminal == null || dt.destination_terminal.trim() == ''
                ) {
                    this.alertService.showToast('error', 'Please fill required return segment details.', 'top-right', true);
                    return;
                }
            }
        }

        if (this.formGroup.get('adult').value > 0) {
            //Adult validation
            for (let dt of this.formDataListAdult) {
                if (
                    dt.title == null || dt.title.trim() == '' ||
                    dt.first_name == null || dt.first_name.trim() == '' ||
                    dt.last_name == null || dt.last_name.trim() == '' ||
                    dt.ticket_no == null || dt.ticket_no.trim() == '' ||
                    dt.baseFare == null 
                ) {
                    this.alertService.showToast('error', 'Please fill required adult details.', 'top-right', true);
                    return;
                }

                if (this.formGroup.get('trip_type').value == 'Oneway Trip') {
                    dt.return_ticket_no = ''
                    dt.return_baseFare = ''
                }else{
                    if (
                        dt.return_baseFare == null || 
                        dt.return_ticket_no == null || dt.return_ticket_no.trim() == '' 
                    ) {
                        this.alertService.showToast('error', 'Please fill required adult return details.', 'top-right', true);
                        return;
                    }
                }

                if (this.formGroup.get('is_passport_required').value == true) {
                    if (
                        dt.passport_no == null || dt.passport_no.trim() == '' ||
                        dt.passport_expiry_date == null ||
                        dt.passport_issuing_country == null || dt.passport_issuing_country.trim() == ''
                    ) {
                        this.alertService.showToast('error', 'Please fill required adult details.', 'top-right', true);
                        return;
                    }
                }
            }
        }

        if (this.formGroup.get('child').value > 0) {
            //Child validation
            for (let dt of this.formDataListChild) {
                if (
                    dt.title == null || dt.title.trim() == '' ||
                    dt.first_name == null || dt.first_name.trim() == '' ||
                    dt.last_name == null || dt.last_name.trim() == '' ||
                    dt.ticket_no == null || dt.ticket_no.trim() == '' ||
                    dt.baseFare == null ||
                    dt.dob == null
                ) {
                    this.alertService.showToast('error', 'Please fill required child details.', 'top-right', true);
                    return;
                }

                if (this.formGroup.get('trip_type').value == 'Oneway Trip') {
                    dt.return_ticket_no = ''
                    dt.return_baseFare = ''
                }else{
                    if (
                        dt.return_baseFare == null || 
                        dt.return_ticket_no == null || dt.return_ticket_no.trim() == '' 
                    ) {
                        this.alertService.showToast('error', 'Please fill required child return details.', 'top-right', true);
                        return;
                    }
                }

                if (this.formGroup.get('is_passport_required').value == true) {
                    if (
                        dt.passport_no == null || dt.passport_no.trim() == '' ||
                        dt.passport_expiry_date == null ||
                        dt.passport_issuing_country == null || dt.passport_issuing_country.trim() == ''
                    ) {
                        this.alertService.showToast('error', 'Please fill required child details.', 'top-right', true);
                        return;
                    }
                }
            }
        }

        if (this.formGroup.get('infant').value > 0) {
            //Infant validation
            for (let dt of this.formDataListInfant) {
                if (
                    dt.title == null || dt.title.trim() == '' ||
                    dt.first_name == null || dt.first_name.trim() == '' ||
                    dt.last_name == null || dt.last_name.trim() == '' ||
                    dt.ticket_no == null || dt.ticket_no.trim() == '' ||
                    dt.baseFare == null ||
                    dt.dob == null
                ) {
                    this.alertService.showToast('error', 'Please fill required infant details.', 'top-right', true);
                    return;
                }

                if (this.formGroup.get('trip_type').value == 'Oneway Trip') {
                    dt.return_ticket_no = ''
                    dt.return_baseFare = ''
                }else{
                    if (
                        dt.return_baseFare == null || 
                        dt.return_ticket_no == null || dt.return_ticket_no.trim() == '' 
                    ) {
                        this.alertService.showToast('error', 'Please fill required infant return details.', 'top-right', true);
                        return;
                    }
                }

                if (this.formGroup.get('is_passport_required').value == true) {
                    if (
                        dt.passport_no == null || dt.passport_no.trim() == '' ||
                        dt.passport_expiry_date == null ||
                        dt.passport_issuing_country == null || dt.passport_issuing_country.trim() == ''
                    ) {
                        this.alertService.showToast('error', 'Please fill required infant details.', 'top-right', true);
                        return;
                    }
                }
            }
        }

        this.formDataListAdult.forEach((x) => {
            x.passport_expiry_date = DateTime.fromJSDate(x.passport_expiry_date).toFormat('yyyy-MM-dd') + 'T' + DateTime.fromJSDate(x.passport_expiry_date).toFormat('HH:mm');
            if (this.formGroup.get('is_passport_required').value == false) {
                x.passport_no = ''
                x.passport_expiry_date = ''
                x.passport_issuing_country = ''
               
            }
        })

        this.formDataListChild.forEach((x) => {
            x.dob = DateTime.fromJSDate(x.dob).toFormat('yyyy-MM-dd') + 'T' + DateTime.fromJSDate(x.dob).toFormat('HH:mm');
            x.passport_expiry_date = DateTime.fromJSDate(x.passport_expiry_date).toFormat('yyyy-MM-dd') + 'T' + DateTime.fromJSDate(x.passport_expiry_date).toFormat('HH:mm');

            if (this.formGroup.get('is_passport_required').value == false) {
                x.passport_no = ''
                x.passport_expiry_date = ''
                x.passport_issuing_country = ''
            }
        })

        this.formDataListInfant.forEach((x) => {
            x.dob = DateTime.fromJSDate(x.dob).toFormat('yyyy-MM-dd') + 'T' + DateTime.fromJSDate(x.dob).toFormat('HH:mm');
            x.passport_expiry_date = DateTime.fromJSDate(x.passport_expiry_date).toFormat('yyyy-MM-dd') + 'T' + DateTime.fromJSDate(x.passport_expiry_date).toFormat('HH:mm');

            if (this.formGroup.get('is_passport_required').value == false) {
                x.passport_no = ''
                x.passport_expiry_date = ''
                x.passport_issuing_country = ''
            }
        })

        this.combinedArray = this.formDataListAdult.concat(
            this.formDataListChild,
            this.formDataListInfant
        );

        const json = this.formGroup.value;
        if (json.trip_type == 'Oneway Trip') {
            json['return_date'] = ''
        } else {
            json['return_date'] = DateTime.fromJSDate(this.formGroup.get('return_date').value).toFormat('yyyy-MM-dd') + 'T' + DateTime.fromJSDate(this.formGroup.get('return_date').value).toFormat('HH:mm')
        }

        if (json.trip_type != 'Round Trip') {
            json['return_baseFare'] = 0,
            json['return_commission'] = 0,
            json['return_airlineTax'] = 0,
            json['return_pnr'] = '',
            json['return_gds_pnr'] = '',
            json['return_flight_type'] = '',
            json['return_airline_type'] = '',
            json['is_return_refundable'] = false
        }

        json['booking_date'] = DateTime.fromJSDate(this.formGroup.get('booking_date').value).toFormat('yyyy-MM-dd') + 'T' + DateTime.fromJSDate(this.formGroup.get('booking_date').value).toFormat('HH:mm')

        json['departure_date'] = DateTime.fromJSDate(this.formGroup.get('departure_date').value).toFormat('yyyy-MM-dd') + 'T' + DateTime.fromJSDate(this.formGroup.get('departure_date').value).toFormat('HH:mm')



        this.formDataList.forEach((x) => {

            x.departure_date = `${DateTime.fromJSDate(
                new Date(x.dp_date)
            ).toFormat('yyyy-MM-dd')}T${DateTime.fromISO(x.dep_time).toFormat(
                'HH:mm'
            )}`;

            x.return_date = `${DateTime.fromJSDate(
                new Date(x.rt_date)
            ).toFormat('yyyy-MM-dd')}T${DateTime.fromISO(x.arr_time).toFormat(
                'HH:mm'
            )}`;

        });

        this.formDataListReturn.forEach((x) => {
            x.departure_date = `${DateTime.fromJSDate(
                new Date(x.dpR_date)
            ).toFormat('yyyy-MM-dd')}T${DateTime.fromISO(x.depR_time).toFormat(
                'HH:mm'
            )}`;
            x.return_date = `${DateTime.fromJSDate(
                new Date(x.rtR_date)
            ).toFormat('yyyy-MM-dd')}T${DateTime.fromISO(x.arrR_time).toFormat(
                'HH:mm'
            )}`;
        });

        json['segments'] = this.formDataList;
        json['return_segments'] = this.formGroup.get('trip_type').value !== 'Oneway Trip' ? this.formDataListReturn : [];

        // this.formDataListTraveller.phone_number = this.formDataListTraveller.phone_number.toString()
        // json['traveller'] = this.formDataListTraveller;
        json['traveller'] = {
            address: this.formGroup.get('address').value,
            phone_number: this.formGroup.get('phone_number').value.toString(),
            email: this.formGroup.get('email').value,
            check_in_baggage: this.formGroup.get('check_in_baggage').value,
            cabin_baggage: this.formGroup.get('cabin_baggage').value,
            is_passport_required: this.formGroup.get('is_passport_required').value
        }

        /****adult/child/infant*****/
        json['travellers'] = this.combinedArray.filter((x) => x.first_name != null && x.first_name != '');

        this.flighttabService.flightImport(json).subscribe({
            next: (data) => {
                this.disableBtn = false;
                this.alertService.showToast('success', 'New record added', 'top-right', true);
                this.router.navigate([
                    Routes.booking.flight_route
                ]);
            },
            error: (error) => {
                this.disableBtn = false;
                this.alertService.showToast('error', error, 'top-right', true);
            },
        });
    }

    saveOfflinePNR(): void {
        if (!this.formGroup.valid) {
            this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.formGroup.markAllAsTouched();
            return;
        }
        this.isSaveOfflinePNR = true;
    }
}

/*************DTO**************/
class dtoAdult {
    title: string = '';
    first_name: string = '';
    last_name: string = '';
    ticket_no: string = '';
    return_ticket_no: string = '';
    passport_no: string = '';
    baseFare: string = '';
    return_baseFare: string = '';
    tax: string = '';
    dob: Date = new Date();
    passport_expiry_date: Date = new Date();
    passport_issuing_country: string = '';
}

class dtoSsrs {
    type: string = '';
    item: string = '';
    amount: number = 0;
}

class dtoSsrsR {
    type: string = '';
    item: string = '';
    amount: number = 0;
}
