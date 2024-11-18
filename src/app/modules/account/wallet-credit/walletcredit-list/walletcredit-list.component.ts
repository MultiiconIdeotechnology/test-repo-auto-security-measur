import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { Security, filter_module_name, messages, module_name, walletCreditPermissions } from 'app/security';
import { WalletService } from 'app/services/wallet-credit.service';
import { WalletCreditEntryComponent } from '../wallet-credit-entry/wallet-credit-entry.component';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AgentService } from 'app/services/agent.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';


@Component({
  selector: 'app-walletcredit-list',
  templateUrl: './walletcredit-list.component.html',
  styleUrls: ['./walletcredit-list.component.scss'],
  styles: [
    `
      .tbl-grid {
          grid-template-columns: 40px 110px 170px 170px 190px 150px 100px 140px 120px 180px;
      }
    `,
  ],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule,
    PrimeNgImportsModule
  ],
})
export class WalletcreditListComponent extends BaseListingComponent implements OnDestroy {

  module_name = module_name.walletCredit;
  filter_table_name = filter_module_name.wallet_credited;
  private settingsUpdatedSubscription: Subscription;
  dataList = [];
  total = 0;
  agentList: any[] = [];
  selectedAgent: any = {};

  cols: Column[] = [
    { field: 'entry_by', header: 'Entry By' },
    { field: 'sub_agent_name', header: 'Sub Agent Name' },
    { field: 'sub_agent_code', header: 'Sub Agent Code' },
  ];
  _selectedColumns: Column[];
  isFilterShow: boolean = false;
  selectedAction: string;
  actionList: any[] = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ]

  constructor(
    private walletService: WalletService,
    private conformationService: FuseConfirmationService,
    private router: Router,
    private matDialog: MatDialog,
    private agentService: AgentService,
    public _filterService: CommonFilterService
  ) {
    super(module_name.walletCredit);
    this.key = this.module_name;
    this.sortColumn = 'is_enable';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  ngOnInit() {
    this.agentList = this._filterService.agentListByValue;

    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
      this.selectedAgent = resp['table_config']['master_agent_name']?.value;
      if(this.selectedAgent && this.selectedAgent.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }
      // this.sortColumn = resp['sortColumn'];
      // this.primengTable['_sortField'] = resp['sortColumn'];
      if (resp['table_config']['expiry_date'].value) {
        resp['table_config']['expiry_date'].value = new Date(resp['table_config']['expiry_date'].value);
      }
      if (resp['table_config']['entry_date_time'].value) {
        resp['table_config']['entry_date_time'].value = new Date(resp['table_config']['entry_date_time'].value);
      }
      this.primengTable['filters'] = resp['table_config'];
      this._selectedColumns = resp['selectedColumns'] || [];

      this.isFilterShow = true;
      this.primengTable._filter();
    });

  }

  ngAfterViewInit() {
    // Defult Active filter show
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      this.isFilterShow = true;
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
      this.selectedAgent = filterData['table_config']['master_agent_name']?.value;
      if(this.selectedAgent && this.selectedAgent.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }

      if (filterData['table_config']['expiry_date'].value) {
        filterData['table_config']['expiry_date'].value = new Date(filterData['table_config']['expiry_date'].value);
      }
      if (filterData['table_config']['entry_date_time'].value) {
        filterData['table_config']['entry_date_time'].value = new Date(filterData['table_config']['entry_date_time'].value);
      }
      this.primengTable['filters'] = filterData['table_config'];
      // this.primengTable['_sortField'] = filterData['sortColumn'];
      // this.sortColumn = filterData['sortColumn'];
      this._selectedColumns = filterData['selectedColumns'] || [];
    }
  }

  get selectedColumns(): Column[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: Column[]) {
    if (Array.isArray(val)) {
      this._selectedColumns = this.cols.filter(col =>
        val.some(selectedCol => selectedCol.field === col.field)
      );
    } else {
      this._selectedColumns = [];
    }
  }

  refreshItems(event?: any): void {
    this.isLoading = true;
    this.walletService.getWalletCreditList(this.getNewFilterReq(event)).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.dataList = data.data;
        this.totalRecords = data.total;
      },
      error: (err) => {
        this.alertService.showToast('error', err, 'top-right', true);
        this.isLoading = false;
      },
    });
  }

  // function to get the Agent list from api
  getAgent(value: string, bool = true) {
    this.agentService.getAgentComboMaster(value, bool).subscribe((data) => {
      this.agentList = data;
  
      for (let i in this.agentList) {
        this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`;
        this.agentList[i].id_by_value = this.agentList[i].agency_name;
      }
    })
  }

  createInternal(model): void {
    this.matDialog.open(WalletCreditEntryComponent, {
      data: { data: null, send: 'create' },
      disableClose: true,
    })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.alertService.showToast(
            'success',
            'New record added',
            'top-right',
            true
          );
          this.refreshItems();
        }
      });
  }

  changeExpiry(record): void {
    if (!Security.hasPermission(walletCreditPermissions.changeExpiryPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog
      .open(WalletCreditEntryComponent, {
        data: { data: record, readonly: false },
        disableClose: true,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.refreshItems();
        }
      });
  }

  viewInternal(record): void {
    this.matDialog.open(WalletCreditEntryComponent, {
      data: { data: record, readonly: true },
      disableClose: true,
    });
  }

  EnableDisable(record): void {
    if (!Security.hasPermission(walletCreditPermissions.enableDisablePermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const label: string = record.is_enable ? 'Disable' : 'Enable';
    this.conformationService
      .open({
        title: label,
        message:
          'Are you sure to ' +
          label.toLowerCase() +
          ' ' +
          record.master_agent_name +
          ' ?',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res === 'confirmed') {
          this.walletService
            .setEnable(record.id)
            .subscribe({
              next: () => {
                record.is_enable = !record.is_enable;
                if (record.is_enable) {
                  this.alertService.showToast(
                    'success',
                    'Wallet Credit has been Enabled!',
                    'top-right',
                    true
                  );
                } else {
                  this.alertService.showToast(
                    'success',
                    'Wallet Credit has been Disabled!',
                    'top-right',
                    true
                  );
                }
              }, error: (err) => {
                this.alertService.showToast('error', err);
              }
            });
        }
      });
  }

  // deleteInternal(record): void {
  //   const label: string = 'Delete Wallet Credit';
  //   this.conformationService
  //     .open({
  //       title: label,
  //       message:
  //         'Are you sure to ' +
  //         label.toLowerCase() +
  //         ' ' +
  //         record.master_agent_name +
  //         ' ?',
  //     })
  //     .afterClosed()
  //     .subscribe((res) => {
  //       if (res === 'confirmed') {
  //         this.walletService.delete(record.id).subscribe({
  //           next: () => {
  //             this.alertService.showToast(
  //               'success',
  //               'Wallet Credit has been deleted!',
  //               'top-right',
  //               true
  //             );
  //             this.refreshItems();
  //           },
  //           error: (err) => {
  //             this.alertService.showToast('error', err)
  //             this.isLoading = false;
  //           },
  //         });
  //       }
  //     });
  // }

  getNodataText(): string {
    if (this.isLoading) return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

  exportExcel(): void {
    if (!Security.hasExportDataPermission(this.module_name)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    let modal = this.getNewFilterReq({})
    modal['Take'] = this.totalRecords;

    this.walletService.getWalletCreditList(modal).subscribe(data => {
      for (var dt of data.data) {
        dt.expiry_date = dt.expiry_date ? DateTime.fromISO(dt.expiry_date).toFormat('dd-MM-yyyy hh:mm a') : '';
        dt.entry_date_time = dt.entry_date_time ? DateTime.fromISO(dt.entry_date_time).toFormat('dd-MM-yyyy hh:mm a') : '';
        // dt.entry_by = DateTime.fromISO(dt.entry_by).toFormat('dd-MM-yyyy hh:mm a')

      }
      Excel.export(
        'Wallet Credit',
        [
          { header: 'Agent Code', property: 'master_agent_code' },
          { header: 'Agent.', property: 'master_agent_name' },
          { header: 'Balance', property: 'credit_balance' },
          { header: 'Expiry', property: 'expiry_date' },
          { header: 'Policy Type', property: 'payment_cycle_policy_type' },
          { header: 'Policy', property: 'payment_cycle_policy' },
          { header: 'Outstanding', property: 'outstanding_on_due_date' },
          { header: 'Over Due', property: 'over_due_count' },
          { header: 'Entry', property: 'entry_date_time' },
          { property: 'entry_by', header: 'Entry By' },
          { property: 'sub_agent_name', header: 'Sub Agent Name' },
          { property: 'sub_agent_code', header: 'Sub Agent Code' },
        ],
        data.data, "Wallet Credit", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }]);
    });
  }

  ngOnDestroy(): void {
    // this.masterService.setData(this.key, this);
    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }

}
