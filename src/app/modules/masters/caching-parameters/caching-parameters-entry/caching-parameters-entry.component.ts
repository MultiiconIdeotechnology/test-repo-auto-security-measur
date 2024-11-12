import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { Routes } from 'app/common/const';
import { DesignationService } from 'app/services/designation.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { debounceTime, distinctUntilChanged, filter, ReplaySubject, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { MatSidenav } from '@angular/material/sidenav';
import { EntityService } from 'app/services/entity.service';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { CachingParameterService } from 'app/services/caching-parameters.service';

@Component({
    selector: 'app-caching-parameters-entry',
    templateUrl: './caching-parameters-entry.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        AsyncPipe,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatSlideToggleModule,
        NgxMatSelectSearchModule,
        MatTooltipModule,
        MatAutocompleteModule,
        RouterOutlet,
        MatOptionModule,
        MatDividerModule,
        FuseDrawerComponent
    ]
})
export class CachingParametersEntryComponent {
    @ViewChild('settingsDrawer') public settingsDrawer: MatSidenav;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    readonly: boolean = false;
    record: any = {};
    btnTitle: string = 'Create';
    fieldList: {};
    cachingParametersListRoute = Routes.settings.caching_parameters_route;
    disableBtn: boolean = false;
    countryList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    cityList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    stateList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    MobileCodeList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    mobilecodelist: any[] = [];
    statelist: any[] = [];
    formGroup: FormGroup;
    title = "Create Caching Parameters"
    btnLabel = "Submit"
    listFlag: boolean = false;
    createFlag: boolean = false;
    SupplierList: any[] = [];
    editCachingId: any;
    fromcityList: any[] = [];

    travelTypeList: any[] =
        [
            { value: 'Any', viewValue: 'Any' },
            { value: 'Domestic', viewValue: 'Domestic' },
            { value: 'International', viewValue: 'International' },
        ];

    tripTypeList: any[] =
        [
            { value: 'Any', viewValue: 'Any' },
            { value: 'Oneway', viewValue: 'Oneway' },
            { value: 'Round', viewValue: 'Round' }
        ];

