import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { TechInfoTabsComponent } from '../info-tabs/info-tabs.component';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { AppConfig } from 'app/config/app-config';
import { module_name, filter_module_name, messages, Security, techDashPermissions } from 'app/security';
import { Subject, Subscription } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { AgentService } from 'app/services/agent.service';
import { CrmService } from 'app/services/crm.service';
import { GlobalSearchService } from 'app/services/global-search.service';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { DomainSslVerificationComponent } from '../domain-ssl-verification/domain-ssl-verification.component';

@Component({
  selector: 'app-cancelled',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    NgxMatSelectSearchModule,
    MatTooltipModule,
    MatAutocompleteModule,
    RouterOutlet,
    MatOptionModule,
    MatDividerModule,
    MatSortModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    MatDialogModule,
    CommonModule,
    MatTabsModule,
    MatProgressBarModule,
    TechInfoTabsComponent,
    PrimeNgImportsModule
  ],
  templateUrl: './cancelled.component.html',
  styleUrls: ['./cancelled.component.scss']
})
export class CancelledComponent extends BaseListingComponent {
  @Input() isFilterShowCancelled: boolean;
  @Output() isFilterShowCancelledChange = new EventEmitter<boolean>();
  cols = [];
  total = 0;

  dataList: any;
  appConfig = AppConfig;
  isLoading: any;
  searchInputControlCancelled = new FormControl('');
  @ViewChild('tabGroup') tabGroup;
  @ViewChild(MatPaginator) public _paginator: MatPaginator;
  @ViewChild(MatSort) public _sortArchive: MatSort;
  getWLSettingList = [];
  Mainmodule: any;
  public _unsubscribeAll: Subject<any> = new Subject<any>();
  public key: any;
  public sortColumn: any;
  public sortDirection: any;
  module_name = module_name.lead;
  filter_table_name = filter_module_name.tech_dashboard_cancelled;
  private settingsUpdatedSubscription: Subscription;
  data: any;
  selectedAgent: any;
  agentList: any[] = [];
  filter: any = {}

