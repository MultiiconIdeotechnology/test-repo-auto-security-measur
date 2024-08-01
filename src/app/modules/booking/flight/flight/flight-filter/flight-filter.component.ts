import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule, MatDatepickerToggle } from '@angular/material/datepicker';
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
import { CurrencyRoeService } from 'app/services/currency-roe.service';
import { FlightTabService } from 'app/services/flight-tab.service';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { LedgerService } from 'app/services/ledger.service';
import { ToasterService } from 'app/services/toaster.service';
import { CommonUtils } from 'app/utils/commonutils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject, debounceTime, distinctUntilChanged, filter, startWith, switchMap, Observable } from 'rxjs';

@Component({
  selector: 'app-flight-filter',
  templateUrl: './flight-filter.component.html',
  styleUrls: ['./flight-filter.component.scss'],
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
    CommonModule
  ]
})
export class FlightFilterComponent {

  disableBtn: boolean = false
  readonly: boolean = false;
  record: any = {};

  agentfilterr: any;
  agent_id: any;
  agentList: any[] = [];
  DR = dateRange;
  public FromDate: any;
  public ToDate: any;
  allVal = {
    "id": "all",
    "company_name": "All"
  };

  allValStatus =
    'All'
    ;
  public dateRanges = [];
  serviceForList = ['Pending', 'Rejected', 'Waiting for Payment', 'Confirmed', 'Offline Pending', 'Confirmation Pending', 'Payment Failed', 'Booking Failed', 'Cancelled', 'Partially Cancelled', 'Hold'];

  selectAgentList = ['All', 'Master Agent', 'Sub Agent'];


  @ViewChild(MatDatepickerToggle) toggle: MatDatepickerToggle<Date>;

  allagentList: any[] = [];

  SupplierList: any[] = [];
  fromcityList: any[] = [];
  tocityList: any[] = [];

  // fromcityList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  // tocityList: ReplaySubject<any[]> = new ReplaySubject<any[]>();

  // supplier_id = new FormControl([]);
  selectedList: any[] = []

  supplierListAll: any[] = [];
  supplierList: any[] = [];

