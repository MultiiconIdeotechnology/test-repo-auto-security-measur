import { Component, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
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
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { BaseListingComponent, Column, Types } from 'app/form-models/base-listing';
import { filter_module_name, messages, module_name, Security } from 'app/security';
import { AccountService } from 'app/services/account.service';
import { AgentService } from 'app/services/agent.service';
import { EntityService } from 'app/services/entity.service';
import { AppConfig } from 'app/config/app-config';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ProformaEntryComponent } from './proforma-entry/proforma-entry.component';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
import { CommonUtils } from 'app/utils/commonutils';
import { DateTime } from 'luxon';
import { Excel } from 'app/utils/export/excel';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-proforma-invoice',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    NgClass,
    RouterOutlet,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    MatTabsModule,
    PrimeNgImportsModule,
    ProformaEntryComponent
  ],
  templateUrl: './proforma-invoice.component.html',
  styleUrls: ['./proforma-invoice.component.scss']
})
export class ProformaInvoiceComponent extends BaseListingComponent implements OnDestroy {

  private settingsUpdatedSubscription: Subscription;
  module_name = module_name.proformaInvoice;
  filter_table_name = filter_module_name.proforma_invoice;
  public Filter: any;
  public key: any = "invoice_date";
  total = 0;
  dataList = [];
  appConfig = AppConfig;

  isFilterShow: boolean = false;
  selectedAgent: any;
  isLoading = false;
  private destroy$: Subject<any> = new Subject<any>();

  types = Types;
  cols: Column[] = [];
  selectedColumns: Column[] = [];
  exportCol: Column[] = [];
  activeFiltData: any = {};

  constructor(
    private accountService: AccountService,
    private confirmService: FuseConfirmationService,
    private agentService: AgentService,
    private sidebarDialogService: SidebarCustomModalService,
    private entityService: EntityService,
    public _filterService: CommonFilterService
  ) {
    super(module_name.proformaInvoice)
    this.key = 'invoice_date';
    this.sortColumn = 'invoice_date';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);



