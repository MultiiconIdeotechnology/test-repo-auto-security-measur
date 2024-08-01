import { DateTime } from 'luxon';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, NgClass, DatePipe, AsyncPipe, NgFor } from '@angular/common';
import { ToasterService } from 'app/services/toaster.service';
import { AgentService } from 'app/services/agent.service';
import { InstallmentService } from 'app/services/installment.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-installment-entry',
  templateUrl: './installment-entry.component.html',
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
export class InstallmentEntryComponent {
  disableBtn: boolean = false;
  record: any = {};
  isPayment: boolean = false;

  constructor(
    public matDialogRef: MatDialogRef<InstallmentEntryComponent>,
    private builder: FormBuilder,
    private installmentService: InstallmentService,
    public agentService: AgentService,
    public alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {};
  }

  formGroup: FormGroup;
  title = 'Create Installment';
  btnLabel = 'Create';

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      wl_id: [''],
      agent_id: [''],
      installment_date: [DateTime.now()],
      installment_amount: [1, Validators.min(1)],
      installment_due_date: [''],
      installment_remark: [''],
      payment_date: [DateTime.now()],
      payment_amount: [1, Validators.min(1)],
      payment_remark: [''],
    });
    this.isPayment = this.data.isPayment;
    if (this.isPayment) {
      this.title = 'Payment';
    }
    if (this.data.id) {
      this.installmentService.getWlPaymentPolicyRecord({ id: this.data.id }).subscribe({
        next: (res: any) => {
          this.formGroup.patchValue(res);
        },
        error: (err) => {
          this.disableBtn = false;
          this.alertService.showToast('error', err, "top-right", true);
        },
      });
    }
  }

  submit(): void {
    if(!this.formGroup.valid){
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
}

    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    var model: any = {};
    if (!this.isPayment) {
      if (!this.formGroup.get('id').value)
        model = {
          id: this.data.id, wl_id: this.data.data.id, agent_id: this.data.data.agent_id, installment_amount: json.installment_amount, installment_date: DateTime.fromJSDate(new Date(json.installment_date)).toFormat('yyyy-MM-dd'),
          installment_due_date: DateTime.fromJSDate(new Date(json.installment_due_date)).toFormat('yyyy-MM-dd'), installment_remark: json.installment_remark,
        }
      if (this.formGroup.get('id').value) {
        model = {
          id: this.data.id, wl_id: this.data.data.id, agent_id: this.data.data.agent_id, installment_amount: json.installment_amount, installment_date: DateTime.fromJSDate(new Date(json.installment_date)).toFormat('yyyy-MM-dd'),
          installment_due_date: DateTime.fromJSDate(new Date(json.installment_due_date)).toFormat('yyyy-MM-dd'), installment_remark: json.installment_remark,
          payment_date: json.payment_date && json.payment_date != null ? DateTime.fromJSDate(new Date(json.payment_date)).toFormat('yyyy-MM-dd') : '',
          payment_amount: json.payment_amount, payment_remark: json.payment_remark,
        }
      }
    } else {
      model = {
        id: this.data.id, payment_date: DateTime.fromJSDate(new Date(json.payment_date)).toFormat('yyyy-MM-dd'),
        payment_amount: json.payment_amount, payment_remark: json.payment_remark,
        wl_id: this.data.data.id, agent_id: this.data.data.agent_id, installment_amount: json.installment_amount, installment_date: DateTime.fromJSDate(new Date(json.installment_date)).toFormat('yyyy-MM-dd'),
        installment_due_date: DateTime.fromJSDate(new Date(json.installment_due_date)).toFormat('yyyy-MM-dd'), installment_remark: json.installment_remark
      }
    }
    this.installmentService.create(model).subscribe({
      next: () => {
        this.matDialogRef.close(true);
        this.disableBtn = false;
      },
      error: (err) => {
        this.disableBtn = false;
        this.alertService.showToast('error', err, "top-right", true);
      },
    });
  }
}
