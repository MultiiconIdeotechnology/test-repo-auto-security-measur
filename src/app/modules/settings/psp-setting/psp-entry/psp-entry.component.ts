import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PspSettingService } from 'app/services/psp-setting.service';
import { ToasterService } from 'app/services/toaster.service';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { J } from '@angular/cdk/keycodes';


@Component({
  selector: 'app-psp-entry',
  templateUrl: './psp-entry.component.html',
  styleUrls: ['./psp-entry.component.scss'],
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
    MatSnackBarModule,
  ],
})
export class PspEntryComponent {

  disableBtn: boolean = false
  readonly: boolean = false;
  record: any = {};
  fieldList: {};
  listData: any
  toppingList: any[] = [];
  providerList: any[] = [];
  payment_modes = new FormControl([]);
  selectedList: any[] = []
  agentList: any[] = [];
  compnyList: any[] = [];


  pspList: any[] = [
    { value: 'Company', viewValue: 'Company' },
    { value: 'Agent', viewValue: 'Agent' },
  ];


  constructor(
    public matDialogRef: MatDialogRef<PspEntryComponent>,
    private builder: FormBuilder,
    public alertService: ToasterService,
    private pspsettingService: PspSettingService,
    private clipboard: Clipboard,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
  }

  formGroup: FormGroup;
  title = "Create PSP"
  btnLabel = "Create"
  keywords = [];

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      provider: [''],
      psp_for: [''],
      psp_for_id: [''],
      psp_for_agent_id: [''],
      psp_for_company_id: [''],
      agentfilter: [''],
      companyfilter: [''],

      merchant_code: [''],
      panel_url: [''],
      panel_user_id: [''],
      panel_password: [''],
      uat_api_base_url: [''],
      live_api_base_url: [''],
      retrun_url: [''],
      refund_url: [''],
      key: [''],
      secret_code: [''],
      salt: [''],
      schema_code: [''],
      // payment_modes: [[]],
      is_auto_surcharge: [false],
      is_live: [false]


    });

    this.formGroup.get('psp_for').patchValue('Compnay')

    /*************Payment Gateway combo**************/
    this.pspsettingService.getPaymentGatewayTypes({}).subscribe({
      next: (data) => {
        this.providerList = data
        this.formGroup.get("provider").patchValue(this.providerList[0]);
      }
    })

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
          this.formGroup.get("psp_for_agent_id").patchValue(this.agentList[0].id);
        }
      });

      /*************Company combo**************/
    this.formGroup
    .get('companyfilter')
    .valueChanges.pipe(
      filter((search) => !!search),
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.pspsettingService.getCompanyCombo(value);
      })
    )
    .subscribe({
      next: data => {
        this.compnyList = data
        this.formGroup.get("psp_for_company_id").patchValue(this.compnyList[0].company_id);
      }
    });


    this.pspsettingService.getPaymentModes({ type: '' }).subscribe({
      next: (data) => {
        this.toppingList = data
      }
    })

    this.payment_modes.valueChanges.subscribe((selectedValues: any) => {
      this.selectedList = selectedValues
    });


    if (this.record.id) {
      // this.formGroup.patchValue(this.record)
      this.pspsettingService.getPaymentGatewayRecord(this.record.id).subscribe({
        next: (data) => {
          this.readonly = this.data.readonly;
          if (this.readonly) {
            this.fieldList = [
              { name: 'Provider', value: data.provider },
              { name: 'PSP For', value: data.psp_for },
              { name: 'PSP For Name', value: data.psp_for_name },
              { name: 'Merchant Code', value: data.merchant_code },
              { name: 'Panel URL', value: data.panel_url },
              { name: 'Panel User Id', value: data.panel_user_id },
              { name: 'Panel Password', value: data.panel_password },
              { name: 'UAT Api Base URL', value: data.uat_api_base_url },
              { name: 'Live Api Base URL', value: data.live_api_base_url },
              { name: 'Retrun URL', value: data.retrun_url },
              { name: 'Refund URL', value: data.refund_url },
              { name: 'Key', value: data.key_name },
              { name: 'Secret Code', value: data.secret_code },
              { name: 'Salt', value: data.salt },
              { name: 'Schema Code', value: data.schema_code },
              { name: 'Is Auto Search', value: data.is_auto_surcharge ? 'Yes' : 'No' },
              { name: 'Is Active', value: data.is_active ? 'Yes' : 'No' },
              { name: 'Is Default', value: data.is_default ? 'Yes' : 'No' },
              { name: 'Is Live', value: data.is_live ? 'Yes' : 'No' },

            ]
          }
          this.formGroup.patchValue(this.record);
          this.formGroup.get('agentfilter').patchValue(this.record.psp_for_name);

          var modes = data.payment_modes.split(',');
          this.payment_modes.patchValue(modes)
          // this.formGroup.get('cityfilter').patchValue(this.record.city_name);
          this.title = this.readonly ? 'Info PSP' : 'Modify PSP';
          this.btnLabel = this.readonly ? 'Close' : 'Save';
        },
        error: (err) => {
          this.alertService.showToast('error', err)
        },

      });
    }



  }

  copyLink(link: string): void {
    this.clipboard.copy(link);
    this.alertService.showToast('success', 'Copied');
  }

  submit(): void {
    if (!this.formGroup.valid) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }
    this.disableBtn = true;
    const json = this.formGroup.getRawValue();

    if (json.psp_for == 'Company') {
      json['psp_for_agent_id'] = ''
    }

    if (json.psp_for == 'Agent') {
      json['psp_for_company_id'] = ''
    }

    json['psp_for_id'] = json.psp_for == 'Company' ? json.psp_for_company_id : json.psp_for_agent_id
    json['payment_modes'] = this.selectedList.join(',');

    this.pspsettingService.create(json).subscribe({
      next: () => {
        this.matDialogRef.close(true);
        this.disableBtn = false;
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
