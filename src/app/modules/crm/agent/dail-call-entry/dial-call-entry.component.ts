import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject, Input, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DateAdapter, MAT_DATE_FORMATS, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, ActivatedRoute, RouterOutlet, RouterLink } from '@angular/router';
import { Routes } from 'app/common/const';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { CityService } from 'app/services/city.service';
import { DesignationService } from 'app/services/designation.service';
import { EmployeeService } from 'app/services/employee.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { ReplaySubject, switchMap, of, distinctUntilChanged, debounceTime, filter, startWith } from 'rxjs';
import { Security, module_name, crmLeadPermissions } from 'app/security';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { DateTime } from 'luxon';
import { CrmService } from 'app/services/crm.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MY_DATE_FORMATS } from 'app/utils/commonutils';
import { LuxonDateAdapterService } from 'app/services/LuxonDateAdapter.service';

@Component({
    selector: 'app-crm-dial-call-entry',
    templateUrl: './dial-call-entry.component.html',
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
        MatDatepickerModule,
        MatMenuModule,
        NgxMatTimepickerModule,
        MatTabsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatDialogModule,
        CommonModule,
        MatProgressSpinnerModule,
        RouterLink
    ],
    providers: [
        { provide: DateAdapter, useClass: LuxonDateAdapterService },
        { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
      ]
})
export class CRMDialCallEntryComponent extends BaseListingComponent implements OnDestroy {
    latestLogin: Date | null;
    readonly: boolean = false;
    record: any = {};
    recordAgentDialCallFlag: any = {};
    btnTitle: string = 'Create';
    fieldList: {};
    agentListRoute = Routes.crm.agents_route;
    disableBtn: boolean = false;
    formGroup: FormGroup;
    title = "Dial Call";
    btnLabel = "Submit";
    cityList: any[] = [];
    first: boolean = true;
    rescheduleFlag: boolean = false;
    MobileCodeList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    tabName: any;
    tabNameStr: any = 'Details';
    tab: string = 'Details';
    dataList = [];
    todayDateTime = new Date();
    masterCallPurpose: any;
    @Input() basicDetails: any = {};
    noAnswerFlag: boolean = false;
    noAnswerReactiveFlag: boolean = false;
    // service_offered_by_ta = new FormControl([]);

    @ViewChild(MatPaginator) public _paginatorInbox: MatPaginator;
    @ViewChild(MatSort) public _sortInbox: MatSort;
    searchInputControlInbox = new FormControl('');

    languageList: any[] =
        [
            { value: 'English', viewValue: 'English' },
            { value: 'Hindi', viewValue: 'Hindi' },
            { value: 'Regional', viewValue: 'Regional' }
        ];

    //serviceOfferList: string[] = ['Air', 'Hotel', 'Rail', 'Bus'];
    serviceOfferList: string[] = ['Air', 'Hotel', 'Rail', 'Bus', 'Holiday', 'VISA', 'Insurance', 'CAB', 'Forex'];

    feedbackList: any[] =
        [
            { value: 'Positive', viewValue: 'Positive' },
            { value: 'Negative', viewValue: 'Negative' },
            { value: 'No Answer', viewValue: 'No Answer' }
        ];

    reActiveList: any[] =
        [
            { value: 'Yes', viewValue: 'Yes' },
            { value: 'No', viewValue: 'No' },
            { value: 'No Answer', viewValue: 'No Answer' }
        ];

    reasonList: any[] =
        [
            { value: 'Rate', viewValue: 'Rate' },
            { value: 'Service', viewValue: 'Service' },
            { value: 'Features', viewValue: 'Features' }
        ];

    purposeList: any[] =
        [
            { value: 'Demo', viewValue: 'Demo' },
            { value: 'Query', viewValue: 'Query' },
            { value: 'Follow-up', viewValue: 'Follow-up' }
        ];

    priorityList: any[] =
        [
            { value: 'High', viewValue: 'High' },
            { value: 'Medium', viewValue: 'Medium' },
            { value: 'Low', viewValue: 'Low' }
        ];

    public prefferedLanguage(event: any): void {
        this.noAnswerFlag = false;
        if(event == 'No Answer'){
            this.noAnswerFlag = true;
        }
    }

    public reActive(event: any): void {
        this.noAnswerReactiveFlag = false;
        if(event == 'No Answer'){
            this.noAnswerReactiveFlag = true;
        }
    }

    constructor(
        public matDialogRef: MatDialogRef<CRMDialCallEntryComponent>,
        public formBuilder: FormBuilder,
        public cityService: CityService,
        public router: Router,
        private employeeService: EmployeeService,
        public route: ActivatedRoute,
        public designationService: DesignationService,
        public alertService: ToasterService,
        private crmService: CrmService,
    ) {
        super(module_name.dialCall);
        setTimeout(() => {
            if(this.basicDetails){
                this.record = this.basicDetails?.data ?? {}
                this.recordAgentDialCallFlag = this.basicDetails?.agentDialCallFlag ?? {}
            }
        }, 1000);
    }

