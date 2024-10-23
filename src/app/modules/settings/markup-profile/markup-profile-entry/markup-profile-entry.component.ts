import { Routes } from 'app/common/const';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReplaySubject, debounceTime, distinctUntilChanged, filter, startWith, switchMap } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, NgClass, DatePipe, AsyncPipe, NgFor } from '@angular/common';
import { CityService } from 'app/services/city.service';
import { DestinationService } from 'app/services/destination.service';
import { ProductFixDepartureService } from 'app/services/product-fix-departure.service';
import { ToasterService } from 'app/services/toaster.service';
import { EmployeeService } from 'app/services/employee.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MarkupprofileService } from 'app/services/markupprofile.service';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { Linq } from 'app/utils/linq';
import { SupplierService } from 'app/services/supplier.service';
import { PspSettingService } from 'app/services/psp-setting.service';

@Component({
    selector: 'app-markup-profile-entry',
    templateUrl: './markup-profile-entry.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        AsyncPipe,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatRadioModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatTabsModule,
        MatDividerModule,
        MatDatepickerModule,
        MatChipsModule,
        MatTooltipModule,
        MatMenuModule,
        NgxMatSelectSearchModule,
        NgxMatTimepickerModule,
    ],
})
export class MarkupProfileEntryComponent {

    disableBtn: boolean = false
    readonly: boolean = false;
    employeeList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    AgentList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    profileList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    isFirstEmp: boolean = false;
    isFirstChange: boolean = true;
    Detail = 'Add';
    airline = "Add";
    Destination = "Add";
    Visa = "Add";
    Supplier = "Add";
    compnyList: any[] = [];
    selectedDetailTab:string = "airline_wise_markup"

    markupprofileList: any[] = [
        "Company",
        "Agent"
    ]
    record: any = {};
    detailList: any[] = [];
    airList: any[] = [];
    destList: any[] = [];
    visaList: any[] = [];
    suppList: any[] = [];
    isChecked = true;
    btnTitle: string = 'Create';
    formGroup: FormGroup;
    DetailFormGroup: FormGroup;
    DetailFormGroupOne: FormGroup;
    AirlineFormGroup: FormGroup;
    GroupInquiryFormGroup: FormGroup;
    DestinationFormGroup: FormGroup;
    VisaFormGroup: FormGroup;
    SupplierFormGroup: FormGroup;
    // AirlineList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    DestinationList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    VisaList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    cityList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    supplierList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    AirlineList: any[] = [];
    AllAirline: any[] = [];


    MarkupProfileListRoute = Routes.settings.markupprofile_route;
    btnLabel = "Create"

    b2bSearchQuery: string = '';
    b2cSearchQuery: string = '';
    filteredB2BList: any[] = [];
    filteredB2CList: any[] = [];

    db2bSearchQuery: string = '';
    db2cSearchQuery: string = '';
    dfilteredB2BList: any[] = [];
    dfilteredB2CList: any[] = [];

    vb2bSearchQuery: string = '';
    vb2cSearchQuery: string = '';
    vfilteredB2BList: any[] = [];
    vfilteredB2CList: any[] = [];

    sb2bSearchQuery: string = '';
    sb2cSearchQuery: string = '';
    sfilteredB2BList: any[] = [];
    sfilteredB2CList: any[] = [];

    AllDestination: any[] = [];
    DestinationListV: any[] = [];



    type_list: any[] = [
        { value: 'Flat for Full Booking', viewValue: 'Flat for Full Booking' },
        { value: 'Flat Per Pax', viewValue: 'Flat Per Pax' },
        { value: 'Percentage(%) for Full Booking', viewValue: 'Percentage(%) for Full Booking' },
        { value: 'Percentage(%) Per Pax', viewValue: 'Percentage(%) Per Pax' },
    ];

    typeAir_list: any[] = [
        { value: 'Flat for Full Amendment', viewValue: 'Flat for Full Amendment' },
        { value: 'Flat Per Pax', viewValue: 'Flat Per Pax' },
        { value: 'Percentage(%) for Full Amendment', viewValue: 'Percentage(%) for Full Amendment' },
        { value: 'Percentage(%) Per Pax', viewValue: 'Percentage(%) Per Pax' },
    ];

    stype_list: any[] = [
        { value: 'Flat for Full Booking', viewValue: 'Flat for Full Booking' },
        { value: 'Flat Per Pax', viewValue: 'Flat Per Pax' },
        { value: 'Flat Per Pax Per Segment', viewValue: 'Flat Per Pax Per Segment' },
        { value: 'Flat Per Segment Full Booking', viewValue: 'Flat Per Segment Full Booking' },
        { value: 'Percentage(%) for Full Booking', viewValue: 'Percentage(%) for Full Booking' },
        { value: 'Percentage(%) Per Pax', viewValue: 'Percentage(%) Per Pax' },
        { value: 'Percentage(%) Per Pax Per Segment', viewValue: 'Percentage(%) Per Pax Per Segment' },
        { value: 'Percentage(%) Per Segment Full Booking', viewValue: 'Percentage(%) Per Segment Full Booking' },
    ];

