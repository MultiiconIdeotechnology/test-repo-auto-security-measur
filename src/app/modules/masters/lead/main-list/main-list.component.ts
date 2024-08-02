import { Security, leadsPermissions, messages, module_name } from './../../../../security';
import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { WAuditedComponent } from 'app/modules/account/withdraw/audited/audited.component';
import { WPendingComponent } from 'app/modules/account/withdraw/pending/pending.component';
import { WRejectedComponent } from 'app/modules/account/withdraw/rejected/rejected.component';
import { takeUntil, debounceTime, Subject } from 'rxjs';
import { LeadListComponent } from '../lead-list/lead-list.component';
import { ConvertedListComponent } from '../converted-list/converted-list.component';
import { Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { UserService } from 'app/core/user/user.service';
import { AgentService } from 'app/services/agent.service';
import { LeadsService } from 'app/services/leads.service';
import { KycInfoComponent } from '../../agent/kyc-info/kyc-info.component';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { LeadEntryComponent } from '../lead-entry/lead-entry.component';
import { AssignKycComponent } from '../assign-kyc/assign-kyc.component';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { CreateLeadComponent } from '../create-lead/create-lead.component';
import { environment } from 'environments/environment';
import { MarkupProfileDialogeComponent } from '../../agent/markup-profile-dialoge/markup-profile-dialoge.component';
import { SetKycProfileComponent } from '../../agent/set-kyc-profile/set-kyc-profile.component';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { EmployeeService } from 'app/services/employee.service';

@Component({
  selector: 'app-main-list',
  templateUrl: './main-list.component.html',
  // styleUrls: ['./main-list.component.scss'],
  styles: [`
  .tbl-grid {
    grid-template-columns:  40px 180px 110px 110px 210px 220px 130px 200px;
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
    MatSortModule,
    MatFormFieldModule,
    MatMenuModule,
    MatDialogModule,
    MatDividerModule,
    CommonModule,
    MatTabsModule,
    WPendingComponent,
    WAuditedComponent,
    WRejectedComponent,
    LeadListComponent,
    ConvertedListComponent,
    PrimeNgImportsModule
  ],
})
export class MainListComponent extends BaseListingComponent {

  module_name = module_name.newSignup
  dataList = [];
  user: any = {};
  total = 0;
  Mainmodule: any;
  _selectedColumns: Column[];
  isFilterShow: boolean = false;
  selectedRm:string;
  employeeList:any[] = [];
  // user: any = {};

  columns = [
    { key: 'agency_name', name: 'Agent', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, width: '50', align: '', indicator: false, tooltip: true },
    { key: 'lead_status', name: 'Status', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, width: '50', align: '', indicator: false },
    { key: 'entry_date_time', name: 'Date', is_date: true, date_formate: 'dd-MM-yyyy', is_sortable: true, class: '', is_sticky: false, width: '50', align: '', indicator: false },
    { key: 'relation_manager', name: 'RM', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, width: '50', align: '', indicator: false, tooltip: true },
    { key: 'email_address', name: 'Email', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, width: '50', align: '', indicator: false, tooltip: true },
    { key: 'mobile_number', name: 'Mobile', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, width: '50', align: '', indicator: false },
    { key: 'city_name', name: 'City', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, width: '50', align: '', indicator: false, tooltip: true },
  ]
  cols = [];

  statusList =  [ 'New', 'Converted', 'Live', 'Kyc Pending']

  constructor(
    private conformationService: FuseConfirmationService,
    private leadsService: LeadsService,
    private agentService: AgentService,
    // private alertService: ToasterService,
    private userService: UserService,
    private employeeService: EmployeeService,
    private matDialog: MatDialog,
    private router: Router,
  ) {
    super(module_name.newSignup)
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'entry_date_time';
    this.sortDirection = 'desc';
    this.Mainmodule = this

    this.userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user: any) => {
        this.user = user;
      });
  }

  ngOnInit() {
    this.cols = [
      { field: 'contact_person', header: 'Contact Person', type: 'text' },
    ];

    this.getRelationManagerList("");
  }

  get selectedColumns(): Column[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: Column[]) {
    this._selectedColumns = this.cols.filter((col) => val.includes(col));
  }

  refreshItems(event?: any): void {
    this.isLoading = true;

    // const filterReq = GridUtils.GetFilterReq(
    //   this._paginatorPending,
    //   this._sortPending,
    //   this.searchInputControlPending.value, "entry_date_time", 1
    // );

    var model = this.getNewFilterReq(event);
    model['Status'] = '';
    if (Security.hasPermission(leadsPermissions.viewOnlyAssignedPermissions)) {
      model['relationmanagerId'] = this.user.id
    }

    this.leadsService.getAgentLeadList(model).subscribe({
      next: data => {
        this.isLoading = false;
        this.dataList = data.data;
        // this._paginator.length = data.total;
        this.totalRecords = data.total;
      }, error: err => {
        this.alertService.showToast('error', err, 'top-right', true)
        this.isLoading = false;
      }
    })
  }

  // To get Relationship Manager data from employeelist api
  getRelationManagerList(value: any) {
    this.employeeService.getemployeeCombo(value).subscribe((data) => {
        this.employeeList = data;
    })
}

  create(): void {
    this.matDialog.open(CreateLeadComponent, {
      data: null,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.refreshItems();
      }
    })
  }

  modifyReditect(record) {
    if (!Security.hasEditEntryPermission(module_name.newSignup)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    // window.open( record.url + `kyc-dashboard/` + record.id + `/email`);

    if (environment.isEnvironment == 'production') {
      window.open(record.url + `kyc-dashboard/` + record.id + `/email`);
    } else {
      window.open(environment.stagingUrl + `kyc-dashboard/` + record.id + `/email`);
    }
  }

  setKYCVerify(record): void {
    if (!Security.hasPermission(leadsPermissions.viewKYCPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(KycInfoComponent, {
      data: { record: record, agent: true, isLead: 'Lead', send: 'leadMaster' },
      disableClose: true
    }).afterClosed().subscribe(res => {

    })
  }

  view(record) {
    if (!Security.hasViewDetailPermission(module_name.newSignup)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(LeadEntryComponent, {
      data: { data: record, title: 'Lead Info', readonly: true },
      disableClose: true
    })
  }

  leadConverter(record): void {
    // if (!Security.hasNewEntryPermission(this.module)) {
    //     this.alertService.error('Permission Denied.');
    //     return;
    // }
    const label: string = 'Convert to Agent'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.leadsService.leadConvert(record.id).subscribe({
          next: () => {
            // record.is_blocked = !record.is_blocked;
            this.alertService.showToast('success', "Lead has been Converted to agent!", "top-right", true);
            this.refreshItems();
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);

          },
        })
      }
    })
  }

  setEmailVerify(record): void {
    if (!Security.hasPermission(leadsPermissions.verifyEmailPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const Fdata = {
      id: record.id,
      from: "Lead"
    }
    const label: string = record.is_email_verified ? 'Unverify Email' : 'Verify Email'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.email_address + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.agentService.setEmailVerify(Fdata).subscribe({
          next: () => {
            record.is_email_verified = !record.is_email_verified;
            if (record.is_email_verified) {
              this.alertService.showToast('success', "Email has been verified!", "top-right", true);
            }
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);

          },
        })
      }
    })
  }

  setMobileVerify(record): void {
    if (!Security.hasPermission(leadsPermissions.verifyMobilePermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const Fdata = {
      id: record.id,
      from: "Lead"
    }
    const label: string = record.is_mobile_verified ? 'Unverify Mobile' : 'Verify Mobile'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.mobile_number + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.agentService.setMobileVerify(Fdata).subscribe({
          next: () => {
            record.is_mobile_verified = !record.is_mobile_verified;
            if (record.is_mobile_verified) {
              this.alertService.showToast('success', "Mobile number has been verified", "top-right", true);
            }
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);

          },
        })
      }
    })
  }

  assignKYC(record): void {

    this.matDialog.open(AssignKycComponent, {
      data: { data: record, readonly: true },
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {

      }
    })
  }

  setMarkupProfile(record): void {
    if (!Security.hasPermission(leadsPermissions.setMarkupProfilePermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(MarkupProfileDialogeComponent, {
      data: record,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        // this.agentService.setMarkupProfile(record.id, res.transactionId).subscribe({
        //   next: () => {
        //     this.alertService.showToast('success', "The markup profile has been set!", "top-right", true);
        //   },
        //   error: (err) => {
        //     this.alertService.showToast('error', err, 'top-right', true);

        //   },
        // })
      }
    })
  }

  kycProfile(record): void {
    if (!Security.hasPermission(leadsPermissions.setKYCProfilePermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(SetKycProfileComponent, {
      data: record,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.agentService.setKYCProfile(record.id, res.kyc_profile_id).subscribe({
          next: () => {
            this.alertService.showToast('success', "KYC Profile has been set!", "top-right", true);
            record.kyc_profile_id = res.kyc_profile_id;
            this.refreshItems()
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);

          },
        })
      }
    })
  }

  exportExcel(): void {
    if (!Security.hasExportDataPermission(this.module_name)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    // const filterReq = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value);
    // const req = Object.assign(filterReq);

    // req.skip = 0;
    // req.take = this._paginator.length;
    const filterReq = this.getNewFilterReq({});
    filterReq['Take'] = this.totalRecords;

    this.leadsService.getAgentLeadList(filterReq).subscribe(data => {
      for (var dt of data.data) {
        // dt.amendment_request_time = DateTime.fromISO(dt.amendment_request_time).toFormat('dd-MM-yyyy HH:mm:ss')
        dt.entry_date_time = DateTime.fromISO(dt.entry_date_time).toFormat('dd-MM-yyyy')
      }
      Excel.export(
        'New Signup',
        [
          { header: 'Agent', property: 'agency_name' },
          { header: 'Status', property: 'lead_status' },
          { header: 'Date', property: 'entry_date_time' },
          { header: 'RM', property: 'relation_manager' },
          { header: 'Email', property: 'email_address' },
          { header: 'Mobile', property: 'mobile_number' },
          { header: 'City', property: 'city_name' },
          { property: 'contact_person', header: 'Contact Person' },
        ],
        data.data, "New Signup", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }]);
    });
  }


  getStatusColor(status: string): string {
        if (status == 'New') {
            return 'text-yellow-600';
        } else if (status == 'Converted' || status == 'Live') {
            return 'text-green-600';
        }  else if (status == 'Kyc Pending') {
            return 'text-blue-600';
        } else if (status == 'Kyc Rejected') {
            return 'text-red-600';
        } else {
            return '';
        }
    }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

}
