import { Routes } from 'app/common/const';
import { Router } from '@angular/router';
import { Security, agentsPermissions, messages, module_name } from 'app/security';
import { Component } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EmployeeDialogComponent } from '../employee-dialog/employee-dialog.component';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { KycInfoComponent } from '../kyc-info/kyc-info.component';
import { BlockReasonComponent } from '../../supplier/block-reason/block-reason.component';
import { MarkupProfileDialogeComponent } from '../markup-profile-dialoge/markup-profile-dialoge.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AgentService } from 'app/services/agent.service';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { SetKycProfileComponent } from '../set-kyc-profile/set-kyc-profile.component';
import { SetCurrencyComponent } from '../set-currency/set-currency.component';
import { AgentFilterComponent } from '../agent-filter/agent-filter.component';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { WhitelabelEntryComponent } from '../../whitelabel/whitelabel-entry/whitelabel-entry.component';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { UserService } from 'app/core/user/user.service';
import { takeUntil } from 'rxjs';
import { ReshuffleComponent } from '../reshuffle/reshuffle.component';
import { AgentEditComponent } from '../agent-edit/agent-edit.component';
import { AgentRMLogsComponent } from '../rmlogs/rmlogs.component';
import { AgentStatusChangedLogComponent } from '../status-changed-log/status-changed-log.component';

@Component({
  selector: 'app-agent-list',
  templateUrl: './agent-list.component.html',
  styles: [`
  .tbl-grid {
    grid-template-columns:  40px 110px 250px 100px 250px 150px 120px 120px 100px 200px 200px 120px 170px;
  }
  `],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
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
  ]
})
export class AgentListComponent extends BaseListingComponent {
  module_name = module_name.agent
  agentFilter: any;
  user: any = {};
  dataList = [];
  total = 0;

