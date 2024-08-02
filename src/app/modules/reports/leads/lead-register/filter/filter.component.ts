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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { dateRange, dateRangeLeadRegister } from 'app/common/const';
import { AgentService } from 'app/services/agent.service';
import { EmployeeService } from 'app/services/employee.service';
import { LeadsRegisterService } from 'app/services/leads-register.service';
import { CommonUtils } from 'app/utils/commonutils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject, filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

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
    MatDatepickerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    NgxMatSelectSearchModule,
    MatSnackBarModule,

  ]
})
export class FilterComponent {

  disableBtn: boolean = false;
  readonly: boolean = false;
  record: any = {};
  DR = dateRangeLeadRegister;
  public FromDate: any;
  public ToDate: any;
  public dateRanges = [];


  StatusList: any[] = [
    { value: 'All', viewValue: 'All' },
    { value: 'New', viewValue: 'New' },
    { value: 'Live', viewValue: 'Live' },
    { value: 'Converted', viewValue: 'Converted' },
    { value: 'Dead', viewValue: 'Dead' },
  ];

  priorityText: any[] = [
    { value: 'All', viewValue: 'All' },
    { value: 'High', viewValue: 'High' },
    { value: 'Medium', viewValue: 'Medium' },
    { value: 'Low', viewValue: 'Low' },
  ];

  leadType: any[] = [
    { value: 'All', viewValue: 'All' },
    { value: 'B2B Partner', viewValue: 'B2B Partner' },
    { value: 'WL', viewValue: 'WL' },
    { value: 'Corporate', viewValue: 'Corporate' },
    { value: 'Supplier', viewValue: 'Supplier' },
  ];

  leadSource: any[] = [
    { value: 'All', viewValue: 'All' },
    { value: 'Website', viewValue: 'Website' },
    { value: 'B2B Login', viewValue: 'B2B Login' },
    { value: 'Social Media', viewValue: 'Social Media' },
    { value: 'Expo', viewValue: 'Expo' },
  ];

  kycList: any[] = [
    { value: 'All', viewValue: 'All' },
    { value: 'Yes', viewValue: 'Yes' },
    { value: 'No', viewValue: 'No' },
  ]

  // employeeList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  employeeList: any[] = [];
  leadList: any[] = [];



  constructor(
    public matDialogRef: MatDialogRef<FilterComponent>,
    private builder: FormBuilder,
    private employeeService: EmployeeService,
    private leadsRegisterService: LeadsRegisterService,
    private agentService: AgentService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    if (data)
      this.record = data;
      this.dateRanges = CommonUtils.valuesArray(dateRangeLeadRegister);
  }

  title = "Filter Criteria"
  btnLabel = "Apply"
  formGroup: FormGroup;
  isfirst: boolean = true;

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      lead_type: [''],
      lead_status: [''],
      relationship_manager_id: [''],
      empfilter: [''],
      leadfilter: [''],
      KYC_Status: [''],
      priority_text: [''],
      lead_source: [''],
      date: [''],
      FromDate: [null],
      ToDate: [null]
    });
    this.dateRanges = CommonUtils.valuesArray(dateRangeLeadRegister);

    this.formGroup.get('date').patchValue(dateRangeLeadRegister.all);
    this.updateDate(dateRangeLeadRegister.all)

    // this.formGroup.get('date').patchValue(dateRange.today);
    // this.updateDate(dateRange.today)

    this.formGroup.get('lead_type').patchValue('All')
    this.formGroup.get('lead_status').patchValue('All')
    this.formGroup.get('lead_source').patchValue('All')
    this.formGroup.get('priority_text').patchValue('All')
    this.formGroup.get('KYC_Status').patchValue('All')
    // this.formGroup.get('date').patchValue('All')

    this.formGroup.get('empfilter').valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.employeeService.getemployeeCombo(value);
      })
    ).subscribe({
      next: data => {
        this.employeeList = data,
        this.employeeList = [],
          this.employeeList.push({
            "id": "",
            "employee_name": "All"
          })
        this.employeeList.push(...data);

        if (!this.record.relationship_manager_id) {
          this.formGroup.get('relationship_manager_id').patchValue(this.employeeList[0]);
        }
      }
    });

    //lead source
    this.formGroup.get('leadfilter').valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.leadsRegisterService.leadSouceCombo(value);
      })
    ).subscribe({
      next: data => {
        this.leadList = data,
        this.leadList = [],
          this.leadList.push({
            "id": "",
            "lead_source": "All"
          })
        this.leadList.push(...data);

        if (!this.record.lead_source) {
          this.formGroup.get('lead_source').patchValue(this.leadList[0]);
        }
      }
    });

    if (this.record) {
      this.formGroup.patchValue(this.record)
    }

    if (this.record.relationship_manager_id) {
      // this.formGroup.get('empfilter').patchValue(this.record.relation_manager_name);
      this.formGroup.get('relationship_manager_id').patchValue(this.record.relationship_manager_id);
    }

  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

  apply(): void {
    const json = this.formGroup.getRawValue();
    this.matDialogRef.close(json);
  }

  public updateDate(event: any): void {
    if (event === dateRangeLeadRegister.all) {
        this.FromDate = null;
        this.ToDate = null;
        // this.FromDate.setDate(null);
        this.formGroup.get('FromDate').patchValue(this.FromDate);
        this.formGroup.get('ToDate').patchValue(this.ToDate);
      }
    if (event === dateRangeLeadRegister.today) {
      this.FromDate = new Date();
      this.ToDate = new Date();
      this.FromDate.setDate(this.FromDate.getDate());
      this.formGroup.get('FromDate').patchValue(this.FromDate);
      this.formGroup.get('ToDate').patchValue(this.ToDate);
    }
    else if (event === dateRangeLeadRegister.last3Days) {
      this.FromDate = new Date();
      this.ToDate = new Date();
      this.FromDate.setDate(this.FromDate.getDate() - 3);
      this.formGroup.get('FromDate').patchValue(this.FromDate);
      this.formGroup.get('ToDate').patchValue(this.ToDate);
    }
    else if (event === dateRangeLeadRegister.lastWeek) {
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
    else if (event === dateRangeLeadRegister.lastMonth) {
      this.FromDate = new Date();
      this.ToDate = new Date();
      this.FromDate.setDate(1);
      this.FromDate.setMonth(this.FromDate.getMonth());
      this.formGroup.get('FromDate').patchValue(this.FromDate);
      this.formGroup.get('ToDate').patchValue(this.ToDate);
    }
    else if (event === dateRangeLeadRegister.last3Month) {
      this.FromDate = new Date();
      this.ToDate = new Date();
      this.FromDate.setDate(1);
      this.FromDate.setMonth(this.FromDate.getMonth() - 3);
      this.formGroup.get('FromDate').patchValue(this.FromDate);
      this.formGroup.get('ToDate').patchValue(this.ToDate);
    }
    else if (event === dateRangeLeadRegister.last6Month) {
      this.FromDate = new Date();
      this.ToDate = new Date();
      this.FromDate.setDate(1);
      this.FromDate.setMonth(this.FromDate.getMonth() - 6);
      this.formGroup.get('FromDate').patchValue(this.FromDate);
      this.formGroup.get('ToDate').patchValue(this.ToDate);
    }
    else if (event === dateRangeLeadRegister.setCustomDate) {
      this.FromDate = new Date();
      this.ToDate = new Date();
      this.formGroup.get('FromDate').patchValue(this.FromDate);
      this.formGroup.get('ToDate').patchValue(this.ToDate);
    }
  }
}
