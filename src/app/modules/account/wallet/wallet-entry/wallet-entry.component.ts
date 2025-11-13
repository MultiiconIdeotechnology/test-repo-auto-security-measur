import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { JsonFile } from 'app/common/jsonFile';
import { AgentService } from 'app/services/agent.service';
import { CurrencyRoeService } from 'app/services/currency-roe.service';
import { PspSettingService } from 'app/services/psp-setting.service';
import { ToasterService } from 'app/services/toaster.service';
import { WalletService } from 'app/services/wallet.service';
import { DocValidationDTO, CommonUtils } from 'app/utils/commonutils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-wallet-entry',
  templateUrl: './wallet-entry.component.html',
  styleUrls: ['./wallet-entry.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    NgxMatSelectSearchModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatMenuModule,
    NgxMatTimepickerModule,
    RouterOutlet,
    MatOptionModule,
    MatDividerModule
  ]
})
export class WalletEntryComponent {

  disableBtn: boolean = false;
  agentList: any[] = [];
  CurrencyList: any[] = [];
  CurrencyListTemp: any[] = [];
  mopList: any[] = ['NEFT', 'RTGS', 'IMPS', 'UPI', 'CASH', 'Digital Payment'];
  selectedFile: File;

  jFile: JsonFile;

  constructor(
    public matDialogRef: MatDialogRef<WalletEntryComponent>,
    private builder: FormBuilder,
    private pspsettingService: PspSettingService,
    private agentService: AgentService,
    private walletService: WalletService,
    private currencyRoeService: CurrencyRoeService,
    public alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    // this.record = data?.data ?? {};
  }

  formGroup: FormGroup;
  title = 'Wallet Recharge';
  btnLabel = 'Top-up';


  ngOnInit(): void {
    this.formGroup = this.builder.group({
      recharge_for_id: [''],
      agentfilter: [''],
      currency_id: [''],
      currencyfilter: [''],
      recharge_amount: ['0', Validators.min(0)],
      settled_amount: ['0'],
      mop: [''],
      user_remark: [''],
      transaction_number: [''],
      request_from: ['Web'],
    });

    this.formGroup.get('mop').patchValue('NEFT')

    /*************Agent combo**************/
    this.formGroup
      .get('agentfilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((value: any) => {
          return this.pspsettingService.getAgentCombo(value, true);
        })
      )
      .subscribe({
        next: data => {
          this.agentList = data
          this.formGroup.get("recharge_for_id").patchValue(this.agentList[0]?.id || '');
        }
      });

    /*************Currency combo**************/
    this.currencyRoeService.getcurrencyCombo().subscribe({
      next: res => {
        this.CurrencyList = res;
        this.CurrencyListTemp = res;
        this.formGroup.get('currency_id').patchValue(this.CurrencyList.find(x => x.currency_short_code.includes("INR")).id)
      }
    })

    this.formGroup.get('currencyfilter').valueChanges.subscribe(data => {
      if (data.trim() == '') {
        this.CurrencyList = this.CurrencyListTemp
      }
      else {
        this.CurrencyList = this.CurrencyListTemp.filter(x => x.currency_short_code.toLowerCase().includes(data.toLowerCase()));
      }
    })

  }

  onFileSelected(event: any) {

    const file = (event.target as HTMLInputElement).files[0];

    const extantion: string[] = ["pdf", "jpg", "jpeg", "png", "webp"];
    var validator: DocValidationDTO = CommonUtils.isDocValid(file, extantion, 2024, null);
    if (!validator.valid) {
      this.alertService.showToast('error', validator.alertMessage, 'top-right', true);
      (event.target as HTMLInputElement).value = '';
      return;
    }
    this.selectedFile = event.target.files[0];

    CommonUtils.getJsonFile(file, (reader, jFile) => {
      this.jFile = jFile;
    });

    this.alertService.showToast('success', 'Attached file successfully');
    (event.target as HTMLInputElement).value = '';
  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

  submit() {
    if (this.formGroup.get('recharge_amount').value < 0) {
      this.alertService.showToast('error', 'Please enter positive number.', 'top-right', true);
      return;
    }
    if (!this.formGroup.valid) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }

    this.disableBtn = true;
    const json = this.formGroup.getRawValue();

      json.file = this.jFile? this.jFile : '' 

        this.walletService.offlineRecharge(json).subscribe({
          next: () => {
            this.disableBtn = false;
            this.matDialogRef.close(true);
            this.alertService.showToast('success', 'Top-up wallet request added!', 'top-right', true);
          },
          error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);
            this.disableBtn = false;
          },
        });

  }

}
