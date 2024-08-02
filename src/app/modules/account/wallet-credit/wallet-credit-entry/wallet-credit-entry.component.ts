import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { PspSettingService } from 'app/services/psp-setting.service';
import { ToasterService } from 'app/services/toaster.service';
import { WalletService } from 'app/services/wallet-credit.service';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-wallet-credit-entry',
  templateUrl: './wallet-credit-entry.component.html',
  styleUrls: ['./wallet-credit-entry.component.scss'],
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
export class WalletCreditEntryComponent {

  readonly: boolean = false;
  record: any = {};
  fieldList: {};
  disableBtn: boolean = false;


  agentList: any[] = [];
  formGroup: FormGroup;
  title = "Wallet Credit"
  btnLabel = "Create"
  createEntry: boolean = false;


  policyType: any[] = [
    { value: 'One Time', viewValue: 'One Time' },
    { value: 'Fix Week Day', viewValue: 'Fix Week Day' },
    { value: 'Fix Date', viewValue: 'Fix Date' },
  ];

  weekDay: any[] = [
    { value: 'Monday', viewValue: 'Monday' },
    { value: 'Tuesday', viewValue: 'Tuesday' },
    { value: 'Wednesday', viewValue: 'Wednesday' },
    { value: 'Thursday', viewValue: 'Thursday' },
    { value: 'Friday', viewValue: 'Friday' },
    { value: 'Saturday', viewValue: 'Saturday' },
    { value: 'Sunday', viewValue: 'Sunday' },
  ];
  currency: any;


  constructor(
    public matDialogRef: MatDialogRef<WalletCreditEntryComponent>,
    public formBuilder: FormBuilder,
    private pspsettingService: PspSettingService,
    public walletService: WalletService,
    public router: Router,
    public route: ActivatedRoute,
    public alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
    if(this.data?.send)
    this.createEntry = (this.data.send == 'create')

  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      id: [''],
      master_agent_id: [''],
      agentfilter: [''],
      // sub_agent_id: [''],
      // fix_week_Day: [''],
      // fix_Day: [''],
      credit_balance: [''],
      expiry_date: new Date(),
      remark: [''],
      payment_cycle_policy_type: [''],
      payment_cycle_policy: [''],
      is_enable: [true],
    });

    this.formGroup.get('payment_cycle_policy_type').patchValue('One Time')

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
          // this.formGroup.get("master_agent_id").patchValue(this.agentList[0]);
          this.currency = this.agentList[0]?.base_currency;
        }
      });

    if (this.record.id) {
      // this.readonly = readonly ? true : false;
      // this.btnTitle = readonly ? 'Close' : 'Save';
      this.walletService.getWalletCreditRecord(this.record.id).subscribe({
        next: (data) => {
          this.readonly = this.data.readonly;
          this.formGroup.patchValue(data);

          if (this.readonly) {
            this.fieldList = [
              { name: 'Agent', value: data.master_agent_name, },
              { name: 'Credit Balance', value: data.credit_balance, },
              { name: 'Payment Cycle Policy Type', value: data.payment_cycle_policy_type, },
              { name: 'Payment Cycle Policy', value: data.payment_cycle_policy, },
              { name: 'Outstanding On Due Date', value: data.outstanding_on_due_date, },
              { name: 'Over Due Count', value: data.over_due_count, },
              { name: 'Expiry Date', value: data.expiry_date ? DateTime.fromISO(data.expiry_date).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
              { name: 'IP Address', value: data.ip_address, },
              { name: 'Entry By', value: data.entry_by, },
              { name: 'Entry Date', value: data.entry_date_time ? DateTime.fromISO(data.entry_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
              { name: 'Remark', value: data.remark, },
              { name: 'Is Enable', value: data.is_enable ? 'Yes' : 'No', },
            ];
          }
          this.title = this.readonly ? ("Wallet Credit - " + this.record.master_agent_name) : 'Change Expiry';
          this.btnLabel = this.readonly ? "Close" : 'Save';
        },
        error: (err) => {
          this.alertService.showToast('error',err,'top-right',true);
          this.disableBtn = false;
        },
      });
    }
  }

  navigationChanged(data){
    this.currency = data.base_currency
  }

  changeValue(data:any){
    this.formGroup.get('payment_cycle_policy').patchValue('')
    if(data == 'Fix Week Day' || data == 'Fix Date'){
      var date = new Date(this.formGroup.get('expiry_date').value)
      date.setFullYear(new Date().getFullYear() + 1)
      this.formGroup.get('expiry_date').patchValue(date)
    }else{
      this.formGroup.get('expiry_date').patchValue(new Date())
    }

  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

  submit(): void {
    if (!this.formGroup.valid) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }
    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    json['master_agent_id'] = json.master_agent_id.id || '';
    json['expiry_date'] =  DateTime.fromJSDate(new Date(this.formGroup.get('expiry_date').value)).toFormat('yyyy-MM-dd')


    this.walletService.create(json).subscribe({
      next: () => {
          this.disableBtn = false;
          this.matDialogRef.close(true);
          if (json.id) {
              this.alertService.showToast('success', 'Record modified', 'top-right', true);
          }
          else {
              this.alertService.showToast('success', 'New record added', 'top-right', true);
          }
      },
      error: (err) => {
          this.alertService.showToast('error',err,'top-right',true);
          this.disableBtn = false;
      },
  });

  }

}
