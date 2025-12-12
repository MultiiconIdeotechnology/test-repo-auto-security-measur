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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { imgPdfExtantions } from 'app/common/const';
import { FlightTabService } from 'app/services/flight-tab.service';
import { OfflineserviceService } from 'app/services/offlineservice.service';
import { SupplierService } from 'app/services/supplier.service';
import { ToasterService } from 'app/services/toaster.service';
import { CommonUtils, DocValidationDTO } from 'app/utils/commonutils';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { ReplaySubject, filter, startWith, debounceTime, distinctUntilChanged, switchMap, Observable } from 'rxjs';

@Component({
  selector: 'app-purchase-entry',
  templateUrl: './purchase-entry.component.html',
  styleUrls: ['./purchase-entry.component.scss'],
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
export class PurchaseEntryComponent {

  SupplierList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  record: any = {};
  disableBtn: boolean = false
  records: any = {};
  readonly: boolean = false;
  isFirst: boolean = true;
  fieldList: {};
  obsId: any;

  serviceList: any[] = [
    { value: 'Airline', viewValue: 'Airline' },
    { value: 'Hotel', viewValue: 'Hotel' },
    { value: 'BUS', viewValue: 'BUS' },
    { value: 'Holiday Package', viewValue: 'Holiday Package' },
    { value: 'Activity', viewValue: 'Activity' },
    { value: 'OTB', viewValue: 'OTB' },
    { value: 'VISA', viewValue: 'VISA' },
    { value: 'Other', viewValue: 'Other' },
  ];

  constructor(
    public matDialogRef: MatDialogRef<PurchaseEntryComponent>,
    private builder: FormBuilder,
    private matSnackBar: MatSnackBar,
    private offlineService: OfflineserviceService,
    private supplierService: SupplierService,
    private flighttabService: FlightTabService,
    private alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
    this.obsId = this.data.Obs_id
  }

  formGroup: FormGroup;
  title = "Purchase Entry"
  btnLabel = "Submit"

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

    this.formGroup.get('service_type').patchValue('Airline');

    this.formGroup
      .get('supplierFilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value: any) => {
          if (!this.data.readonly)
            return this.supplierService.getSupplierCombo(value);
          else
            return new Observable<any>();
        })
      )
      .subscribe({
        next: (data) => {
          this.SupplierList.next(data);

          if (this.isFirst && !this.record.id) {
            this.formGroup.get('supplier_id').patchValue(data[0]);
            this.formGroup.get('roe').patchValue(data[0].roe);
            this.formGroup.get('currency').patchValue(data[0].currency_short_code);
            this.isFirst = false;
          }
        },
      });

    if (this.record.id) {
      this.offlineService.getOsbPurchaseRecord(this.record.id).subscribe({
        next: (data) => {
          this.records = data;

          this.readonly = this.data.readonly;
          if (this.readonly) {
            this.fieldList = [
              { name: 'Service Type', value: data.service_type ,isTooltip : true},
              { name: 'Supplier', value: data.supplier_name },
              { name: 'Purchase Amount', value: data.purchase_amount + data.currency },
              { name: 'Service Charge', value: data.service_charge || '--' },
              { name: 'Service Charge GST', value: data.service_charge_gst || '--' },
              { name: 'ROE', value: data.roe },
              { name: 'Service Date', value: data.service_date ? DateTime.fromISO(data.service_date).toFormat('dd-MM-yyyy') : '' },
              { name: 'Supplier Reference No.', value: data.supplier_booking_ref_no ,isTooltip : true },
            ];
          } else {
            this.formGroup.patchValue(data);
            this.formGroup.get('supplierFilter').patchValue(data.supplier_name);
            this.formGroup.get('supplier_id').patchValue({ id: data.supplier_id, company_name: data.supplier_name, currency_short_code: data.currency, roe: data.roe });
          }
          this.title = this.readonly ? 'Purchase Info' : 'Modify Purchase Entry';
          this.btnLabel = this.readonly ? 'Close' : 'Save';
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

    const extantion: string[] = CommonUtils.valuesArray(imgPdfExtantions);
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

    json.supplier_id = json.supplier_id.id;
    json['osb_id'] = this.obsId
    json['service_date'] = DateTime.fromJSDate(new Date(this.formGroup.get('service_date').value)).toFormat('yyyy-MM-dd')

    this.offlineService.purchaseCreate(json).subscribe({
      next: () => {
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

  onKeyPressNumberDecimal(event: KeyboardEvent): boolean {
    const input = event.target as HTMLInputElement;
    const key = event.key;
  
    // Allow digits 0–9
    if (/^\d$/.test(key)) return true;
  
    // Allow one decimal point
    if (key === '.' && !input.value.includes('.')) return true;
  
    // Block everything else
    event.preventDefault();
    return false;
  }
}
