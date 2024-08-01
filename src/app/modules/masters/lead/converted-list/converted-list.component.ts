import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AppConfig } from 'app/config/app-config';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, leadsPermissions, messages, module_name } from 'app/security';
import { EntityService } from 'app/services/entity.service';
import { LeadsService } from 'app/services/leads.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { Subject, takeUntil } from 'rxjs';
import { LeadEntryComponent } from '../lead-entry/lead-entry.component';
import { AgentService } from 'app/services/agent.service';
import { KycInfoComponent } from '../../agent/kyc-info/kyc-info.component';
import { UserService } from 'app/core/user/user.service';

@Component({
  selector: 'app-converted-list',
  templateUrl: './converted-list.component.html',
  styleUrls: ['./converted-list.component.scss'],
  styles: [`
  .tbl-grid {
    grid-template-columns: 40px 180px 110px 110px 210px 220px 170px 200px;
  }
  `],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    DatePipe,
    AsyncPipe,
    NgxMatSelectSearchModule,
    NgxMatTimepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatTabsModule,
    MatPaginatorModule,
    MatSortModule

  ],
})
export class ConvertedListComponent {

  total = 0;
  dataList = [];

  @ViewChild('tabGroup') tabGroup;

  @ViewChild(MatPaginator) public _paginatorConverted: MatPaginator;
  @ViewChild(MatSort) public _sortPending: MatSort;
  searchInputControlConverted = new FormControl('');

  Mainmodule: any;
  isLoading = false;
  public _unsubscribeAll: Subject<any> = new Subject<any>();
  public key: any;
  public sortColumn: any;
  public sortDirection: any;
  appConfig = AppConfig;
  user: any = {};


  module_name = module_name.newSignup

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
    private leadsService: LeadsService,
    private conformationService: FuseConfirmationService,
    private alertService: ToasterService,
    private agentService: AgentService,
    private userService: UserService,
    private matDialog: MatDialog,
    private entityService: EntityService,
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
    this.entityService.onWithdrawAuditedCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (item) => {
        this.refreshItemsConverted();
      }
    })

    this.searchInputControlConverted.valueChanges
      .subscribe(() => {
        GridUtils.resetPaginator(this._paginatorConverted);
        this.refreshItemsConverted();
      });

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

  refreshItemsConverted() {
    this.isLoading = true;
    const filterReq = GridUtils.GetFilterReq(
      this._paginatorConverted,
      this._sortPending,
      this.searchInputControlConverted.value, "entry_date_time", 1
    );
    filterReq['Status'] = 'Converted';
    // filterReq['FromDate'] = DateTime.fromJSDate(new Date(this.filter.FromDate)).toFormat('yyyy-MM-dd')
    // filterReq['ToDate'] = DateTime.fromJSDate(new Date(this.filter.ToDate)).toFormat('yyyy-MM-dd')
    // filterReq['agent_id'] = this.filter?.agent_id == 'all' ? '' : this.filter?.agent_id;
    if (Security.hasPermission(leadsPermissions.viewOnlyAssignedPermissions)) {
      filterReq['relationmanagerId'] = this.user.id
    }

    this.leadsService.getAgentLeadList(filterReq).subscribe(
      {
        next: data => {
          this.isLoading = false;
          this.dataList = data.data;
          this.dataList.forEach(x => {
            x.withdraw_amount = x.withdraw_currency + " " + x.withdraw_amount
          })
          this._paginatorConverted.length = data.total;
          this.total = data.total;
        }, error: err => {
          this.alertService.showToast('error', err);

          this.isLoading = false;
        }
      }
    );
  }

  setEmailVerify(record): void {
    if (!Security.hasPermission(leadsPermissions.verifyEmailPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const label: string = record.is_email_verified ? 'Unverify Email' : 'Verify Email'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.email_address + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.agentService.setEmailVerify(record.id).subscribe({
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

    const label: string = record.is_mobile_verified ? 'Unverify Mobile' : 'Verify Mobile'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.mobile_number + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.agentService.setMobileVerify(record.id).subscribe({
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

  setKYCVerify(record): void {
    if (!Security.hasPermission(leadsPermissions.viewKYCPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(KycInfoComponent, {
      data: { record: record, agent: true, isLead: 'Lead' },
      disableClose: true
    }).afterClosed().subscribe(res => {

    })
  }

  getNodataTextAudited(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControlConverted.value)
      return `no search results found for \'${this.searchInputControlConverted.value}\'.`;
    else return 'No data to display';
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

}
