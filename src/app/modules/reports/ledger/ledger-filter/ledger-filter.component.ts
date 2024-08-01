import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule, MatDatepickerToggle } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { dateRange } from 'app/common/const';
import { AgentService } from 'app/services/agent.service';
import { CurrencyRoeService } from 'app/services/currency-roe.service';
import { LedgerService } from 'app/services/ledger.service';
import { ToasterService } from 'app/services/toaster.service';
import { CommonUtils } from 'app/utils/commonutils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject, filter, startWith, debounceTime, distinctUntilChanged, switchMap, Observable } from 'rxjs';

@Component({
  selector: 'app-ledger-filter',
  templateUrl: './ledger-filter.component.html',
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
export class LedgerFilterComponent {
  disableBtn: boolean = false
  readonly: boolean = false;
  record: any = {};

  agentfilterr:any;
  agent_id:any;
  currencyId:any;
  first: boolean = true;


  // agentList:any[]=[];
  // agentList: ReplaySubject<any[]> = new ReplaySubject<any[]>();

  DR = dateRange;
  // public date = new FormControl();
  // public fromDate = new FormControl();
  // public toDate = new FormControl();
  public fromDate: any;
  public toDate: any;
  public dateRanges = [];
  serviceForList = ['All', 'Wallet Topup', 'Airline Booking', 'Hotel Booking', 'Holiday Package Booking', 'Bus Booking', 'VISA Booking','Commission'];
  // public service_for = new FormControl(this.serviceForList[0]);
  selectAgentList = ['Master Agent', 'Sub Agent' ];
  // public agent_for = new FormControl(this.selectAgentList[0]);
  @ViewChild(MatDatepickerToggle) toggle: MatDatepickerToggle<Date>;

  allagentList: any[] = [];

  agentList: any[] = [];
  CurrencyList: any[] = [];
  CurrencyListAll: any[] = [];


  constructor(
    public matDialogRef: MatDialogRef<LedgerFilterComponent>,
    private builder: FormBuilder,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    private agentService: AgentService,
    private currencyRoeService: CurrencyRoeService,
    private ledgerService:LedgerService,
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

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      // agent_for: [this.selectAgentList[0]],
      agent_id: [''],
      agentfilterr: [''],
      service_for: [this.serviceForList[0]],
      date: [''],
      fromDate: [''],
      toDate: [''],
      currencyId: [''],
      currencyfilter: [''],

      agentfilter: [''],

    });

    // this.changeVal(this.formGroup.get('service_for').value);

    this.dateRanges = CommonUtils.valuesArray(dateRange);
    this.formGroup.get('date').patchValue(dateRange.today);
    this.updateDate(dateRange.today)

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
    .subscribe({ next: data => {
      this.agentList = data
      if(!this.record.agent_id)
         this.formGroup.get("agent_id").patchValue(this.agentList[0]);
    }});

    this.currencyRoeService.getcurrencyCombo().subscribe({
      next: res => {
        this.CurrencyList = res;
        // this.currencyId = this.CurrencyList;
        // this.formGroup.get("currencyId").patchValue(this.CurrencyList.find(x => x.currency_short_code === "INR"))

        this.CurrencyListAll = res;

        // if (this.first && !this.record.currencyId) {
          // this.formGroup.get('currencyId').patchValue(res[0].currencyId.currency_short_code);
        this.formGroup.get("currencyId").patchValue(this.CurrencyList.find(x => x.currency_short_code === "INR"))

        //   this.first = false
        // }
      }
    })

    this.formGroup.get('currencyfilter').valueChanges.subscribe(data => {
      if(data.trim() == ''){
        this.CurrencyList = this.CurrencyListAll
      }
      else{
      this.CurrencyList = this.CurrencyListAll.filter(x => x.currency_short_code.toLowerCase().includes(data.toLowerCase()));
    }})

    if(this.record.agent_id){
      this.formGroup.patchValue(this.record)
      this.formGroup.get("agentfilter").patchValue(this.record.agent_id.agency_name);
      this.formGroup.get("agent_id").patchValue(this.record.agent_id);

    }

    if(this.record.currencyId){
      this.formGroup.get("currencyfilter").patchValue(this.record.currencyId.currency_short_code);
    }

    // this.changeVal(this.formGroup.get('agent_for').value);

  


  }

  
  

  // filterfrom(value: string) {
  //   this.ledgerService.getAgentComboForLedger(value,this.formGroup.get('agent_for').value).subscribe({
  //     next: (res) => {
  //       this.agentList = res;
  //       this.allagentList = res;
  //     }
  //   });
    
  // }

  // changeVal(v) {
  //   this.ledgerService.getAgentComboForLedger('', v).subscribe({
  //     next: (res) => {
  //       this.agentList = res;
  //       this.agent_id = this.agentList[0];
  //       // this.refreshItems();
  //       if(!this.record.agent_id)
  //       this.formGroup.get("agent_id").patchValue(this.agentList[0]);
  //     },error: (err) => {
  //       this.alertService.showToast('error', err);
  //     }
  //   });
  // }

  apply():void {
    const json = this.formGroup.getRawValue();
    json.agent_id = json.agent_id
    json.currencyId = json.currencyId
    this.matDialogRef.close(json);
    json.fromDate =  new Date(this.formGroup.get('fromDate').value)
    json.toDate =  new Date(this.formGroup.get('toDate').value)
  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

  public updateDate(event: any): void {

    if (event === dateRange.today) {
      this.fromDate = new Date();
      this.toDate = new Date();
      this.fromDate.setDate(this.fromDate.getDate());
      this.formGroup.get('fromDate').patchValue(this.fromDate);
      this.formGroup.get('toDate').patchValue(this.toDate);
    }
    else if (event === dateRange.last3Days) {
      this.fromDate = new Date();
      this.toDate = new Date();
      this.fromDate.setDate(this.fromDate.getDate() - 3);
      this.formGroup.get('fromDate').patchValue(this.fromDate);
      this.formGroup.get('toDate').patchValue(this.toDate);
    }
    else if (event === dateRange.lastWeek) {
      this.fromDate = new Date();
      this.toDate = new Date();
      const dt = new Date(); // current date of week
      const currentWeekDay = dt.getDay();
      const lessDays = currentWeekDay === 0 ? 6 : currentWeekDay - 1;
      const wkStart = new Date(new Date(dt).setDate(dt.getDate() - lessDays));
      const wkEnd = new Date(new Date(wkStart).setDate(wkStart.getDate() + 6));

      this.fromDate = wkStart;
      this.toDate = new Date();
      this.formGroup.get('fromDate').patchValue(this.fromDate);
      this.formGroup.get('toDate').patchValue(this.toDate);
    }
    else if (event === dateRange.lastMonth) {
      this.fromDate = new Date();
      this.toDate = new Date();
      this.fromDate.setDate(1);
      this.fromDate.setMonth(this.fromDate.getMonth());
      this.formGroup.get('fromDate').patchValue(this.fromDate);
      this.formGroup.get('toDate').patchValue(this.toDate);
    }
    else if (event === dateRange.last3Month) {
      this.fromDate = new Date();
      this.toDate = new Date();
      this.fromDate.setDate(1);
      this.fromDate.setMonth(this.fromDate.getMonth() - 3);
      this.formGroup.get('fromDate').patchValue(this.fromDate);
      this.formGroup.get('toDate').patchValue(this.toDate);
    }
    else if (event === dateRange.last6Month) {
      this.fromDate = new Date();
      this.toDate = new Date();
      this.fromDate.setDate(1);
      this.fromDate.setMonth(this.fromDate.getMonth() - 6);
      this.formGroup.get('fromDate').patchValue(this.fromDate);
      this.formGroup.get('toDate').patchValue(this.toDate);
    }
    else if (event === dateRange.setCustomDate) {
      this.fromDate = new Date();
      this.toDate = new Date();
      this.formGroup.get('fromDate').patchValue(this.fromDate);
      this.formGroup.get('toDate').patchValue(this.toDate);
    }
  }

  // dateRangeChange(start, end): void {
  //   if (start.value && end.value) {
  //     this.fromDate = start.value;
  //     this.toDate = end.value;
  //   }
  // }
  onRangeInputClicked() {
    const fakeMouseEvent = new MouseEvent('click');
    this.toggle._open(fakeMouseEvent);
  }

  // cancleDate() {
  //   this.formGroup.get('date').patchValue('Today');
  //   this.updateDate(dateRange.today);
  // }


}
