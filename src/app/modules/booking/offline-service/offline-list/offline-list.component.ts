import { NgIf, NgFor, DatePipe, CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
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
import { Router, RouterOutlet } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, filter_module_name, module_name, offlineServicePermissions } from 'app/security';
import { OfflineserviceService } from 'app/services/offlineservice.service';
import { ToasterService } from 'app/services/toaster.service';
import { VisaService } from 'app/services/visa.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { OfflineEntryComponent } from '../offline-entry/offline-entry.component';
import { Routes } from 'app/common/const';
import { UserService } from 'app/core/user/user.service';
import { takeUntil } from 'rxjs';
import { OperationPersonComponent } from '../operation-person/operation-person.component';
import { MatDividerModule } from '@angular/material/divider';
import { OsbLogsComponent } from '../osb-logs/osb-logs.component';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { EmployeeService } from 'app/services/employee.service';
import { AgentService } from 'app/services/agent.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
  selector: 'app-offline-list',
  templateUrl: './offline-list.component.html',
  styleUrls: ['./offline-list.component.scss'],
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
    MatDividerModule,
    PrimeNgImportsModule
  ]
})
export class OfflineListComponent extends BaseListingComponent {

  module_name = module_name.offlineService;
  filter_table_name = filter_module_name.offline_service_booking;
  private settingsUpdatedSubscription: Subscription;
  dataList = [];
  total = 0;
  visaFilter: any;
  user: any = {};
  selectedEmployee: any;
  selectedAgent: any;
  cols = [];
  statusList = ['New', 'Completed', 'Pending'];
  isFilterShow: boolean = false;
  employeeList: any[] = [];
  agentList: any[] = [];

  constructor(
    private matDialog: MatDialog,
    private toasterService: ToasterService,
    private router: Router,
    private offlineService: OfflineserviceService,
    private userService: UserService,
    private conformationService: FuseConfirmationService,
    private employeeService: EmployeeService,
    private agentService: AgentService,
    public _filterService: CommonFilterService
  ) {
    super(module_name.offlineService);
    this.key = this.module_name;
    this.sortColumn = 'entry_date_time';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);

    this.userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user: any) => {
        this.user = user;
      });
  }

  ngOnInit(): void {
    this.getRelationManagerList("");
    this.getAgent("");

    // common filter
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
      this.selectedAgent = resp['table_config']['dec_agent_id']?.value;
      if (this.selectedAgent && this.selectedAgent.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }
      this.selectedEmployee = resp['table_config']['sales_person_flitres']?.value;

      // this.sortColumn = resp['sortColumn'];
      // this.primengTable['_sortField'] = resp['sortColumn'];
      if (resp['table_config']['entry_date_time'].value) {
        resp['table_config']['entry_date_time'].value = new Date(resp['table_config']['entry_date_time'].value);
      }
      this.primengTable['filters'] = resp['table_config'];
      this.isFilterShow = true;
      this.primengTable._filter();
    });
  }

  ngAfterViewInit() {
    // Defult Active filter show
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      this.isFilterShow = true;
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
      this.selectedAgent = filterData['table_config']['dec_agent_id']?.value;
      this.selectedEmployee = filterData['table_config']['sales_person_flitres']?.value;
      if (filterData['table_config']['entry_date_time'].value) {
        filterData['table_config']['entry_date_time'].value = new Date(filterData['table_config']['entry_date_time'].value);
      }
      // this.primengTable['_sortField'] = filterData['sortColumn'];
      // this.sortColumn = filterData['sortColumn'];
      this.primengTable['filters'] = filterData['table_config'];
    }
  }

  getFilter(): any {
    const filterReq = GridUtils.GetFilterReq(
      this._paginator,
      this._sort,
      this.searchInputControl.value
    );
    return filterReq;
  }

  refreshItems(event?: any) {
    this.isLoading = true;
    let extraModel = this.getFilter();
    let oldModel = this.getNewFilterReq(event)
    let model = { ...extraModel, ...oldModel };

    if (Security.hasPermission(offlineServicePermissions.viewOnlyAssignedPermissions)) {
      model.relationmanagerId = this.user.id
    }

    this.offlineService.getOfflineServiceBookingList(model).subscribe({
      next: (data: any) => {
        this.isLoading = false;
        this.dataList = data.data;
        // this._paginator.length = data.total;
        this.totalRecords = data.total;

      },
      error: (err) => {
        this.toasterService.showToast('error', err)
        this.isLoading = false;
      },
    });
  }

  //Function to get Agent List from api
  getAgent(value: string, bool = true) {
    this.agentService.getAgentComboMaster(value, bool).subscribe((data) => {
      this.agentList = data;

      if (this.selectedAgent && this.selectedAgent.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }

      for (let i in this.agentList) {
        this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}${this.agentList[i].email_address}`
      }
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

  viewInternal(record): void {
    this.router.navigate([
      Routes.booking.offline_service_entry_route + '/' + record.id + '/readonly',
    ]);
  }

  //create
  createInternal(model): void {
    this.matDialog.open(OfflineEntryComponent,
      { data: null, disableClose: true, })
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

  editInternal(record): void {
    this.matDialog.open(OfflineEntryComponent, {
      data: { data: record, readonly: false },
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.alertService.showToast('success', "Record modified", "top-right", true);
        this.refreshItems();
      }
    })
  }

  deleteInternal(record): void {
    const label: string = 'Delete Offline Service'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.agent_name + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.offlineService.delete(record.id).subscribe({
          next: () => {
            this.alertService.showToast('success', "Offline Service has been deleted!", "top-right", true);
            this.refreshItems();
          }, error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);
          }
        })
      }
    })
  }

  getStatusColor(status: string): string {
    if (status == 'Pending') {
      return 'text-orange-600';
    } else if (status == 'Completed') {
      return 'text-green-600';
    } else if (status == 'Rejected' || status == 'Cancelled') {
      return 'text-red-600';
    } else if (status == 'New') {
      return 'text-blue-600';
    } else {
      return '';
    }
  }

  OperationPerson(data: any) {
    this.matDialog.open(OperationPersonComponent, {
      data: data,
    }).afterClosed().subscribe(res => {
      if (res)
        this.refreshItems();
    })
  }

  StatusChangeLog(data: any) {
    this.matDialog.open(OsbLogsComponent,
      {
        data: data
      })
  }

  getNodataText(): string {
    if (this.isLoading) return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

  ngOnDestroy(): void {

    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }

}
