import { Component, Inject } from '@angular/core';
import { ReplaySubject, debounceTime, distinctUntilChanged, filter, startWith, switchMap } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, NgClass, DatePipe, AsyncPipe, NgFor } from '@angular/common';
import { CurrencyService } from 'app/services/currency.service';
import { SupplierService } from 'app/services/supplier.service';
import { CityService } from 'app/services/city.service';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ToasterService } from 'app/services/toaster.service';
import { Linq } from 'app/utils/linq';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DateTime } from 'luxon';


@Component({
  selector: 'app-supplier-entry',
  templateUrl: './supplier-entry.component.html',
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
export class SupplierEntryComponent {

  disableBtn: boolean = false
  readonly: boolean = false;
  iscreate: boolean = true;
  record: any = {};
  first: boolean = true
  cityList: any[] = [];
  // cityList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  MobileCodeList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  KycProfileList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  CurrencyList: any[] = [];
  CurrencyListAll: any[] = [];
  mobilecodelist: any[] = [];
  transaction_currency_id: any;
  fieldList: {};
  selectedList: any[] = []

  api_for = new FormControl([]);

  // toppingList: string[] = ['Airline', 'BUS', 'Hotel', 'Holiday', 'Insurance', 'Visa'];
  toppingList: string[] = ['Airline', 'BUS', 'Hotel', 'Holiday', 'Insurance', 'Visa'];


  // api_for: any[] = [
  //   {value: 'Airline', viewValue: 'Airline'},
  //   {value: 'BUS', viewValue: 'BUS'},
  //   {value: 'Hotel', viewValue: 'Hotel'},
  //   {value: 'Holiday Product', viewValue: 'Holiday Product'},
  //   {value: 'Insurance', viewValue: 'Insurance'},
  // ];

  constructor(
    public matDialogRef: MatDialogRef<SupplierEntryComponent>,
    private builder: FormBuilder,
    private supplierService: SupplierService,
    @Inject(MAT_DIALOG_DATA) public data: any = {},
    private cityService: CityService,
    private kycDocumentService: KycDocumentService,
    private currencyService: CurrencyService,
    private alertService: ToasterService
  ) {
    this.record = data?.data ?? {}
    this.iscreate = data.iscreate ? true : false
  }

  formGroup: FormGroup;
  title = "Create Supplier"
  btnLabel = "Create"

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      company_name: [''],
      email_address: ['', Validators.email],
      mobile_code: [''],
      mobile_number: [''],
      city_id: [''],
      priority: [''],
      transaction_currency_id: [''],
      cityfilter: [''],
      mobileCodefilter: [''],
      currencyfilter: [''],
      // api_for: ['']
    });

    this.api_for.valueChanges.subscribe((selectedValues: any) => {
      this.selectedList = selectedValues
    });

    //   this.formGroup.get('company_name').valueChanges.subscribe(text => {
    //     this.formGroup.get('company_name').patchValue(Linq.convertToTitleCase(text), { emitEvent: false });
    //  }) 

    this.formGroup.get('email_address').valueChanges.subscribe(text => {
      this.formGroup.get('email_address').patchValue(text.toLowerCase(), { emitEvent: false });
    })

    this.currencyService.getcurrencyCombo().subscribe({
      next: res => {
        this.CurrencyList = res;
        this.CurrencyListAll = res;

        // if ( this.first && !this.record.transaction_currency_id) {
        // const defaultCurrency = this.CurrencyList.find((currency) => currency.currency_short_code === 'INR');
        this.formGroup.get('transaction_currency_id').patchValue(this.CurrencyList.find(x => x.currency_short_code.includes("INR")).id);
        // this.first = false
        // }

      }
    })

    this.formGroup.get('currencyfilter').valueChanges.subscribe(data => {
      if (data.trim() == '') {
        this.CurrencyList = this.CurrencyListAll
      }
      else {
        this.CurrencyList = this.CurrencyListAll.filter(x => x.currency_short_code.toLowerCase().includes(data.toLowerCase()));
      }
    })

    this.formGroup.get('cityfilter').valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.cityService.getCityCombo(value);
      })
    ).subscribe({
      next: data => {
        this.cityList = data;

        if (!this.record.city_id) {
          this.formGroup.get("city_id").patchValue(data[0].id);
          this.first = false;
        }


      }
    });

    // this.formGroup.get('mobileCodefilter').valueChanges.pipe(
    //   filter(search => !!search),
    //   startWith(''),
    //   debounceTime(400),
    //   distinctUntilChanged(),
    //   switchMap((value: any) => {
    //     return this.cityService.getMobileCodeCombo(value);
    //   })
    // ).subscribe(data => this.MobileCodeList.next(data));

    this.cityService.getMobileCodeCombo().subscribe((res: any) => {
      this.MobileCodeList.next(res);
      this.mobilecodelist = res;
      if (!this.record.id) {
        this.formGroup.get('mobile_code').setValue('91');
      }
    });

    if (this.record.id) {
      this.formGroup.patchValue(this.record)
      this.readonly = this.data.readonly;
      if (this.readonly) {

        this.fieldList = [
          { name: 'Compnay Name', value: this.record.company_name },
          { name: 'E-Mail Address', value: this.record.email_address },
          { name: 'Priority', value: this.record.priority },
          { name: 'Services', value: this.record.api_for },
          { name: 'Mobile Number', value: this.record.mobile_code + ' ' + this.record.mobile_number },
          { name: 'City', value: this.record.city_name },
          { name: 'Base Currency', value: this.record.currency },
          { name: 'Profile Name', value: this.record.profile_name },
          { name: 'Is Block', value: this.record.is_block ? 'Yes' : 'No' },
          { name: 'Block Date', value: this.record.block_date_time ? DateTime.fromISO(this.record.block_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
          { name: 'Block Reason', value: this.record.block_reason },
          { name: 'Unblock Date', value: this.record.unblock_date_time ? DateTime.fromISO(this.record.unblock_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
          { name: 'Is KYC Completed', value: this.record.is_kyc_completed ? 'Yes' : 'No' },
          { name: 'KYC Complete Date', value: this.record.kyc_complete_date ? DateTime.fromISO(this.record.kyc_complete_date).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
        ]

        // this.formGroup.get('transaction_currency_id').patchValue(this.record.currency_short_code)
        // this.formGroup.get('city_id').patchValue(this.record.city_name)
        // this.formGroup.get('kyc_profile_id').patchValue(this.record.profile_name)
      } else {
        this.formGroup.get('cityfilter').patchValue(this.record.city_name)
      }
      var modes = this.record.api_for.replaceAll(" ", "").split(',');
      modes.forEach(element => {
        element = element.toString().trim();
      });
      this.api_for.patchValue(modes)
      this.title = this.readonly ? ("Supplier - " + this.record.company_name) : 'Modify Supplier';
      this.btnLabel = this.readonly ? "Close" : 'Save';
    }
  }

  filterMobileCode(value: string) {
    const Filter = this.mobilecodelist.filter(x =>
      (x.country_code.toLowerCase().includes(value.toLowerCase()) || x.mobile_code.toLowerCase().includes(value.toLowerCase()))
    );
    this.MobileCodeList.next(Filter);
  }

  isValidEmail(email: string): boolean {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  submit(): void {
    if (!this.formGroup.valid) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }

    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    json['api_for'] = this.selectedList.join(',');

    this.supplierService.create(json).subscribe({
      next: () => {
        this.matDialogRef.close(true);
        this.disableBtn = false;
        this.alertService.showToast('success', "Supplier has been Created!", "top-right", true);
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



