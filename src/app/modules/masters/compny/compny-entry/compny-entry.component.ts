import { LiveAnnouncer } from '@angular/cdk/a11y';
import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { imgExtantions } from 'app/common/const';
import { CompnyService } from 'app/services/compny.service';
import { CurrencyRoeService } from 'app/services/currency-roe.service';
import { ToasterService } from 'app/services/toaster.service';
import { CommonUtils, DocValidationDTO } from 'app/utils/commonutils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { WhitelabelEntryComponent } from '../../whitelabel/whitelabel-entry/whitelabel-entry.component';

@Component({
  selector: 'app-compny-entry',
  templateUrl: './compny-entry.component.html',
  styleUrls: ['./compny-entry.component.scss'],
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
    MatDatepickerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatMenuModule,
    NgxMatSelectSearchModule,
    NgxMatTimepickerModule,
  ],
})
export class CompnyEntryComponent {

  disableBtn: boolean = false;
  readonly: boolean = false;
  record: any = {};
  logo_1: string | null = null;
  logo_2: string | null = null;
  logo_3: string | null = null;
  first: boolean = true
  cityList: any[] = [];
  fieldList: {};
  records: any = {};
  logo1: any;


  constructor(
    public matDialogRef: MatDialogRef<WhitelabelEntryComponent>,
    private builder: FormBuilder,
    private compnyService: CompnyService,
    public alertService: ToasterService,
    public currencyRoeService: CurrencyRoeService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {};
  }

  formGroup: FormGroup;
  title = 'Create Company';
  btnLabel = 'Create';

  keywords = [];
  CurrencyList: any[] = [];
  base_currency_id: any;
  CurrencyListAll: any[] = [];
  CurrencyListTemp: any[] = [];




  announcer = inject(LiveAnnouncer);

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      company_name: [''],
      city_id: [''],
      address: [''],
      pin_code: [''],
      contact_no: [''],
      contact_email: ['', Validators.email],
      gst_vat_no: [''],
      website_url: ['', Validators.required],
      logo_1: [''],
      logo_2: [''],
      logo_3: [''],
      cityfilter: [''],

      gst_number: [''],
      base_currency_id: [''],
      currencyfilter: [''],
    });

    this.formGroup.get('cityfilter').valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.compnyService.getCityCombo(value);
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

    this.currencyRoeService.getcurrencyCombo().subscribe({
      next: res => {
        this.CurrencyList = res;
        this.CurrencyListTemp = res
        this.formGroup.get('base_currency_id').patchValue(this.CurrencyList.find(x => x.currency_short_code.includes("INR")).id)
      }
    })

    this.formGroup.get('currencyfilter').valueChanges.subscribe(data => {
      if(data.trim() == ''){
        this.CurrencyList = this.CurrencyListTemp
      }
      else{
      this.CurrencyList = this.CurrencyListTemp.filter(x => x.currency_short_code.toLowerCase().includes(data.toLowerCase()));
      }
    })


    /*****Record*****/
    if (this.record.id) {
      this.compnyService.getCompanyRecord(this.record.id).subscribe({
        next: (data) => {
          this.records = data;
          this.formGroup.get("cityfilter").patchValue(data.city_name);
          this.formGroup.get("city_id").patchValue(data.city_id);


          this.readonly = this.data.readonly;
          if (this.readonly) {
            this.fieldList = [
              {
                name: 'Company Name',
                value: data.company_name
              },
              {
                name: 'City Name',
                value: data.city_name,
              },
              {
                name: 'Address',
                value: data.address
              },
              {
                name: 'Pincode',
                value: data.pin_code,
              },
              {
                name: 'Contact No',
                value: data.contact_no
              },
              {
                name: 'Contact Email',
                value: data.contact_email,
              },
              {
                name: 'Website URL',
                value: data.website_url,
              },
              {
                name: 'GST vat No',
                value: data.gst_vat_no,
              },
              { name: 'Logo size 1', value: data.logo_1 },
              { name: 'Logo size 2', value: data.logo_2 },
              { name: 'Logo size 3', value: data.logo_3 },
            ];
          }
          this.formGroup.patchValue(data);
          this.logo_1 = data.logo_1;
          this.logo_2 = data.logo_2;
          this.logo_3 = data.logo_3;
          this.title = this.readonly
            ? 'Company - ' + this.record.company_name
            : 'Modify Company';
          this.btnLabel = this.readonly ? 'Close' : 'Save';
        },error: (err) => {this.alertService.showToast('error',err,'top-right',true)}
      });
    }



  }

  public onProfileInput(event: any, logoSize: string): void {
    const file = (event.target as HTMLInputElement).files[0];

    const extantion: string[] = CommonUtils.valuesArray(imgExtantions);
    var validator: DocValidationDTO = CommonUtils.isDocValid(file, extantion, null, 2);
    if (!validator.valid) {
      this.alertService.showToast('error', validator.alertMessage);
      (event.target as HTMLInputElement).value = '';
      return;
    }
    CommonUtils.getJsonFile(file, (reader, jFile) => {
      this[logoSize] = reader.result;
      this.formGroup.get(logoSize).patchValue(jFile);
    });

    //   if (file) {
    //     if (file.size <= 2 * 1024 * 1024) {
    //         const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
    //         const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

    //         if (allowedExtensions.includes(fileExtension)) {
    //             CommonUtils.getJsonFile(file, (reader, jFile) => {
    //                 this[logoSize] = reader.result;
    //                 this.formGroup.get(logoSize).patchValue(jFile);
    //             });

    //             this.formGroup.get(logoSize).updateValueAndValidity();
    //         } else {
    //             this.alertService.showToast(
    //                 'error',
    //                 'Please be advised that only files in the formats of JPG, JPEG, PNG, SVG, and GIF are compatible',
    //                 'top-right',
    //                 true
    //             );
    //             (event.target as HTMLInputElement).value = '';
    //         }
    //     } else {
    //         this.alertService.showToast(
    //             'error',
    //             'The system currently restricts the upload of photos exceeding 2 MB in size. Please ensure that your file adheres to this limit for successful submission',
    //             'top-right',
    //             true
    //         );
    //         (event.target as HTMLInputElement).value = '';
    //     }
    // }



  }

  public onFileClick(logoSize: string): void {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.accept = 'image/*';
    inputElement.addEventListener('change', (event) =>
      this.onProfileInput(event, logoSize)
    );
    inputElement.click();
  }

  public removePhoto(logoSize: string): void {
    this.formGroup.get(logoSize).patchValue(null);
    this[logoSize] = null;
  }

  isValidEmail(email: string): boolean {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  submit(): void {
    if(!this.formGroup.valid){
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
  }

    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    if (typeof json.logo_1 === 'string') {
      json.logo_1 = {
        fileName: '',
        fileType: '',
        base64: '',
      };
    }
    if (typeof json.logo_2 === 'string') {
      json.logo_2 = {
        fileName: '',
        fileType: '',
        base64: '',
      };
    }
    if (typeof json.logo_3 === 'string') {
      json.logo_3 = {
        fileName: '',
        fileType: '',
        base64: '',
      };
    }

    this.compnyService.create(json).subscribe({
      next: () => {
        this.matDialogRef.close(true);
        this.disableBtn = false;
      },
      error: (err) => {
        this.disableBtn = false;
        this.alertService.showToast('error', err, 'top-right', true);
      },
    });
  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }


}
