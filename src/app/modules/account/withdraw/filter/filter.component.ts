import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { dateRange } from 'app/common/const';
import { AgentService } from 'app/services/agent.service';
import { ToasterService } from 'app/services/toaster.service';
import { WithdrawService } from 'app/services/withdraw.service';
import { CommonUtils } from 'app/utils/commonutils';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
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
    MatTooltipModule
  ]
})
export class FilterComponent {

  formGroup: FormGroup;
  agentList: any[] = [];
  DR = dateRange;
  public FromDate: any;
  public ToDate: any;
  public dateRanges = [];

  constructor(
    public matDialogRef: MatDialogRef<FilterComponent>,
    public formBuilder: FormBuilder,
    public withdrawService: WithdrawService,
    public agentService: AgentService,
    public alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    // this.record = data?.data ?? {};
    this.dateRanges = CommonUtils.valuesArray(dateRange);
  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      agent_id: [''],
      agentfilter: [''],
      date: [''],
      FromDate: new Date(),
      ToDate: new Date(),
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
          return this.agentService.getAgentCombo(value);
        })
      )
      .subscribe({
        next: data => {
          this.agentList = data
        }
      });

    this.formGroup.patchValue(this.data);
    this.formGroup.get('agentfilter').patchValue(this.data.agency_name);
    this.formGroup.get('agent_id').patchValue({ id: this.data.agent_id, agency_name: this.data.agency_name });

  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

  apply(): void {
    const json = this.formGroup.getRawValue();
    json['FromDate'] = DateTime.fromJSDate(new Date(json.FromDate)).toFormat('yyyy-MM-dd').toString()
    json['ToDate'] = DateTime.fromJSDate(new Date(json.ToDate)).toFormat('yyyy-MM-dd').toString()
    json['agency_name'] = json.agent_id.agency_name
    json['agent_id'] = json.agent_id.id
    this.matDialogRef.close(json);
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

  cancle(){
    this.formGroup.get('date').patchValue('Today');
    this.updateDate(this.formGroup.get('date').value);
  }

}
