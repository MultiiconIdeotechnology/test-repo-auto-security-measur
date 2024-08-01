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
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, bankPermissions, messages, module_name } from 'app/security';
import { BankService } from 'app/services/bank.service';
import { ToasterService } from 'app/services/toaster.service';
import { BankEntryComponent } from '../bank-entry/bank-entry.component';

@Component({
  selector: 'app-bank-list',
  templateUrl: './bank-list.component.html',
  styleUrls: ['./bank-list.component.scss'],
  styles: [`
  .tbl-grid {
    grid-template-columns:  40px 200px 120px 100px 230px 100px 194px 180px 200px 160px 120px 134px 100px 170px;
  }
  `],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
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
    MatDividerModule
  ]
})
export class BankListComponent extends BaseListingComponent {

  module_name = module_name.bank
  dataList = [];
  total = 0;


  constructor(
    private matDialog: MatDialog,
    public alertService: ToasterService,
    private conformationService: FuseConfirmationService,
    private bankService: BankService
  ) {
    super(module_name.bank)
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'bank_name';
    this.sortDirection = 'desc';
    this.Mainmodule = this
  }

  columns = [
    { key: 'particular_name', name: 'Particular', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: true, is_boolean: false, tooltip: true },
    { key: 'agent_id', name: 'Agent Code', is_date: false, date_formate: '', is_sortable: true, is_fixed: true, class: '', is_sticky: false, indicator: true, is_boolean: false, tooltip: false },
    { key: 'document_proof', name: 'Document', is_date: false, date_formate: '', is_sortable: false, class: 'header-center-view ', is_sticky: false, indicator: false, is_boolean: false, tooltip: true, isicon: true },
    { key: 'bank_name', name: 'Bank Name', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'account_currency', name: 'Currency', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'branch_name', name: 'Branch Name', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'account_number', name: 'Account Number', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'account_holder_name', name: 'Account Holder Name', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'pan_card_number', name: 'PAN Card Number', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'ifsc_code', name: 'IFSC Code', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'micr_code', name: 'MICR Code', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'is_audited', name: 'Is Audited', is_date: false, date_formate: '', is_sortable: true, class: 'header-center-view', is_sticky: false, indicator: false, is_boolean: true, tooltip: true },
    { key: 'audit_date_time', name: 'Audit Date', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },

  ]
  cols = [];

  create() {
    this.matDialog.open(BankEntryComponent, {
      data: null, disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.alertService.showToast('success', "New record added", "top-right", true);
        this.refreshItems()
      }
    })
  }

  viewInternal(record): void {
    this.matDialog.open(BankEntryComponent, {
      data: { data: record, readonly: true },
      disableClose: true
    })
  }

  editInternal(record): void {
    this.matDialog.open(BankEntryComponent, {
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
    const label: string = 'Delete Bank'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.bank_name + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.bankService.delete(record.id).subscribe({
          next: () => {
            this.alertService.showToast('success', "Bank has been deleted!", "top-right", true);
            this.refreshItems()
          }
        })
      }
    })
  }

  AuditUnaudit(record): void {
    if (!Security.hasPermission(bankPermissions.auditUnauditPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const label: string = record.is_audited
      ? 'Unaudit Bank'
      : 'Audit Bank';
    this.conformationService
      .open({
        title: label,
        message:
          'Are you sure to ' +
          label.toLowerCase() +
          ' ' +
          record.bank_name +
          ' ?',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res === 'confirmed') {
          this.bankService.setAudit(record.id).subscribe({
            next: () => {
              record.is_audited = !record.is_audited;
              if (record.is_audited) {
                this.alertService.showToast(
                  'success',
                  'Bank has been Audited!',
                  'top-right',
                  true
                );
              } else {
                this.alertService.showToast(
                  'success',
                  'Bank has been Unaudited!',
                  'top-right',
                  true
                );
              }
            },
          });
        }
      });
  }

  downloadfile(str: string) {
    window.open(str, '_blank');
  }

  refreshItems(): void {
    this.isLoading = true;
    this.bankService.getBankList(this.getFilterReq()).subscribe({
      next: data => {
        this.isLoading = false;
        this.dataList = data.data;
        this.total = data.total;
      }, error: err => {
        this.isLoading = false;
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


}
