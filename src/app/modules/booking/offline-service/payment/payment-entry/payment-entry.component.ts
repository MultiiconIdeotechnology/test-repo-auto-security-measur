import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AccountService } from 'app/services/account.service';
import { OfflineserviceService } from 'app/services/offlineservice.service';
import { SupplierService } from 'app/services/supplier.service';
import { ToasterService } from 'app/services/toaster.service';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject, filter, startWith, debounceTime, distinctUntilChanged, switchMap, Observable } from 'rxjs';

@Component({
  selector: 'app-payment-entry',
  templateUrl: './payment-entry.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    CommonModule,
    FormsModule,
    MatNativeDateModule,
    NgxMatSelectSearchModule
  ]
})
export class PaymentEntryComponent implements OnInit {

  SupplierList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  record: any = {};
  disableBtn: boolean = false
  records: any = {};
  readonly: boolean = false;
  isFirst: boolean = true;
  fieldList: {};
  mopList: any[] = ['Wallet', 'Digital Payment'];
  obsId: any;
  maxAmount: number = 0;

  constructor(
    public matDialogRef: MatDialogRef<PaymentEntryComponent>,
    private builder: FormBuilder,
    private offlineService: OfflineserviceService,
    private supplierService: SupplierService,
    private alertService: ToasterService,
    private accountService: AccountService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
    this.obsId = this.data.Obs_id
  }

  formGroup: FormGroup;
  title = "Payment Entry"
  btnLabel = "Submit"

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      osb_id: this.obsId,
      net_sale_amount: [0],
      supplier_id: [''],
      supplierFilter: [''],
      currency: [''],
      account_remark: [''],
      roe: [''],
      mop: [this.mopList[0]],
    })

    this.formGroup
      .get('supplierFilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value: any) => {
          return this.supplierService.getSupplierCombo(value, this.obsId);
        })
      )
      .subscribe({
        next: (data) => {
          this.SupplierList.next(data);
          if (this.isFirst && data[0])
            this.maxAmount = data[0].obs_purches_amount

          if (this.isFirst && data[0] && !this.record.id) {
            this.formGroup.get('supplier_id').patchValue(data[0]);
            this.formGroup.get('roe').patchValue(data[0].roe);
            this.formGroup.get('currency').patchValue(data[0].currency_short_code);
            this.formGroup.get('net_sale_amount').patchValue(this.maxAmount);
            this.isFirst = false;
          }
        },
      });

    if (this.record.id) {
      this.accountService.getPaymentRecord(this.record.id).subscribe({
        next: (data) => {
          this.records = data;

          this.readonly = this.data.readonly;
          if (this.readonly) {
            this.fieldList = [
              { name: 'Ref no.', value: data.payment_ref_no, isTooltip: true },
              { name: 'Status', value: data.payment_status },
              { name: 'Supplier', value: data.payment_to_name, isTooltip: true },
              { name: 'Amount', value: data.supplier_currency + " " + data.supplier_amount },
              { name: 'ROE', value: data.roe },
              { name: 'Entry Date', value: data.payment_request_date ? DateTime.fromISO(data.payment_request_date).toFormat('dd-MM-yyyy HH:mm:ss') : '' },
              { name: 'Audited By', value: '', isTooltip: true },
              { name: 'Audit Date Time', value: data.audit_date_time ? DateTime.fromISO(data.audit_date_time).toFormat('dd-MM-yyyy HH:mm:ss') : '' },
              { name: 'Rejected By', value: '', isTooltip: true },
              { name: 'Reject Date Time', value: '' },
              { name: 'Rejection Remark', value: data.payment_reject_reason },
            ];
          } else {
            this.formGroup.patchValue({
              id: data.id,
              account_remark: data.payment_remark,
              mop: data.mode_of_payment,
              net_sale_amount: data.supplier_amount,
              roe: data.roe,
              currency: data.supplier_currency,
              supplierFilter: data.payment_to_name,
              supplier_id: { company_name: data.payment_to_name, id: data.payment_to_id },
            });
          }
          this.title = this.readonly ? 'Payment Info' : 'Modify Payment Entry';
          this.btnLabel = this.readonly ? 'Close' : 'Save';
        },
      });
    }
  }

  supplierChange(data: any) {
    this.formGroup.get('roe').patchValue(data.roe);
    this.formGroup.get('currency').patchValue(data.currency_short_code);
    this.maxAmount = data.obs_purches_amount
  }

  submit() {
    if (!this.formGroup.valid) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }

    this.disableBtn = true;
    const json = this.formGroup.getRawValue();

    if (json.roe <= 0) {
      this.alertService.showToast('error', 'ROE must be greater than 0.', 'top-right', true);
      this.disableBtn = false;
      return;
    }

    json.supplier_id = json.supplier_id.id;
    json['osb_id'] = this.obsId;

    this.offlineService.createPaymentEntry(json).subscribe({
      next: () => {
        this.matDialogRef.close(true);
        this.disableBtn = false;
      }, error: (err) => {
        this.disableBtn = false;
        this.alertService.showToast('error', err, "top-right", true);
      }
    })
  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }
}
