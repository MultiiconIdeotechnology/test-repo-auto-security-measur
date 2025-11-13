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
import { AgentLedgerWalletMissmatchService } from 'app/services/agent-ledger-wallet-missmatch.service';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { BaseListingComponent, Column, Types } from 'app/form-models/base-listing';
import { filter_module_name, module_name } from 'app/security';
import { Subscription } from 'rxjs';
import { cloneDeep } from 'lodash';


@Component({
  selector: 'app-agent-ledger-wallet-missmatch',
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
    PrimeNgImportsModule
  ],
  templateUrl: './agent-ledger-wallet-missmatch.component.html',
  styleUrls: ['./agent-ledger-wallet-missmatch.component.scss']
})
export class AgentLedgerWalletMissmatchComponent extends BaseListingComponent implements OnDestroy {

  dataList = [];
  total = 0;
  module_name = module_name.agentLedgerWalletMissmatch;
  filter_table_name = filter_module_name.agent_ledger_wallet_missmatch;
  isFilterShow: boolean = false;
  private settingsUpdatedSubscription: Subscription;
  selectedAgent: any;
  agentList: any[] = [];

  types = Types;
  cols: Column[] = [];
  selectedColumns: Column[] = [];
  exportCol: Column[] = [];
  activeFiltData: any = {};

  constructor(
    private agentLedgerWalletMissmatchService: AgentLedgerWalletMissmatchService,
    public _filterService: CommonFilterService
  ) {
    super(module_name.agentLedgerWalletMissmatch)
    this.key = 'mismatchAmount';
    this.sortColumn = 'mismatchAmount';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);

    this.selectedColumns = [
      { field: 'code', header: 'Agent Code', type: Types.number, isFrozen: false, fixVal: 0 },
      { field: 'type', header: 'Type', type: Types.text },
      { field: 'name', header: 'Name', type: Types.text },
      { field: 'ledgerBalance', header: 'Ledger Balance', type: Types.number, fixVal: 2, class: 'text-right' },
      { field: 'walletBalance', header: 'Wallet Balance', type: Types.number, fixVal: 2, class: 'text-right' },
      { field: 'mismatchAmount', header: 'Missmatch Amount', type: Types.number, fixVal: 2, class: 'text-right' }
    ];
    this.cols.unshift(...this.selectedColumns);
    this.exportCol = cloneDeep(this.cols);
  }

  ngOnInit(): void {

    // common filter
    this._filterService.updateSelectedOption('');
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
      this._filterService.updateSelectedOption('');
      this.selectedAgent = resp['table_config']['agent_name']?.value;
      if (this.selectedAgent && this.selectedAgent.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }

      // this.sortColumn = resp['sortColumn'];
      // this.primengTable['_sortField'] = resp['sortColumn'];
      if (resp['table_config']['last_top_up']?.value && Array.isArray(resp['table_config']['last_top_up']?.value)) {
        this._filterService.selectionDateDropdown = 'custom_date_range';
        this._filterService.rangeDateConvert(resp['table_config']['last_top_up']);
      }
      this.primengTable['filters'] = resp['table_config'];
      this.isFilterShow = true;
      this.selectedColumns = this.checkSelectedColumn(resp['selectedColumns'] || [], this.selectedColumns);
      this.primengTable._filter();
    });
  }

  ngAfterViewInit() {
    // Defult Active filter show
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      this.isFilterShow = true;
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
      this.selectedAgent = filterData['table_config']['agent_name']?.value;

      if (this.selectedAgent && this.selectedAgent.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }

      if (filterData['table_config']['last_top_up']?.value && Array.isArray(filterData['table_config']['last_top_up']?.value)) {
        this._filterService.selectionDateDropdown = 'custom_date_range';
        this._filterService.rangeDateConvert(filterData['table_config']['last_top_up']);
      }
      // this.primengTable['_sortField'] = filterData['sortColumn'];
      // this.sortColumn = filterData['sortColumn'];
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
    this.agentLedgerWalletMissmatchService.agentMissmatchReport(this.getNewFilterReq(event)).subscribe({
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
