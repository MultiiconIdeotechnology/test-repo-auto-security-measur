import { NgIf, NgFor, DatePipe, CommonModule, NgClass } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent, Column, Types } from 'app/form-models/base-listing';
import { KycInfoComponent } from 'app/modules/masters/agent/kyc-info/kyc-info.component';
import { LeadEntryComponent } from 'app/modules/masters/lead/lead-entry/lead-entry.component';
import { Security, filter_module_name, kycDashboardPermissions, messages, module_name } from 'app/security';
import { KycDashboardService } from 'app/services/kyc-dashboard.service';
import { LeadsService } from 'app/services/leads.service';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { KycService } from 'app/services/kyc.service';
import { EmployeeService } from 'app/services/employee.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { MainComponent } from '../main/main.component';
import { EntityService } from 'app/services/entity.service';
import { AgentKycInfoComponent } from './agent-kyc-info/agent-kyc-info.component';
import { cloneDeep } from 'lodash';


@Component({
  selector: 'app-agent-kyc',
  templateUrl: './agent-kyc.component.html',
  styleUrls: ['./agent-kyc.component.scss'],
  styles: [`
  .tbl-grid {
    grid-template-columns:  40px 200px 200px 200px 220px 150px 200px 200px 200px;
  }
  `],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule,
    CommonModule,
    NgClass,
    RouterOutlet,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    PrimeNgImportsModule,
    MainComponent,
    AgentKycInfoComponent
  ]

})

export class AgentKycComponent extends BaseListingComponent implements OnDestroy {

  total = 0;
  dataList = [];
  serviceForList = ['All', 'Rejected'];
  public Status = new FormControl(this.serviceForList[0]);
  module_name = module_name.agentkyc;
  filter_table_name = filter_module_name.kyc_agent;
  private settingsUpdatedSubscription: Subscription;
  kycProfileList: any[] = [];
  selectedKycProfile: any;
  employeeList: any[] = [];
  selectedRm: any;

  types = Types;
  cols: Column[] = [
    { field: 'contact_person', header: 'Contact Person', type: Types.text },
  ];
  selectedColumns: Column[] = [];
  exportCol: Column[] = [];
  activeFiltData: any = {};

  // columns = [
  //   { key: 'agency_name', name: 'Agent', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, tooltip: true },
  //   { key: 'kyc_profile', name: 'KYC Profile', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false, tooltip: true },
  //   { key: 'relation_manager', name: 'RM', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false, tooltip: true },
  //   { key: 'email_address', name: 'Email', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false, tooltip: true },
  //   { key: 'mobile_number', name: 'Mobile', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false },
  //   { key: 'city_name', name: 'City', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false },
  //   { key: 'entry_date_time', name: 'Date', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false },
  //   { key: 'update_date_time', name: 'Update Date', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false },
  // ];

  statusList = [
    { label: 'Rejected', value: true },
    { label: 'Pending', value: false }
  ];

  isFilterShow: boolean = false;

  constructor(
    private kycDashboardService: KycDashboardService,
    private kycService: KycService,
    private entityService: EntityService,
    private conformationService: FuseConfirmationService,
    private employeeService: EmployeeService,
    private matDialog: MatDialog,
    public _filterService: CommonFilterService
  ) {
    super(module_name.agentkyc)
    // this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'update_date_time';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);

    this.selectedColumns = [
      { field: 'agency_name', header: 'Agent', type: Types.text },
      { field: 'kyc_profile', header: 'KYC Profile', type: Types.select },
      { field: 'relation_manager', header: 'RM', type: Types.select },
      { field: 'email_address', header: 'Email', type: Types.text },
      { field: 'mobile_no', header: 'Mobile', type: Types.text },
      { field: 'city_name', header: 'City', type: Types.text },
      { field: 'pincode', header: 'Pincode', type: Types.text },
      { field: 'address', header: 'Address', type: Types.text },
      { field: 'entry_date_time', header: 'Date', type: Types.date, dateFormat: 'dd-MM-yyyy HH:mm:ss' },
      { field: 'update_date_time', header: 'Update Date', type: Types.date, dateFormat: 'dd-MM-yyyy HH:mm:ss' },
      { field: 'is_rejected', header: 'Status', type: Types.select }
    ];
    this.cols.unshift(...this.selectedColumns);
    this.exportCol = cloneDeep(this.cols);
  }

