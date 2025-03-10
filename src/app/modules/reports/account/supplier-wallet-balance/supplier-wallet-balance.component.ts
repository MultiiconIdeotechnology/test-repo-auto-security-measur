import { DatePipe, CommonModule, NgClass } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
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
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, filter_module_name, messages, module_name } from 'app/security';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AgentService } from 'app/services/agent.service';
import { AgentBalanceService } from 'app/services/agent-balance.service';
import { RefferralService } from 'app/services/referral.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
  selector: 'app-supplier-wallet-balance',
  standalone: true,
  imports: [ 
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
    PrimeNgImportsModule],
  templateUrl: './supplier-wallet-balance.component.html',
  styleUrls: ['./supplier-wallet-balance.component.scss']
})
export class SupplierWalletBalanceComponent extends BaseListingComponent {
  dataList = [];
  total = 0;
  module_name = module_name.supplierWalletBalance;
  filter_table_name = filter_module_name.supplier_wallet_balance;
  private settingsUpdatedSubscription: Subscription;
  isFilterShow: boolean = false;
  agentList: any[] = [];
  employeeList: any[] = [];
  selectedRM: any;
  selectedAgent: any;

  constructor(
      private agentBalanceService: AgentBalanceService,
      private agentService: AgentService,
      public _filterService: CommonFilterService
  ) {
      super(module_name.supplierWalletBalance)
      this.key = 'payment_request_date';
      this.sortColumn = 'last_top_up';
      this.sortDirection = 'desc';
      this.Mainmodule = this;
      this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    
  }

  getAgent(value: string) {
      this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
          this.agentList = data;

          for (let i in this.agentList) {
              this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`;
              this.agentList[i].id_by_value = this.agentList[i].agency_name;
          }
      })
  }

  refreshItems(event?: any): void {
      this.isLoading = true;
      this.agentBalanceService.getWalletReportList(this.getNewFilterReq(event)).subscribe({
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

  exportExcel(): void {
      if (!Security.hasExportDataPermission(module_name.agentBalance)) {
          return this.alertService.showToast('error', messages.permissionDenied);
      }

      const filterReq = this.getNewFilterReq({});
      const req = Object.assign(filterReq);

      req.skip = 0;
      req.take = this.totalRecords;
      
      this.agentBalanceService.getWalletReportList(req).subscribe(data => {
          for (var dt of data.data) {
              dt.last_top_up = dt.last_top_up ? DateTime.fromISO(dt.last_top_up).toFormat('dd-MM-yyyy hh:mm a') : '';
              dt.balance = dt.currency + ' ' + dt.balance
          }
          Excel.export(
              'Supplier Wallet Balance',
              [
                  { header: 'Agent', property: 'agent_name' },
                  { header: 'Balance', property: 'balance' },
              ],
              data.data, "Supplier Wallet Balance", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }]);
      });
  }

  ngOnDestroy(): void {

      if (this.settingsUpdatedSubscription) {
          this.settingsUpdatedSubscription.unsubscribe();
          this._filterService.activeFiltData = {};
      }
  }
}
