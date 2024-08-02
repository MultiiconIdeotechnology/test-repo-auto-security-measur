import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { Routes } from 'app/common/const';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { module_name } from 'app/security';
import { CityService } from 'app/services/city.service';
import { CrmService } from 'app/services/crm.service';
import { DesignationService } from 'app/services/designation.service';
import { EmployeeService } from 'app/services/employee.service';
import { ToasterService } from 'app/services/toaster.service';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { ReplaySubject, switchMap, of, distinctUntilChanged, debounceTime, startWith, filter } from 'rxjs';

@Component({
    selector: 'app-crm-schedule-call-entry',
    templateUrl: './schedule-call-entry.component.html',
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
    ]
})
export class CRMScheduleCallEntryComponent extends BaseListingComponent
    implements OnDestroy {
    readonly: boolean = false;
    record: any = {};
    btnTitle: string = 'Create';
    fieldList: {};
    leadListRoute = Routes.crm.lead_route;
    disableBtn: boolean = false;
    formGroup: FormGroup;
    title = "Schedule Call"
    btnLabel = "Submit"
    cityList: any[] = [];
    first: boolean = true;
    MobileCodeList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    dataList = [];
    todayDateTime = new Date();

    feedbackList: any[] =
        [
            { value: 'Positive', viewValue: 'Positive' },
            { value: 'Negative', viewValue: 'Negative' },
            { value: 'No Answer', viewValue: 'No Answer' }
        ];

    purposeList: any[] =
        [
            { value: 'Demo', viewValue: 'Demo' },
            { value: 'Query', viewValue: 'Query' },
            { value: 'Follow-up', viewValue: 'Follow-up' }
        ];


    constructor(
        public matDialogRef: MatDialogRef<CRMScheduleCallEntryComponent>,
        public formBuilder: FormBuilder,
        public cityService: CityService,
        public router: Router,
        private employeeService: EmployeeService,
        public route: ActivatedRoute,
        private crmService: CrmService,
        public designationService: DesignationService,
        public alertService: ToasterService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        super(module_name.scheduleCall);
        this.record = data?.data ?? {}
    }

    ngOnInit(): void {
        this.formGroup = this.formBuilder.group({
            id: [''],
            is_call_rescheduled: [true],
            call_assign_to: [''],
            reschedule_date_time: [''],
            schedule_date: ['', Validators.required],
            schedule_time: ['', Validators.required],
            call_purpose: ['', Validators.required],
            reschedule_remark: ['', Validators.required],
            assignfilter: [''],
        });

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
        // this.assignBy();
    }

    assignBy() {
        const filterReq = this.getFilterReq()
        filterReq['service_for'] = "lead_assigned";

        this.employeeService.getEmployeeList(filterReq).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
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
        // const newJson = {
        //     is_call_rescheduled: true,
        //     call_assign_to: (json?.call_assign_to && json?.is_call_rescheduled) ? json?.call_assign_to : "",
        //     reschedule_date_time: (json?.schedule_date && json?.is_call_rescheduled ) ? DateTime.fromJSDate(new Date(json.schedule_date)).toFormat('yyyy-MM-dd') + 'T' + json.schedule_time : "",
        //     call_purpose:  (json?.call_purpose && json?.is_call_rescheduled) ? json?.call_purpose : "",
        //     reschedule_remark: (json?.reschedule_remark && json.is_call_rescheduled) ? json?.reschedule_remark : ""
        // }

        const newJson = {
            master_for: "lead_master",
            master_id: this.record?.id ? this.record?.id : "",
            feedback: this.record?.last_call_feedback ? this.record?.last_call_feedback : "",
            preferred_language: "",
            reactive_status: false,
            is_call_rescheduled: true,
            call_assign_to: (json?.call_assign_to && json?.is_call_rescheduled) ? json?.call_assign_to : "",
            reschedule_date_time: (json?.schedule_date && json?.is_call_rescheduled) ? DateTime.fromJSDate(new Date(json.schedule_date)).toFormat('yyyy-MM-dd') + 'T' + json.schedule_time : "",
            call_purpose: (json?.call_purpose && json?.is_call_rescheduled) ? json?.call_purpose : "",
            reschedule_remark: (json?.reschedule_remark && json.is_call_rescheduled) ? json?.reschedule_remark : "",
            priority_text: (json?.is_call_rescheduled) ? this.record?.priority_text : "",
            priority_id: (json?.is_call_rescheduled) ? this.record?.priority_id : ""
        }
        this.crmService.createScheduleCall(newJson).subscribe({
            next: () => {
                this.router.navigate([this.leadListRoute]);
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