  constructor(
    public matDialogRef: MatDialogRef<FlightFilterComponent>,
    private builder: FormBuilder,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    private flighttabService: FlightTabService,
    private agentService: AgentService,
    private currencyRoeService: CurrencyRoeService,
    private kycDocumentService: KycDocumentService,
    private ledgerService: LedgerService,
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


  vaalchange() {
    var alldt = this.formGroup.get('supplier_id').value.filter(x => x.id != "all");
    this.formGroup.get('supplier_id').patchValue(alldt);

  }

  vaalStatuschange() {
    var alldt = this.formGroup.get('status').value.filter(x => x.status != "all");
    this.formGroup.get('status').patchValue(alldt);
  }

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      // agent_for: [this.selectAgentList[0]],
      agent_id: [''],
      agentfilter: [''],
      // service_for: [this.serviceForList[0]],
      supplier_id: [''],
      supplierfilter: [''],
      suppliers: [''],
      fromCity: [''],
      toCity: [''],
      status: [],
      fromcityfilter: [''],
      tocityfilter: [''],

      date: [''],
      FromDate: [''],
      ToDate: [''],
    });

    // this.formGroup.get('supplier_id').valueChanges.subscribe((selectedValues: any) => {
    //   this.selectedList = selectedValues
    //   var alldt = this.selectedList.filter(x => x.id == "all");
    //   if (alldt.length > 0) {
    //     this.formGroup.get('supplier_id').patchValue(alldt);
    //   }
    // });


    this.formGroup.get('date').patchValue(dateRange.last3Month);
    this.updateDate(dateRange.last3Month)

    this.flighttabService.getSupplierBoCombo('Airline').subscribe({
      next: (res) => {
        this.supplierListAll = res;
        this.SupplierList.push(...res);
        // this.formGroup.get('supplier_id').patchValue(this.SupplierList.find(x => x.company_name.includes("All")).id)

      },
    });

    this.formGroup.get('supplierfilter').valueChanges.subscribe(data => {
      this.SupplierList = this.supplierListAll
      this.SupplierList = this.supplierListAll.filter(x => x.company_name.toLowerCase().includes(data.toLowerCase()));
      // if (data.trim() == '') {
      // }
      // else {
      // }
    })

    //  this.formGroup
    //   .get('supplierfilter')
    //   .valueChanges.pipe(
    //       filter((search) => !!search),
    //       startWith(''),
    //       debounceTime(400),
    //       distinctUntilChanged(),
    //       switchMap((value: any) => {
    // return this.kycDocumentService.getSupplierCombo(value,'Airline');
    //       })
    //   )
    //   .subscribe((data) =>{
    //     this.SupplierList =[];
    //     this.SupplierList.push({
    //       "id": "",
    //       "company_name": "All"
    //     })
    //     this.SupplierList.push(...data);
    //   });



    this.flighttabService.getAirportMstCombo("").subscribe((data) => {
      // this.fromcityList = data;

      this.fromcityList = []
      this.fromcityList.push({ "id": "All", "display_name": "All" })
      this.fromcityList.push(...data)
      if (!this.record.fromCity)
        this.formGroup.get("fromCity").patchValue(this.fromcityList[0]);
      // else
      // this.formGroup.get("fromCity").patchValue(this.record.fromCity);


      this.tocityList = [];
      this.tocityList.push({ "id": "All", "display_name": "All" })
      this.tocityList.push(...data)
      if (!this.record.toCity)
        this.formGroup.get("toCity").patchValue(this.tocityList[0]);
      // else
      // this.formGroup.get("toCity").patchValue(this.record.toCity);

    });

    this.formGroup
      .get('fromcityfilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value: any) => {
          if (this.isfirst == true) {
            return new Observable<any[]>();
          } else
            return this.flighttabService.getAirportMstCombo(value);
        })
      )
      .subscribe((data) => {
        this.fromcityList = data;
      });

    this.formGroup
      .get('tocityfilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value: any) => {
          if (this.isfirst == true) {
            this.isfirst = false;
            return new Observable<any[]>();
          } else
            return this.flighttabService.getAirportMstCombo(value);
        })
      )
      .subscribe((data) => {
        this.tocityList = data
      });

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

    if (this.record.agent_id) {
      this.formGroup.patchValue(this.record)

      this.formGroup.get("agentfilter").patchValue(this.record.agent_id.agency_name);
      this.formGroup.get("agent_id").patchValue(this.record.agent_id);
    }

    if (this.record) {
      this.formGroup.patchValue(this.record)
      // this.formGroup.get("agentfilterr").patchValue(this.record.agent_id.agency_name);
      this.formGroup.get("fromcityfilter").patchValue(this.record.fromCity.display_name);
      this.formGroup.get("fromCity").patchValue(this.record.fromCity);
      this.formGroup.get("tocityfilter").patchValue(this.record.toCity.display_name);
      this.formGroup.get('supplier_id').patchValue(this.record.supplier_id);
      this.formGroup.get('status').patchValue(this.record.status ?? []);
    }

    // this.changeVal(this.formGroup.get('agent_for').value);
  }

  changeStatus() {
    this.formGroup.get('status').patchValue(this.formGroup.get('status').value.filter(x => x != 'All'))
  }

  filterfrom(value: string) {
    this.ledgerService.getAgentComboForLedger(value, this.formGroup.get('agent_for').value).subscribe({
      next: (res) => {
        this.agentList = res;
        this.allagentList = res;
      }, error: (err) => {
        this.alertService.showToast('error', err);
      }
    });
  }

  changeVal(v) {
    if (v == "All") {
      this.formGroup.get('agent_id').patchValue('');
      return;
    }
    this.ledgerService.getAgentComboForLedger('', v).subscribe({
      next: (res) => {
        this.agentList = [];
        this.agent_id = this.agentList[0];
        // this.refreshItems();

        this.agentList.push({
          "id": "",
          "agency_name": "All"
        })
        this.agentList.push(...res);

        if (!this.record.agent_id)
          this.formGroup.get("agent_id").patchValue(this.agentList[0]);

      }, error: (err) => {
        this.alertService.showToast('error', err);
      }
    });
  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

  apply(): void {
    const json = this.formGroup.getRawValue();
    json.agent_id = json.agent_id
    // json.suppliers = this.supplier_id.value

    // json.supplier_id = this.selectedList.map(x => x.id).join(',');
    json.fromCity = json.fromCity
    json.toCity = json.toCity
    json.FromDate = new Date(this.formGroup.get('FromDate').value)
    json.ToDate = new Date(this.formGroup.get('ToDate').value)
    this.matDialogRef.close(json);
  }

  resetForm() {
    this.formGroup.reset();
    this.formGroup.get('date').patchValue(dateRange.last3Month);
    this.formGroup.get("agent_id").patchValue(this.agentList[0]);
    this.formGroup.get("fromCity").patchValue(this.fromcityList[0]);
    this.formGroup.get("toCity").patchValue(this.tocityList[0]);
    this.formGroup.get("supplier_id").patchValue([this.allVal]);
    this.formGroup.get("status").patchValue([this.allValStatus]);
    // this.formGroup.get('status').patchValue(this.serviceForList[0]);
    this.formGroup.get('FromDate').patchValue(this.FromDate);
    this.formGroup.get('ToDate').patchValue(this.ToDate);
  }

  // onRangeInputClicked() {
  //   const fakeMouseEvent = new MouseEvent('click');
  //   this.toggle._open(fakeMouseEvent);
  // }

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
