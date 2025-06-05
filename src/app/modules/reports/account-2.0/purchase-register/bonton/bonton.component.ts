import { filter_module_name, messages, module_name, Security } from 'app/security';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AppConfig } from 'app/config/app-config';
import { AccountService } from 'app/services/account.service';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { Linq } from 'app/utils/linq';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { PspSettingService } from 'app/services/psp-setting.service';
import { AgentService } from 'app/services/agent.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-bonton',
  standalone: true,
  imports: [
    DatePipe,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatMenuModule,
    MatDialogModule,
    MatDividerModule,
    FormsModule,
    PrimeNgImportsModule,
    MatTooltipModule,
    MatSelectModule,
  ],
  templateUrl: './bonton.component.html',
  styleUrls: ['./bonton.component.scss']
})
export class BontonComponent extends BaseListingComponent implements OnDestroy {
  @Input() isFilterShow: boolean = false;
  @Output() isFilterShowEvent = new EventEmitter(false);
  module_name = module_name.products_collection;
  filter_table_name = filter_module_name.products_collection;
  private settingsUpdatedSubscription: Subscription;
  isLoading = false;
  dataList = [];
  totalsObj: any = {};
  selectedAgent: any;
  agentList: any[] = [];
  selectedRM: any;
  employeeList: any = [];
  user: any = {};

  statusList: any[] = [
    { label: 'Inprocess', value: 'Inprocess' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Blocked', value: 'Blocked' },
    { label: 'Delivered', value: 'Delivered' },
  ];

  tableFieldArr: any =
    [
      { field: 'invoice_date', header: 'Date', type: 'custom', matchMode: 'custom' },
      { field: 'supplier_master.company_name', header: 'Name', type: 'text', matchMode: 'contains' },
      { field: 'invoice_number', header: 'Invoice No', type: 'text', matchMode: 'contains' },
      { field: 'supplier_reference_number', header: 'Supplier. Ref. No', type: 'text', matchMode: 'contains' },
      { field: 'booking_reference_number', header: 'Ref. No', type: 'text', matchMode: 'contains' },
      { field: 'pnr_number', header: 'PNR', type: 'text', matchMode: 'contains' },
      { field: 'booking_price.purchase_base_price', header: 'Base Fare', type: 'numeric', matchMode: 'equals' },
      { field: 'booking_price.purchase_tax', header: 'Airline Tax', type: 'numeric', matchMode: 'equals' },
      { field: 'booking_price.supplier_service_charge', header: 'Service charge', type: 'numeric', matchMode: 'equals' },
      { field: 'booking_price.supplier_service_charge_gst', header: 'CGST', type: 'numeric', matchMode: 'equals' },
      { field: 'booking_price.supplier_service_charge_gst', header: 'SGST', type: 'numeric', matchMode: 'equals' },
      { field: 'booking_price.supplier_service_charge_gst', header: 'IGST', type: 'numeric', matchMode: 'equals' },
      { field: 'total_purchase', header: 'Total Purchase', type: 'numeric', matchMode: 'equals', },
      { field: 'booking_price.purchase_commission', header: 'Commission Income', type: 'numeric', matchMode: 'equals' },
      { field: 'booking_price.purchase_tds', header: 'TDS', type: 'numeric', matchMode: 'equals' },
      { field: 'net_payable', header: 'Net Payable', type: 'numeric', matchMode: 'equals', }
    ];

  constructor(
    private accountService: AccountService,
    private agentService: AgentService,
    public _filterService: CommonFilterService,
  ) {
    super(module_name.products_collection);

    this.sortColumn = 'installment_date';
    this.sortDirection = 'desc';
    this._filterService.applyDefaultFilter(this.filter_table_name);

  }

  ngOnInit(): void {
    // common filter
    this.startSubscription();
  }

  ngAfterViewInit() {
    // Defult Active filter show
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      this.isFilterShow = true;
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
      this.selectedAgent = filterData['table_config']['agency_name']?.value;
      this.selectedRM = filterData['table_config']['rm']?.value;


      if (this.selectedAgent && this.selectedAgent.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }

      if (filterData['table_config']['installment_date']?.value && Array.isArray(filterData['table_config']['installment_date']?.value)) {
        this._filterService.selectionDateDropdown = 'custom_date_range';
        this._filterService.rangeDateConvert(filterData['table_config']['installment_date']);
      }
      this.isFilterShowEvent.emit(true);
      this.primengTable['filters'] = filterData['table_config'];
    }
  }

