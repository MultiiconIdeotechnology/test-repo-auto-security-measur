// import { AmendmentRequestsService } from './../../../../services/amendment-requests.service';
import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CurrencyRoeService } from 'app/services/currency-roe.service';
import { CurrencyService } from 'app/services/currency.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject, debounceTime, distinctUntilChanged, filter, startWith, switchMap } from 'rxjs';
import { AmendmentRequestsService } from 'app/services/amendment-requests.service';

@Component({
  selector: 'app-update-charge',
  templateUrl: './update-charge.component.html',
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
    CommonModule,
    NgxMatSelectSearchModule,
    MatTooltipModule,
    MatDividerModule
  ]
})
export class UpdateChargeComponent {
  disableBtn: boolean = false
  readonly: boolean = false;
  record: any = {};

  gross_sales_return_per_person: number = 0;
  gross_sales_return_total: number = 0;
  net_sales_return_per_person: number = 0;
  net_sales_return_total: number = 0;
  sales_return_total: number = 0;

  constructor(
    public matDialogRef: MatDialogRef<UpdateChargeComponent>,
    private builder: FormBuilder,
    private matSnackBar: MatSnackBar,
    private alertService: ToasterService,
    private amendmentRequestsService: AmendmentRequestsService,
    private currencyService: CurrencyRoeService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
  }