    constructor(
        private builder: FormBuilder,
        private markupprofileService: MarkupprofileService,
        private employeeService: EmployeeService,
        public route: ActivatedRoute,
        public toasterService: ToasterService,
        public productFixDepartureService: ProductFixDepartureService,
        public destinationService: DestinationService,
        public cityService: CityService,
        private pspsettingService: PspSettingService,
        private supplierService: SupplierService
    ) { }

    ngOnInit(): void {

        this.formGroup = this.builder.group({
            id: [''],
            profile_name: ['', Validators.required],
            company_id: [''],
            companyfilter: [''],
        });

        this.DetailFormGroup = this.builder.group({
            id: [''],
            profile_name: [''],
            markup_profile_id: [''],
            profile_type: [''],
            air_dom_ow_type: ['Flat for Full Booking', Validators.required],
            air_dom_ow_val: [0, Validators.required],
            air_dom_rt_type: ['Flat for Full Booking', Validators.required],
            air_dom_rt_val: [0, Validators.required],
            air_int_ow_type: ['Flat for Full Booking', Validators.required],
            air_int_ow_val: [0, Validators.required],
            air_int_rt_type: ['Flat for Full Booking', Validators.required],
            air_int_rt_val: [0, Validators.required],
            hol_dom_type: ['Flat for Full Booking', Validators.required],
            hol_dom_val: [0, Validators.required],
            hol_int_type: ['Flat for Full Booking', Validators.required],
            hol_int_val: [0, Validators.required],
            hot_dom_type: ['Flat for Full Booking', Validators.required],
            hot_dom_val: [0, Validators.required],
            hot_int_type: ['Flat for Full Booking', Validators.required],
            hot_int_val: [0, Validators.required],
            bus_type: ['Flat for Full Booking', Validators.required],
            bus_val: [0, Validators.required],
            ins_type: ['Flat for Full Booking', Validators.required],
            ins_val: [0, Validators.required],
            act_type: ['Flat for Full Booking', Validators.required],
            act_val: [0, Validators.required],
            air_can_type: ['Flat for Full Booking', Validators.required],
            air_can_val: [0, Validators.required],
            air_ins_can_type: ['Flat for Full Booking', Validators.required],
            air_ins_can_val: [0, Validators.required],
            air_reissue_type: ['Flat for Full Booking', Validators.required],
            air_reissue_val: [0, Validators.required],
            air_no_show_type: ['Flat for Full Booking', Validators.required],
            air_no_show_val: [0, Validators.required],
            air_void_type: ['Flat for Full Booking', Validators.required],
            air_void_val: [0, Validators.required],
            air_meal_type: ['Flat for Full Booking', Validators.required],
            air_meal_val: [0, Validators.required],
            air_bag_type: ['Flat for Full Booking', Validators.required],
            air_bag_val: [0, Validators.required],
            air_correction_type: ['Flat for Full Amendment', Validators.required],
            air_correction_val: [0, Validators.required],
            air_int_can_type: ['Flat for Full Amendment', Validators.required],
            air_int_can_val: [0, Validators.required],
            air_int_ins_can_type: ['Flat for Full Amendment', Validators.required],
            air_int_ins_can_val: [0, Validators.required],
            air_int_reissue_type: ['Flat for Full Amendment', Validators.required],
            air_int_reissue_val: [0, Validators.required],
            // air_misc_type: ['Flat for Full Amendment', Validators.required],
            // air_misc_val: [0, Validators.required],
            air_int_no_show_type: ['Flat for Full Amendment', Validators.required],
            air_int_no_show_val: [0, Validators.required],
            air_int_void_type: ['Flat for Full Amendment', Validators.required],
            air_int_void_val: [0, Validators.required],
            air_int_meal_type: ['Flat for Full Amendment', Validators.required],
            air_int_meal_val: [0, Validators.required],
            air_int_bag_type: ['Flat for Full Amendment', Validators.required],
            air_int_bag_val: [0, Validators.required],
            air_int_correction_val: [0, Validators.required],
            air_int_correction_type: ['Flat for Full Amendment', Validators.required],
        });

        this.DetailFormGroupOne = this.builder.group({
            id: [''],
            profile_name: [''],
            markup_profile_id: [''],
            profile_type: [''],
            air_dom_ow_type: ['Flat for Full Booking', Validators.required],
            air_dom_ow_val: [0, Validators.required],
            air_dom_rt_type: ['Flat for Full Booking', Validators.required],
            air_dom_rt_val: [0, Validators.required],
            air_int_ow_type: ['Flat for Full Booking', Validators.required],
            air_int_ow_val: [0, Validators.required],
            air_int_rt_type: ['Flat for Full Booking', Validators.required],
            air_int_rt_val: [0, Validators.required],
            hol_dom_type: ['Flat for Full Booking', Validators.required],
            hol_dom_val: [0, Validators.required],
            hol_int_type: ['Flat for Full Booking', Validators.required],
            hol_int_val: [0, Validators.required],
            hot_dom_type: ['Flat for Full Booking', Validators.required],
            hot_dom_val: [0, Validators.required],
            hot_int_type: ['Flat for Full Booking', Validators.required],
            hot_int_val: [0, Validators.required],
            visa_type: ['Flat for Full Booking', Validators.required],
            visa_val: [0, Validators.required],
            bus_type: ['Flat for Full Booking', Validators.required],
            bus_val: [0, Validators.required],
            ins_type: ['Flat for Full Booking', Validators.required],
            ins_val: [0, Validators.required],
            act_type: ['Flat for Full Booking', Validators.required],
            act_val: [0, Validators.required],
            air_can_type: ['Flat for Full Booking', Validators.required],
            air_can_val: [0, Validators.required],
            air_ins_can_type: ['Flat for Full Booking', Validators.required],
            air_ins_can_val: [0, Validators.required],
            air_reissue_type: ['Flat for Full Booking', Validators.required],
            air_reissue_val: [0, Validators.required],
            air_misc_type: ['Flat for Full Booking', Validators.required],
            air_misc_val: [0, Validators.required],
            air_no_show_type: ['Flat for Full Booking', Validators.required],
            air_no_show_val: [0, Validators.required],
            air_void_type: ['Flat for Full Booking', Validators.required],
            air_void_val: [0, Validators.required],
            air_meal_type: ['Flat for Full Booking', Validators.required],
            air_meal_val: [0, Validators.required],
            air_bag_type: ['Flat for Full Booking', Validators.required],
            air_bag_val: [0, Validators.required],
        });

        this.AirlineFormGroup = this.builder.group({
            id: [''],
            markup_profile_name: [''],
            markup_profile_id: [''],
            profile_type: ['B2B'],
            airline_id: ['', Validators.required],
            airline_name: [''],
            air_dom_ow_type: ['Flat for Full Booking', Validators.required],
            air_dom_ow_val: [0, Validators.required],
            air_dom_rt_type: ['Flat for Full Booking', Validators.required],
            air_dom_rt_val: [0, Validators.required],
            air_int_ow_type: ['Flat for Full Booking', Validators.required],
            air_int_ow_val: [0, Validators.required],
            air_int_rt_type: ['Flat for Full Booking', Validators.required],
            air_int_rt_val: [0, Validators.required],
            airlinefilter: ['']
        });

        this.GroupInquiryFormGroup = this.builder.group({
            id: [''],
            profile_name: [''],
            markup_profile_id: [''],
            profile_type: [''],
            giAir_dom_ow_type: ['Flat for Full Booking', Validators.required],
            giAir_dom_ow_val: [0, Validators.required],
            giAir_dom_rt_type: ['Flat for Full Booking', Validators.required],
            giAir_dom_rt_val: [0, Validators.required],
            giAir_int_ow_type: ['Flat for Full Booking', Validators.required],
            giAir_int_ow_val: [0, Validators.required],
            giAir_int_rt_type: ['Flat for Full Booking', Validators.required],
            giAir_int_rt_val: [0, Validators.required],
        });

        this.DestinationFormGroup = this.builder.group({
            id: [''],
            destination_name: [''],
            destination_id: ['', Validators.required],
            profile_type: ['B2B', Validators.required],
            markup_type: ['Flat for Full Booking', Validators.required],
            markup_value: [0, Validators.required],
            markup_profile_id: [''],
            destinationfilter: ['']
        });

        this.VisaFormGroup = this.builder.group({
            id: [''],
            city_id: ['', Validators.required],
            display_name: [''],
            country_code: [''],
            profile_type: ['B2B', Validators.required],
            markup_type: ['Flat for Full Booking', Validators.required],
            markup_value: [0, Validators.required],
            markup_profile_id: [''],
            country: [''],
            cityfilter: [''],
            visa_type: ['Flat for Full Booking', Validators.required],
            visa_val: [0, Validators.required],
        });

        this.SupplierFormGroup = this.builder.group({
            id: [''],
            supplier_id: ['', Validators.required],
            supplierfilter: [''],
            profile_type: ['B2B', Validators.required],
            markup_type: ['Flat for Full Booking', Validators.required],
            markup_val: [0, Validators.required],
            markup_profile_id: [''],

        });

        /*************Company combo**************/
        this.formGroup
            .get('companyfilter')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(200),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    return this.pspsettingService.getCompanyCombo(value);
                })
            )
            .subscribe({
                next: data => {
                    this.compnyList = data
                }
            });

        this.productFixDepartureService.getVisaDestinationCombo('').subscribe({
            next: (res) => {
                this.AllDestination = res;
                this.DestinationListV = res;
            }, error: (err) => {
                this.toasterService.showToast('error', err);
            }
        });

        //   this.formGroup.get('profile_name').valueChanges.subscribe(text => {
        //     this.formGroup.get('profile_name').patchValue(Linq.convertToTitleCase(text), { emitEvent: false });
        //  })

        // this.AirlineFormGroup.get('airlinefilter').valueChanges.pipe(
        //     filter(search => !!search),
        //     startWith(''),
        //     debounceTime(200),
        //     distinctUntilChanged(),
        //     switchMap((value: any) => {
        //         return this.productFixDepartureService.getAirlineCombo(value);
        //     })
        // ).subscribe(data => this.AirlineList.next(data));

        this.productFixDepartureService.getAirlineCombo('').subscribe({
            next: (res) => {
                this.AllAirline = res;
                this.AirlineList = res;

                this.AirlineFormGroup.get("airline_id").patchValue(this.AirlineList[0]);
            }, error: (err) => {
                this.toasterService.showToast('error', err);
            }
        });

        this.DestinationFormGroup.get('destinationfilter').valueChanges.pipe(
            filter(search => !!search),
            startWith(''),
            debounceTime(200),
            distinctUntilChanged(),
            switchMap((value: any) => {
                return this.destinationService.getdestinationCombo(value);
            })
        ).subscribe(data => this.DestinationList.next(data));

        // this.VisaFormGroup.get('cityfilter').valueChanges.pipe(
        //     filter(search => !!search),
        //     startWith(''),
        //     debounceTime(200),
        //     distinctUntilChanged(),
        //     switchMap((value: any) => {
        //         return this.cityService.getCityCombo(value);
        //     })
        // ).subscribe(data => this.cityList.next(data));

        this.SupplierFormGroup.get('supplierfilter').valueChanges.pipe(
            filter(search => !!search),
            startWith(''),
            debounceTime(200),
            distinctUntilChanged(),
            switchMap((value: any) => {
                return this.supplierService.getSupplierCombo(value);
            })
        ).subscribe(data => this.supplierList.next(data));

        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            const readonly = params.get('readonly');

            if (id) {
                this.readonly = readonly ? true : false;
                this.btnTitle = readonly ? 'Close' : 'Save';
                this.markupprofileService.getMarkup(id).subscribe({
                    next: data => {
                        this.record = data;
                        this.formGroup.patchValue(this.record);
                        this.formGroup.get('companyfilter').patchValue(this.record.company_name)
                        this.formGroup.get('company_id').patchValue(this.record.company_id)

                        if (this.record.markup_details.length >= 1) {
                            for (var md of this.record.markup_details) {
                                this.detailList.push(md);
                                const b2b = this.detailList.find(x => x.profile_type === 'B2B')
                                this.DetailFormGroup.patchValue(b2b);
                                this.GroupInquiryFormGroup.patchValue(b2b);
                                const b2c = this.detailList.find(x => x.profile_type === 'B2C')

                                this.DetailFormGroupOne.patchValue(b2c);
                                this.Detail = 'Save';
                            }
                        }

                        if (this.record.airline_wise_markups.length >= 1) {
                            for (var md of this.record.airline_wise_markups) {
                                // md.airline_id = { id: md.airline_id, airline_name: md.airline_name }
                                this.airList.push(md);
                                this.filterData();
                            }
                        }

                        if (this.record.destination_wise_markups.length >= 1) {
                            for (var md of this.record.destination_wise_markups) {
                                md.destination_id = { id: md.destination_id, destination_name: md.destination_name }
                                this.destList.push(md);
                                this.dfilterData();
                            }
                        }

                        if (this.record.visa_country_wise_markups.length >= 1) {
                            for (var md of this.record.visa_country_wise_markups) {
                                md.city_id = { id: md.city_id, display_name: md.display_name }
                                this.visaList.push(md);
                                this.vfilterData();
                            }
                        }

                        if (this.record.supplier_wise_markup.length >= 1) {
                            for (var md of this.record.supplier_wise_markup) {
                                md.supplier_id = { id: md.supplier_id, suppler_name: md.suppler_name }
                                this.suppList.push(md);
                                this.sfilterData();
                            }
                        }

                    },
                    error: (err) => {
                        this.toasterService.showToast('error', err)

                    },
                })
            }
        })

    }

    filterAirline(val): void {
        const value = this.AllAirline.filter(x => x.airline_name.toLowerCase().includes(val.toLowerCase()) || x.short_code.toLowerCase().includes(val.toLowerCase()))
        this.AirlineList = value;
    }

    filterData() {
        this.filteredB2BList = this.airList.filter(item => item.profile_type === 'B2B');
        // this.filteredB2CList = this.airList.filter(item => item.profile_type === 'B2C');
        this.applySearchFilters();
    }

    filterDestination(val): void {
        const value = this.AllDestination.filter(x => x.destination.toLowerCase().includes(val.toLowerCase()))
        this.DestinationListV = value;
    }

    applySearchFilters() {
        if (this.b2bSearchQuery === '') {
            this.filteredB2BList = this.airList.filter(item => item.profile_type === 'B2B');
        } else {
            this.filteredB2BList = this.airList.filter(item =>
                item.profile_type === 'B2B' && item.airline_name.toLowerCase().includes(this.b2bSearchQuery.toLowerCase())
            );
        }
        // if (this.b2cSearchQuery === '') {
        //     this.filteredB2CList = this.airList.filter(item => item.profile_type === 'B2C');
        // } else {
        //     this.filteredB2CList = this.airList.filter(item =>
        //         item.profile_type === 'B2C' && item.airline_id.airline_name.toLowerCase().includes(this.b2cSearchQuery.toLowerCase())
        //     );
        // }
    }

    dfilterData() {
        this.dfilteredB2BList = this.destList.filter(item => item.profile_type === 'B2B');
        // this.dfilteredB2CList = this.destList.filter(item => item.profile_type === 'B2C');
        this.dapplySearchFilters();
    }

    dapplySearchFilters() {
        if (this.db2bSearchQuery === '') {
            this.dfilteredB2BList = this.destList.filter(item => item.profile_type === 'B2B');
        } else {
            this.dfilteredB2BList = this.destList.filter(item =>
                item.profile_type === 'B2B' && item.destination_id.destination_name.toLowerCase().includes(this.db2bSearchQuery.toLowerCase())
            );
        }
        // if (this.db2cSearchQuery === '') {
        //     this.dfilteredB2CList = this.destList.filter(item => item.profile_type === 'B2C');
        // } else {
        //     this.dfilteredB2CList = this.destList.filter(item =>
        //         item.profile_type === 'B2C' && item.destination_id.destination_name.toLowerCase().includes(this.db2cSearchQuery.toLowerCase())
        //     );
        // }
    }

    vfilterData() {
        this.vfilteredB2BList = this.visaList.filter(item => item.profile_type === 'B2B');
        // this.vfilteredB2CList = this.visaList.filter(item => item.profile_type === 'B2C');
        this.vapplySearchFilters();
    }

    vapplySearchFilters() {
        if (this.vb2bSearchQuery === '') {
            this.vfilteredB2BList = this.visaList.filter(item => item.profile_type === 'B2B');
        } else {
            this.vfilteredB2BList = this.visaList.filter(item =>
                item.profile_type === 'B2B' && item.city_id.display_name.toLowerCase().includes(this.vb2bSearchQuery.toLowerCase())
            );
        }
        // if (this.vb2cSearchQuery === '') {
        //     this.vfilteredB2CList = this.visaList.filter(item => item.profile_type === 'B2C');
        // } else {
        //     this.vfilteredB2CList = this.visaList.filter(item =>
        //         item.profile_type === 'B2C' && item.city_id.display_name.toLowerCase().includes(this.vb2cSearchQuery.toLowerCase())
        //     );
        // }
    }

    sfilterData() {
        this.sfilteredB2BList = this.suppList.filter(item => item.profile_type === 'B2B');
        // this.sfilteredB2CList = this.suppList.filter(item => item.profile_type === 'B2C');
        this.sapplySearchFilters();
    }

    sapplySearchFilters() {
        if (this.sb2bSearchQuery === '') {
            this.sfilteredB2BList = this.suppList.filter(item => item.profile_type === 'B2B');
        } else {
            this.sfilteredB2BList = this.suppList.filter(item =>
                item.profile_type === 'B2B' && item.supplier_id.suppler_name.toLowerCase().includes(this.sb2bSearchQuery.toLowerCase())
            );
        }
        // if (this.sb2cSearchQuery === '') {
        //     this.sfilteredB2CList = this.suppList.filter(item => item.profile_type === 'B2C');
        // } else {
        //     this.sfilteredB2CList = this.suppList.filter(item =>
        //         item.profile_type === 'B2C' && item.supplier_id.suppler_name.toLowerCase().includes(this.sb2cSearchQuery.toLowerCase())
        //     );
        // }
    }

    AddDetailb2b(): void {
        const json = this.DetailFormGroup.getRawValue();
        json.markup_profile_id = this.formGroup.get('id').value;
        json.profile_name = this.formGroup.get('profile_name').value;
        json.profile_type = 'B2B';
        this.markupprofileService.detailCreate(json).subscribe({
            next: res => {
                if (json.id) {
                    const index = this.detailList.indexOf(x => x.id == json.id);
                    const editrecord = this.detailList.find(x => x.id == json.id);
                    Object.assign(editrecord, this.DetailFormGroup.value);
                    this.detailList[index] = editrecord;
                } else {
                    this.DetailFormGroup.get('id').patchValue(res.id);
                    this.detailList.push(this.DetailFormGroup.value);
                }
                this.toasterService.showToast('success', 'Saved Markup Profile Detail');
                this.Detail = 'Save';
                // this.DetailFormGroup.get('id').patchValue('');
            }, error: err => {
                this.toasterService.showToast('error', err);
            }
        })
    }

    AddGroupInquiryb2b(): void {
        const json = this.GroupInquiryFormGroup.getRawValue();
        json.markup_profile_id = this.formGroup.get('id').value;
        json.profile_name = this.formGroup.get('profile_name').value;
        json.profile_type = 'B2B';
        this.markupprofileService.airGroupInquiryCreate(json).subscribe({
            next: res => {
                if (json.id) {
                    const index = this.detailList.indexOf(x => x.id == json.id);
                    const editrecord = this.detailList.find(x => x.id == json.id);
                    Object.assign(editrecord, this.GroupInquiryFormGroup.value);
                    this.detailList[index] = editrecord;
                } else {
                    this.GroupInquiryFormGroup.get('id').patchValue(json.id);
                    this.detailList.push(this.GroupInquiryFormGroup.value);
                }
                this.toasterService.showToast('success', 'Saved Markup Profile Detail');
            }, error: err => {
                this.toasterService.showToast('error', err);
            }
        })
    }

    AddDetailb2c(): void {
        const json = this.DetailFormGroupOne.getRawValue();
        json.markup_profile_id = this.formGroup.get('id').value;
        json.profile_name = this.formGroup.get('profile_name').value;
        json.profile_type = 'B2C';
        this.markupprofileService.detailCreate(json).subscribe({
            next: res => {
                if (json.id) {
                    const index = this.detailList.indexOf(x => x.id == json.id);
                    const editrecord = this.detailList.find(x => x.id == json.id);
                    Object.assign(editrecord, this.DetailFormGroupOne.value);
                    this.detailList[index] = editrecord;
                } else {
                    this.DetailFormGroupOne.get('id').patchValue(res.id);
                    this.detailList.push(this.DetailFormGroupOne.value);
                }
                this.toasterService.showToast('success', 'Saved Markup Profile Detail');
                this.Detail = 'Save';
                // this.DetailFormGroupOne.get('id').patchValue('');
            }, error: err => {
                this.toasterService.showToast('error', err);
            }
        })
    }

    AddAirline(): void {
        if (!this.AirlineFormGroup.valid) {
            this.toasterService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.AirlineFormGroup.markAllAsTouched();
            return;
        }
        const json = this.AirlineFormGroup.getRawValue();
        json.markup_profile_id = this.formGroup.get('id').value;
        json.airline_name = this.AirlineFormGroup.get('airline_id').value.airline_name;
        json.airline_id = this.AirlineFormGroup.get('airline_id').value.id;

        this.markupprofileService.airCreate(json).subscribe({
            next: res => {
                if (json.id) {
                    if (json.profile_type === 'B2B') {
                        const index = this.filteredB2BList.indexOf(this.filteredB2BList.find(x => x.id == json.id));
                        const editrecord = this.filteredB2BList.find(x => x.id == json.id);
                        Object.assign(editrecord, json);
                        this.filteredB2BList[index] = editrecord;
                    } else {
                        const index = this.filteredB2CList.indexOf(this.filteredB2BList.find(x => x.id == json.id));
                        const editrecord = this.filteredB2CList.find(x => x.id == json.id);
                        Object.assign(editrecord, json);
                        this.filteredB2CList[index] = editrecord;
                    }
                } else {
                    if (json.profile_type === 'B2B') {
                        json.id = res.id;
                        this.filteredB2BList.push(json);
                        this.airList.push(json);
                    } else {
                        json.id = res.id;
                        this.filteredB2CList.push(json);
                        this.airList.push(json);
                    }
                }
                this.toasterService.showToast('success', this.Detail == 'Save' ? 'Airline Saved' : 'Airline Created');
                this.airline = 'Add';
                this.AirlineFormGroup.get('id').patchValue('');
                this.AirlineFormGroup.get('airline_id').patchValue('');
                // this.AirlineFormGroup.get('profile_type').patchValue('');
                // this.DetailFormGroup.reset();
            }, error: err => {
                this.toasterService.showToast('error', err);
            }
        })
    }
    editAirline(data: any) {
        this.AirlineFormGroup.patchValue(data);
        this.AirlineFormGroup.get('airline_id').patchValue({ id: data.airline_id, airline_name: data.airline_name });
        // this.AirlineFormGroup.get('airlinefilter').patchValue(data.airline_name);

        this.airline = 'Save';
    }
    deleteAirline(data: any) {
        this.markupprofileService.airDelete(data.id).subscribe({
            next: res => {
                if (data.profile_type === 'B2B') {
                    const index = this.filteredB2BList.indexOf(this.filteredB2BList.find(x => x.id === data.id))
                    this.filteredB2BList.splice(index, 1);
                    const indexOne = this.airList.indexOf(this.airList.find(x => x.id === data.id))
                    this.airList.splice(indexOne, 1);
                } else {
                    const index = this.filteredB2CList.indexOf(this.filteredB2CList.find(x => x.id === data.id))
                    this.filteredB2CList.splice(index, 1);
                    const indexOne = this.airList.indexOf(this.airList.find(x => x.id === data.id))
                    this.airList.splice(indexOne, 1);
                }
                this.toasterService.showToast('success', 'Airline Deleted Successfully');
            }, error: err => {
                this.toasterService.showToast('error', err);
            }
        })
    }

    AddDestination(): void {
        if (!this.DestinationFormGroup.valid) {
            this.toasterService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.DestinationFormGroup.markAllAsTouched();
            return;
        }

        const json = this.DestinationFormGroup.getRawValue();
        json.markup_profile_id = this.formGroup.get('id').value;
        json.destination_id = this.DestinationFormGroup.get('destination_id').value.id;

        this.markupprofileService.destinationCreate(json).subscribe({
            next: res => {
                if (json.id) {
                    if (json.profile_type === 'B2B') {
                        const index = this.dfilteredB2BList.indexOf(x => x.id == json.id);
                        const editrecord = this.dfilteredB2BList.find(x => x.id == json.id);
                        Object.assign(editrecord, this.DestinationFormGroup.value);
                        this.dfilteredB2BList[index] = editrecord;
                    } else {
                        const index = this.dfilteredB2CList.indexOf(x => x.id == json.id);
                        const editrecord = this.dfilteredB2CList.find(x => x.id == json.id);
                        Object.assign(editrecord, this.DestinationFormGroup.value);
                        this.dfilteredB2CList[index] = editrecord;
                    }
                } else {
                    if (json.profile_type === 'B2B') {
                        this.DestinationFormGroup.get('id').patchValue(res.id)
                        this.dfilteredB2BList.push(this.DestinationFormGroup.value);
                        this.destList.push(this.DestinationFormGroup.value);
                    } else {
                        this.DestinationFormGroup.get('id').patchValue(res.id)
                        this.dfilteredB2CList.push(this.DestinationFormGroup.value);
                        this.destList.push(this.DestinationFormGroup.value);
                    }
                }
                this.toasterService.showToast('success', this.Detail == 'Save' ? 'Destination Saved' : 'Destination Created');
                this.Destination = 'Add';
                this.DestinationFormGroup.get('id').patchValue('');
                this.DestinationFormGroup.get('destination_id').patchValue('');
            }, error: err => {
                this.toasterService.showToast('error', err);
            }
        })
    }
    editDestination(data: any) {
        this.DestinationFormGroup.patchValue(data);
        this.DestinationFormGroup.get('destinationfilter').patchValue(data.destination_name);
        this.Destination = 'Save';
    }
    deleteDestination(data: any) {
        this.markupprofileService.destinationDelete(data.id).subscribe({
            next: res => {
                if (data.profile_type === 'B2B') {
                    const index = this.dfilteredB2BList.indexOf(this.dfilteredB2BList.find(x => x.id === data.id))
                    this.dfilteredB2BList.splice(index, 1);
                    const indexOne = this.destList.indexOf(this.destList.find(x => x.id === data.id))
                    this.destList.splice(indexOne, 1);
                } else {
                    const index = this.dfilteredB2CList.indexOf(this.dfilteredB2CList.find(x => x.id === data.id))
                    this.dfilteredB2CList.splice(index, 1);
                    const indexOne = this.destList.indexOf(this.destList.find(x => x.id === data.id))
                    this.destList.splice(indexOne, 1);
                }
                this.toasterService.showToast('success', 'Destination Deleted Successfully');
            }, error: err => {
                this.toasterService.showToast('error', err);
            }
        })
    }


    AddVisa(): void {
        if (!this.VisaFormGroup.valid) {
            this.toasterService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.VisaFormGroup.markAllAsTouched();
            return;
        }

        const json = this.VisaFormGroup.getRawValue();
        json.markup_profile_id = this.formGroup.get('id').value;

        json.tempCity = this.VisaFormGroup.get('city_id').value;
        json.city_id = this.VisaFormGroup.get('city_id').value.id;
        // json.destination_name = json.city_id.destination;

        this.markupprofileService.visaCreate(json).subscribe({
            next: res => {
                json.city_id = { display_name: json.tempCity.destination, id: json.tempCity.id }
                if (json.id) {
                    if (json.profile_type === 'B2B') {
                        const index = this.vfilteredB2BList.indexOf(x => x.id == json.id);
                        const editrecord = this.vfilteredB2BList.find(x => x.id == json.id);
                        Object.assign(editrecord, json);
                        this.vfilteredB2BList[index] = editrecord;
                    } else {
                        const index = this.vfilteredB2CList.indexOf(x => x.id == json.id);
                        const editrecord = this.vfilteredB2CList.find(x => x.id == json.id);
                        Object.assign(editrecord, json);
                        this.vfilteredB2CList[index] = editrecord;
                    }
                } else {
                    if (json.profile_type === 'B2B') {
                        this.VisaFormGroup.get('id').patchValue(res.id)
                        json.id = res.id;
                        this.vfilteredB2BList.push(json);
                        this.visaList.push(json);
                    } else {
                        this.VisaFormGroup.get('id').patchValue(res.id)
                        json.id = res.id;
                        this.vfilteredB2CList.push(json);
                        this.visaList.push(json);
                    }
                }
                this.toasterService.showToast('success', this.Detail == 'Save' ? 'Visa Saved' : 'Visa Created');
                this.Visa = 'Add';
                this.VisaFormGroup.get('id').patchValue('');
                this.VisaFormGroup.get('city_id').patchValue('');
                // this.VisaFormGroup.get('profile_type').patchValue('');
            }, error: err => {
                this.toasterService.showToast('error', err);
            }
        })
    }
    editVisa(data: any) {
        this.VisaFormGroup.patchValue(data);
        this.VisaFormGroup.get('cityfilter').patchValue(data.city_id.display_name);
        // this.VisaFormGroup.get('city_id').patchValue(data.display_name);
        this.VisaFormGroup.get('city_id').patchValue({ destination: data.city_id.display_name, id: data.city_id.id });

        this.Visa = 'Save';
    }
    deleteVisa(data: any) {
        this.markupprofileService.visaDelete(data.id).subscribe({
            next: res => {
                if (data.profile_type === 'B2B') {
                    const index = this.vfilteredB2BList.indexOf(this.vfilteredB2BList.find(x => x.id === data.id))
                    this.vfilteredB2BList.splice(index, 1);
                    const indexOne = this.visaList.indexOf(this.visaList.find(x => x.id === data.id))
                    this.visaList.splice(indexOne, 1);
                } else {
                    const index = this.vfilteredB2CList.indexOf(this.vfilteredB2CList.find(x => x.id === data.id))
                    this.vfilteredB2CList.splice(index, 1);
                    const indexOne = this.visaList.indexOf(this.visaList.find(x => x.id === data.id))
                    this.visaList.splice(indexOne, 1);
                }
                this.toasterService.showToast('success', 'Visa Deleted Successfully');
            }, error: err => {
                this.toasterService.showToast('error', err);
            }
        })
    }

    AddSupplier(): void {
        if (!this.SupplierFormGroup.valid) {
            this.toasterService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.SupplierFormGroup.markAllAsTouched();
            return;
        }

        const json = this.SupplierFormGroup.getRawValue();
        json.markup_profile_id = this.formGroup.get('id').value;
        json.supplier_id = this.SupplierFormGroup.get('supplier_id').value.id;

        this.markupprofileService.supplierCreate(json).subscribe({
            next: res => {
                if (json.id) {
                    if (json.profile_type === 'B2B') {
                        const index = this.sfilteredB2BList.indexOf(x => x.id == json.id);
                        const editrecord = this.sfilteredB2BList.find(x => x.id == json.id);
                        Object.assign(editrecord, this.SupplierFormGroup.value);
                        this.sfilteredB2BList[index] = editrecord;
                    } else {
                        const index = this.sfilteredB2CList.indexOf(x => x.id == json.id);
                        const editrecord = this.sfilteredB2CList.find(x => x.id == json.id);
                        Object.assign(editrecord, this.SupplierFormGroup.value);
                        this.sfilteredB2CList[index] = editrecord;
                    }
                } else {
                    if (json.profile_type === 'B2B') {
                        this.SupplierFormGroup.get('id').patchValue(res.id)
                        this.sfilteredB2BList.push(this.SupplierFormGroup.value);
                        this.suppList.push(this.SupplierFormGroup.value);
                    } else {
                        this.SupplierFormGroup.get('id').patchValue(res.id)
                        this.sfilteredB2CList.push(this.SupplierFormGroup.value);
                        this.suppList.push(this.SupplierFormGroup.value);
                    }
                }
                this.toasterService.showToast('success', this.Detail == 'Save' ? 'Supplier Saved' : 'Supplier Created');
                this.Supplier = 'Add';
                this.SupplierFormGroup.get('id').patchValue('');
                this.SupplierFormGroup.get('supplier_id').patchValue('');
            }, error: err => {
                this.toasterService.showToast('error', err);
            }
        })
    }
    editSupplier(data: any) {
        this.SupplierFormGroup.patchValue(data);
        this.SupplierFormGroup.get('supplierfilter').patchValue(data.suppler_name);
        this.Supplier = 'Save';
    }
    deleteSupplier(data: any) {
        this.markupprofileService.supplierDelete(data.id).subscribe({
            next: res => {
                if (data.profile_type === 'B2B') {
                    const index = this.sfilteredB2BList.indexOf(this.sfilteredB2BList.find(x => x.id === data.id))
                    this.sfilteredB2BList.splice(index, 1);
                    const indexOne = this.suppList.indexOf(this.suppList.find(x => x.id === data.id))
                    this.suppList.splice(indexOne, 1);
                } else {
                    const index = this.sfilteredB2CList.indexOf(this.sfilteredB2CList.find(x => x.id === data.id))
                    this.sfilteredB2CList.splice(index, 1);
                    const indexOne = this.suppList.indexOf(this.suppList.find(x => x.id === data.id))
                    this.suppList.splice(indexOne, 1);
                }
                this.toasterService.showToast('success', 'Supplier Deleted Successfully');
            }, error: err => {
                this.toasterService.showToast('error', err);
            }
        })
    }

    submit(): void {
        if (!this.formGroup.valid) {
            this.toasterService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.formGroup.markAllAsTouched();
            return;
        }

        this.disableBtn = true;
        const json = this.formGroup.getRawValue();
        json['company_id'] =  json.company_id;
        this.markupprofileService.create(json).subscribe({
            next: (res) => {
                this.disableBtn = false;
                this.toasterService.showToast('success', this.btnTitle === 'Create' ? 'Markup profile Created' : 'Markup profile Saved');

                this.markupprofileService.getMarkup(res.id).subscribe({
                    next: data => {
                        this.record = data;
                        this.formGroup.patchValue(this.record)
                    }
                })

            }, error: (err) => {
                this.disableBtn = false;
                this.toasterService.showToast('error', err);
            }
        })
    }

    changeprofile() {
        this.formGroup.get('particular_id').patchValue('');
        if (this.formGroup.get('markup_profile_by').value == 'Agent' && this.isFirstChange) {
            this.employeeService.getAgentCombo('').subscribe(data => this.AgentList.next(data));
            this.isFirstChange = false;
        }
    }

    public compareWith(v1: any, v2: any) {
        return v1 && v2 && v1.id === v2.id;
    }

    onDetail(val:any){
        this.selectedDetailTab = val;
    }

}


