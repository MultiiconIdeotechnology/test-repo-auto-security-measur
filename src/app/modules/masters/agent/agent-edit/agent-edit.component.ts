import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
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
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { Routes } from 'app/common/const';
import { AgentService } from 'app/services/agent.service';
import { CityService } from 'app/services/city.service';
import { CompnyService } from 'app/services/compny.service';
import { PspSettingService } from 'app/services/psp-setting.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject, filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
    selector: 'app-agent-edit',
    templateUrl: './agent-edit.component.html',
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
        MatDividerModule
    ]
})
export class AgentEditComponent {
    readonly: boolean = false;
    record: any = {};
    btnTitle: string = 'Create';
    fieldList: {};

    agentListRoute = Routes.customers.agent_route;
    leadListRoute = Routes.customers.lead_route;
    disableBtn: boolean = false;
    billingCopmanyList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    cityList: any[] = [];
    MobileCodeList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    mobilecodelist: any[] = [];
    statelist: any[] = [];
    formGroup: FormGroup;
    title = "Edit Agent"
    btnLabel = "Submit"
    companyList: any[] = [];
    first: boolean = true;
    lead: boolean = false;

    constructor(
        public matDialogRef: MatDialogRef<AgentEditComponent>,
        public formBuilder: FormBuilder,
        public router: Router,
        private companyService: CompnyService,
        public route: ActivatedRoute,
        public cityService: CityService,
        private pspsettingService: PspSettingService,
        public agentService: AgentService,
        public alertService: ToasterService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        this.record = data?.data ?? {}
    }

    public compareWith(v1: any, v2: any) {
        return v1 && v2 && v1.id === v2.id;
    }

    ngOnInit(): void {
        this.formGroup = this.formBuilder.group({
            id: [''],
            agency_name: [''],
            billing_company_id: [''],
            companyfilter: [''],
            agent_id: [''],
            agentfilter: [''],
            contact_person: [''],
            contact_person_number: [''],
            contact_person_email: [''],
            mobilefilter: [''],
            pan_number: [''],
            gst_number: [''],
            address_line1: [''],
            address_line2: [''],
            pincode: [''],
            mobile_code: [''],
            mobileCodefilter: [''],
            city_id: [''],
            cityfilter: ['']
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
                    this.companyList = data;
                }
            });

        this.formGroup.get('cityfilter').valueChanges.pipe(
            filter(search => !!search),
            startWith(''),
            debounceTime(400),
            distinctUntilChanged(),
            switchMap((value: any) => {
                return this.companyService.getCityCombo(value);
            })
        ).subscribe({
            next: data => {
                this.cityList = data;
            }
        });

        this.cityService.getMobileCodeCombo().subscribe((res: any) => {
            this.MobileCodeList.next(res);
            this.mobilecodelist = res;
        });

        if (this.record.id) {
            this.formGroup.patchValue(this.record);
        }
        else {
            this.formGroup.get('mobile_code').setValue('91');
        }

        if (this.record.id) {
            this.agentService.getAgentDetailList(this.record.id).subscribe({
                next: (res) => {
                    this.formGroup.patchValue(res[0])
                    this.formGroup.get("contact_person").patchValue(res[0]?.contactPerson);
                    this.formGroup.get("contact_person_email").patchValue(res[0]?.contactPersonEmail);
                    this.formGroup.get("billing_company_id").patchValue(res[0]?.billingCompanyId);
                    this.formGroup.get("companyfilter").patchValue(res[0]?.billingCompanyName);
                    this.formGroup.get("city_id").patchValue(res[0]?.cityId);
                    this.formGroup.get("cityfilter").patchValue(res[0]?.cityName);
                    this.formGroup.get("mobile_code").patchValue(res[0]?.mobileCode);
                    this.formGroup.get("contact_person_number").patchValue(res[0]?.contactPersonNumber);
                    this.formGroup.get("address_line1").patchValue(res[0]?.addressLine1);
                    this.formGroup.get("address_line2").patchValue(res[0]?.addressLine2);
                    this.formGroup.get("pincode").patchValue(res[0]?.pincode);
                    this.formGroup.get("pan_number").patchValue(res[0]?.panNumber);
                    this.formGroup.get("agency_name").patchValue(res[0]?.agencyName);
                    this.formGroup.get("gst_number").patchValue(res[0]?.gstNumber);
                }
            });
        }
    }

    filterMobileCode(value: string) {
        const Filter = this.mobilecodelist.filter(
            (x) =>
                x.country_code.toLowerCase().includes(value.toLowerCase()) ||
                x.mobile_code.toLowerCase().includes(value.toLowerCase())
        );
        this.MobileCodeList.next(Filter);
    }

    submit(): void {
        const json = this.formGroup.getRawValue();
        this.disableBtn = true
        const newJson = {
            id: this.record?.id,
            billing_company_id: json.billing_company_id ? json.billing_company_id : "",
            agency_name: json.agency_name ? json.agency_name : "",
            city_id: json.city_id ? json.city_id : "",
            address_line1: json.address_line1 ? json.address_line1 : "",
            address_line2: json.address_line2 ? json.address_line2 : "",
            pincode: json.pincode ? json.pincode : "",
            contact_person: json.contact_person ? json.contact_person : "",
            contact_person_number: json.contact_person_number ? json.contact_person_number.toString() : "",
            contact_person_email: json.contact_person_email ? json.contact_person_email : "",
            gst_number: json.gst_number ? json.gst_number : "",
            pan_number: json.pan_number ? json.pan_number : "",
            mobile_code: json.mobile_code ? json.mobile_code : ""
        }

        this.agentService.agentEdit(newJson).subscribe({
            next: () => {
                this.alertService.showToast('success', "Agent has been Modified!", "top-right", true);
                this.router.navigate([this.agentListRoute])
                this.matDialogRef.close(true);
                this.disableBtn = false;
            }, error: err => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.disableBtn = false;
            }
        })
    }
}
