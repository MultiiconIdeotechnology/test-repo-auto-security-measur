import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, TitleCasePipe } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, ActivatedRoute, RouterOutlet, RouterLink } from '@angular/router';
import { Routes } from 'app/common/const';
import { CityService } from 'app/services/city.service';
import { CrmService } from 'app/services/crm.service';
import { DesignationService } from 'app/services/designation.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject, filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragPreview, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { FuseDrawerComponent } from "../../../../../@fuse/components/drawer/drawer.component";

@Component({
    selector: 'app-crm-lead-entry',
    templateUrl: './lead-entry.component.html',
    styles       : [
        ` app-crm-lead-entry {
                position: static;
                display: block;
                flex: none;
                width: auto;
            }

            @media (screen and min-width: 1280px) {
                empty-layout + app-crm-lead-entry .settings-cog {
                    right: 0 !important;
                }
            }
        `,
    ],
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
    MatCheckboxModule,
    MatSidenavModule,
    CdkDropList,
    CdkDrag,
    CdkDragPreview,
    CdkDragHandle,
    RouterLink,
    TitleCasePipe,
    DatePipe,
    FuseDrawerComponent
]
})
export class CRMLeadEntryComponent {
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';

    readonly: boolean = false;
    record: any = {};
    btnTitle: string = 'Create';
    fieldList: {};
    leadListRoute = Routes.crm.lead_route;
    disableBtn: boolean = false;
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
            { value: 'BoostMyBrand', viewValue: 'Boost My Brand' },
            { value: 'Corporate', viewValue: 'Corporate' },
            { value: 'Supplier', viewValue: 'Supplier' }
        ];

    // leadSourceList: any[] =
    //     [
    //         { value: 1, viewValue: 'Website' },
    //         { value: 2, viewValue: 'B2B Login' },
    //         { value: 3, viewValue: 'Social' }
    //     ];

    constructor(
        public matDialogRef: MatDialogRef<CRMLeadEntryComponent>,
        public formBuilder: FormBuilder,
        public cityService: CityService,
        public router: Router,
        public route: ActivatedRoute,
        public designationService: DesignationService,
        public alertService: ToasterService,
        public crmService: CrmService,
        @Inject(MAT_DIALOG_DATA) public data: any = {},
        @Inject(MAT_DIALOG_DATA) public editFlag: any = {}
    ) {
        this.isEditFlag = this.isEditFlag?.editFlag;
        this.record = data?.data ?? {}
    }

    ngOnInit(): void {
        this.formGroup = this.formBuilder.group({
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

        if (this.record.id && !this.editFlag) {
            // this.readonly = readonly ? true : false;
            // this.btnTitle = readonly ? 'Close' : 'Save';
            this.cityService.getCityRecord(this.record.id).subscribe({
                next: (data) => {
                    // this.record = data;
                    this.readonly = this.data.readonly;
                    this.formGroup.patchValue(data);
                    this.formGroup
                        .get('countryfilter')
                        .patchValue(data.country);
                    this.formGroup
                        .get('statefilter')
                        .patchValue(data.state_name);
                    if (this.readonly) {
                        this.fieldList = [
                            { name: 'Country', value: data.country, },
                            { name: 'State', value: data.state_name, },
                            { name: 'City', value: data.city_name, },
                            { name: 'Display Name', value: data.display_name, },
                            { name: 'Country Code', value: data.country_code, },
                            // { name: 'Mobile Code', value: data.mobile_code, },
                            { name: 'GST State Code', value: data.gst_state_code, },
                            { name: 'Latitude', value: data.latitude, },
                            { name: 'Longitude', value: data.longitude, },
                        ];
                    }
                    this.title = this.readonly ? ("City - " + this.record.country) : 'Modify City';
                    this.btnLabel = this.readonly ? "Close" : 'Save';
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

        this.cityService.getMobileCodeCombo().subscribe((res: any) => {
            this.MobileCodeList.next(res);
            this.formGroup.get('mobile_code').patchValue('91');
        });

        if (this.editFlag?.editFlag == true) {
            this.formGroup.patchValue(this.record)
            this.title = "Edit Lead"
            this.editLeadId = this.record?.id;
            this.formGroup.get('cityfilter').patchValue(this.record?.city_name);
            this.formGroup.get("city_id").patchValue(this.record?.city_id_enc);
        }
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

        if (this.editFlag?.editFlag) {
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
                        this.matDialogRef.close(true);
                    } else {
                        this.disableBtn = false;
                        this.alertService.showToast('success', 'Record modified', 'top-right', true);
                        this.matDialogRef.close(true);
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
                        this.matDialogRef.close(true);
                    } else {
                        this.disableBtn = false;
                        this.alertService.showToast('success', 'New record added', 'top-right', true);
                        this.matDialogRef.close(true);
                    }
                },
                error: (err) => {
                    this.alertService.showToast('error', err.status, 'top-right', true);
                    this.disableBtn = false;
                },
            });
        }
    }
}