    constructor(
        public formBuilder: FormBuilder,
        public cachingParameterService: CachingParameterService,
        public router: Router,
        public route: ActivatedRoute,
        private kycDocumentService: KycDocumentService,
        public designationService: DesignationService,
        public alertService: ToasterService,
        private entityService: EntityService,
    ) {
        // this.record = data?.data ?? {}
        this.entityService.oncachingParametersCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                this.settingsDrawer.toggle();

                this.record = item.data
                if (item?.list) {
                    this.listFlag = true;
                    this.title = "Caching Parameters Info"
                }

                this.formGroup
                    .get('supplierfilter')
                    .valueChanges.pipe(
                        filter((search) => !!search),
                        startWith(''),
                        debounceTime(200),
                        distinctUntilChanged(),
                        switchMap((value: any) => {
                            return this.kycDocumentService.getSupplierCombo(value);
                        })
                    )
                    .subscribe({
                        next: data => {
                            this.SupplierList = [];
                            this.SupplierList.push({
                                id: '',
                                company_name: 'Any',
                            });
                            this.SupplierList.push(...data);

                            // if (!this.record?.data) {
                            //     this.formGroup.get('supplier_id').patchValue(this.SupplierList[0]?.id);
                            // }
                        }
                    });

                if (item?.create) {
                    this.formGroup.patchValue({
                        id: "",
                        supplier_id: "",
                        supplierfilter: "",
                        travel_type: "",
                        trip_type: "",
                        sector: "",
                        today_travel: "",
                        one_week_travel: "",
                        one_month_travel: "",
                        far_travel: ""
                    });

                    this.listFlag = false;
                    this.createFlag = true;
                    this.title = "Create Caching Parameters"
                    this.editCachingId = ""

                    this.formGroup.get('travel_type').patchValue('Any');
                    this.formGroup.get('trip_type').patchValue('Any');
                    this.formGroup.get('sector').patchValue('Any');
                }

                if (item?.edit) {
                    this.listFlag = false;
                    this.createFlag = true;
                    this.title = "Edit Caching Parameters"
                    this.editCachingId = this.record?.id;

                    if (this.record?.id) {
                        this.formGroup.get('supplierfilter').patchValue(this.record?.supplier_name);
                        this.formGroup.get('supplier_id').patchValue(this.record?.supplier_id);
                    }
                    this.formGroup.patchValue(this.record)
                }
            }
        })
    }

    numberOnly(event: any): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    // sector: ['', Validators.pattern(/^([A-Za-z]{3})-([A-Za-z]{3})$/)],
    ngOnInit(): void {
        this.formGroup = this.formBuilder.group({
            id: [''],
            supplier_id: [''],
            supplierfilter: [''],
            travel_type: ['', Validators.required],
            sector: ['', [Validators.required, this.sectorValidator()]],
            trip_type: ['', Validators.required],
            today_travel: ['', [Validators.required, this.greaterThanZeroValidator()]],
            one_week_travel: ['', [Validators.required, this.greaterThanZeroValidator()]],
            one_month_travel: ['', [Validators.required, this.greaterThanZeroValidator()]],
            far_travel: ['', [Validators.required, this.greaterThanZeroValidator()]]
        });

        this.formGroup.get('sector').valueChanges.subscribe(value => {
            this.formatSectorInput();
        });
    }

    greaterThanZeroValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            const value = control.value;
            return value > 0 ? null : { 'greaterThanZero': true };
        };
    }

    sectorValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value as string;
            if(value !== 'ANY'){
                if (value && value.length === 7) {
                    const formatPattern = /^[A-Z]{3}-[A-Z]{3}$/;
                    if (!formatPattern.test(value)) {
                        return { 'invalidFormat': true };
                    }
                } else if (value && value.length !== 7) {
                    return { 'invalidLength': true };
                }
            }
            return null;
        };
    }

    formatSectorInput() {
        const control = this.formGroup.get('sector');
        if (control) {
            const rawValue = control.value as string;
            const formattedValue = this.transformToUppercasePattern(rawValue);
            control.setValue(formattedValue, { emitEvent: false });
        }
    }

    transformToUppercasePattern(value: string): string {
        const uppercased = value.toUpperCase();
        const cleaned = uppercased.replace(/[^A-Z]/g, '');
        return cleaned.length <= 3 ? cleaned : `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}`;
    }

    submit(): void {
        if (!this.formGroup.valid) {
            this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.formGroup.markAllAsTouched();
            return;
        }

        if (this.readonly) {
            this.router.navigate([this.cachingParametersListRoute]);
            return;
        }
        const json = this.formGroup.getRawValue();
        this.disableBtn = true;
        const newJson = {
            id: this.editCachingId ? this.editCachingId : "",
            supplier_id: json.supplier_id ? json.supplier_id : "",
            travel_type: json.travel_type ? json.travel_type : "",
            trip_type: json.trip_type ? json.trip_type : "",
            sector: json.sector == 'ANY' ? 'Any' : json.sector,
            today_travel: json.today_travel ? json.today_travel : 0,
            one_week_travel: json.one_week_travel ? json.one_week_travel : 0,
            one_month_travel: json.one_month_travel ? json.one_month_travel : 0,
            far_travel: json.far_travel ? json.far_travel : 0
        }

        this.cachingParameterService.create(newJson).subscribe({
            next: () => {
                this.router.navigate([this.cachingParametersListRoute]);
                this.disableBtn = false;
                this.entityService.raiserefreshcachingParametersCall(true);
                this.settingsDrawer.close();
                if (json.id) {
                    this.alertService.showToast('success', 'Record modified', 'top-right', true);
                }
                else {
                    this.alertService.showToast('success', 'New record added', 'top-right', true);
                }
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.disableBtn = false;
            },
        });
    }
}
