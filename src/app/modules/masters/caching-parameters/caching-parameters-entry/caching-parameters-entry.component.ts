import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { FlightTabService } from 'app/services/flight-tab.service';

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

    cachingParametersListRoute = Routes.masters.caching_parameters_route;
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
    SupplierList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
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
        // public matDialogRef: MatDialogRef<CachingParametersEntryComponent>,
        public formBuilder: FormBuilder,
        public cachingParameterService: CachingParameterService,
        public router: Router,
        public route: ActivatedRoute,
        private kycDocumentService: KycDocumentService,
        public designationService: DesignationService,
        public alertService: ToasterService,
        private entityService: EntityService,
        // @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        // this.record = data?.data ?? {}
        this.entityService.oncachingParametersCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                this.settingsDrawer.toggle()
                this.record = item.data
                if(item?.list){
                    this.listFlag = true;
                    this.title ="Caching Parameters Info"
                }

                if(item?.create){
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
                    this.title ="Create Caching Parameters"
                    this.editCachingId = ""
                }

                if(item?.edit){
                    this.listFlag = false;
                    this.createFlag = true;
                    this.title ="Edit Caching Parameters"
                    this.editCachingId = this.record?.id;

                    this.formGroup.patchValue(this.record)
                    // this.formGroup.get('cityfilter').patchValue(this.record?.city_name);
                    // this.formGroup.get("city_id").patchValue(this.record?.city_id_enc);
                }
            }
        })
    }

    ngOnInit(): void {
        this.formGroup = this.formBuilder.group({
            id: [''],
            supplier_id: ['', Validators.required],
            supplierfilter: [''],
            travel_type: ['', Validators.required],
            trip_type: ['', Validators.required],
            sector: ['', Validators.pattern(/^([A-Za-z]{3})-([A-Za-z]{3})$/)],
            today_travel: [''],
            one_week_travel: [''],
            one_month_travel: [''],
            far_travel: ['']
        });

        this.formGroup.get('sector').valueChanges.subscribe(value => {
            if (this.formGroup.get('sector').valid) {
            } else {
                this.alertService.showToast('error', 'Invalid sector format. Please enter format like: BOM-DEL', 'top-right', true);
            }
        });


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
        .subscribe((data) => this.SupplierList.next(data));
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
            sector: json.sector ? json.sector : "",
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
