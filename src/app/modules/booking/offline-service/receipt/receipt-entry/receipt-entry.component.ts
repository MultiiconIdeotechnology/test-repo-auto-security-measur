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
import { imgExtantions } from 'app/common/const';
import { AccountService } from 'app/services/account.service';
import { OfflineserviceService } from 'app/services/offlineservice.service';
import { ToasterService } from 'app/services/toaster.service';
import { CommonUtils, DocValidationDTO } from 'app/utils/commonutils';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-receipt-entry',
  templateUrl: './receipt-entry.component.html',
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
export class ReceiptEntryComponent implements OnInit {

  SupplierList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  record: any = {};
  disableBtn: boolean = false
  records: any = {};
  readonly: boolean = false;
  isFirst: boolean = true;
  fieldList: {};
  obsId: any;
  mopList: any[] = ['Wallet', 'Online'];

  constructor(
    public matDialogRef: MatDialogRef<ReceiptEntryComponent>,
    private builder: FormBuilder,
    private offlineService: OfflineserviceService,
    private alertService: ToasterService,
    private accountService: AccountService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
    this.obsId = this.data.Obs_id
  }

  formGroup: FormGroup;
  title = "Receipt Entry"
  btnLabel = "Submit"

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      osb_id: this.obsId,
      net_sale_amount: [''],
      remark: [''],
      payment_attachment: [''],
      proof_attachment: [''],
      mop: [this.mopList[0]],
    })

    if (this.record.id) {
      this.accountService.getReceiptRecord(this.record.id).subscribe({
        next: (data) => {
          this.records = data;

          this.readonly = this.data.readonly;
          if (this.readonly) {
            this.fieldList = [
              { name: 'Reference Number', value: data.receipt_ref_no, isTooltip: true },
              { name: 'Amount', value: data.payment_currency + " " + data.payment_amount },
              { name: 'ROE', value: data.roe },
              { name: 'MOP', value: data.mode_of_payment },

              { name: 'Audited By', value: "", isTooltip: true },
              { name: 'Audit Date Time', value: data.audit_date_time ? DateTime.fromISO(data.audit_date_time).toFormat('dd-MM-yyyy HH:mm:ss') : "" },

              { name: 'Rejected By', value: "", isTooltip: true },
              { name: 'Reject Date Time', value: DateTime.fromISO(data.receipt_request_date).toFormat('dd-MM-yyyy HH:mm:ss') },
              { name: 'Remark', value: data.receipt_remark },
              { name: 'Rejection Remark', value: data.receipt_reject_reason },
            ];
          } else {
            this.formGroup.patchValue({
              id: data.id,
              net_sale_amount: data.payment_amount,
              remark: data.receipt_remark,
              payment_attachment: data.payment_attachment,
              proof_attachment: data.proof_attachment,
              mop: data.mode_of_payment,
            });
          }

          this.title = this.readonly ? 'Receipt Info' : 'Modify Receipt Entry';
          this.btnLabel = this.readonly ? 'Close' : 'Save';
        },
      });
    }
  }

  downloadfile(data: string) {
    window.open(data, '_blank')
  }

  uploadDocument(event: any, from: string): void {
    const file = (event.target as HTMLInputElement).files[0];

    const extantion: string[] = CommonUtils.valuesArray(imgExtantions);
    var validator: DocValidationDTO = CommonUtils.isDocValid(file, extantion, 3036, null);
    if (!validator.valid) {
      this.alertService.showToast('error', validator.alertMessage);
      (event.target as HTMLInputElement).value = '';
      return;
    }

    CommonUtils.getJsonFile(file, (reader, jFile) => {
      const doc = Object.assign({});
      jFile["result"] = reader.result;

      if (from == "proof_attachment")
        this.formGroup.get('proof_attachment').patchValue(jFile);
      else
        this.formGroup.get('payment_attachment').patchValue(jFile);

      this.alertService.showToast('success', "Document Uploaded", "top-right", true);
      (event.target as HTMLInputElement).value = '';
    });
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

    // if (json.mop == 'Wallet' && !json.proof_attachment.base64) {
    //   this.alertService.showToast('error', 'Proof Attachment is required.', 'top-right', true);
    //   this.disableBtn = false;
    //   return;
    // }
    json['osb_id'] = this.obsId;
    if (!json.proof_attachment?.base64) {
      json.proof_attachment = {
        base64: "",
        fileType: "",
        fileName: ""
      }
    }
    if (!json.payment_attachment?.base64) {
      json.payment_attachment = {
        base64: "",
        fileType: "",
        fileName: ""
      }
    }

    this.offlineService.createReceiptEntry(json).subscribe({
      next: () => {
        this.matDialogRef.close(true);
        this.disableBtn = false;
      }, error: (err) => {
        this.disableBtn = false;
        this.alertService.showToast('error', err, "top-right", true);
      }
    })
  }

  MOPChange() {
    this.formGroup.get('proof_attachment').patchValue('');
  }

  download(data: any): void {
    if (data?.base64) {
      const newTab = window.open('', '_blank');
      if (newTab) {
        newTab.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Document Viewer</title>
                </head>
                <style>
                    html, body, iframe {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        height: 100%;
                        border: none;
                    }
                </style>
                <body>
                    <iframe src="${data?.result}"></iframe>
                </body>
            </html>
        `);
        newTab.document.close();
      } else {
        alert('Please allow popups for this website');
      }
    } else
      window.open(data, '_blank');
  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }
}
