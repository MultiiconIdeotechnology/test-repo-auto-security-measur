import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { PSPPermissions, Security, filter_module_name, messages, module_name } from 'app/security';
import { PspSettingService } from 'app/services/psp-setting.service';
import { ToasterService } from 'app/services/toaster.service';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { Subscription } from 'rxjs';
import { UserService } from 'app/core/user/user.service';
import { PspSetupService } from 'app/services/psp-setup.service';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
import { PspSetupSidebarComponent } from './psp-setup-sidebar/psp-setup-sidebar.component';
import { Router } from '@angular/router';
import { Routes } from 'app/common/const';
import { BulkAssignDialogComponent } from './bulk-assign-dialog/bulk-assign-dialog.component';

@Component({
  selector: 'app-psp-setup',
  standalone: true,
  imports: [
    NgIf,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule,
    PrimeNgImportsModule,
    PspSetupSidebarComponent
  ],
  templateUrl: './psp-setup.component.html',
  styleUrls: ['./psp-setup.component.scss']
})
export class PspSetupComponent extends BaseListingComponent {
  module_name = module_name.psp_setup;
  filter_table_name = filter_module_name.psp_setup;
  private settingsUpdatedSubscription: Subscription;
  dataList = [];
  total = 0;
  isFilterShow: boolean = false;

  constructor(
    private pspsettingService: PspSettingService,
    private pspSetupService: PspSetupService,
    private conformationService: FuseConfirmationService,
    private toasterService: ToasterService,
    public _filterService: CommonFilterService,
    private _userService: UserService,
    private sidenavService: SidebarCustomModalService,
    private router: Router,
	private matDialog: MatDialog,
  ) {
    super(module_name.psp_setup);
    this.key = this.module_name;
    this.sortColumn = 'profile_name';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  ngOnInit() {
    this.refreshItems();

    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
      // this.sortColumn = resp['sortColumn'];
      // this.primengTable['_sortField'] = resp['sortColumn'];
      this.primengTable['filters'] = resp['table_config'];
      // this._selectedColumns = resp['selectedColumns'] || [];
      this.isFilterShow = true;
      this.primengTable._filter();
    });
  }

  ngAfterViewInit() {
    // Defult Active filter show
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
      this.primengTable['filters'] = filterData['table_config'];
      // this._selectedColumns = filterData['selectedColumns'] || [];
      this.isFilterShow = true;
    }
  }

  refreshItems(event?: any): void {
    this.isLoading = true;
    this.pspSetupService
      .getPaymentGatewaySettingsList(this.getNewFilterReq(event))
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          this.dataList = data.data;
          this.totalRecords = data.total;
        },
        error: (err) => {
          this.toasterService.showToast('error', err)
          this.isLoading = false;
        },
      });
  }

  createInternal(model:any): void {
    localStorage.removeItem('pspSetupProfile');
    // this.pspSetupService.managePgProfileSubject.next({ isProfileFormSuccess: false });
    this.router.navigate([Routes.settings.psp_setup_entry_route]);
  }

  editInternal(record): void {
    localStorage.setItem('pspSetupProfile', JSON.stringify({id:record.id, profile_name:record?.profile_name}));
    // this.pspSetupService.managePgProfileSubject.next({ isProfileFormSuccess: true });
    // this.pspSetupService.editPgProfileSubject.next(record);
    this.router.navigate(
      [Routes.settings.psp_setup_entry_route], { queryParams: { id: record.id} });
  }

  deleteInternal(record: any, index: any): void {
    console.log("index", index)
    const label: string = 'Delete PSP Profile';
    this.conformationService
      .open({
        title: label,
        message:
          'Are you sure to ' +
          label.toLowerCase() +
          ' ' +
          record.profile_name +
          ' ?',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res === 'confirmed') {

          // const executeMethod = () => {
          this.pspSetupService.delete(record.id).subscribe({
            next: (res: any) => {
              console.log("res>>>", res)
              if (res && res['status']) {
                this.toasterService.showToast(
                  'success',
                  'PSP Profile has been Deleted!',
                  'top-right',
                  true
                );
                this.dataList.splice(index, 1);
                this.dataList = [...this.dataList];
              } else {
                console.log("Response status is false")
              }
            },
            error: (err) => {
              this.toasterService.showToast('error', err)
              this.isLoading = false;
            },
          });
          // }
        }
      });
  }

  SetDefault(record): void {
    // if (!Security.hasPermission(PSPPermissions.setDefaultPermissions)) {
    //   return this.toasterService.showToast('error', messages.permissionDenied);
    // }

    const label: string = 'Set Default PSP Profile';
    this.conformationService
      .open({
        title: label,
        message:
          'Are you sure to ' +
          label.toLowerCase() +
          ' ' +
          record.profile_name +
          ' ?',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res === 'confirmed') {

          // const executeMethod = () => {
          this.pspSetupService.setDefaultStatus(record.id).subscribe({
            next: () => {
              this.refreshItems();
              this.toasterService.showToast(
                'success',
                'PSP Profile Set as Default!'
              );
            },
            error: (err) => {
              this.toasterService.showToast('error', err)
              this.isLoading = false;
            },
          });
          // }

        }
      });
  }

  EnableDisable(record): void {
    // if (!Security.hasPermission(inventoryVisaPermissions.enableDisablePermissions)) {
    //     return this.alertService.showToast('error', messages.permissionDenied);
    // }

    const label: string = record.is_enabled ? 'Disable' : 'Enable';
    this.conformationService
      .open({
        title: label,
        message:
          'Are you sure to ' +
          label.toLowerCase() +
          ' ' +
          record.profile_name +
          ' ?',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res === 'confirmed') {
          this.pspSetupService
            .setEnableStatus(record.id)
            .subscribe({
              next: () => {
                record.is_enabled = !record.is_enabled;
                if (record.is_enabled) {
                  this.alertService.showToast(
                    'success',
                    'PSP Profile has been Enabled!',
                    'top-right',
                    true
                  );
                } else {
                  this.alertService.showToast(
                    'success',
                    'PSP Profile has been Disabled!',
                    'top-right',
                    true
                  );
                }
              }, error: (err) => {
                this.alertService.showToast('error', err);
              }
            });
        }
      });
  }

  bulkAssign(record:any) {
    	this.matDialog.open(BulkAssignDialogComponent, 
        {
          data:record,
          disableClose:true,
          panelClass:['zero-dialog', 'md-dialog']
        }
      )
  }

  onAgentAssigned(id: any) {
    this.sidenavService.openModal('Agents', id)
  }

  getNodataText(): string {
    if (this.isLoading) return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

  ngOnDestroy() {
    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }
}
