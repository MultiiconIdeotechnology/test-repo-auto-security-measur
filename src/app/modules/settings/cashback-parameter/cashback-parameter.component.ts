import { filter_module_name, module_name } from 'app/security';
import { Component, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CashbackParameterEntryComponent } from './cashback-parameter-entry/cashback-parameter-entry.component';
import { CashbackParameterService } from 'app/services/cashback-parameters.service';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';

@Component({
  selector: 'app-cashback-parameter',
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
    MatMenuModule,
    MatDialogModule,
    MatDividerModule,
    FormsModule,
    PrimeNgImportsModule,
    MatTooltipModule,
    CashbackParameterEntryComponent
  ],
  templateUrl: './cashback-parameter.component.html',
  styleUrls: ['./cashback-parameter.component.scss']
})
export class CashbackParameterComponent extends BaseListingComponent implements OnDestroy {
  module_name = module_name.cashbackparameters;
  filter_table_name = filter_module_name.cashback_parameters_master;
  private settingsUpdatedSubscription: Subscription;
  dataList = [];
  total = 0;
  user: any;
  is_first: any;

  // cols: any = [
  //   { field: 'template_for_name', header: 'Update By ', type: 'text' },
  //   { field: 'modify_date_time', header: 'Update Date', type: 'date' },
  // ];
  _selectedColumns: Column[];
  isFilterShow: boolean = false;
  supplierListAll: any[] = [];
  selectedSupplier: any;
  cashforList: any[] = [];
  transactionTypeList: any[] = [
    { label: 'Domestic', value: 'Domestic' },
    { label: 'International', value: 'International' }
  ]

  cashforCompanyList:any[] = ['Company', 'Agent'];

  constructor(
    private cashbackService: CashbackParameterService,
    private modalService: SidebarCustomModalService,
    private conformationService: FuseConfirmationService,
    public _filterService: CommonFilterService,
  ) {
    super(module_name.city);
    this.key = this.module_name;
    // this.sortColumn = '';
    this.sortDirection = 'asc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  ngOnInit() {
    // Subscribe to the cashback list
    this.cashbackService.cashbackList$.subscribe(list => {
      this.dataList = list;
    });

    this.getCompanyList();

    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
      // if (resp['table_config']['modify_date_time']?.value != null) {
      //   resp['table_config']['modify_date_time'].value = new Date(resp['table_config']['modify_date_time'].value);
      // }
      this.primengTable['filters'] = resp['table_config'];
      this._selectedColumns = resp['selectedColumns'] || [];
      this.isFilterShow = true;
      this.primengTable._filter();
    });
  }

  handleModalClose(key:any){
    if(key == 'call-api'){
      this.refreshItems()
    }
  }

  ngAfterViewInit() {
    // Defult Active filter show
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);

      // if (filterData['table_config']['modify_date_time']?.value != null) {
      //   filterData['table_config']['modify_date_time'].value = new Date(filterData['table_config']['modify_date_time'].value);
      // }

      this.primengTable['filters'] = filterData['table_config'];
      this._selectedColumns = filterData['selectedColumns'] || [];
      this.isFilterShow = true;
    }
  }

  refreshItems(event?: any): void {
    this.isLoading = true;
    this.cashbackService.getCashbackParametersList(this.getNewFilterReq(event)).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.dataList = data.data;
        this.cashbackService.setCashbackList(this.dataList)
        this.totalRecords = data.total;
      },
      error: (err) => {
        this.alertService.showToast('error', err, 'top-right', true);
        this.isLoading = false;
      },
    });
  }

  createInternal(model: any): void {
    this.modalService.openModal('create', { data: null, title: 'Create Cashback Parameters', edit: true });
  }

  editInternal(record): void {
    this.cashbackService.setCashbackId(record.cashback_for_id)
    this.modalService.openModal('edit', { data: record, title: 'Edit Cashback Parameters', edit: true });
  }

  viewInternal(record: any): void {
    this.modalService.openModal('readOnly', { data: record, title: 'Cashback Parameters Info', list: true })
  }

  deleteInternal(record: any, index: number): void {
    const label: string = 'Delete Cashback Parameters';
    this.conformationService
      .open({
        title: label,
        message: 'Are you sure to ' + label.toLowerCase() + ' for ' + record.cashback_for + ' ?',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res === 'confirmed') {
          this.cashbackService.delete(record.id).subscribe({
            next: () => {
              this.alertService.showToast(
                'success',
                'Cashback Parameter has been deleted!',
                'top-right',
                true
              );
              this.dataList.splice(index, 1)
            },
            error: (err) => {
              this.alertService.showToast(
                'error',
                err,
                'top-right',
                true
              );
            },
          });
        }
      });
  }

  setEnableDisable(data: any): void {
    // if (!Security.hasPermission(walletRechargePermissions.auditUnauditPermissions)) {
    // 	return this.alertService.showToast('error', messages.permissionDenied);
    // }

    const label: string = data.is_enable ? 'Disable Cashback' : 'Enable Cashback';
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ?'
    }).afterClosed().subscribe({
      next: (res) => {
        if (res === 'confirmed') {
          this.cashbackService.setEnableDisable(data.id).subscribe({
            next: () => {
              if (!data.is_enable) {
                this.alertService.showToast('success', "Cashback has been enable.", "top-right", true);
              } else {
                this.alertService.showToast('success', "Cashback has been disable.", "top-right", true);
              }

              data.is_enable = !data.is_enable;
              this.cashbackService.setCashbackList(this.dataList);
              // this.refreshItems()

            }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
          });
        }
      }
    })

  }

  getCompanyList(){
    this.cashbackService.getCompanyCombo("").subscribe({
      next: (data) => {
        this.cashforList = data.map((item: any) => {
          return {
            ...item, 
            label: item.company_name === "BONTON HOLIDAYS PVT. LTD." ? 'Company' : 'Agent',
          };
        });
        this.cashbackService.setCompanyList(this.cashforList);
      },
      error: (err) => {
        this.alertService.showToast('error', err, 'top-right', true);
      },
    });
  }

  getNodataText(): string {
    if (this.isLoading) return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

  ngOnDestroy(): void {
    // this.masterService.setData(this.key, this);
    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }
}
