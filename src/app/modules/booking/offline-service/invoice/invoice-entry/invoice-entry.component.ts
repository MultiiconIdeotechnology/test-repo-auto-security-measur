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
  selector: 'app-invoice-entry',
  templateUrl: './invoice-entry.component.html',
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
export class InvoiceEntryComponent implements OnInit {

  SupplierList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  record: any = {};
  disableBtn: boolean = false
  records: any = {};
  readonly: boolean = false;
  isFirst: boolean = true;
  fieldList: {};
  obsId: any;

  constructor(
    public matDialogRef: MatDialogRef<InvoiceEntryComponent>,
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
  title = "Receipt Entry"
  btnLabel = "Create"

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      osb_id: this.obsId,
      net_sale_amount: [''],
      supplier_id: [''],
      supplierFilter: [''],
      currency: [''],
      roe: [''],
    })

    this.formGroup
      .get('supplierFilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value: any) => {
          if (!this.record.id)
            return this.supplierService.getSupplierCombo(value);
          else
            return new Observable<any>();
        })
      )
      .subscribe({
        next: (data) => {
          this.SupplierList.next(data);

          if (this.isFirst) {
            this.formGroup.get('supplier_id').patchValue(data[0]);
            this.formGroup.get('roe').patchValue(data[0].roe);
            this.formGroup.get('currency').patchValue(data[0].currency_short_code);
            this.isFirst = false;
          }
        },
      });

    if (this.record.id) {
      this.accountService.getReceiptRecord(this.record.id).subscribe({
        next: (data) => {
          this.records = data;

          this.readonly = this.data.readonly;
          if (this.readonly) {
            this.fieldList = [
              { name: 'Transaction ID', value: data.transaction_ref_no },
              { name: 'Ref no.', value: data.receipt_ref_no },
              { name: 'Status', value: data.receipt_status },
              { name: 'To', value: data.receipt_to },
              { name: 'Net Sale Amount', value: data.supplier_currency + " " + data.payment_amount },
              { name: 'Mode of Payment', value: data.mode_of_payment },
              { name: 'ROE', value: data.roe },
              { name: 'Requested', value: DateTime.fromISO(data.receipt_request_date).toFormat('dd-MM-yyyy HH:mm:ss') },
              { name: 'Audited', value: data.receipt_status != "Confirmed" ? ' - ' : DateTime.fromISO(data.audit_date_time).toFormat('dd-MM-yyyy HH:mm:ss') },
            ];
          }
          this.formGroup.patchValue(data);
          this.title = this.readonly ? 'Receipt Info' : 'Modify Receipt Entry';
          this.btnLabel = this.readonly ? 'Close' : 'Save';
        },
      });
    }
  }

  supplierChange(data: any) {
    this.formGroup.get('roe').patchValue(data.roe);
    this.formGroup.get('currency').patchValue(data.currency_short_code);
  }

  submit() {
    if (!this.formGroup.valid) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }

    this.disableBtn = true;
    const json = this.formGroup.getRawValue();

    json.supplier_id = json.supplier_id.id;
    json['osb_id'] = this.obsId;

    this.offlineService.createInvoiceEntry(json).subscribe({
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