  ngOnInit() {
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
      this.selectedKycProfile = resp['table_config']['kyc_profile_id_filters']?.value;
      this.selectedRm = resp['table_config']['relation_manager']?.value;
      // this.sortColumn = resp['sortColumn'];
      // this.primengTable['_sortField'] = resp['sortColumn'];

      if (resp['table_config']['entry_date_time'].value) {
        resp['table_config']['entry_date_time'].value = new Date(resp['table_config']['entry_date_time'].value);
      }
      if (resp['table_config']['update_date_time'].value) {
        resp['table_config']['update_date_time'].value = new Date(resp['table_config']['update_date_time'].value);
      }
      this.primengTable['filters'] = resp['table_config'];
      this.selectedColumns = resp['selectedColumns'] || [];

      this.isFilterShow = true;
      this.selectedColumns = this.checkSelectedColumn(resp['selectedColumns'] || [], this.selectedColumns);
      this.primengTable._filter();
    });

    this.getKycCombo();
    this.getRelationManagerList("");
  }

  ngAfterViewInit() {
    // Defult Active filter show
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
      this.selectedKycProfile = filterData['table_config']['kyc_profile_id_filters']?.value;
      this.selectedRm = filterData['table_config']['relation_manager']?.value;

      if (filterData['table_config']['entry_date_time'].value) {
        filterData['table_config']['entry_date_time'].value = new Date(filterData['table_config']['entry_date_time'].value);
      }
      if (filterData['table_config']['update_date_time'].value) {
        filterData['table_config']['update_date_time'].value = new Date(filterData['table_config']['update_date_time'].value);
      }
      this.primengTable['filters'] = filterData['table_config'];
      this.selectedColumns = filterData['selectedColumns'] || [];
      // this.primengTable['_sortField'] = filterData['sortColumn'];
      // this.sortColumn = filterData['sortColumn'];
      this.isFilterShow = true;
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

  // get selectedColumns(): Column[] {
  //   return this._selectedColumns;
  // }

  // set selectedColumns(val: Column[]) {
  //   if (Array.isArray(val)) {
  //     this._selectedColumns = this.cols.filter(col =>
  //       val.some(selectedCol => selectedCol.field === col.field)
  //     );
  //   } else {
  //     this._selectedColumns = [];
  //   }
  // }


  viewInternal(record) {
    this.entityService.raiseagentKycInfo({ data: record })

    // this.matDialog.open(LeadEntryComponent, {
    //   data: { data: record, title: 'Agent Info', readonly: true },
    //   disableClose: true
    // })
  }

  refreshItems(event?: any): void {
    this.isLoading = true;

    const request = this.getNewFilterReq(event)
    request['Status'] = this.Status.value == 'All' ? '' : this.Status.value;

    this.kycDashboardService.getAgentLeadKycList(request).subscribe({
      next: data => {
        this.isLoading = false;
        this.dataList = data.data;
        this.totalRecords = data.total;
        this.total = data.total;

      }, error: err => {
        this.isLoading = false;
      }
    })
  }

  getKycCombo() {
    this.kycService.getkycprofileCombo('agent').subscribe((data) => {
      this.kycProfileList = data;
    })
  }

  // To get Relationship Manager data from employeelist api
  getRelationManagerList(value: any) {
    this.employeeService.getemployeeCombo(value).subscribe((data) => {
      this.employeeList = data;

      for (let i in this.employeeList) {
        this.employeeList[i].id_by_value = this.employeeList[i].employee_name;
      }
    })
  }

  setKYCVerify(record): void {
    if (!Security.hasPermission(kycDashboardPermissions.agentViewKYCPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(KycInfoComponent, {
      data: { record: record, agent: true, isLead: 'Lead', isMaster: record.is_master_agent, send: 'agentKYC', isAgencyDuplicateName: true },
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res == 'confirmed') {
        // this.agentService.setMarkupProfile(record.id, res.transactionId).subscribe({
        //   next: () => {
        //     // record.is_blocked = !record.is_blocked;
        //     this.alertService.showToast('success', "The markup profile has been set", "top-right", true);
        //   }
        // })

        this.refreshItems();
      }
    })
  }

  // Hide as per instruction... 
  // leadConverter(record): void {
  //   if (!Security.hasPermission(kycDashboardPermissions.agentConvertToTAPermissions)) {
  //     return this.alertService.showToast('error', messages.permissionDenied);
  //   }

  //   const label: string = 'Convert to Travel Agent'
  //   this.conformationService.open({
  //     title: label,
  //     message: 'Are you sure to ' + label.toLowerCase() + ' ?'
  //   }).afterClosed().subscribe(res => {
  //     if (res === 'confirmed') {
  //       this.kycDashboardService.leadConvert(record.id).subscribe({
  //         next: (res) => {
  //           this.alertService.showToast('success', "Lead has been Converted to travel agent!", "top-right", true);
  //           this.refreshItems();
  //         }, error: (err) => {
  //           this.alertService.showToast('error', err, "top-right", true);

  //         },
  //       })
  //     }
  //   })
  // }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

  ngOnDestroy(): void {
    // this.masterService.setData(this.key, this)
    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }

  displayColCount(): number {
    return this.selectedColumns.length + 1;
  }


  isValidDate(value: any): boolean {
    const date = new Date(value);
    return value && !isNaN(date.getTime());
  }

}