    ngOnInit(): void {
        this.formGroup = this.formBuilder.group({
            preferred_language: [''],
            feedback: ['', Validators.required],
            rm_remark: ['', Validators.required],
            is_call_rescheduled: [false],
            call_assign_to: [''],
            service_offered_by_ta: [''],
            schedule_date: ['', Validators.required],
            schedule_time: ['', Validators.required],
            call_purpose: ['', Validators.required],
            priority: ['', Validators.required],
            reschedule_remark: ['', Validators.required],
            reactive_reason: [''],
            reactive_status: ['', Validators.required],
            reschedule_date_time: [''],
            assignfilter: [''],
        });

        if (this.formGroup.get('is_call_rescheduled').value == true) {
            this.rescheduleFlag = true;
            this.formGroup.get('schedule_date').clearValidators();
            this.formGroup.get('schedule_time').clearValidators();
            this.formGroup.get('call_purpose').clearValidators();
            this.formGroup.get('reschedule_remark').clearValidators();
            this.formGroup.get('priority').clearValidators();

            this.formGroup.get('schedule_date').updateValueAndValidity();
            this.formGroup.get('schedule_time').updateValueAndValidity();
            this.formGroup.get('call_purpose').updateValueAndValidity();
            this.formGroup.get('reschedule_remark').updateValueAndValidity();
            this.formGroup.get('priority').updateValueAndValidity();
        } else {
            this.formGroup.get('schedule_date').clearValidators();
            this.formGroup.get('schedule_time').clearValidators();
            this.formGroup.get('call_purpose').clearValidators();
            this.formGroup.get('reschedule_remark').clearValidators();
            this.formGroup.get('feedback').clearValidators();
            this.formGroup.get('reactive_status').clearValidators();

            this.formGroup.get('priority').clearValidators();
            if (this.record?.status == 'New') {
                this.formGroup.get('reactive_status').clearValidators();
                this.formGroup.get('feedback').setValidators(Validators.required);
            }

            if (this.record?.status == 'Active') {
                this.formGroup.get('reactive_status').clearValidators();
                this.formGroup.get('feedback').setValidators(Validators.required);
            }

            if (this.record?.status == 'Inactive') {
                this.formGroup.get('feedback').clearValidators();
                this.formGroup.get('reactive_status').setValidators(Validators.required);
            }
        }

        this.formGroup.get('is_call_rescheduled').valueChanges.subscribe((value: boolean) => {
            this.rescheduleFlag = value;
            if (!this.rescheduleFlag) {
                this.formGroup.get('schedule_date').clearValidators();
                this.formGroup.get('schedule_time').clearValidators();
                this.formGroup.get('call_purpose').clearValidators();
                this.formGroup.get('reschedule_remark').clearValidators();
                this.formGroup.get('feedback').clearValidators();
                this.formGroup.get('priority').clearValidators();
                this.formGroup.get('reactive_status').clearValidators();
            } else {
                this.formGroup.get('schedule_date').setValidators(Validators.required);
                this.formGroup.get('schedule_time').setValidators(Validators.required);
                this.formGroup.get('call_purpose').setValidators(Validators.required);
                this.formGroup.get('reschedule_remark').setValidators(Validators.required);
                this.formGroup.get('priority').setValidators(Validators.required);
            }
            this.formGroup.get('schedule_date').updateValueAndValidity();
            this.formGroup.get('schedule_time').updateValueAndValidity();
            this.formGroup.get('call_purpose').updateValueAndValidity();
            this.formGroup.get('reschedule_remark').updateValueAndValidity();
            this.formGroup.get('priority').updateValueAndValidity();

            if (this.record?.status == 'New') {
                this.formGroup.get('reactive_status').clearValidators();
                this.formGroup.get('feedback').setValidators(Validators.required);
            }

            if (this.record?.status == 'Active') {
                this.formGroup.get('reactive_status').clearValidators();
                this.formGroup.get('feedback').setValidators(Validators.required);
            }

            if (this.record?.status == 'Inactive') {
                this.reActive(this.formGroup.get('reactive_status'))
                this.formGroup.get('feedback').clearValidators();
                this.formGroup.get('reactive_status').setValidators(Validators.required);
            }
        });
        // this.assignBy()

        this.formGroup
            .get('assignfilter')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(200),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    // const filterReq = this.getFilterReq()
                    // filterReq['service_for'] = "lead_assigned";
                    // filterReq['Filter'] = value;
                    return this.employeeService.getEmployeeLeadAssignCombo(value);
                })
            )
            .subscribe({
                next: data => {
                    this.dataList = data;
                    // Sort array in asc order based on employee_name
                    this.dataList.sort((a, b) => {
                        if (a.employee_name < b.employee_name) {
                            return -1;
                        }
                        if (a.employee_name > b.employee_name) {
                            return 1;
                        }
                        return 0;
                    });

                    this.dataList = [];
                    this.dataList.push({
                        "id": "",
                        "employee_name": "Self",
                    })
                    data.forEach(employee => {
                        this.dataList.push(employee);
                    });
                    this.formGroup.get("call_assign_to").patchValue("");
                }
            });
    }

    public compareWith(v1: any, v2: any) {
        return v1 && v2 && v1.id === v2.id;
    }

    assignBy() {
        const filterReq = this.getFilterReq()
        filterReq['service_for'] = "lead_assigned";

        this.employeeService.getEmployeeList(filterReq).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;

                // Sort array in asc order based on employee_name
                this.dataList.sort((a, b) => {
                    if (a.employee_name < b.employee_name) {
                        return -1;
                    }
                    if (a.employee_name > b.employee_name) {
                        return 1;
                    }
                    return 0;
                });

                this.dataList = [];
                this.dataList.push({
                    "id": "",
                    "employee_name": "Self"
                })
                data.data.forEach(employee => {
                    this.dataList.push(employee);
                });
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true)
                this.isLoading = false;
            },
        });
    }

    public getTabsPermission(tab: string): boolean {
        if (tab == "detail")
            return Security.hasPermission(crmLeadPermissions.detailTabPermissions)
        if (tab == "feedback")
            return Security.hasPermission(crmLeadPermissions.feedbackTabPermissions)
    }

    public tabChanged(event: any): void {
        const tabName = event?.tab?.ariaLabel;
        this.tabNameStr = tabName;
        this.tabName = tabName;

        switch (tabName) {
            case 'detail':
                this.tab = 'detail';
                break;

            case 'feedback':
                this.tab = 'feedback';
                // if (this.isSecound) {
                //   this.audited.refreshItemsAudited()
                //   this.isSecound = false
                // }
                break;
        }
    }

    filterMobile(value: string) {
        this.cityService.getMobileCodeCombo(value).pipe(
            switchMap(MobileCodeList => {
                if (value) {
                    const mobilefilter = MobileCodeList.filter(item =>
                        (item.mobile_code?.toLowerCase().includes(value?.toLowerCase())) || (item.country_code?.toLowerCase().includes(value?.toLowerCase()))
                    );
                    return of(mobilefilter);
                } else {
                    return of(MobileCodeList);
                }
            })
        ).subscribe(res => {
            this.MobileCodeList.next(res);
        });
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
        this.formGroup.markAllAsTouched();
        if (!this.formGroup.valid) {
            this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.formGroup.markAllAsTouched();
            return;
        }

        if (this.readonly) {
            this.router.navigate([this.agentListRoute]);
            return;
        }
        const json = this.formGroup.getRawValue();
        this.disableBtn = true;

        if(this.recordAgentDialCallFlag == true){
            this.masterCallPurpose = this.record?.callPurpose ? this.record?.callPurpose : ""
        }

        const newJson = {
            master_call_purpose: this.masterCallPurpose,
            preferred_language: json?.preferred_language ? (json?.preferred_language) : "",
            // feedback: json?.feedback ? json?.feedback : "",
            feedback: (json?.reactive_status == 'Yes' || json?.reactive_status == 'No' || json?.reactive_status == 'No Answer')
          ? (json?.feedback ? json?.feedback : json?.reactive_status) : json?.feedback,
            service_offered_by_ta: json.service_offered_by_ta ? (json.service_offered_by_ta) : [],
            master_for: "agent_signup",
            master_id: this.record?.masterID ? this.record?.masterID : "",
            rm_remark: json?.rm_remark ? json?.rm_remark : "",
            reactive_reason: json?.reactive_reason ? json?.reactive_reason : "",
            reactive_status: json?.reactive_status == 'Yes' ? true : false,
            priority: (json?.priority && json?.is_call_rescheduled) ? json?.priority : "",
            is_call_rescheduled: json?.is_call_rescheduled ? json?.is_call_rescheduled : false,
            reschedule_remark: (json?.reschedule_remark && json.is_call_rescheduled) ? json?.reschedule_remark : "",
            call_purpose: (json?.call_purpose && json?.is_call_rescheduled) ? json?.call_purpose : "",
            call_assign_to: (json?.call_assign_to && json?.is_call_rescheduled) ? json?.call_assign_to : "",
            reschedule_date_time: (json?.schedule_date && json?.is_call_rescheduled) ? DateTime.fromJSDate(new Date(json.schedule_date)).toFormat('yyyy-MM-dd') + 'T' + json.schedule_time : "",
            crmId: this.record?.crmId ? this.record?.crmId : ""
        }

        this.crmService.createDialCall(newJson).subscribe({
            next: () => {
                this.router.navigate([this.agentListRoute]);
                this.disableBtn = false;
                this.matDialogRef.close(true);
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
