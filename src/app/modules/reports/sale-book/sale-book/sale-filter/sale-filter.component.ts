import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
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
import { FlightTabService } from 'app/services/flight-tab.service';
import { PspSettingService } from 'app/services/psp-setting.service';
import { CommonUtils } from 'app/utils/commonutils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-sale-filter',
  templateUrl: './sale-filter.component.html',
  styleUrls: ['./sale-filter.component.scss'],
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
export class SaleFilterComponent {

  supplierListAll: any[] = [];
  supplierList: any[] = [];
  SupplierList: any[] = [];
  allVal = {
    "id": "all",
    "company_name": "All"
  };

  disableBtn: boolean = false;
  readonly: boolean = false;
  record: any = {};
  DR = dateRange;
  public FromDate: any;
  public ToDate: any;
  public dateRanges = [];
  dateBy = [{value:'BookingDate', name:'Booking Date'},{value:'InvoiceDate', name:'Invoice Date'},{value:'TravelDate', name:'Travel Date'}];
  ServicesBy = [{value:'All', name:'All'},{value:'Airline', name:'Airline'},{value:'Hotel', name:'Hotel'},{value:'Bus', name:'Bus'},{value:'Visa', name:'Visa'},{value:'Insurance', name:'Insurance'}, {value:'Tech Product', name:'Tech Product'}, {value:'OSB', name:'OSB'}];

  constructor(
    public matDialogRef: MatDialogRef<SaleFilterComponent>,
    private builder: FormBuilder,
    private pspsettingService: PspSettingService,
    private flighttabService: FlightTabService,
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
  compnyList: any[] = [];

  vaalchange() {
    var alldt = this.formGroup.get('supplier_id').value.filter(x => x.id != "all");
    this.formGroup.get('supplier_id').patchValue(alldt);

  }

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      filter_date_by: [''],
      agent_id: [''],
      agentfilter: [''],
      billing_company_id: [''],
      companyfilter: [''],
      service: [''],
      date: [''],
      FromDate: [''],
      ToDate: [''],
      supplier_id: [''],
      supplierfilter: [''],
    });

    this.formGroup.get('filter_date_by').patchValue('BookingDate');
    this.formGroup.get('service').patchValue('All');
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
          this.agentList = [];
          this.agentList.push({ "id": "", "agency_name": "All" })
          this.agentList.push(...data)
          if (!this.record.agent_id)
            this.formGroup.get("agent_id").patchValue(this.agentList[0]);
        }
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
          this.compnyList = data
          this.compnyList = [];
          this.compnyList.push({ "id": "", "company_name": "All" })
          this.compnyList.push(...data)
          if (!this.record.billing_company_id)
          this.formGroup.get("billing_company_id").patchValue(this.compnyList[0]);
        }
      });

      /******Supplier Combo*******/
      this.flighttabService.getSupplierBoCombo('').subscribe({
        next: (res) => {
          this.supplierListAll = res;
          this.SupplierList.push(...res);
          // this.formGroup.get('supplier_id').patchValue(this.SupplierList.find(x => x.company_name.includes("All")).id)

        },
      });

      this.formGroup.get('supplierfilter').valueChanges.subscribe(data => {
        this.SupplierList = this.supplierListAll
        this.SupplierList = this.supplierListAll.filter(x => x.company_name.toLowerCase().includes(data.toLowerCase()));
      })

    if (this.record.agent_id) {
        this.formGroup.patchValue(this.record)
        this.formGroup.get("agentfilter").patchValue(this.record.agent_id.agency_name);
        this.formGroup.get("agent_id").patchValue(this.record.agent_id);

      }

    if (this.record) {
      this.formGroup.get('supplier_id').patchValue(this.record.supplier_id);
    }

  }

  cancelDate() {
    this.formGroup.get('date_').setValue('');
  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

  apply(): void {
    const json = this.formGroup.getRawValue();
    json.agent_id = json.agent_id
    json.date = json.date
    json.billing_company_id = json.billing_company_id
    json.service = json.service
    json.filter_date_by = json.filter_date_by
    json.FromDate = new Date(this.formGroup.get('FromDate').value)
    json.ToDate = new Date(this.formGroup.get('ToDate').value)
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

}
