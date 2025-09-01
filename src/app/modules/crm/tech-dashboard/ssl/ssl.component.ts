import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { BaseListingComponent } from 'app/form-models/base-listing';
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
import { AppConfig } from 'app/config/app-config';
import { module_name, filter_module_name, messages, Security } from 'app/security';
import { Subject, Subscription } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { AgentService } from 'app/services/agent.service';
import { CrmService } from 'app/services/crm.service';
import { GlobalSearchService } from 'app/services/global-search.service';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-ssl',
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
  templateUrl: './ssl.component.html',
  styleUrls: ['./ssl.component.scss']
})
export class SslComponent extends BaseListingComponent {

  @Input() isFilterShowSsl: boolean;
  @Output() isFilterShowSslChange = new EventEmitter<boolean>();
  cols = [];
  total = 0;

  dataList: any;
  appConfig = AppConfig;
  isLoading: any;
  searchInputControlSSL = new FormControl('');
  @ViewChild('tabGroup') tabGroup;
  @ViewChild(MatPaginator) public _paginator: MatPaginator;
  @ViewChild(MatSort) public _sortArchive: MatSort;
  getWLSettingList = [];
  Mainmodule: any;
  public _unsubscribeAll: Subject<any> = new Subject<any>();
  public key: any;
  public sortColumn: any;
  public sortDirection: any;

  module_name = module_name.techDashboard;
  filter_table_name = filter_module_name.tech_dashboard_ssl;
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
    this.sortColumn = 'domainName';
    this.sortDirection = 'asc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  ngOnInit(): void {
    this.agentList = this._filterService.agentListByValue;

    // common filter
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
      this.selectedAgent = resp['table_config']['agency_name']?.value;
      if (this.selectedAgent && this.selectedAgent.id) {

        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }
      // this.sortColumn = resp['sortColumn'];
      // this.primengTable['_sortField'] = resp['sortColumn'];
      if (resp['table_config']['activation_date'].value) {
        resp['table_config']['activation_date'].value = new Date(resp['table_config']['activation_date'].value);
      }
      if (resp['table_config']['expiry_date'].value) {
        resp['table_config']['expiry_date'].value = new Date(resp['table_config']['expiry_date'].value);
      }
      this.primengTable['filters'] = resp['table_config'];
      this.isFilterShowSsl = true;
      this.isFilterShowSslChange.emit(this.isFilterShowSsl);
      this.primengTable._filter();
    });
  }

  ngAfterViewInit() {
    // Defult Active filter show
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      this.isFilterShowSsl = true;
      this.isFilterShowSslChange.emit(this.isFilterShowSsl);
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
      if (filterData['table_config']['activation_date'].value) {
        filterData['table_config']['activation_date'].value = new Date(filterData['table_config']['activation_date'].value);
      }
      if (filterData['table_config']['expiry_date'].value) {
        filterData['table_config']['expiry_date'].value = new Date(filterData['table_config']['expiry_date'].value);
      }
      this.primengTable['filters'] = filterData['table_config'];
      // this.primengTable['_sortField'] = filterData['sortColumn'];
      // this.sortColumn = filterData['sortColumn'];
    }
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControlSSL.value)
      return `no search results found for \'${this.searchInputControlSSL.value}\'.`;
    else return 'No data to display';
  }

  refreshItems(event?: any) {
    this.isLoading = true;
    this.isLoading = true;
    const filterReq = this.getNewFilterReq(event);
    filterReq['Filter'] = this.searchInputControlSSL.value;
    // const filterReq = GridUtils.GetFilterReq(
    //     this._paginator,
    //     this._sortArchive,
    //     this.searchInputControlExpired.value, ""
    // );
    this.crmService.domainList(filterReq).subscribe({
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

  exportExcel(event?: any): void {
          if (!Security.hasExportDataPermission(this.module_name)) {
              return this.alertService.showToast('error', messages.permissionDenied);
          }
  
          const filterReq = this.getNewFilterReq(event);
          filterReq['Filter'] = this.searchInputControlSSL.value;
          filterReq['Take'] = this.totalRecords;
  
          this.crmService.domainList(filterReq).subscribe(data => {
              for (var dt of data.data) {
                  dt.sslExpiryDateTime = dt.sslExpiryDateTime ? DateTime.fromISO(dt.sslExpiryDateTime).toFormat('dd-MM-yyyy') : ''
              }
              Excel.export(
                  'SSL',
                  [
                      { header: 'Agent Code', property: 'agentCode' },
                      { header: 'Domain Name', property: 'domainName' },
                      { header: 'SSL Expiry Date Time', property: 'sslExpiryDateTime' },
                      { header: 'Domain Pointed', property: 'isDomainPointed' },
                      { header: 'IP Address', property: 'ipAddress' },
                  ],
                  data.data, "SSL", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }]);
          });
      }
}