  // function to get the Agent list from api
  getAgent(value: string) {
    this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
      this.agentList = data;

      for (let i in this.agentList) {
        this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`;
        this.agentList[i].id_by_value = this.agentList[i].agency_name;
      }
    })
  }

  // Api to get the Employee list data
  // getEmployeeList(value: string) {
  //   this.refferralService.getEmployeeLeadAssignCombo(value).subscribe((data: any) => {
  //     this.employeeList = data;

  //     for (let i in this.employeeList) {
  //       this.employeeList[i].id_by_value = this.employeeList[i].employee_name;
  //     }
  //   });
  // }


  getStatusIndicatorClass(status: string): string {
    if (status == 'Pending') {
      return 'bg-yellow-600';
    } else if (status == 'Audited') {
      return 'bg-green-600';
    } else if (status == 'Rejected') {
      return 'bg-red-600';
    } else if (status == 'Confirmed') {
      return 'bg-green-600';
    } else {
      return 'bg-blue-600';
    }
  }



  refreshItems(event?: any): void {
    this.isLoading = true;
    let newModel = this.getNewFilterReq(event);

    this.accountService.getCollectionList(newModel).subscribe({
      next: (data) => {
        this.dataList = data.data;
        this.totalRecords = data.total;
        this.totalsObj = data.totals || 0;
        this.isLoading = false;
        if (this.dataList && this.dataList.length) {
          setTimeout(() => {
            // this.isFrozenColumn('', ['index', 'payment_attachment',]);
          }, 200);
        }
      },
      error: (err) => {
        this.alertService.showToast('error', err);
        this.isLoading = false;
      },
    });
  }

  // Status
  getStatusColor(status: string): string {
    if (status == 'Pending') {
      return 'text-blue-600';
    } else if (status == 'Inprocess') {
      return 'text-yellow-600';
    } else if (status == 'Delivered') {
      return 'text-green-600';
    } else if (status == 'Blocked') {
      return 'text-red-600';
    } else {
      return '';
    }
  }

  exportExcel(): void {
    // if (!Security.hasExportDataPermission(this.module_name)) {
    //     return this.alertService.showToast(
    //         'error',
    //         messages.permissionDenied
    //     );
    // }

    const filterReq = this.getNewFilterReq({});

    filterReq['Filter'] = this.searchInputControl.value;
    filterReq['Take'] = this.totalRecords;

    this.accountService.getCollectionList(filterReq).subscribe((data) => {
      for (var dt of data.data) {
        dt.installment_date = dt.installment_date ? DateTime.fromISO(dt.installment_date).toFormat('dd-MM-yyyy') : '';
      }
      ['agent_code', 'agency_name', 'rm', 'product', 'status', 'installment_amount', 'due_Amount', 'installment_date']
      Excel.export(
        'Collection',
        [
          { header: 'Agent Code', property: 'agent_code' },
          { header: 'Agent', property: 'agency_name' },
          { header: 'RM', property: 'rm' },
          { header: 'Product name', property: 'product' },
          { header: 'Status', property: 'status' },
          { header: 'Amount', property: 'installment_amount' },
          { header: 'Due Amount', property: 'due_Amount' },
          { header: 'Installment Date', property: 'installment_date' },
        ],
        data.data,
        'Collection',
        [{ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }]
      );
    });
  }

  getNodataText(): string {
    if (this.isLoading) return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

  startSubscription() {
    if (!this.settingsUpdatedSubscription || this.settingsUpdatedSubscription.closed) {
      this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
        this._filterService.updateSelectedOption('');
        this.selectedAgent = resp['table_config']['agency_name']?.value;
        if (this.selectedAgent && this.selectedAgent.id) {
          const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
          if (!match) {
            this.agentList.push(this.selectedAgent);
          }
        }
        this.selectedRM = resp['table_config']['rm']?.value;

        if (resp['table_config']['installment_date']?.value && Array.isArray(resp['table_config']['installment_date']?.value)) {
          this._filterService.selectionDateDropdown = 'custom_date_range';
          this._filterService.rangeDateConvert(resp['table_config']['installment_date']);
        }

        this.primengTable['filters'] = resp['table_config'];
        this.isFilterShow = true;
        this.primengTable._filter();
      });
    }
  }

  stopSubscription() {
    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this.settingsUpdatedSubscription = undefined;
    }
  }

  ngOnDestroy(): void {
    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }
}
