import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup } from '@angular/forms';
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
import { CurrencyRoeService } from 'app/services/currency-roe.service';
import { OfflineserviceService } from 'app/services/offlineservice.service';
import { ToasterService } from 'app/services/toaster.service';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';

@Component({
  selector: 'app-sales-entry',
  templateUrl: './sales-entry.component.html',
  styleUrls: ['./sales-entry.component.scss'],
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
export class SalesEntryComponent {

  record: any = {};
  disableBtn: boolean = false
  supplier_invoice: string | null = null;
  records: any = {};
  readonly: boolean = false;
  fieldList: {};
  obsId: any
  CurrencyList: any[] = [];
  CurrencyListTemp: any[] = [];
  currency_short_code: string = '';

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
    public matDialogRef: MatDialogRef<SalesEntryComponent>,
    private builder: FormBuilder,
    private offlineService: OfflineserviceService,
    private alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
    this.obsId = this.data.Obs_id
    this.currency_short_code = this.data.currency_short_code
  }

  formGroup: FormGroup;
  title = "Sales Entry"
  btnLabel = "Submit"

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      osb_id: this.obsId,
      service_type: [this.serviceList[0].value],
      service_particular: [''],
      service_remark: [''],
      service_date: new Date(),
      agent_currency_id: [this.data.agent_currency_id],
      sale_amount: [1],
      service_charge: [0],
      total_tax: [0],
      net_sale_amount: [0],
      sgst: [''],
      cgst: [''],
      igst: [''],
      vat: [''],
      currency: [this.currency_short_code],
    })

    if (this.record.id) {
      this.offlineService.getOsbSalesRecord(this.record.id).subscribe({
        next: (data) => {
          this.records = data;
          this.readonly = this.data.readonly;
          if (this.readonly) {
            this.fieldList = [
              { name: 'Service Type', value: data.service_type ,isTooltip : true },
              { name: 'Service Date', value: data.service_date ? DateTime.fromISO(data.service_date).toFormat('dd-MM-yyyy') : '' },
              { name: 'Sale Amount', value: data.agent_currency + " " + data.sale_amount },
              { name: 'Service Charge', value: data.agent_currency + " " + data.service_charge },
              { name: 'Total Tax', value: data.agent_currency + " " + data.total_tax },

              { name: 'SGST', value: data.sgst, isHide: this.currency_short_code.toLowerCase() != 'ind' },
              { name: 'CGST', value: data.cgst, isHide: this.currency_short_code.toLowerCase() != 'ind' },
              { name: 'IGST', value: data.igst, isHide: this.currency_short_code.toLowerCase() != 'ind' },
              { name: 'VAT', value: data.vat, isHide: this.currency_short_code.toLowerCase() == 'ind' },

              { name: 'Net Sale Amount', value: data.agent_currency + " " + data.net_sale_amount },
              { name: 'Service Particular', value: data.service_particular },
              { name: 'Service Remark', value: data.service_remark },
            ];
          }
          this.formGroup.patchValue(data);
          this.supplier_invoice = data.supplier_invoice;
          this.title = this.readonly ? 'Sales Info' : 'Modify Sales Entry';
          this.btnLabel = this.readonly ? 'Close' : 'Save';
        },
      });
    }
  }

  submit() {
    if (!this.formGroup.valid) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }
    this.disableBtn = true;

    const json = this.formGroup.getRawValue();

    json['osb_id'] = this.obsId
    json['service_date'] = DateTime.fromJSDate(new Date(this.formGroup.get('service_date').value)).toFormat('yyyy-MM-dd')
    json.net_sale_amount = json.sale_amount + json.service_charge + json.total_tax;
    json.sgst = json.sgst ? json.sgst : 0;
    json.cgst = json.cgst ? json.cgst : 0;
    json.igst = json.igst ? json.igst : 0;
    json.vat = json.vat ? json.vat : 0;

    this.offlineService.salesCreate(json).subscribe({
      next: () => {
        this.matDialogRef.close(true);
        this.disableBtn = false;
      }, error: (err) => {
        this.disableBtn = false;
        this.alertService.showToast('error', err, "top-right", true);
      }
    })
  }

}
