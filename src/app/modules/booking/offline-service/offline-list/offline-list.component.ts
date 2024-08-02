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
import { Security, module_name, offlineServicePermissions } from 'app/security';
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

@Component({
  selector: 'app-offline-list',
  templateUrl: './offline-list.component.html',
  styleUrls: ['./offline-list.component.scss'],
  styles: [`
    .tbl-grid {
      grid-template-columns:  40px 200px 130px 120px 200px 200px 200px 200px;
    }
  `],
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

  module_name = module_name.offlineService
  dataList = [];
  total = 0;
  visaFilter: any;
  user: any = {};
  selectedEmployee:string;

  columns = [
    {
      key: 'booking_ref_number', name: 'Booking Ref', is_fixed: true, is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false, applied: false, tooltip: true, toBooking: false,
    },
    {
      key: 'status', name: 'Status', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
    },
    {
      key: 'dec_agent_id', name: 'Agent Code', is_date: false, date_formate: '', is_sortable: true, class: 'header-center-view', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
    },
    {
      key: 'agent_name', name: 'Agency Name', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false, applied: false, toBooking: false, tooltip: true,
    },
    {
      key: 'operation_person', name: 'Operation Person', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: true
    },
    {
      key: 'sales_person', name: 'RM', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false, applied: false, tooltip: true, toColor: false
    },
    {
      key: 'entry_date_time', name: 'Entry Date', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
    },
  ]
  cols = [];
  statusList = [ 'New', 'Completed', 'Pending'];
  isFilterShow: boolean = false;
  employeeList:any[] = [];
  agentList:any[] = [];

  constructor(
    private matDialog: MatDialog,
    private toasterService: ToasterService,
    private router: Router,
    private offlineService: OfflineserviceService,
    private userService: UserService,
    private conformationService: FuseConfirmationService,
    private employeeService: EmployeeService,
    private agentService: AgentService
  ) {
    super(module_name.offlineService);
    this.cols = this.columns.map((x) => x.key);
    this.key = this.module_name;
    this.sortColumn = 'entry_date_time';
    this.sortDirection = 'desc';
    this.Mainmodule = this;

    this.userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user: any) => {
        this.user = user;
      });
  }

  ngOnInit(): void {
    this.getRelationManagerList("");
    this.getAgent("");
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
  getAgent(value: string) {
    this.agentService.getAgentCombo(value).subscribe((data) => {
        this.agentList = data;

        for (let i in this.agentList) {
            this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}${this.agentList[i].email_address}`
        }
    })
}

  // To get Relationship Manager data from employeelist api
  getRelationManagerList(value: any) {
    this.employeeService.getemployeeCombo(value).subscribe((data) => {
        this.employeeList = data;
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
    } else if ( status == 'Rejected' || status == 'Cancelled') {
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

}
