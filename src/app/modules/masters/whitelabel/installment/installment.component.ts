import { module_name } from 'app/security';
import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Component, Inject } from '@angular/core';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { InstallmentEntryComponent } from '../installment-entry/installment-entry.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { InstallmentService } from 'app/services/installment.service';
import { ToasterService } from 'app/services/toaster.service';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-installment',
  templateUrl: './installment.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule
  ],
})
export class InstallmentComponent extends BaseListingComponent {
  module_name = module_name.Installment
  columns = [
    { key: 'actions', name: '#', is_date: false, date_formate: '', is_sortable: false, class: '', is_sticky: true, width: '10', align: 'center', indicator: false, is_required: false, is_included: false, is_boolean: false },
    { key: 'installment_date', name: 'Inst. Date', is_date: true, date_formate: 'dd-MM-yyyy', is_sortable: true, class: '', is_sticky: false, width: '36', align: '', indicator: true, is_required: false, is_included: false, is_boolean: false },
    { key: 'installment_due_date', name: 'Inst. Due Date', is_date: true, date_formate: 'dd-MM-yyyy', is_sortable: true, class : '', is_sticky: false, width: '40', align: '', indicator: false, is_required: false, is_included: false, is_boolean: false },
    { key: 'installment_amount', name: 'Inst. Amount', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, width: '44', align: 'right', indicator: false, is_required: false, is_included: false, is_boolean: false },
    { key: 'installment_remark', name: 'Inst. Remark', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, width: '50', align: '', indicator: false, is_required: false, is_included: true, is_boolean: false },
    { key: 'payment_date', name: 'Pay. Date', is_date: true, date_formate: 'dd-MM-yyyy', is_sortable: true, class : '', is_sticky: false, width: '36', align: '', indicator: false, is_required: false, is_included: false, is_boolean: false },
    { key: 'payment_amount', name: 'Pay. Amount', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, width: '44', align: 'right', indicator: false, is_required: false, is_included: false, is_boolean: false },
    { key: 'payment_remark', name: 'Pay. Remark', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, width: '50', align: '', indicator: false, is_required: false, is_included: true, is_boolean: false },
  ]
  cols = [];

  constructor(
    public matDialogRef: MatDialogRef<InstallmentComponent>,
    private installmentService: InstallmentService,
    public alertService: ToasterService,
    private matDialog: MatDialog,
    private conformationService: FuseConfirmationService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    super(module_name.agent)
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'installment_date';
    this.sortDirection = 'desc';
    this.Mainmodule = this
  }

  refreshItems(): void {
    this.isLoading = true;
    const model = this.getFilterReq();
    model['wl_id'] = this.data.id;

    this.installmentService.getWlPaymentPolicyList(model).subscribe({
      next: data => {
        this.isLoading = false;
        this.dataSource.data = data.data;
        this._paginator.length = data.total;
      }, error: err => {
        this.alertService.showToast('error', err, "top-right", true);
        this.isLoading = false;
      }
    })
  }

  createInternal(): void {
    this.matDialog.open(InstallmentEntryComponent, {
      data: { data: this.data, id: '', isPayment: false },
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.alertService.showToast('success', "Installment has been created!", "top-right", true);
        this.refreshItems();
      }
    })
  }

  editInternal(record): void {
    this.matDialog.open(InstallmentEntryComponent, {
      data: { data: this.data, id: record.id, isPayment: false, },
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.alertService.showToast('success', "Installment has been Modified!", "top-right", true);
        this.refreshItems();
      }
    })
  }

  Payment(record): void {
    this.matDialog.open(InstallmentEntryComponent, {
      data: { data: this.data, id: record.id, isPayment: true },
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.alertService.showToast('success', "Payment has been created!", "top-right", true);
        this.refreshItems();
      }
    })
  }

  deleteInternal(record): void {
    const label: string = 'Delete Installment'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.installment_amount + '?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.installmentService.delete(record.id).subscribe({
          next: () => {
            this.alertService.showToast('success', "Installment has been deleted!", "top-right", true);
            this.refreshItems()
          }
          , error: err => {
            this.alertService.showToast('error', err, "top-right", true);
            this.isLoading = false;
          }

        })
      }
    })
  }

  Audit(record : any): void {
    const label: string = 'Audite Payment';
    this.conformationService
      .open({
        title: label,
        message:
          'Are you sure to ' +
          label.toLowerCase() +
          ' ' +
          record.installment_amount +
          '?',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res === 'confirmed') {
          this.installmentService.setPaymentAudit(record.id).subscribe({
            next: () => {
              record.is_payment_audited = !record.is_payment_audited;
              this.alertService.showToast(
                'success',
                'Payment has been Audited!',
                'top-right',
                true
              );
            },
             error: err => {
              this.alertService.showToast('error', err, "top-right", true);
              this.isLoading = false;
            }
          });
        }
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

