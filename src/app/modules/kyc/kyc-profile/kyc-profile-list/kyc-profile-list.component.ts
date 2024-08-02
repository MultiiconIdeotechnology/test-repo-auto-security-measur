import { Router } from '@angular/router';
import { Routes } from 'app/common/const';
import { Security, kycprofilePermissions, messages, module_name } from 'app/security';
import { Component, OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { KycService } from './../../../../services/kyc.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ToasterService } from 'app/services/toaster.service';
import { KycFilterComponent } from '../kyc-filter/kyc-filter.component';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';

@Component({
  selector: 'app-kyc-profile-list',
  templateUrl: './kyc-profile-list.component.html',
  styles: [`
  .tbl-grid {
    grid-template-columns:  40px 200px 280px 140px 150px 160px;
  }
  `],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
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
    CommonModule,
    PrimeNgImportsModule
  ]
})
export class KycProfileListComponent extends BaseListingComponent implements OnDestroy {

  total = 0;
  dataList = [];
  profile_for: string = "All";

  module_name = module_name.kycprofile
  columns = [
    { key: 'profile_name', name: 'Profile', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, tooltip: true },
    { key: 'company_name', name: 'Company', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false, tooltip: true },
    { key: 'profile_for', name: 'Profile For', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false, tooltip: true },
    { key: 'documents', name: 'Documents', is_date: false, date_formate: '', is_sortable: true, class: 'header-center-view', is_sticky: false, align: '', indicator: false },
    { key: 'entry_date_time', name: 'Entry', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false },
  ]
  cols = [];
  isFilterShow: boolean = false;
  selectedMasterStatus:string;
  selectMasterList = [
    { label: 'Agent', value: 'Agent' },
    { label: 'Sub Agent', value: 'Sub Agent' },
    { label: 'Customer', value: 'Customer' },
    { label: 'Supplier', value: 'Supplier' },
    { label: 'Employee', value: 'Employee' },
]

  constructor(
    private kycService: KycService,
    private conformationService: FuseConfirmationService,
    private router: Router,
    private toasterService: ToasterService,
    private matDialog: MatDialog,
  ) {
    super(module_name.kycprofile)
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'profile_name';
    this.sortDirection = 'asc';
    this.Mainmodule = this
  }

  refreshItems(event?:any): void {
    this.isLoading = true;
    var FData = this.getNewFilterReq(event);
    FData.profileFor = this.profile_for;
    this.kycService.getkycprofileList(FData).subscribe({
      next: data => {
        this.isLoading = false;
        this.dataList = data.data;
        this.totalRecords = data.total;
        this.total = data.total;

      }, error: err => {
        this.toasterService.showToast('error', err)
        this.isLoading = false;
      }
    })
  }

  createInternal(model): void {
    this.router.navigate([Routes.kyc.kycprofile_entry_route])
  }

  editInternal(record): void {
    this.router.navigate([Routes.kyc.kycprofile_entry_route + '/' + record.id])
  }

  viewInternal(record): void {
    this.router.navigate([Routes.kyc.kycprofile_entry_route + '/' + record.id + '/readonly'])
  }

  deleteInternal(record): void {
    const label: string = 'Delete Kyc Profile'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.profile_name + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.kycService.delete(record.id).subscribe({
          next: () => {
            this.alertService.showToast('success', "KYC has been deleted!", "top-right", true);
            this.refreshItems();
          }
          , error: err => {
            this.toasterService.showToast('error', err)
            this.isLoading = false;
          }
        })
      }
    })
  }

  copyKYC(record): void {
    if (!Security.hasPermission(kycprofilePermissions.copyPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    
    this.conformationService.open({
        title: 'Copy KYC Profile',
        message: 'Are you sure to generate copy of ' + record.profile_name + ' ?',
    }).afterClosed().subscribe((res) => {
        if (res === 'confirmed') {
            this.kycService.kycProfileCopy(record.id).subscribe({
                next: () => {
                    this.alertService.showToast('success', 'KYC Profile Copied');
                    this.refreshItems();
                }, error: (err) => {
                    this.alertService.showToast('error', err);
                }
            })
        }
    });
}

  SetDefault(record): void {
    const label: string = 'Set Default KYC Profile';
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
          this.kycService
            .setDefault(record.id)
            .subscribe({
              next: () => {
                this.refreshItems();
                this.toasterService.showToast(
                  'success',
                  'KYC Profile as Default!'
                );
              },
               error: err => {
                this.toasterService.showToast('error', err)
                this.isLoading = false;
              }
            });
        }
      });
  }

  Filter() {
    this.matDialog.open(KycFilterComponent, {
      data: this.profile_for,
      disableClose: true,
    }).afterClosed().subscribe(res => {
      if (res) {
        this.profile_for = res;
        this.refreshItems();
      }
    })
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

  ngOnDestroy(): void {
    // this.masterService.setData(this.key, this)
  }
}

