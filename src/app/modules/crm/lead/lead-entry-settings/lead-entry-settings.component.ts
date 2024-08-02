import { CdkDropList, CdkDrag, CdkDragPreview, CdkDragHandle } from '@angular/cdk/drag-drop';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { FuseConfig, FuseConfigService, Themes } from '@fuse/services/config';
import { Routes } from 'app/common/const';
import { CityService } from 'app/services/city.service';
import { CrmService } from 'app/services/crm.service';
import { DesignationService } from 'app/services/designation.service';
import { EntityService } from 'app/services/entity.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { Subject, takeUntil, distinctUntilChanged, debounceTime, startWith, filter, switchMap, ReplaySubject } from 'rxjs';

@Component({
    selector: 'lead-settings',
    templateUrl: './lead-entry-settings.component.html',
    styles: [
        `
            referral-settings {
                position: static;
                display: block;
                flex: none;
                width: auto;
            }
        `,
    ],
    standalone: true,
    imports: [
        NgIf,
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
        MatCheckboxModule,
        MatSidenavModule,
        CdkDropList,
        CdkDrag,
        CdkDragPreview,
        CdkDragHandle,
        RouterLink,
        TitleCasePipe,
        FuseDrawerComponent,
        MatDividerModule,
        NgFor,
        MatDatepickerModule,
        MatMenuModule,
        NgxMatSelectSearchModule,
        NgxMatTimepickerModule]
})
export class LeadEntrySettingsComponent implements OnInit, OnDestroy {
    disableBtn: boolean = false;
    rmList: any[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    @ViewChild('settingsDrawer') public settingsDrawer: MatSidenav;

    config: FuseConfig;
    layout: string;
    scheme: 'dark' | 'light';
    theme: string;
    themes: Themes;

    readonly: boolean = false;
    record: any = {};
    btnTitle: string = 'Create';
    fieldList: {};
    leadListRoute = Routes.crm.lead_route;
    formGroup: FormGroup;
    title = "Add New Lead"
    btnLabel = "Submit"
    cityList: any[] = [];
    first: boolean = true;
    MobileCodeList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    mobilecodelist: any[] = [];
    isEditFlag: any = {};
    editLeadId: any;

    leadTypeList: any[] =
        [
            { value: 'B2B Partner', viewValue: 'B2B Partner' },
            { value: 'WL', viewValue: 'WL' },
            { value: 'Corporate', viewValue: 'Corporate' },
            { value: 'Supplier', viewValue: 'Supplier' }
        ];

    constructor(
        public builder: FormBuilder,
        public cityService: CityService,
        public router: Router,
        public route: ActivatedRoute,
        public designationService: DesignationService,
        public alertService: ToasterService,
        public crmService: CrmService,
        public entityService: EntityService,
        private _fuseConfigService: FuseConfigService,
        // @Inject(MAT_DIALOG_DATA) public data: any = {},
        // @Inject(MAT_DIALOG_DATA) public editFlag: any = {}
    ) {
        // this.isEditFlag = this.isEditFlag?.editFlag;
        // this.record = data?.data ?? {}
        this.entityService.onleadEntityCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                this.settingsDrawer.toggle()
                if (item) {
                    this.record = item?.data ?? {}
                    this.isEditFlag = item?.editFlag;
                    this.readonly = item?.readonly;

                    this.formGroup.patchValue({
                        id: "",
                        lead_type: ['BO'],
                        lead_source: "",
                        agency_name: "",
                        contact_person_name: "",
                        contact_person_mobile: "",
                        contact_person_email: "",
                        city_id: "",
                        mobile_code: "",
                        mobilefilter: "",
                        cityfilter: "",
                        Is_Email_Whatsapp: true
                    })
                    this.title = "Add New Lead"
                    this.formGroup.get('mobile_code').setValue('91');

                    this.formGroup
                        .get('cityfilter')
                        .valueChanges.pipe(
                            filter((search) => !!search),
                            startWith(''),
                            debounceTime(200),
                            distinctUntilChanged(),
                            switchMap((value: any) => {
                                return this.cityService.getCityCombo(value);
                            })
                        )
                        .subscribe({
                            next: (data) => {
                                this.cityList = data;
                                if (!this.record.city_id) {
                                    this.formGroup.get("city_id").patchValue(data[0].id)
                                    this.first = false;
                                }
                            }
                        });

                    // this.cityService.getMobileCodeCombo().subscribe((res: any) => {
                    //     this.MobileCodeList.next(res);
                    //     this.formGroup.get('mobile_code').patchValue('91');
                    // });

                    this.cityService.getMobileCodeCombo().subscribe((res: any) => {
                        this.MobileCodeList.next(res);
                        this.mobilecodelist = res;
                    });

                    if (this.record?.id) {
                        this.cityService.getCityRecord(this.record?.id).subscribe({
                            next: (data) => {
                                this.formGroup.patchValue(data);
                                this.formGroup.get("mobile_code").patchValue(this.record?.contact_person_mobile_code);
                            },
                            error: (err) => {
                                this.alertService.showToast(
                                    'error',
                                    err,
                                    'top-right',
                                    true
                                );
                                this.disableBtn = false;
                            },
                        });
                    }

                    if (this.isEditFlag) {
                        this.formGroup.patchValue(this.record)
                        this.title = "Edit Lead"
                        this.editLeadId = this.record?.id;
                        this.formGroup.get('cityfilter').patchValue(this.record?.city_name);
                        this.formGroup.get("city_id").patchValue(this.record?.city_id_enc);
                    }
                }
            }
        })

        this._fuseConfigService.config$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config: FuseConfig) => {
                this.config = config;
            });
    }

    ngOnInit(): void {
        this.formGroup = this.builder.group({
            id: [''],
            lead_type: ['', Validators.required],
            lead_source: ['BO'],
            agency_name: ['', Validators.required],
            contact_person_name: ['', Validators.required],
            contact_person_mobile: ['', Validators.required],
            contact_person_email: ['', Validators.required],
            city_id: ['', Validators.required],
            mobile_code: ['', Validators.required],
            mobilefilter: [''],
            cityfilter: [''],
            Is_Email_Whatsapp: [true]
        });
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

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    filterMobileCode(value: string) {
        const Filter = this.mobilecodelist.filter(x =>
            (x.country_code.toLowerCase().includes(value.toLowerCase()) || x.mobile_code.toLowerCase().includes(value.toLowerCase()))
        );
        this.MobileCodeList.next(Filter);
    }

    numberOnly(event): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    isValidEmail(email: string): boolean {
        const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(email);
    }

    submit(): void {
        if (!this.formGroup.valid) {
            this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.formGroup.markAllAsTouched();
            return;
        }

        if (this.readonly) {
            this.router.navigate([this.leadListRoute]);
            return;
        }

        const json = this.formGroup.getRawValue();
        this.disableBtn = true;

        if (this.isEditFlag) {
            const modifiedObj = {
                id: this.editLeadId,
                city_id: json.city_id,
                agency_name: json.agency_name,
                contact_person_name: json.contact_person_name,
                contact_person_mobile: json.contact_person_mobile,
                contact_person_email: json.contact_person_email,
                contact_person_mobile_code: json.mobile_code
            };
            this.crmService.createInboxLead(modifiedObj).subscribe({
                next: (res) => {
                    if (res?.status == "Lead Already Exist") {
                        this.disableBtn = false;
                        this.alertService.showToast('error', res.status, 'top-right', true);
                        this.entityService.raiserefreshleadEntityCall(true);
                        this.settingsDrawer.close();

                    } else {
                        this.disableBtn = false;
                        this.alertService.showToast('success', 'Record modified', 'top-right', true);
                        this.entityService.raiserefreshleadEntityCall(true);
                        this.settingsDrawer.close();
                    }
                },
                error: (err) => {
                    this.alertService.showToast('error', err, 'top-right', true);
                    this.disableBtn = false;
                },
            });
        } else {
            const modifiedObj = {
                id: "",
                lead_type: json.lead_type,
                city_id: json.city_id,
                agency_name: json.agency_name,
                contact_person_name: json.contact_person_name,
                contact_person_mobile: json.contact_person_mobile,
                contact_person_email: json.contact_person_email,
                contact_person_mobile_code: json.mobile_code,
                lead_source: 'BO',
                Is_Email_Whatsapp: json.Is_Email_Whatsapp ? json.Is_Email_Whatsapp : false,
                is_manual_entry: true
            };
            this.crmService.createInboxLead(modifiedObj).subscribe({
                next: (res) => {
                    if (res?.status == "Lead Already Exist") {
                        this.disableBtn = false;
                        this.alertService.showToast('error', res.status, 'top-right', true);
                        this.entityService.raiserefreshleadEntityCall(true);
                        this.settingsDrawer.close();
                    } else {
                        this.disableBtn = false;
                        this.alertService.showToast('success', 'New record added', 'top-right', true);
                        this.entityService.raiserefreshleadEntityCall(true);
                        this.settingsDrawer.close();
                    }
                },
                error: (err) => {
                    this.alertService.showToast('error', err.status, 'top-right', true);
                    this.disableBtn = false;
                },
            });
        }
    }

    public compareWith(v1: any, v2: any) {
        return v1 && v2 && v1.id === v2.id;
    }
}