  formGroup: FormGroup;
  title = "Update Charge";
  btnLabel = "Update";
  CurrencyList: any[] = [];
  CurrencyListAll: any[] = [];

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      air_booking_id: [''],
      agent_name: [''],
      agent_id: [''],
      amendment_type: [''],
      company_name: [''],
      supplier_id: [''],
      markup_type: [''],
      markup_value: [''],
      air_amt_tax_type: [''],
      air_amt_tax_val: [''],
      currency_id: [''],
      roe: [0],
      is_refund: [''],
      pax: [''],
      amendment_amount_per_person: [0],
      is_segment_amount: [false],
      currencyfilter: [''],
      company_remark: [''],
      amountType : [''],
      base_amount:[''],
      segmentAmount:['']
    });


    // this.currencyService.getCurrencyRoeCombo().subscribe({
    //   next: res => {
    //     this.CurrencyList = res;
    //     this.CurrencyListAll = res;
    //   }
    // })

    // this.formGroup.get('currencyfilter').valueChanges.pipe(
    //   filter(search => !!search),
    //   startWith(''),
    //   debounceTime(400),
    //   distinctUntilChanged(),
    //   switchMap((value: any) => {
    //     return this.currencyService.getCurrencyRoeCombo(value);
    //   })
    // ).subscribe((data:any) => {
    //   this.CurrencyList = data
    //   this.formGroup.get("currency_id").patchValue(data[0].id);
    // })

    // this.formGroup.get('base_amount').patchValue()

    this.formGroup.get('currencyfilter').valueChanges.subscribe(data => {
      this.CurrencyList = this.CurrencyListAll.filter(x => x.currency_short_code.toLowerCase().includes(data.toLowerCase()));
    })

    this.formGroup.get('currency_id').valueChanges.subscribe((value) => {
      setTimeout(() => {
        this.formGroup.get('roe').patchValue(value.sale_roe);
      })
    })
    this.formGroup.get('amendment_amount_per_person').valueChanges.subscribe((value) => {
      setTimeout(() => {
        this.calculation()
      })
    });

    this.amendmentRequestsService.initialAmendmentCharges(this.data.id).subscribe({
      next: (res) => {
        this.formGroup.patchValue(res)
        this.formGroup.get('base_amount').patchValue(res.cancellation_charge);
        this.calculation();
      }, error: (err) => {
        this.disableBtn = false;
        this.alertService.showToast('error', err, "top-right", true);
      }
    })



  }

  calculation(): void {
    const form = this.formGroup.value;
    form.amendment_amount_per_person = form.amendment_amount_per_person || 0;
    if (form.amendment_amount_per_person < 1 || !form.amendment_amount_per_person) {
      this.gross_sales_return_per_person = 0;
      this.gross_sales_return_total = 0;
      this.net_sales_return_per_person = 0;
      this.net_sales_return_total = 0;
      return;
    }

    this.sales_return_total = form.amendment_amount_per_person * form.pax;

    const markup_value = form.markup_type.includes('%') ? (form.amendment_amount_per_person * form.markup_value) / 100 : form.markup_value;

    switch (form.markup_type) {
      case 'Flat for Full Amendment':
        this.gross_sales_return_per_person = form.is_refund ? form.amendment_amount_per_person - (markup_value / form.pax) : form.amendment_amount_per_person + (markup_value / form.pax);
        this.gross_sales_return_total = this.gross_sales_return_per_person * form.pax;
        break;
      case 'Flat Per Pax':
        this.gross_sales_return_per_person = form.is_refund ? form.amendment_amount_per_person - (markup_value) : form.amendment_amount_per_person + (markup_value);
        this.gross_sales_return_total = this.gross_sales_return_per_person * form.pax;
        break;
      case 'Percentage(%) for Full Amendment':
        this.gross_sales_return_per_person = form.is_refund ? form.amendment_amount_per_person - (markup_value / form.pax) : form.amendment_amount_per_person + (markup_value / form.pax);
        this.gross_sales_return_total = this.gross_sales_return_per_person * form.pax;
        break;
      case 'Percentage(%) Per Pax':
        this.gross_sales_return_per_person = form.is_refund ? form.amendment_amount_per_person - (markup_value) : form.amendment_amount_per_person + (markup_value);
        this.gross_sales_return_total = this.gross_sales_return_per_person * form.pax;
        break;
    }

    this.gross_sales_return_per_person = Number(this.gross_sales_return_per_person.toFixed(2));
    this.gross_sales_return_total = Number(this.gross_sales_return_total.toFixed(2));


    switch (form.air_amt_tax_type) {

      case 'Tax On Sale Amount':
        const tax_value = (this.gross_sales_return_total * form.air_amt_tax_val) / 100
        this.net_sales_return_per_person = form.is_refund ? this.gross_sales_return_per_person - (tax_value / form.pax) : this.gross_sales_return_per_person + (tax_value / form.pax);
        this.net_sales_return_total = this.net_sales_return_per_person * form.pax;
        break;
      case 'Tax On Commission':

        const tax_value_com = (markup_value * form.air_amt_tax_val) / 100
        this.net_sales_return_per_person = form.is_refund ? this.gross_sales_return_per_person - (tax_value_com / form.pax) : this.gross_sales_return_per_person + (tax_value_com / form.pax);
        this.net_sales_return_total = this.net_sales_return_per_person * form.pax;
        break;
    }

    this.net_sales_return_per_person = Number(this.net_sales_return_per_person.toFixed(2));
    this.net_sales_return_total = Number(this.net_sales_return_total.toFixed(2));

  }

  submit(): void {
    if(!this.formGroup.valid){
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
}

    this.disableBtn = true;
    const values = this.formGroup.getRawValue();
    const json = {
      // amendment_amount_per_person: values.amendment_amount_per_person,
      total_pax: values.pax,
      currency_id: values.currency_id.currency_id,
      amendment_id: this.data.id,
      roe: values.roe,
      company_remark:values.company_remark,
      isRefundAMDT : values.is_refund,
      amountType : values.amountType,

      // base_amount : values.base_amount,
      segmentAmount : values.segmentAmount ? values.segmentAmount : 0,
      amendment_amount_per_person: values.base_amount,
      
    }
    json['currency_id'] = this.data.supplier_currency_id
    this.amendmentRequestsService.amendmentCharges(json).subscribe({
      next: () => {
        this.alertService.showToast('success', 'Amendment charges updated!', "top-right", true);
        this.matDialogRef.close(true);
        this.disableBtn = false;
      }, error: (err) => {
        this.disableBtn = false;
        this.alertService.showToast('error', err, "top-right", true);
      }
    })
  }

  compareWith(v1, v2) {
    return v1 && v2 && v1.id == v2.id
  }
}