    // this.entityService.onRefreshPaymentLinkEntityCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
    //   next: (item) => {
    //     if (item) {
    //       this.refreshItems();
    //     }
    //   }
    // })
    this.selectedColumns = [
      { field: 'invoice_date', header: 'Invoice Date', type: Types.date, dateFormat: 'dd-MM-yyyy' },
      { field: 'invoice_no', header: 'Invoice No.', type: Types.text },
      { field: 'customer_name', header: 'Customer Name', type: Types.text },
      { field: 'taxable_amount', header: 'Taxable Amount',type: Types.number, fixVal: 2, class: 'text-right' },
      { field: 'tax', header: 'Tax', type: Types.number, fixVal: 2, class: 'text-right' },
      { field: 'total_amount', header: 'Service Charge', type: Types.number, fixVal: 2, class: 'text-right' },
      { field: 'currency', header: 'Currency', type: Types.text },
      { field: 'gst', header: 'GST', type: Types.text }
    ];
    this.cols.unshift(...this.selectedColumns);
    this.exportCol = cloneDeep(this.cols);
  }

  ngOnInit() {

    this.sidebarDialogService.onModalChange().pipe((takeUntil(this.destroy$))).subscribe((res: any) => {
      if (res && res.key == 'create-response') {
        let index = this.dataList.findIndex((item: any) => item.id == res.data.id);
        if (index != -1) {
          this.dataList[index] = res.data;
        } else {
          this.dataList.unshift(res.data);
        }
      }
    })

    // this.getAgent("");

    this._filterService.updateSelectedOption('');

    // common filter
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
      this._filterService.updateSelectedOption('');
      this.selectedAgent = resp['table_config']['agent']?.value;
      // this.selectedSupplier = resp['table_config']['supplier_name']?.value;
      // this.selectedFromAirport = resp['table_config']['from_id_filtres']?.value;
      // this.selectedToAirport = resp['table_config']['to_id_filtres']?.value;

      // if (this.selectedAgent && this.selectedAgent.id) {
      //   const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
      //   if (!match) {
      //     this.agentList.push(this.selectedAgent);
      //   }
      // }

      if (resp['table_config']['invoice_date']?.value != null) {
        resp['table_config']['invoice_date'].value = new Date(resp['table_config']['invoice_date'].value);
      }

      this.primengTable['filters'] = resp['table_config'];
      this.isFilterShow = true;
      this.selectedColumns = this.checkSelectedColumn(resp['selectedColumns'] || [], this.selectedColumns);
      this.primengTable._filter();
    });

  }

  ngAfterViewInit() {
    // Defult Active filter show
    // this._filterService.updateSelectedOption('');
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      this.isFilterShow = true;
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
      this.selectedAgent = filterData['table_config']['agent']?.value;

      if (filterData['table_config']['invoice_date']?.value != null) {
        filterData['table_config']['invoice_date'].value = new Date(filterData['table_config']['invoice_date'].value);
      }
      this.primengTable['filters'] = filterData['table_config'];
      this.selectedColumns = this.checkSelectedColumn(filterData['selectedColumns'] || [], this.selectedColumns);
      this.onColumnsChange();
    } else {
      this.selectedColumns = this.checkSelectedColumn([], this.selectedColumns);
      this.onColumnsChange();
    }
  }

  onColumnsChange(): void {
    this._filterService.setSelectedColumns({ name: this.filter_table_name, columns: this.selectedColumns });
  }

  checkSelectedColumn(col: any[], oldCol: Column[]): any[] {
    if (col.length) return col;
    else {
      var Col = this._filterService.getSelectedColumns({ name: this.filter_table_name })?.columns || [];
      if (!Col.length)
        return oldCol;
      else
        return Col;
    }
  }

  isDisplayHashCol(): boolean {
    return this.selectedColumns.length > 0;
  }

  onSelectedColumnsChange(): void {
    this._filterService.setSelectedColumns({ name: this.filter_table_name, columns: this.selectedColumns });
  }

  refreshItems(event?: any): void {
    this.isLoading = true;
    var newModel = this.getNewFilterReq(event);
    this.accountService.GetProformaInvoiceList(newModel).subscribe({
      next: (data) => {
        this.dataList = data.data;
        this.totalRecords = data.total;
        this.isLoading = false;
      }, error: (err) => {
        this.alertService.showToast('error', err)
        this.isLoading = false
      }
    });
  }

  createInternal(): void {
    // if (!Security.hasNewEntryPermission(module_name.whatsapp_config_template)) {
    //     return this.alertService.showToast('error', messages.permissionDenied);
    // }
    this.sidebarDialogService.openModal('proforma-invoice-create', null)
  }

  view(data): void {
    // if (!Security.hasViewPermission(module_name.whatsapp_config_template)) {
    //     return this.alertService.showToast('error', messages.permissionDenied);
    // }
    this.sidebarDialogService.openModal('proforma-invoice-info', data)
  }

  invoice(record): void {
    const recordData = record.id;
    this.accountService.PrintProformaInvoice(recordData).subscribe({
      next: (res) => {
        CommonUtils.downloadPdf(res.data, record.id + '.pdf');
      }, error: (err) => {
        this.alertService.showToast('error', err)
      }
    })
  }

  exportExcel(): void {
    if (!Security.hasExportDataPermission(this.module_name)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const filterReq = this.getNewFilterReq({});
    filterReq['Filter'] = this.searchInputControl.value;
    filterReq['Take'] = this.totalRecords;

    this.accountService.GetProformaInvoiceList(filterReq).subscribe((data) => {
      for (var dt of data.data) {
        dt.invoice_date = dt.invoice_date ? DateTime.fromISO(dt.invoice_date).toFormat('dd-MM-yyyy ') : '';
      }
      Excel.export(
        'Proforma Invoice',
        [
          { header: 'Invoice Date.', property: 'invoice_date' },
          { header: 'Invoice No', property: 'invoice_no' },
          { header: 'Customer Name', property: 'customer_name' },
          { header: 'Taxable Amount', property: 'taxable_amount' },
          { header: 'Tax', property: 'tax' },
          { header: 'Service Charge', property: 'total_amount' },
          { header: 'Currency', property: 'currency' },
        ],
        data.data,
        'Proforma Invoice',
        [{ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }]
      );
    });
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

  displayColCount(): number {
    return this.selectedColumns.length + 1;
  }


  isValidDate(value: any): boolean {
    const date = new Date(value);
    return value && !isNaN(date.getTime());
  }
}
