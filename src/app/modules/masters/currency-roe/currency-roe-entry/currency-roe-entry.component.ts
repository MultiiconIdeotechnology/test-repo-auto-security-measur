import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CurrencyRoeService } from 'app/services/currency-roe.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-currency-roe-entry',
  templateUrl: './currency-roe-entry.component.html',
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
    MatTooltipModule
  ]
})
export class CurrencyRoeEntryComponent {
  disableBtn: boolean = false
  readonly: boolean = false;
  departmentList: any[] = [];
  roeList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  roetoList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  record: any = {};
  fieldList: {};
  currencyListAll: any[] = [];
  currencyList: any[] = [];
  currencyListToAll: any[] = [];
  currencyListTo: any[] = [];
  first: boolean = true;

  constructor(
    public matDialogRef: MatDialogRef<CurrencyRoeEntryComponent>,
    private builder: FormBuilder,
    private currencyRoeService: CurrencyRoeService,
    public alertService: ToasterService,
    private toastr: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
  }

  formGroup: FormGroup;
  title = "Create Currency ROE"
  btnLabel = "Create"

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      from_currency_id: [''],
      to_currency_id: [''],
      actual_markup: [''],
      forex_actual_markup: [''],
    //   purchase_markup: [''],
    //   sale_markup: [''],
    //   forex_purchase_markup: [''],
    //   forex_sale_markup: [''],
      // currency_short_code: [''],
      // currency_short_code_to: [''],
      // actual_roe: [''],
      // purchase_roe: [''],
      // sale_roe: [''],
      // forex_purchase_roe: [''],
      // forex_sale_roe: [''],

      roefilter: [''],
      roetofilter: ['']
    });

    // this.currencyRoeService.getcurrencyCombo("").subscribe(data => {
    //   this.roeList.next(data);
    //   this.roetoList.next(data)
    // })

    this.currencyRoeService.getcurrencyCombo().subscribe({
      next: (res) => {
        this.currencyListAll = res;
        this.currencyList = res;

        if (!this.record.id) {
          const defaultFromCurrency = this.currencyList.find(
            (currency) => currency.currency_short_code === 'INR'
          );
          this.formGroup
            .get('from_currency_id')
            .patchValue(defaultFromCurrency.id);
        }

        this.currencyListToAll = res;
        this.currencyListTo = res;

        if (!this.record.id) {
          const defaultToCurrency = this.currencyListTo.find(
            (currency) => currency.currency_short_code === 'INR'
          );
          this.formGroup
            .get('to_currency_id')
            .patchValue(defaultToCurrency.id);
        }
      },
    });

    this.formGroup.get('roefilter').valueChanges.subscribe((data) => {
      this.currencyList = this.currencyListAll.filter((x) =>
        x.currency_short_code.toLowerCase().includes(data.toLowerCase())
      );
    });

    this.formGroup.get('roetofilter').valueChanges.subscribe((data) => {
      this.currencyListTo = this.currencyListToAll.filter((x) =>
        x.currency_short_code.toLowerCase().includes(data.toLowerCase())
      );
    });

    // this.formGroup.get('roetofilter').valueChanges.pipe(
    //   filter(search => !!search),
    //   startWith(''),
    //   debounceTime(200),
    //   distinctUntilChanged(),
    //   switchMap((value: any) => {
    //     if(value)
    //     return this.currencyRoeService.getcurrencyCombo(value);
    //     else return new Observable<any[]>();
    //   })
    // ).subscribe(data => this.roetoList.next(data));

    // this.formGroup.get('roefilter').valueChanges.pipe(
    //   filter(search => !!search),
    //   startWith(''),
    //   debounceTime(200),
    //   distinctUntilChanged(),
    //   switchMap((value: any) => {
    //     if(value)
    //     return this.currencyRoeService.getcurrencyCombo(value);
    //     else return new Observable<any[]>();
    //   })
    // ).subscribe(data => this.roeList.next(data));

    if (this.record.id) {
      this.formGroup.patchValue(this.record)
      this.readonly = this.data.readonly;
      this.title = this.readonly ? ("Currency ROE - " + this.record.from_currency_code + " to " + this.record.to_currency_code) : 'Modify Currency ROE';
      this.btnLabel = this.readonly ? "Close" : 'Save';
    }

    if (this.record.id) {
      this.currencyRoeService.getCurrencyRoeRecord(this.record.id).subscribe(data => {
        this.readonly = this.data.readonly;
        if (this.readonly) {

          this.fieldList = [
            { name: 'From Currency', value: data.from_currency_code },
            { name: 'To Currency', value: data.to_currency_code },
            { name: 'Actual ROE', value: data.actual_roe },
            { name: 'Actual Markup', value: data.actual_markup },
            { name: 'Forex Actual Markup', value: data.forex_actual_markup },
            // { name: 'Purchase ROE', value: data.purchase_roe },
            // { name: 'Sale ROE', value: data.sale_roe },
            // { name: 'Forex Purchase Markup', value: data.forex_purchase_markup },
            // { name: 'Forex Sale Markup', value: data.forex_sale_markup },
            // { name: 'Forex Parchase REO', value: data.forex_purchase_roe },
            // { name: 'Forex Sale ROE', value: data.forex_sale_roe },
          ]
        }

        // this.formGroup.get('currency_short_code').patchValue(data.from_currency_code);
        // this.formGroup.get('currency_short_code_to').patchValue(data.to_currency_code);

        this.formGroup.patchValue(data);
        this.formGroup.get('from_currency_id').patchValue(data.from_currency_id);
        this.formGroup.get('to_currency_id').patchValue(data.to_currency_id);


        if (this.data.readonly) {
          this.readonly = true;
          this.title = 'Currency ROE' + ' - ' + this.data.data.actual_roe;
        } else {
          this.readonly = false;
        }
      });
    }
  }

  submit(): void {
    if (!this.formGroup.valid) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }

    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    this.currencyRoeService.create(json).subscribe({
      next: () => {
        this.matDialogRef.close(true);
        this.toastr.showToast('success', this.btnLabel === 'Create' ? "Currency ROE Created" : 'Currency ROE Saved');
        this.disableBtn = false;
      }, error: (err) => {
        this.disableBtn = false;
        this.alertService.showToast('error', err, "top-right", true);
      }
    })
  }
}
