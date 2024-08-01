import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import { CurrencyRoeService } from 'app/services/currency-roe.service';
import { KycDashboardService } from 'app/services/kyc-dashboard.service';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { ToasterService } from 'app/services/toaster.service';
import { VisaService } from 'app/services/visa.service';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import {
    filter,
    startWith,
    debounceTime,
    distinctUntilChanged,
    switchMap,
} from 'rxjs';

@Component({
    selector: 'app-visa-charges',
    templateUrl: './visa-charges.component.html',
    styleUrls: ['./visa-charges.component.scss'],
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
        NgxMatTimepickerModule,
        NgxMatSelectSearchModule,
        MatMenuModule
    ],
})
export class VisaChargesComponent {
    record: any = {};
    SupplierList: any[] = [];
    CurrencyList: any[] = [];
    tempCurrencyList: any[] = [];
    recordList: any[] =[];

    constructor(
        public matDialogRef: MatDialogRef<VisaChargesComponent>,
        private builder: FormBuilder,
        private visaService: VisaService,
        private kycDocumentService: KycDocumentService,
        public currencyRoeService: CurrencyRoeService,
        public alertService: ToasterService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        this.record = data?.data ?? {};
    }

    formGroup: FormGroup;

    ngOnInit(): void {
        this.formGroup = this.builder.group({
            id: [''],
            visa_master_id: [''],
            supplier_id: [''],
            currency_id: [''],
            start_date: [''],
            end_date: [''],
            adult_price: [''],
            child_price: [''],
            infant_price: [''],
            supplierfilter: [''],
            currencyfilter: [''],
        });

        this.formGroup
            .get('supplierfilter')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(400),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    return this.kycDocumentService.getSupplierCombo(
                        value,
                        'Visa'
                    );
                })
            )
            .subscribe((data) => {
                this.SupplierList = data;
                this.formGroup
                    .get('supplier_id')
                    .patchValue(this.SupplierList[0]);
            });

        this.currencyRoeService.getcurrencyCombo().subscribe({
            next: (res) => {
                this.CurrencyList = res;
                this.tempCurrencyList = res;
                this.formGroup
                    .get('currency_id')
                    .patchValue(
                        this.CurrencyList.find((x) =>
                            x.currency_short_code.includes('INR')
                        )
                    );
            },
        });

        this.formGroup.get('currencyfilter').valueChanges.subscribe((data) => {
            this.CurrencyList = this.tempCurrencyList.filter((x) =>
                x.currency_short_code.toLowerCase().includes(data.toLowerCase())
            );
        });

        this.visaService.getVisaChargesList(this.record.id).subscribe({
            next: (res) => {
                this.recordList = res
            }, error: err => this.alertService.showToast('error', err)
          })
    }

    edit(data): void {
        this.formGroup.patchValue(data);
        this.formGroup.get('currencyfilter').patchValue(data.currency);
        this.formGroup.get('currency_id').patchValue({id: data.currency_id,currency_short_code: data.currency});
        this.formGroup.get('supplierfilter').patchValue(data.supplier);
        this.formGroup.get('supplier_id').patchValue({id: data.supplier_id, company_name:data.supplier});
      }
    
      delete(data): void {
        this.visaService.deleteCharges(data.id).subscribe({
          next: () => {
            const index = this.recordList.indexOf(this.recordList.find(x => x.id == data.id))
            this.recordList.splice(index, 1);
            if (!this.recordList.some(x => x.id === this.formGroup.get('id').value) && this.formGroup.get('id').value)
              this.formGroup.reset();
          }, error: err => this.alertService.showToast('error', err)

        })
      }

    add() {
        const json = this.formGroup.getRawValue();
        json['visa_master_id']= this.record.id
        json.supplier= json.supplier_id.company_name 
        json.supplier_id= json.supplier_id.id 
        json.currency= json.currency_id.currency_short_code 
        json.currency_id= json.currency_id.id 
        json['start_date']= DateTime.fromISO(this.formGroup.get('start_date').value).toFormat('yyyy-MM-dd')
        json['end_date']= DateTime.fromISO(this.formGroup.get('end_date').value).toFormat('yyyy-MM-dd')

        this.visaService.createCharges(json).subscribe({
            next: (res) => {
                // this.recordList = res;  
                if (json.id) {
                    const record = this.recordList.find(x => x.id == res.id);
                    Object.assign(record, json);
                    
                    json['currency'] = this.CurrencyList.find((x) => x.id.includes(json.currency_id)).currency_short_code;
                    
                  } else {
                    json.id = res.id;
                    this.recordList.push(json);
                  }
                  document.getElementById('focus').focus();
                  this.formGroup.reset();
            },
            error: (err) => this.alertService.showToast('error', err),
        });
      this.formGroup.reset();

    }

    public compareWith(v1: any, v2: any) {
        return v1 && v2 && v1.id === v2.id;
    }
}
