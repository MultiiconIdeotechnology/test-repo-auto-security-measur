import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { imgExtantions } from 'app/common/const';
import { OfflineserviceService } from 'app/services/offlineservice.service';
import { ToasterService } from 'app/services/toaster.service';
import { CommonUtils, DocValidationDTO } from 'app/utils/commonutils';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';

@Component({
  selector: 'app-download-document',
  templateUrl: './download-document.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    AsyncPipe,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    NgxMatSelectSearchModule,
    MatTooltipModule,
    CommonModule,
    FormsModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    RouterOutlet,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatSlideToggleModule,
    NgxMatTimepickerModule,

  ]
})
export class DownloadDocumentComponent {

  record: any = {};
  obsId: any;
  formGroup: FormGroup;
  title = ""
  disableBtn: boolean = false;
  isInvoiceGenerated : boolean = false;

  constructor(
    public matDialogRef: MatDialogRef<DownloadDocumentComponent>,
    private builder: FormBuilder,
    private offlineService: OfflineserviceService,
    private alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data.data ?? {}
    this.obsId = this.data.Obs_id
    this.title = this.record.from;
    this.isInvoiceGenerated = data.isInvoiceGenerated;
  }

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      osb_id: this.obsId,
      service_type: [''],
      service_particular: [''],
      service_remark: [''],
      service_date: new Date(),
      supplier_id: [''],
      supplierFilter: [''],
      supplier_booking_ref_no: [''],
      purchase_amount: [''],
      service_charge: [''],
      service_charge_gst: [''],
      supplier_invoice: [''],
      supplier_confirmation_proof: [''],
      roe: [''],
      currency: [''],
    })

    if (this.record.id) {
      this.offlineService.getOsbPurchaseRecord(this.record.id).subscribe({
        next: (data) => {
          this.record = data;
          this.formGroup.patchValue(data);
        },
      });
    }
  }

  supplierChange(data: any) {
    this.formGroup.get('roe').patchValue(data.roe);
    this.formGroup.get('currency').patchValue(data.currency_short_code);
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

      if (from == "supplier_invoice")
        this.formGroup.get('supplier_invoice').patchValue(jFile);
      else
        this.formGroup.get('supplier_confirmation_proof').patchValue(jFile);

      this.alertService.showToast('success', "Document Uploaded", "top-right", true);
      (event.target as HTMLInputElement).value = '';
    });
  }


  submit() {
    this.disableBtn = true;
    const json = this.formGroup.getRawValue();

    if (!json?.supplier_invoice?.base64) {
      json.supplier_invoice = {
        fileName: '',
        fileType: '',
        base64: '',
      };
    } else {
      json.supplier_invoice = {
        fileName: json.supplier_invoice.fileName,
        fileType: json.supplier_invoice.fileType,
        base64: json.supplier_invoice.base64,
      };
    }

    if (!json?.supplier_confirmation_proof?.base64) {
      json.supplier_confirmation_proof = {
        fileName: '',
        fileType: '',
        base64: '',
      };
    } else {
      json.supplier_confirmation_proof = {
        fileName: json.supplier_confirmation_proof.fileName,
        fileType: json.supplier_confirmation_proof.fileType,
        base64: json.supplier_confirmation_proof.base64,
      };
    }

    json['osb_id'] = this.obsId
    json['service_date'] = DateTime.fromJSDate(new Date(this.formGroup.get('service_date').value)).toFormat('yyyy-MM-dd')

    this.offlineService.purchaseCreate(json).subscribe({
      next: () => {
        this.alertService.showToast('success', this.title + " saved", "top-right", true);
        this.matDialogRef.close(true);
        this.disableBtn = false;
      }, error: (err) => {
        this.disableBtn = false;
        this.alertService.showToast('error', err, "top-right", true);
      }
    })
  }

  downloadfile(data: string) {
    window.open(data, '_blank')
  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }
}

