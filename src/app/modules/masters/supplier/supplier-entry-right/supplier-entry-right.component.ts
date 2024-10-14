import { Component, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { CityService } from 'app/services/city.service';
import { CurrencyService } from 'app/services/currency.service';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { SupplierService } from 'app/services/supplier.service';
import { ToasterService } from 'app/services/toaster.service';
import { MatSidenav } from '@angular/material/sidenav';
import { debounceTime, distinctUntilChanged, filter, ReplaySubject, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { EntityService } from 'app/services/entity.service';
import { MatDividerModule } from '@angular/material/divider';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { FuseConfig, FuseConfigService } from '@fuse/services/config';
import { KycService } from 'app/services/kyc.service';

@Component({
  selector: 'app-supplier-entry-right',
  standalone: true,
  styles: [
    `
        referral-settings {
            position: static;
            display: block;
            flex: none;
            width: auto;
        }
    `,
  ],
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
    MatDatepickerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatMenuModule,
    NgxMatSelectSearchModule,
    NgxMatTimepickerModule,
    FuseDrawerComponent,
    MatDividerModule,
  ],
  templateUrl: './supplier-entry-right.component.html',
  styleUrls: ['./supplier-entry-right.component.scss']
})
export class SupplierEntryRightComponent {

  formGroup: FormGroup;
  title = 'Supplier';
  btnLabel = 'Submit';
  disableBtn: boolean = false;
  config: FuseConfig;
  toppingList: string[] = ['Airline', 'BUS', 'Hotel', 'Holiday', 'Insurance', 'Visa'];

  CurrencyList: any[] = [];
  CurrencyListAll: any[] = [];
  mobilecodelist: any[] = [];
  cityList: any[] = [];
  MobileCodeList: ReplaySubject<any[]> = new ReplaySubject<any[]>();

  record: any;
  readonly: any;

  profileList: any[] = [];
  AllprofileList: any[] = [];

  create: boolean = false;
  edit: boolean = false;
  info: boolean = false;

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('settingsDrawer') public settingsDrawer: MatSidenav;
  infoData: any;

  constructor(
    private builder: FormBuilder,
    private supplierService: SupplierService,
    private cityService: CityService,
    private kycDocumentService: KycDocumentService,
    private currencyService: CurrencyService,
    private alertService: ToasterService,
    private entityService: EntityService,
    private kycService: KycService,
    private _fuseConfigService: FuseConfigService,

  ) {
    this.entityService.onsupplierEntityCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (item) => {
        console.log("item main record", item);
        this.settingsDrawer.toggle()
        this.create = item?.create;
        this.info = item?.info;
        if(this.info){
          this.infoData = item?.data;
          this.title = "Supplier Info"
          console.log("this.infoData", this.infoData);
        }


        this.formGroup.patchValue({
          id: "",
          company_name: "",
          email_address: "",
          mobile_code: "",
          mobile_number: "",
          city_id: "",
          pan_number: "",
          gst_number: "",
          priority: "",
          transaction_currency_id: "",
          kyc_profile_id: "",
          cityfilter: "",
          mobileCodefilter: "",
          currencyfilter: "",
          is_send: "",
          address: "",
          company_person_name: "",
        })

        if (this.create) {
          this.title = "Create Supplier"
        }

        this.getCityCombo();
        this.getCurrencyCombo();
        this.getKycCombo();

        this.edit = false;
        if (item?.edit) {
          this.create = false;
          this.edit = true;
          this.record = item?.data;
          console.log("this.record", this.record);
          this.readonly = item?.readonlys;
          this.title = "Edit Supplier"

          this.formGroup.patchValue(this.record)
          if (this.record?.id) {
            this.formGroup.get('cityfilter').patchValue(this.record?.city_name);
            this.formGroup.get('city_id').patchValue(this.record?.city_id);
          } 
        }
      }
    })
  }

  ngOnInit(): void {

    this._fuseConfigService.config$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((config: FuseConfig) => {
        this.config = config;
      });

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
      pan_number: [''],
      gst_number: [''],
      address: [''],
      company_person_name: [''],
      kycfilter: [''],
      kyc_profile_id: [''],
      is_send: [false],
    });

    this.formGroup.get('email_address').valueChanges.subscribe(text => {
      this.formGroup.get('email_address').patchValue(text.toLowerCase(), { emitEvent: false });
    })

   
  }

  getCurrencyCombo(){
    this.currencyService.getcurrencyCombo().subscribe({
      next: res => {
        this.CurrencyList = res;
        this.CurrencyListAll = res;
        this.formGroup.get('transaction_currency_id').patchValue(this.CurrencyList.find(x => x.currency_short_code.includes("INR")).id);
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
  }

  getKycCombo(){
    this, this.kycService.getkycprofileCombo("employee").subscribe(data => {
      this.profileList = data;
      this.AllprofileList = data;
      this.formGroup.get('kyc_profile_id').patchValue(this.profileList[0].id);
    })

    this.formGroup.get('kycfilter').valueChanges
    .subscribe(data => {
      this.profileList = this.AllprofileList.filter(x => x.profile_name.toLowerCase().includes(data.toLowerCase()));
    });
  }


  getCityCombo() {
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
        this.formGroup.get("city_id").patchValue(this.cityList[0].id);
      }
    });
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

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

  submit(): void {

  }

}
