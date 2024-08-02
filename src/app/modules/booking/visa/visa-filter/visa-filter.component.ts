import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { dateRange } from 'app/common/const';
import { AgentService } from 'app/services/agent.service';
import { CommonUtils } from 'app/utils/commonutils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap, Observable } from 'rxjs';

@Component({
    selector: 'app-visa-filter',
    templateUrl: './visa-filter.component.html',
    styleUrls: ['./visa-filter.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        AsyncPipe,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        NgxMatSelectSearchModule,
        MatDatepickerModule,
        MatTooltipModule,
    ]
})
export class VisaFilterComponent {
    disableBtn: boolean = false;
    readonly: boolean = false;
    record: any = {};
    DR = dateRange;
    public FromDate: any;
    public ToDate: any;
    public dateRanges = [];
    statusList = ['All', 'Pending', 'Payment Confirmed', 'Payment Failed', 'Inprocess', 'Documents Rejected', 'Documents Revised', 'Applied', 'Success', 'Rejected'];

    constructor(
        public matDialogRef: MatDialogRef<VisaFilterComponent>,
        private builder: FormBuilder,
        private agentService: AgentService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        if (data)
            this.record = data;
        this.dateRanges = CommonUtils.valuesArray(dateRange);
    }

    title = "Filter Criteria"
    btnLabel = "Apply"
    formGroup: FormGroup;
    isfirst: boolean = true;
    fromList: any[] = [];
    toList: any[] = [];
    agentList: any[] = [];

    ngOnInit(): void {
        this.formGroup = this.builder.group({
            id: [''],
            agent_id: [''],
            agentfilter: [''],
            Status: [this.statusList[0]],
            date_: [''],
            date: [''],
            FromDate: [''],
            ToDate: ['']
        });

        this.formGroup.get('date').patchValue(dateRange.lastMonth);
        this.updateDate(dateRange.lastMonth)

        this.formGroup
            .get('agentfilter')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(200),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    return this.agentService.getAgentComboMaster(value, true);
                })
            )
            .subscribe({
                next: data => {
                    this.agentList = data
                    this.agentList = [];
                    this.agentList.push({ "id": "", "agency_name": "All" })
                    this.agentList.push(...data)
                    if (!this.record.agent_id)
                        this.formGroup.get("agent_id").patchValue(this.agentList[0]);
                }
            });

        if (this.record.agent_id) {
            this.formGroup.patchValue(this.record)
            // this.formGroup.get("agentfilter").patchValue(this.record.agent_id.agency_name);
            this.formGroup.get("agent_id").patchValue(this.record.agent_id);
        }
    }

    cancelDate(){
        this.formGroup.get('date_').setValue('');
    }

    public compareWith(v1: any, v2: any) {
        return v1 && v2 && v1.id === v2.id;
    }

    apply(): void {
        const json = this.formGroup.getRawValue();
        json.agent_id = json.agent_id
        json.date_ = json.date_
        json.Status = json.Status
        json.FromDate = new Date(this.formGroup.get('FromDate').value)
        json.ToDate = new Date(this.formGroup.get('ToDate').value)
        this.matDialogRef.close(json);
    }

    resetForm(){
        this.formGroup.reset();
        this.formGroup.get('date').patchValue(dateRange.lastMonth);
        this.formGroup.get("agent_id").patchValue(this.agentList[0]);
        this.formGroup.get("date_").patchValue('');
        this.formGroup.get('Status').patchValue(this.statusList[0]);
        this.formGroup.get('FromDate').patchValue(this.FromDate);
        this.formGroup.get('ToDate').patchValue(this.ToDate);
      }

    public updateDate(event: any): void {
        if (event === dateRange.today) {
            this.FromDate = new Date();
            this.ToDate = new Date();
            this.FromDate.setDate(this.FromDate.getDate());
            this.formGroup.get('FromDate').patchValue(this.FromDate);
            this.formGroup.get('ToDate').patchValue(this.ToDate);
        }
        else if (event === dateRange.last3Days) {
            this.FromDate = new Date();
            this.ToDate = new Date();
            this.FromDate.setDate(this.FromDate.getDate() - 3);
            this.formGroup.get('FromDate').patchValue(this.FromDate);
            this.formGroup.get('ToDate').patchValue(this.ToDate);
        }
        else if (event === dateRange.lastWeek) {
            this.FromDate = new Date();
            this.ToDate = new Date();
            const dt = new Date(); // current date of week
            const currentWeekDay = dt.getDay();
            const lessDays = currentWeekDay === 0 ? 6 : currentWeekDay - 1;
            const wkStart = new Date(new Date(dt).setDate(dt.getDate() - lessDays));
            const wkEnd = new Date(new Date(wkStart).setDate(wkStart.getDate() + 6));

            this.FromDate = wkStart;
            this.ToDate = new Date();
            this.formGroup.get('FromDate').patchValue(this.FromDate);
            this.formGroup.get('ToDate').patchValue(this.ToDate);
        }
        else if (event === dateRange.lastMonth) {
            this.FromDate = new Date();
            this.ToDate = new Date();
            this.FromDate.setDate(1);
            this.FromDate.setMonth(this.FromDate.getMonth());
            this.formGroup.get('FromDate').patchValue(this.FromDate);
            this.formGroup.get('ToDate').patchValue(this.ToDate);
        }
        else if (event === dateRange.last3Month) {
            this.FromDate = new Date();
            this.ToDate = new Date();
            this.FromDate.setDate(1);
            this.FromDate.setMonth(this.FromDate.getMonth() - 3);
            this.formGroup.get('FromDate').patchValue(this.FromDate);
            this.formGroup.get('ToDate').patchValue(this.ToDate);
        }
        else if (event === dateRange.last6Month) {
            this.FromDate = new Date();
            this.ToDate = new Date();
            this.FromDate.setDate(1);
            this.FromDate.setMonth(this.FromDate.getMonth() - 6);
            this.formGroup.get('FromDate').patchValue(this.FromDate);
            this.formGroup.get('ToDate').patchValue(this.ToDate);
        }
        else if (event === dateRange.setCustomDate) {
            this.FromDate = new Date();
            this.ToDate = new Date();
            this.formGroup.get('FromDate').patchValue(this.FromDate);
            this.formGroup.get('ToDate').patchValue(this.ToDate);
        }
    }
}
