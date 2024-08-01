import { LeadsService } from './../../../../services/leads.service';
import { MatMenuModule } from '@angular/material/menu';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, leadsPermissions, messages, module_name } from 'app/security';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Routes } from 'app/common/const';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatDividerModule } from '@angular/material/divider';
import { AgentService } from 'app/services/agent.service';
import { KycInfoComponent } from '../../agent/kyc-info/kyc-info.component';
import { LeadEntryComponent } from '../lead-entry/lead-entry.component';
import { AssignKycComponent } from '../assign-kyc/assign-kyc.component';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { Subject, takeUntil } from 'rxjs';
import { ToasterService } from 'app/services/toaster.service';
import { AppConfig } from 'app/config/app-config';
import { UserService } from 'app/core/user/user.service';

@Component({
  selector: 'app-lead-list',
  templateUrl: './lead-list.component.html',
  styles: [`
  .tbl-grid {
    grid-template-columns:  40px 180px 110px 110px 210px 220px 170px 200px;
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
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule,
    CommonModule
  ]
})
export class LeadListComponent {

  total = 0;
  dataList = [];
  @ViewChild('tabGroup') tabGroup;
  @ViewChild(MatPaginator) public _paginatorPending: MatPaginator;
  @ViewChild(MatSort) public _sortPending: MatSort;
  searchInputControlPending = new FormControl('');
  public _unsubscribeAll: Subject<any> = new Subject<any>();

  Mainmodule: any;
  isLoading = false;
  public key: any;
  public sortColumn: any;
  public sortDirection: any;
  module_name = module_name.newSignup
  user: any = {};

  appConfig = AppConfig;


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

  constructor(
      private conformationService: FuseConfirmationService,
      private leadsService: LeadsService,
      private agentService: AgentService,
      private alertService: ToasterService,
      private userService: UserService,
      private matDialog: MatDialog,
      private router: Router,
  ) {
    // super(module_name.employee)
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

  ngOnInit(): void {
    this.searchInputControlPending.valueChanges
      .subscribe(() => {
        GridUtils.resetPaginator(this._paginatorPending);
        this.refreshItems();
      });
    this.refreshItems();
  }

  refreshItems(): void {
    this.isLoading = true;

    const filterReq = GridUtils.GetFilterReq(
      this._paginatorPending,
      this._sortPending,
      this.searchInputControlPending.value, "entry_date_time", 1
    );

    filterReq['Status'] = '';
    if (Security.hasPermission(leadsPermissions.viewOnlyAssignedPermissions)) {
      filterReq['relationmanagerId'] = this.user.id
    }


    this.leadsService.getAgentLeadList(filterReq).subscribe({
      next: data => {
        this.isLoading = false;
        this.dataList = data.data;
        this._paginatorPending.length = data.total;

        this.total = data.total;

      }, error: err => {
        this.alertService.showToast('error', err, 'top-right', true)
        this.isLoading = false;
      }
    })
  }

  // refreshItems(): void {
  //   this.isLoading = true;
  //   this.leadsService.getAgentLeadList(this.getFilterReq()).subscribe({
  //     next: data => {
  //       this.isLoading = false;
  //       this.dataList = data.data;
  //       this._paginator.length = data.total;
  //       this.total = data.total;
  //     }, error: err => {
  //       this.isLoading = false;
  //     }
  //   })
  // }

  modifyReditect(record) {
    if (!Security.hasEditEntryPermission(module_name.newSignup)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    window.open( record.url + `kyc-dashboard/` + record.id + `/email`);
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

  // viewInternal(record): void {
  //   this.router.navigate([Routes.masters.agent_entry_route + '/' + record.id + '/readonly' + '/lead'])
  // }

  view(record) {
    if (!Security.hasViewDetailPermission(module_name.newSignup)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(LeadEntryComponent, {
      data: { data: record, title: 'Lead Info', readonly: true },
      disableClose: true
    })
  }

  // delete(record): void {
  //   const label: string = 'Delete Lead'
  //   this.conformationService.open({
  //     title: label,
  //     message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.agency_name + ' ?'
  //   }).afterClosed().subscribe(res => {
  //     if (res === 'confirmed') {
  //       this.agentService.delete(record.id).subscribe({
  //         next: () => {
  //           this.alertService.showToast('success', "Lead has been deleted!", "top-right", true);
  //           this.refreshItems();
  //         }, error: err => {
  //           this.alertService.showToast('error', err, "top-right", true);
  //         }
  //       })
  //     }
  //   })
  // }

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

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControlPending.value)
      return `no search results found for \'${this.searchInputControlPending.value}\'.`;
    else return 'No data to display';
  }

  // ngOnDestroy(): void {
  //   this.masterService.setData(this.key, this)
  // }

}
