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
import { imgExtantions } from 'app/common/const';
import { AgentService } from 'app/services/agent.service';
import { BankService } from 'app/services/bank.service';
import { CurrencyRoeService } from 'app/services/currency-roe.service';
import { ToasterService } from 'app/services/toaster.service';
import { CommonUtils, DocValidationDTO } from 'app/utils/commonutils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-bank-entry',
  templateUrl: './bank-entry.component.html',
  styleUrls: ['./bank-entry.component.scss'],
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
export class BankEntryComponent {

  agentList: any[] = [];
  CurrencyList: any[] = [];
  CurrencyListTemp: any[] = [];
  record: any = {};
  disableBtn: boolean = false;
  readonly: boolean = false;
  records: any = {};
  fieldList: {};
  document_proof: string | null = null;




  constructor(
    public matDialogRef: MatDialogRef<BankEntryComponent>,
    private builder: FormBuilder,
    private bankService: BankService,
    private agentService: AgentService,
    private currencyRoeService: CurrencyRoeService,
    public alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {};
  }

  formGroup: FormGroup;
  title = 'Create Bank';
  btnLabel = 'Create';

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      bank_name: [''],
      account_number: [''],
      branch_name: [''],
      account_holder_name: [''],
      pan_card_number: [''],
      account_currency_id: [''],
      ifsc_code: [''],
      micr_code: [''],
      master_for: ['Agent'],
      master_id: [''],
      agentfilter: [''],
      currencyfilter: [''],
      document_proof: [''],
    });

    this.formGroup
      .get('agentfilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((value: any) => {
          return this.agentService.getAgentCombo(value);
        })
      )
      .subscribe({
        next: data => {
          this.agentList = data
          this.formGroup.get("master_id").patchValue(this.agentList[0].id);
        }
      });

    this.currencyRoeService.getcurrencyCombo().subscribe({
      next: res => {
        this.CurrencyList = res;
        this.CurrencyListTemp = res;
        this.formGroup.get('account_currency_id').patchValue(this.CurrencyList.find(x => x.currency_short_code.includes("INR")).id)
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
      this.bankService.getBankRecord(this.record.id).subscribe({
        next: (data) => {
          this.records = data;

          this.formGroup.get("agentfilter").patchValue(data.particular_name);
          this.formGroup.get("master_id").patchValue(data.master_id);

          this.readonly = this.data.readonly;
          if (this.readonly) {
            this.fieldList = [
              { name: 'Particular Name', value: data.particular_name },
              { name: 'Bank Name', value: data.bank_name },
              {
                name: 'Account Holder Name', value: data.account_holder_name,
              },
              { name: 'Branch Name', value: data.branch_name },
              {
                name: 'Account Number', value: data.account_number,
              },
              { name: 'PAN Card Number', value: data.pan_card_number },
              {
                name: 'IFSC Code', value: data.ifsc_code,
              },
              {
                name: 'MICR Code', value: data.micr_code,
              },
              {
                name: 'Account Currency', value: data.account_currency,
              },
              { name: 'Is Audited', value: data.is_audited ? 'Yes' : 'No' },
              { name: 'Audit Date', value: data.audit_date_time },
            ];
          }
          this.formGroup.patchValue(data);
          this.document_proof = data.document_proof;
          this.title = this.readonly
            ? 'Bank - ' + this.record.bank_name
            : 'Modify Bank';
          this.btnLabel = this.readonly ? 'Close' : 'Save';
        },
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

  submit(): void {

    if(!this.formGroup.valid){
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
  }

    this.disableBtn = true;
    const json = this.formGroup.getRawValue();

    if (typeof json.document_proof === 'string') {
      json.document_proof = {
        fileName: '',
        fileType: '',
        base64: '',
      };
    }

    this.bankService.create(json).subscribe({
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
