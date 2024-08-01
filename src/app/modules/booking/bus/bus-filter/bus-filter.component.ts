import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { dateRange } from 'app/common/const';
import { AgentService } from 'app/services/agent.service';
import { BusService } from 'app/services/bus.service';
import { CurrencyRoeService } from 'app/services/currency-roe.service';
import { FlightTabService } from 'app/services/flight-tab.service';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { LedgerService } from 'app/services/ledger.service';
import { ToasterService } from 'app/services/toaster.service';
import { CommonUtils } from 'app/utils/commonutils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap, Observable } from 'rxjs';

@Component({
  selector: 'app-bus-filter',
  templateUrl: './bus-filter.component.html',
  styleUrls: ['./bus-filter.component.scss'],
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
export class BusFilterComponent {

  disableBtn: boolean = false
  readonly: boolean = false;
  record: any = {};
  DR = dateRange;
  public FromDate: any;
  public ToDate: any;
  public dateRanges = [];

  statusList = ['All', 'Payment Failed', 'Waiting for Payment', 'Booking Failed', 'Confirmation Pending', 'Transaction Failed', 'Pending', 'Failed', 'Confirmed', 'Cancelled'];

  constructor(
    public matDialogRef: MatDialogRef<BusFilterComponent>,
    private builder: FormBuilder,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    private flighttabService: FlightTabService,
    private agentService: AgentService,
    private currencyRoeService: CurrencyRoeService,
    private kycDocumentService: KycDocumentService,
    private ledgerService:LedgerService,
    private busService: BusService,
    private alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    if(data)
    this.record = data;
    this.dateRanges = CommonUtils.valuesArray(dateRange);
  }

  title = "Filter Criteria"
  btnLabel = "Apply"
  formGroup: FormGroup;
  isfirst : boolean = true;

  SupplierList: any[] =[];
  fromList: any[]=[];
  toList: any[]=[];
  agentList:any[]=[];

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      agent_id: [''],
      agentfilter: [''],
      Status: [this.statusList[0]],
      supplierId: [''],
      supplierfilter: [''],

      From:[''],
      To:[''],
      fromfilter: [''],
      tofilter: [''],

      date: [''],
      FromDate: [''],
      ToDate: [''],
      
    });

    this.formGroup.get('date').patchValue(dateRange.lastMonth);
    this.updateDate(dateRange.lastMonth)

    this.busService.getBusCityCombo("").subscribe((data)  => {

      this.fromList= []
      this.fromList.push({"id": "", "display_name": "All"})
      this.fromList.push(...data)
      if(!this.record.From)
      this.formGroup.get("From").patchValue(this.fromList[0]);

      this.toList= [];
      this.toList.push({"id": "", "display_name": "All"})
      this.toList.push(...data)
      if(!this.record.To)
      this.formGroup.get("To").patchValue(this.toList[0]);
    });

    ///////////////////supplier combo
      this.formGroup
      .get('supplierfilter')
      .valueChanges.pipe(
          filter((search) => !!search),
          startWith(''),
          debounceTime(400),
          distinctUntilChanged(),
          switchMap((value: any) => {
              return this.kycDocumentService.getSupplierCombo(value,'Bus');
          })
      )
      .subscribe((data) =>{
        this.SupplierList =[];
        this.SupplierList.push({
          "id": "",
          "company_name": "All"
        })
        this.SupplierList.push(...data);

      if(!this.record.supplierId)
      this.formGroup.get("supplierId").patchValue(this.SupplierList[0]);
      });
    
    ///////////////////bus combo
          this.formGroup
            .get('fromfilter')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(400),
                distinctUntilChanged(),
                switchMap((value: any) => {
                  if(this.isfirst == true){
                    return new Observable<any[]>();
                  }else
                    return this.busService.getBusCityCombo(value);
                })
            )
            .subscribe((data) =>{ 
              this.fromList = []
              this.fromList.push({"id": "", "display_name": "All"})
              this.fromList.push(...data)
          });

          this.formGroup
          .get('tofilter')
          .valueChanges.pipe(
              filter((search) => !!search),
              startWith(''),
              debounceTime(400),
              distinctUntilChanged(),
              switchMap((value: any) => {
                if(this.isfirst == true){
                  this.isfirst = false;
                  return new Observable<any[]>();
                }else
                  return this.busService.getBusCityCombo(value);
              })
          )
          .subscribe((data) => {
            this.toList = []
            this.toList.push({"id": "", "display_name": "All"})
            this.toList.push(...data)
          });

    ///////////////////Agent combo
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
          .subscribe({ next: data => {
            this.agentList = data
            this.agentList= [];
            this.agentList.push({"id": "", "agency_name": "All"})
            this.agentList.push(...data)
            if(!this.record.agent_id)
            this.formGroup.get("agent_id").patchValue(this.agentList[0]);
          }});


          if(this.record.agent_id){
            this.formGroup.patchValue(this.record)
            this.formGroup.get("agentfilter").patchValue(this.record.agent_id.agency_name);
            this.formGroup.get("agent_id").patchValue(this.record.agent_id);
          }

          if(this.record.From){
            this.isfirst = false;
            this.formGroup.get("fromfilter").patchValue(this.record.From.display_name);
            this.formGroup.get("From").patchValue(this.record.From);
          }

          if(this.record.To){
            this.isfirst = false;
            this.formGroup.get("tofilter").patchValue(this.record.To.display_name);
            this.formGroup.get("To").patchValue(this.record.To);
          }

  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }    

  apply():void {
    const json = this.formGroup.getRawValue();
    json.agent_id = json.agent_id
    json.supplierId = json.supplierId
    json.From = json.From
    json.To = json.To
    json.Status = json.Status
    json.FromDate =  new Date(this.formGroup.get('FromDate').value)
    json.ToDate =  new Date(this.formGroup.get('ToDate').value)
    this.matDialogRef.close(json);
  }

  resetForm(){
    this.formGroup.reset();
    this.formGroup.get('date').patchValue(dateRange.lastMonth);
    this.formGroup.get("agent_id").patchValue(this.agentList[0]);
    this.formGroup.get("supplierId").patchValue(this.SupplierList[0]);
    this.formGroup.get('Status').patchValue(this.statusList[0]);
    this.formGroup.get('FromDate').patchValue(this.FromDate);
    this.formGroup.get('ToDate').patchValue(this.ToDate);
    this.formGroup.get("From").patchValue(this.fromList[0]);
    this.formGroup.get("To").patchValue(this.toList[0]);
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
