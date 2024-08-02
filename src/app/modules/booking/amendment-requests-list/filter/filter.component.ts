import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FlightComponent } from '../../flight/flight/flight.component';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AgentService } from 'app/services/agent.service';
import { ToasterService } from 'app/services/toaster.service';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { dateRange } from 'app/common/const';
import { CommonUtils } from 'app/utils/commonutils';

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

  disableBtn: boolean = false
  readonly: boolean = false;
  record: any = {};

  agentfilterr: any;
  agent_id: any;
  agentList: any[] = [];

  SupplierList: any[] = [];

  DR = dateRange;
  public FromDate: any;
  public ToDate: any;
  public dateRanges = [];


  StatusList = ['All', 'Pending', 'Inprocess', 'Cancelled','Confirm', 'Rejected', 'Completed', 'Quotation Sent','Partial Cancellation Pending', 'Expired'];
  TypeList = ['All', 'Cancellation Quotation', 'Instant Cancellation', 'Full Refund', 'Reissue Quotation', 'Miscellaneous', 'No Show', 'Void', 'Correction Quotation', 'Wheel Chair', 'Meal Quotation(SSR)', 'Baggage Quotation(SSR)'];

  constructor(
    public matDialogRef: MatDialogRef<FlightComponent>,
    private builder: FormBuilder,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    private kycDocumentService: KycDocumentService,
    private agentService: AgentService,
    private alertService: ToasterService,
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

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      agent_id: [''],
      agentfilter: [''],
      supplier_id: [''],
      supplierfilter: [''],
      status: [this.StatusList[0]],
      type: [this.TypeList[0]],
      FromDate: [''],
      ToDate: [''],
      date: [''],

    });

    this.formGroup.get('date').patchValue(dateRange.last3Month);
    this.updateDate(dateRange.last3Month)

    //supplier combo
    this.formGroup
      .get('supplierfilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value: any) => {
          return this.kycDocumentService.getSupplierCombo(value, 'Airline');
        })
      )
      .subscribe((data) => {
        this.SupplierList = [];
        this.SupplierList.push({
          "id": "",
          "company_name": "All"
        })
        this.SupplierList.push(...data);

        if (!this.record.supplier_id)
          this.formGroup.get("supplier_id").patchValue(this.SupplierList[0]);
      });

    //agent combo
    this.formGroup
      .get('agentfilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((value: any) => {
          return this.agentService.getAgentComboMaster(value,true);
        })
      )
      .subscribe({
        next: data => {
          this.agentList = [];
          this.agentList.push({ "id": "", "agency_name": "All" })
          this.agentList.push(...data)

          if (!this.record.agent_id)
            this.formGroup.get("agent_id").patchValue(this.agentList[0]);
        }
      });

    if (this.record.agent_id) {
      this.formGroup.patchValue(this.record)

      this.formGroup.get("agentfilter").patchValue(this.record.agent_id.agency_name);
      this.formGroup.get("agent_id").patchValue(this.record.agent_id);
    }

    if (this.record) {
      this.formGroup.patchValue(this.record)
    }

  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

  apply(): void {
    const json = this.formGroup.getRawValue();
    json.agent_id = json.agent_id
    json.supplier_id = json.supplier_id
    json.FromDate = new Date(this.formGroup.get('FromDate').value)
    json.ToDate = new Date(this.formGroup.get('ToDate').value)
    this.matDialogRef.close(json);
  }

  resetForm() {
    var date = new Date()
    date.setDate(1)
    date.setMonth(date.getMonth());

    this.formGroup.reset();
    this.formGroup.get('status').patchValue(this.StatusList[0]);
    this.formGroup.get("agent_id").patchValue(this.agentList[0]);
    this.formGroup.get("type").patchValue(this.TypeList[0]);
    this.formGroup.get("supplier_id").patchValue(this.SupplierList[0]);
    this.formGroup.get('FromDate').patchValue(date);
    this.formGroup.get('ToDate').patchValue(new Date());
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
