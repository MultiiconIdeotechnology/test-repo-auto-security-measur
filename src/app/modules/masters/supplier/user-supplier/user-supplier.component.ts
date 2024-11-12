import { user } from './../../../../mock-api/common/user/data';
import { Component, Inject } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { SupplierEntryRightComponent } from '../supplier-entry-right/supplier-entry-right.component';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { CityService } from 'app/services/city.service';
import { CurrencyService } from 'app/services/currency.service';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { SupplierService } from 'app/services/supplier.service';
import { ToasterService } from 'app/services/toaster.service';
import { module_name } from 'app/security';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BlockReasonComponent } from '../block-reason/block-reason.component';
import { EntityService } from 'app/services/entity.service';
import { UserModifyComponent } from '../user-modify/user-modify.component';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-user-supplier',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
    PrimeNgImportsModule,
    SupplierEntryRightComponent,
    UserModifyComponent
  ],
  templateUrl: './user-supplier.component.html',
  styleUrls: ['./user-supplier.component.scss']
})
export class UserSupplierComponent extends BaseListingComponent {

  record: any = {};
  module_name = module_name.user;
  dataList = [];


  constructor(
    public matDialogRef: MatDialogRef<UserSupplierComponent>,
    private builder: FormBuilder,
    private supplierService: SupplierService,
    private conformationService: FuseConfirmationService,
    @Inject(MAT_DIALOG_DATA) public data: any = {},
    private cityService: CityService,
    private entityService: EntityService,
    private matDialog: MatDialog,
    private kycDocumentService: KycDocumentService,
    private currencyService: CurrencyService,
  ) {
    super(module_name.user);
    this.key = this.module_name;
    this.sortColumn = 'user_name';
    this.sortDirection = 'asc';
    this.Mainmodule = this;
    this.data = data
    this.record = data?.data ?? {}
    console.log("this.record", data);

    this.entityService.onrefreshUserSupplierEntityCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (item) => {
        if (item) {
          this.refreshItems();
        }
      }
    })
  }

  refreshItems(event?: any): void {
    this.isLoading = true;
    const request = this.getNewFilterReq(event)
    request['Id'] = this.data.id
    this.supplierService.getSupplierUserMasterList(request).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.dataList = data.data;
        this.totalRecords = data.total;
      },
      error: (err) => {
        this.alertService.showToast('error', err, "top-right", true)
        this.isLoading = false;
      },
    });

  }

  edit(record): void {
    this.entityService.raiseUsersupplierEntityCall({ data: record, edit: true })
  }

  delete(record): void {
    const label: string = 'Delete User';
    this.conformationService
      .open({
        title: label,
        message:
          'Are you sure to ' +
          label.toLowerCase() +
          ' ' +
          record.user_name +
          ' ?',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res === 'confirmed') {
          this.supplierService.deleteUser(record.id).subscribe({
            next: () => {
              this.alertService.showToast('success', "User has been deleted!", "top-right", true);
              this.refreshItems();
            },
            error(err) {
              this.alertService.showToast('error', err, "top-right", true);

            },
          });
        }
      });
  }

  resetPassword(record): void {
    const label: string = 'Reset Password'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.user_name + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.supplierService.resetPasswordUser(record.id).subscribe({
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

  blockUnblock(record: any): void {
    // if (!Security.hasPermission(supplierPermissions.blockUnblockPermissions)) {
    //   return this.alertService.showToast('error', messages.permissionDenied);
    // }

    if (record.is_blocked == false) {
      this.matDialog
        .open(BlockReasonComponent, {
          data: record,
          disableClose: true,
        })
        .afterClosed()
        .subscribe((res) => {
          if (res) {
            this.supplierService
              .setBlockUnblockUser(record.id, res)
              .subscribe({
                next: () => {
                  record.is_blocked = !record.is_blockeded;
                  if (record.is_blockeded) {
                    this.alertService.showToast('success', "User has been blocked!", "top-right", true);
                  }
                },
                error(err) {
                  this.alertService.showToast('error', err, "top-right", true);

                },
              });
          }
        });
    } else {
      const label: string = 'Unblock User';
      this.conformationService
        .open({
          title: label,
          message:
            'Are you sure to ' +
            label.toLowerCase() +
            ' ' +
            record.user_name +
            ' ?',
        })
        .afterClosed()
        .subscribe((res) => {
          if (res === 'confirmed') {
            this.supplierService
              .setBlockUnblockUser(record.id, '')
              .subscribe({
                next: () => {
                  record.is_blocked = !record.is_blocked;
                  if (!record.is_blocked) {
                    this.alertService.showToast('success', "User has been Unblocked!", "top-right", true);
                  }
                },
                error(err) {
                  this.alertService.showToast('error', err, "top-right", true);

                },
              });
          }
        });
    }
  }

  autologin(record: any) {
    // if (!Security.hasPermission(agentsPermissions.autoLoginPermissions)) {
    //     return this.alertService.showToast('error', messages.permissionDenied);
    // }

    const Fdata = {}
    Fdata['id'] = record.id
    Fdata['loginFrom'] = 'SupplierUser'

    this.supplierService.autoLogin(Fdata).subscribe({
      next: data => {
        window.open(data.url + 'sign-in/' + data.code);
      }, error: err => {
        this.alertService.showToast('error', err)
      }
    })
  }

  getNodataText(): string {
    if (this.isLoading) return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }



}
