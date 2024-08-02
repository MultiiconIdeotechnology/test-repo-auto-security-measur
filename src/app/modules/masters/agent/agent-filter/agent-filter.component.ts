import { Component, Inject } from '@angular/core';
import { NgIf, NgFor, CommonModule, NgClass, AsyncPipe } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    startWith,
    switchMap,
} from 'rxjs';
import { EmployeeService } from 'app/services/employee.service';
import { CurrencyService } from 'app/services/currency.service';
import { CityService } from 'app/services/city.service';
import { MarkupprofileService } from 'app/services/markupprofile.service';
import { KycService } from 'app/services/kyc.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AgentService } from 'app/services/agent.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
    selector: 'app-agent-filter',
    templateUrl: './agent-filter.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        AsyncPipe,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        NgxMatSelectSearchModule,
        MatIconModule,
        MatMenuModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatInputModule,
        MatButtonModule,
        MatTooltipModule,
        RouterOutlet,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatTabsModule,
        MatCheckboxModule,
    ],
})
export class AgentFilterComponent {
    filterForm: FormGroup;
    readonly: boolean;
    record: any = {};
    title = 'Filter Criteria';
    currencyListAll: any[] = [];
    currencyList: any[] = [];
    agentProfileList: any[] = [];
    AllprofileList: any[] = [];
    employeeList: any[] = [];
    cityList: any[] = [];
    profileList: any[] = [];
    statusList = ['All', 'New', 'Active','Inactive','Dormant',];

    constructor(
        public matDialogRef: MatDialogRef<AgentFilterComponent>,
        private builder: FormBuilder,
        private employeeService: EmployeeService,
        private currencyService: CurrencyService,
        public cityService: CityService,
        private markupprofileService: MarkupprofileService,
        private kycService: KycService,
        public agentService: AgentService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        if (data) this.record = data;
    }

    ngOnInit(): void {
        this.filterForm = this.builder.group({
            relationmanagerId: [''],
            empfilter: [''],
            currencyId: [''],
            currency_filter: [''],
            cityId: [''],
            cityfilter: [''],
            markupProfileId: [''],
            profile_name: [''],
            profilefilter: [''],
            kycProfileId: [''],
            kycfilter: [''],
            blocked: ['All'],
            Status: [this.statusList[0]],
        });

        this.filterForm.patchValue(this.data);

        this.filterForm.patchValue(this.record)

        this.filterForm
            .get('empfilter')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(400),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    return this.employeeService.getemployeeCombo(value);
                })
            )
            .subscribe((data) => {
                this.employeeList = [];
                this.employeeList.push({
                    id: '',
                    employee_name: 'All',
                });
                this.employeeList.push(...data);

                if (!this.record.relationmanagerId)
                    this.filterForm
                        .get('relationmanagerId')
                        .patchValue(this.employeeList[0]);
            });

        this.currencyService.getcurrencyCombo().subscribe({
            next: (res) => {
                this.currencyListAll = [
                    { id: '', currency_short_code: 'All' },
                    ...res,
                ];
                this.currencyList = [...this.currencyListAll];

                if (!this.record.currencyId)
                    this.filterForm.get('currencyId').patchValue(this.currencyList[0]);
            },
        });

        this.filterForm
            .get('currency_filter')
            .valueChanges.subscribe((data) => {
                this.currencyList = [
                    ...this.currencyListAll.filter((x) =>
                        x.currency_short_code
                            .toLowerCase()
                            .includes(data.toLowerCase())
                    ),
                ];
            });

        this.filterForm
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
            .subscribe((data) => {
                this.cityList = [];
                this.cityList.push({
                    id: '',
                    display_name: 'All',
                });
                this.cityList.push(...data);

                if (!this.record.cityId)
                    this.filterForm.get('cityId').patchValue(this.cityList[0]);
            });

        this.filterForm
            .get('profilefilter')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(200),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    return this.markupprofileService.getMarkupProfileCombo(
                        value
                    );
                })
            )
            .subscribe((data) => {
                this.profileList = [];
                this.profileList.push({
                    id: '',
                    profile_name: 'All',
                });
                this.profileList.push(...data);

                if (!this.record.markupProfileId)
                    this.filterForm
                        .get('markupProfileId')
                        .patchValue(this.profileList[0]);
            });

        this.kycService.getkycprofileCombo('agent').subscribe({
            next: (res) => {
                this.agentProfileList = [
                    { id: '', profile_for: 'Agent', profile_name: 'All' },
                    ...res,
                ];
                this.AllprofileList = [...this.agentProfileList];

                if (!this.record.kycProfileId)
                    this.filterForm
                        .get('kycProfileId')
                        .patchValue(this.agentProfileList[0]);
            },
        })

        this.filterForm.get('kycfilter').valueChanges.subscribe((data) => {
            this.agentProfileList = this.AllprofileList.filter((x) =>
                x.profile_name.toLowerCase().includes(data.toLowerCase())
            );
        });

        if (this.record.relationmanagerId) {
            this.filterForm
                .get('empfilter')
                .patchValue(this.record.relationmanagerId.employee_name);
        }

        if (this.record.currencyId) {
            this.filterForm
                .get('currency_filter')
                .patchValue(this.record.currencyId.currency_short_code);
        }

        if (this.record.cityId) {
            this.filterForm
                .get('cityfilter')
                .patchValue(this.record.cityId.display_name);
        }

        if (this.record.markupProfileId) {
            this.filterForm
                .get('profilefilter')
                .patchValue(this.record.markupProfileId.profile_name);
        }

        if (this.record.kycProfileId) {
            this.filterForm
                .get('kycfilter')
                .patchValue(this.record.kycProfileId.profile_name);
        }
    }

    public compareWith(v1: any, v2: any) {
        return v1 && v2 && v1.id === v2.id;
    }

    ngSubmit(): void {
        const json = this.filterForm.getRawValue();
        json.relationmanagerId = json.relationmanagerId;
        json.currencyId = json.currencyId;
        json.cityId = json.cityId;
        json.markupProfileId = json.markupProfileId;
        json.kycProfileId = json.kycProfileId;
        this.matDialogRef.close(json);
    }
}