  constructor(
    private crmService: CrmService,
    private matDialog: MatDialog,
    private conformationService: FuseConfirmationService,
    private agentService: AgentService,
    public _filterService: CommonFilterService,
    public globalSearchService: GlobalSearchService
  ) {
    super(module_name.techDashboard)
    this.key = this.module_name;
    this.sortColumn = 'expiryDate';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  ngOnInit(): void {
    this.agentList = this._filterService.agentListByValue;

    // common filter
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
      this._filterService.updateSelectedOption('');
      this._filterService.updatedSelectionOptionTwo('');
      this.selectedAgent = resp['table_config']['agency_name']?.value;
      if (this.selectedAgent && this.selectedAgent.id) {

        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }
      // this.sortColumn = resp['sortColumn'];
      // this.primengTable['_sortField'] = resp['sortColumn'];
      if (resp['table_config']['activationDate']?.value != null && resp['table_config']['activationDate'].value.length) {
        this._filterService.updateSelectedOption('custom_date_range');
        this._filterService.rangeDateConvert(resp['table_config']['activationDate']);
      }

      if (resp['table_config']['expiryDate']?.value != null && resp['table_config']['expiryDate'].value.length) {
        this._filterService.updatedSelectionOptionTwo('custom_date_range');
        this._filterService.rangeDateConvert(resp['table_config']['expiryDate']);
      }
      this.primengTable['filters'] = resp['table_config'];
      this.isFilterShowCancelled = true;
      this.isFilterShowCancelledChange.emit(this.isFilterShowCancelled);
      this.primengTable._filter();
    });
  }

  ngAfterViewInit() {
    // Defult Active filter show
    this._filterService.updateSelectedOption('');
    this._filterService.updatedSelectionOptionTwo('');
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      this.isFilterShowCancelled = true;
      this.isFilterShowCancelledChange.emit(this.isFilterShowCancelled);
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
      setTimeout(() => {
        this.selectedAgent = filterData['table_config']['agency_name']?.value;
        if (this.selectedAgent && this.selectedAgent.id) {

          const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
          if (!match) {
            this.agentList.push(this.selectedAgent);
          }
        }
      }, 1000);
      if (filterData['table_config']['activationDate']?.value != null && filterData['table_config']['activationDate'].value.length) {
        this._filterService.updateSelectedOption('custom_date_range');
        this._filterService.rangeDateConvert(filterData['table_config']['activationDate']);
      }

      if (filterData['table_config']['expiryDate']?.value != null && filterData['table_config']['expiryDate'].value.length) {
        this._filterService.updatedSelectionOptionTwo('custom_date_range');
        this._filterService.rangeDateConvert(filterData['table_config']['expiryDate']);
      }
      this.primengTable['filters'] = filterData['table_config'];
      // this.primengTable['_sortField'] = filterData['sortColumn'];
      // this.sortColumn = filterData['sortColumn'];
    }
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControlCancelled.value)
      return `no search results found for \'${this.searchInputControlCancelled.value}\'.`;
    else return 'No data to display';
  }

  refreshItems(event?: any) {
    this.isLoading = true;
    this.isLoading = true;
    const filterReq = this.getNewFilterReq(event);
    filterReq['Filter'] = this.searchInputControlCancelled.value;
    // const filterReq = GridUtils.GetFilterReq(
    //     this._paginator,
    //     this._sortArchive,
    //     this.searchInputControlExpired.value, ""
    // );
    this.crmService.getCancelledProductList(filterReq).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.dataList = data.data;
        this.totalRecords = data.total;
        // this._paginator.length = data?.total;
      },
      error: (err) => {
        this.alertService.showToast('error', err, 'top-right', true);
        this.isLoading = false;
      },
    });
  }

  // Api call to Get Agent data
  getAgent(value: string) {
    this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
      this.agentList = data;

      for (let i in this.agentList) {
        this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`;
        this.agentList[i].id_by_value = this.agentList[i].agency_name;
      }
    })
  }

  wlSetting(record: any) {
    if (!Security.hasPermission(techDashPermissions.wlSettingPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.crmService.getWLSettingListTwoParams(record?.code, record?.item_name).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.getWLSettingList = data[0];

        this.matDialog.open(DomainSslVerificationComponent, {
          disableClose: true,
          data: { record: record, wlSettingList: this.getWLSettingList, from: 'expired' },
          panelClass: ['custom-dialog-modal-md'],
          autoFocus: false,
        }).afterClosed().subscribe((res: any) => {
          if (res && res == 'expired') {
            this.refreshItems();
          }
        })
      },
      error: (err) => {
        this.alertService.showToast('error', err, 'top-right', true);
        this.isLoading = false;
      },
    });
  }

  updateExpiryDate(record): void {
    if (!Security.hasPermission(techDashPermissions.updateExpiryDatePermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const label: string = 'Update Expiry Date';
    this.conformationService
      .open({
        title: label,
        message: 'Do you want to Update Expiry Date?',
        inputBox: 'Date',
        dateCustomShow: true,
        customShow: false,
        datepickerParameter: record?.activationDate
      })
      .afterClosed()
      .subscribe((res) => {
        if (res?.action === 'confirmed') {
          let newJson = {
            id: record?.id ? record?.id : "",
            expiryDate: res?.date ? DateTime.fromISO(res?.date).toFormat('yyyy-MM-dd') : ""
          }
          this.crmService.updateExpiryDate(newJson).subscribe({
            next: (res) => {
              this.alertService.showToast(
                'success',
                'Update Expiry Date has been updated!',
                'top-right',
                true
              );
              if (res) {
                this.refreshItems();
              }
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

  viewDetail(record): void {
    this.matDialog.open(TechInfoTabsComponent, {
      data: { data: record, readonly: true },
      disableClose: true,
    });
  }

  blockAction(record, index): void {
    // if (!Security.hasPermission(agentsPermissions.removeAllSubagentPermissions)) {
    //     return this.alertService.showToast('error', messages.permissionDenied);
    // }

    const label: string = 'Blocked';
    this.conformationService
      .open({
        title: label,
        message: 'Do you want to Blocked?',
        inputBox: 'Status Remark',
        customShow: true
      })
      .afterClosed()
      .subscribe((res) => {
        if (res?.action === 'confirmed') {
          let newJson = {
            ServiceId: record.id,
            Isblock: true,
            BlockRemarks: res?.statusRemark ? res?.statusRemark : ""
          }
          this.crmService.blocked(newJson).subscribe({
            next: (res) => {
              if (res) {
                this.alertService.showToast(
                  'success',
                  'Blocked Successfully!',
                  'top-right',
                  true
                );
                this.dataList.splice(index, 1);
              }
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

  ngOnDestroy(): void {

    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }

  exportExcel(event?: any): void {
    if (!Security.hasExportDataPermission(this.module_name)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const filterReq = this.getNewFilterReq(event);
    filterReq['Filter'] = this.searchInputControlCancelled.value;
    filterReq['Take'] = this.totalRecords;

    this.crmService.getCancelledProductList(filterReq).subscribe(data => {
      for (var dt of data.data) {
        dt.activationDate = dt.activationDate ? DateTime.fromISO(dt.activationDate).toFormat('dd-MM-yyyy') : ''
        dt.expiryDate = dt.expiryDate ? DateTime.fromISO(dt.expiryDate).toFormat('dd-MM-yyyy') : ''
      }
      Excel.export(
        'Cancelled',
        [
          { header: 'Item Code', property: 'itemCode' },
          { header: 'Item', property: 'itemName' },
          { header: 'Product', property: 'productName' },
          { header: 'Agent Code', property: 'agentCode' },
          { header: 'Agency Name', property: 'agencyName' },
          { header: 'Activation Date', property: 'activationDate' },
          { header: 'Expiry Date', property: 'expiryDate' },
          { header: 'RM', property: 'rm' },
        ],
        data.data, "Cancelled", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }]);
    });
  }

}