  columns = [
    { key: 'agent_code', name: 'Agent Code', is_date: false, date_formate: '', is_sortable: true, is_fixed: true, class: '', is_sticky: false, indicator: true, is_boolean: false, tooltip: false },
    { key: 'agency_name', name: 'Agent', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'status', name: 'Status', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'email_address', name: 'Email', is_date: false, date_formate: '', is_sortable: false, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'mobile_number', name: 'Mobile', is_date: false, date_formate: '', is_sortable: false, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'pan_number', name: 'PAN Number', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'gst_number', name: 'GST Number', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'base_currency', name: 'Currency', is_date: false, date_formate: '', is_sortable: false, class: 'header-center-view', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'relation_manager_name', name: 'Relationship Manager ', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'city_name', name: 'City', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'web_last_login_time', name: 'Last Login', is_date: true, date_formate: 'dd-MM-yyyy', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'entry_date_time', name: 'Signup', is_date: true, date_formate: 'dd-MM-yyyy', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
  ]
  cols = [];

  constructor(
    private agentService: AgentService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    private userService: UserService,
    private router: Router,
  ) {
    super(module_name.agent)
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'entry_date_time';
    this.sortDirection = 'desc';
    this.Mainmodule = this

    this.agentFilter = {
      relationmanagerId: '',
      currencyId: '',
      cityId: '',
      markupProfileId: '',
      kycProfileId: '',
      is_blocked: '',
    }
    this.userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user: any) => {
        this.user = user;
      });

  }

  getFilter(): any {
    const filterReq = GridUtils.GetFilterReq(
      this._paginator,
      this._sort,
      this.searchInputControl.value
    );
    filterReq["relationmanagerId"] = this.agentFilter?.relationmanagerId?.id || "";
    filterReq["currencyId"] = this.agentFilter?.currencyId?.id || "";
    filterReq["cityId"] = this.agentFilter?.cityId?.id || "";
    filterReq["markupProfileId"] = this.agentFilter?.markupProfileId?.id || "";
    filterReq["kycProfileId"] = this.agentFilter?.kycProfileId?.id || "";
    filterReq["blocked"] = this.agentFilter?.blocked == "All" ? "" : this.agentFilter?.blocked;
    return filterReq;
  }

  filter() {
    this.matDialog.open(AgentFilterComponent, {
      data: this.agentFilter,
      disableClose: true,
    }).afterClosed().subscribe(res => {
      if (res) {
        this.agentFilter = res;
        this.refreshItems();
      }
    })
  }

  refreshItems(): void {
    this.isLoading = true;
    var Model = this.getFilter();
    if (Security.hasPermission(agentsPermissions.viewOnlyAssignedPermissions)) {
      Model.relationmanagerId = this.user.id
    }

    this.agentService.getAgentList(Model).subscribe({
      next: data => {
        this.isLoading = false;
        this.dataList = data.data;
        this.total = data.total;
      }, error: err => {
        this.alertService.showToast('error', err, 'top-right', true);
        this.isLoading = false;
      }
    })
  }



  resetPassword(record): void {
    const label: string = 'Reset Password'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.agency_name + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.agentService.regenerateNewPassword(record.id).subscribe({
          next: (res) => {
            this.alertService.showToast('success', res.msg, "top-right", true);
            this.refreshItems()
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);
          },
        })
      }
    })
  }

  wallettransfer(record): void {
    if (!Security.hasPermission(agentsPermissions.walletTransferPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const label: string = 'Wallet Transfer'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' for ' + record.agency_name + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.agentService.transferOldToNew({ recharge_for_id: record.id, recharge_for: 'Agent' }).subscribe({
          next: (data: any) => {
            if (data.status)
              this.alertService.showToast('success', "Wallet transfer successfully", "top-right", true);
            else
              this.alertService.showToast('success', "Something went wrong, please try again.", "top-right", true);
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);
          },
        })
      }
    })
  }

  reShuffle(){
    if (!Security.hasPermission(agentsPermissions.reshufflePermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(ReshuffleComponent, {
      data: 'Agent',
      disableClose: true,
    }).afterClosed().subscribe(res => {
      if (res) {
        // this.agentFilter = res;
        // this.refreshItems();
      }
    })
  }

  autologin(record: any) {
    if (!Security.hasPermission(agentsPermissions.autoLoginPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.agentService.autoLogin(record.id).subscribe({
      next: data => {
        window.open(data.url + 'sign-in/' + data.code);
      }, error: err => {
        this.alertService.showToast('error', err)
      }
    })

  }

  // createInternal(model): void {
  //   this.router.navigate([Routes.customers.agent_entry_route])
  // }

  editInternal(record): void {
    this.matDialog
        .open(AgentEditComponent, {
            data: { data: record },
            disableClose: true,
        })
        .afterClosed()
        .subscribe((res) => {
            if (res) {
                this.alertService.showToast('success', "Record modified", "top-right", true);
                this.refreshItems();
            }
        });
}

  viewInternal(record): void {
    this.router.navigate([Routes.customers.agent_entry_route + '/' + record.id + '/readonly'])
  }

  deleteInternal(record): void {
    const label: string = 'Delete Agent'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.agency_name + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.agentService.delete(record.id).subscribe({
          next: () => {
            this.alertService.showToast('success', "Agent has been deleted!", "top-right", true);
            this.refreshItems()
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);
          },
        })
      }
    })
  }

  setBlockUnblock(record): void {
    if (!Security.hasPermission(agentsPermissions.blockUnblockPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    if (record.is_blocked) {
      const label: string = 'Unblock Agent'
      this.conformationService.open({
        title: label,
        message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.agency_name + ' ?'
      }).afterClosed().subscribe(res => {
        if (res === 'confirmed') {
          this.agentService.setBlockUnblock(record.id).subscribe({
            next: () => {
              record.is_blocked = !record.is_blocked;
              this.alertService.showToast('success', "Agent has been Unblock!", "top-right", true);
            },
            error: (err) => {
              this.alertService.showToast('error', err, 'top-right', true);
            },
          })
        }
      })
    } else {
      this.matDialog.open(BlockReasonComponent, {
        data: record,
        disableClose: true
      }).afterClosed().subscribe(res => {
        if (res) {
          this.agentService.setBlockUnblock(record.id, res).subscribe({
            next: () => {
              record.is_blocked = !record.is_blocked;
              this.alertService.showToast('success', "Agent has been Block!", "top-right", true);
            },
            error: (err) => {
              this.alertService.showToast('error', err, 'top-right', true);
            },
          })
        }
      })
    }
  }



  relationahipManager(record): void {
    if (!Security.hasPermission(agentsPermissions.relationshipManagerPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(EmployeeDialogComponent, {
      data: record,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.agentService.setRelationManager(record.id, res.empId).subscribe({
          next: () => {
            // record.is_blocked = !record.is_blocked;
            this.alertService.showToast('success', "Relationship Manager Changed!");
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);

          },
        })
      }
    })
  }

  relationahipManagerLog(record): void {
    if (!Security.hasPermission(agentsPermissions.relationshipManagerLogsPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(AgentRMLogsComponent, {
      data: record,
      disableClose: true
    });
  }

  setKYCVerify(record): void {
    if (!Security.hasPermission(agentsPermissions.viewKYCPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(KycInfoComponent, {
      data: { record: record, agent: true },
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        // this.agentService.setMarkupProfile(record.id, res.transactionId).subscribe({
        //   next: () => {
        //     // record.is_blocked = !record.is_blocked;
        //     this.alertService.showToast('success', "The markup profile has been set", "top-right", true);
        //   }
        // })
      }
    })
  }

  statusChangedLog(record): void {
    if (!Security.hasPermission(agentsPermissions.statusChangedLogsPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(AgentStatusChangedLogComponent, {
      data: record,
      disableClose: true
    });
  }

  setMarkupProfile(record): void {
    if (!Security.hasPermission(agentsPermissions.setMarkupProfilePermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(MarkupProfileDialogeComponent, {
      data: record,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.agentService.setMarkupProfile(record.id, res.transactionId).subscribe({
          next: () => {
            // record.is_blocked = !record.is_blocked;
            this.alertService.showToast('success', "The markup profile has been set!", "top-right", true);
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);

          },
        })
      }
    })
  }

  setEmailVerify(record): void {
    if (!Security.hasPermission(agentsPermissions.verifyEmailPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const label: string = record.is_email_verified ? 'Unverify Email' : 'Verify Email'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.email_address + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.agentService.setEmailVerifyAgent(record.id).subscribe({
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
    if (!Security.hasPermission(agentsPermissions.verifyMobilePermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const label: string = record.is_mobile_verified ? 'Unverify Mobile' : 'Verify Mobile'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.mobile_number + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.agentService.setMobileVerifyAgent(record.id).subscribe({
          next: () => {
            record.is_mobile_verified = !record.is_mobile_verified;
            if (record.is_mobile_verified) {
              this.alertService.showToast('success', "Mobile number has been verified1", "top-right", true);
            }
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);

          },
        })
      }
    })
  }

  setCurrency(record): void {
    if (!Security.hasPermission(agentsPermissions.setCurrencyPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(SetCurrencyComponent, {
      data: record,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.agentService.setBaseCurrency(record.id, res.base_currency_id).subscribe({
          next: () => {
            this.alertService.showToast('success', "The base currency has been set!", "top-right", true);
            this.refreshItems();
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);

          },
        })
      }
    });
  }

  kycProfile(record): void {

    this.matDialog.open(SetKycProfileComponent, {
      data: record,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {

        this.agentService.mapkycProfile(record.id, res.kyc_profile_id).subscribe({
          next: () => {
            // record.is_blocked = !record.is_blocked;
            this.alertService.showToast('success', "KYC Profile has been Added!", "top-right", true);
            record.kyc_profile_id = res.kyc_profile_id;
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);

          },
        })
      }
    })
  }

  convertWl(record): void {
    if (!Security.hasPermission(agentsPermissions.convertToWLPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog
      .open(WhitelabelEntryComponent, {
        data: { data: record, send: 'Agent-WL' },
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

  exportExcel(): void {
    if (!Security.hasExportDataPermission(this.module_name)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    // const filterReq = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value);
    // const req = Object.assign(filterReq);

    // req.skip = 0;
    // req.take = this._paginator.length;
    const filterReq = {};
    filterReq["Filter"] = this.searchInputControl.value;
    filterReq["relationmanagerId"] = this.agentFilter?.relationmanagerId?.id || "";
    filterReq["currencyId"] = this.agentFilter?.currencyId?.id || "";
    filterReq["cityId"] = this.agentFilter?.cityId?.id || "";
    filterReq["markupProfileId"] = this.agentFilter?.markupProfileId?.id || "";
    filterReq["kycProfileId"] = this.agentFilter?.kycProfileId?.id || "";
    filterReq["blocked"] = this.agentFilter?.blocked == "All" ? "" : this.agentFilter?.blocked;
    filterReq['Skip'] = 0;
    filterReq['Take'] = this._paginator.length;
    filterReq['OrderBy'] = 'entry_date_time';
    filterReq['OrderDirection'] = 1;


    this.agentService.getAgentList(filterReq).subscribe(data => {
      for (var dt of data.data) {
        // dt.amendment_request_time = DateTime.fromISO(dt.amendment_request_time).toFormat('dd-MM-yyyy HH:mm:ss')
        dt.entry_date_time = DateTime.fromISO(dt.entry_date_time).toFormat('dd-MM-yyyy HH:mm:ss')
      }
      Excel.export(
        'Agents',
        [
          { header: 'Agent Code', property: 'agent_code' },
          { header: 'Agent', property: 'agency_name' },
          { header: 'Email', property: 'email_address' },
          { header: 'Mobile', property: 'mobile_number' },
          { header: 'PAN Number', property: 'pan_number' },
          { header: 'GST Number', property: 'gst_number' },
          { header: 'Currency', property: 'base_currency' },
          { header: 'Relationship Manager', property: 'relation_manager_name' },
          { header: 'City', property: 'city_name' },
          { header: 'Last Login', property: 'web_last_login_time' },
          { header: 'Signup', property: 'entry_date_time' },
        ],
        data.data, "Agents", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }]);
    });
  }


  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

  ngOnDestroy(): void {
    this.masterService.setData(this.key, this)
  }
}
