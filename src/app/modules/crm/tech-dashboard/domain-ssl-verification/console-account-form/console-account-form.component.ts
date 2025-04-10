import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DomainVerificationService } from 'app/services/domain-verification.service';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-console-account-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatCheckboxModule,
  ],
  templateUrl: './console-account-form.component.html',
  styleUrls: ['./console-account-form.component.scss']
})
export class ConsoleAccountFormComponent {
  wlId:any;
  @Input() data:any;
  @Input() wlSettingData:any
  @Output() stepCompleted = new EventEmitter<number>();
  @Output() stepAllowed = new EventEmitter<number>();
  is_account_active:boolean = false;

  formGroup !:FormGroup

  constructor(
    private builder:FormBuilder,
    private domainVarifyService: DomainVerificationService,
    private alertService: ToasterService,
  ){

    this.domainVarifyService.createUpdateDomain$.subscribe((res: any) => {
      this.wlId = res?.wl_id
    })
    
  }

  ngOnInit():void {
    this.formGroup = this.builder.group({
      wl_id : [""],
      txn_id : ["", Validators.required],
      account_name : ["", Validators.required],
      account_id : ["", Validators.required],
      password : [""],
      product_id : [""]
    });

    if(this.data?.item_name?.toLowerCase().includes('ios')){
      this.formGroup.get('password').setValidators([Validators.required]);
      this.formGroup.get('password')?.patchValue(this.wlSettingData?.play_console_password)
    } else {
      this.formGroup.get('password')?.clearValidators();
    }

    this.formGroup.get('password')?.updateValueAndValidity();

    console.log("wl setting data in console account", this.wlSettingData)

    this.formGroup.patchValue({
      txn_id :this.wlSettingData?.txn_id,
      account_name :this.wlSettingData?.account_name,
      account_id :this.wlSettingData?.account_id,
      is_account_active :this.wlSettingData?.is_account_active,
    });

  }

  onConsoleFormVerify() {
    if(this.formGroup.invalid || !this.is_account_active){
      this.alertService.showToast('error', 'Fill up required field to proceed');
      this.formGroup.markAllAsTouched();
      return;
    }

    let payloadData = this.formGroup.value;
    payloadData.agent_id = this.data?.agentid;
    payloadData.product_id = this.data?.subid;
    payloadData.wl_id = this.wlId;
    payloadData.is_account_active = this.is_account_active;

    console.log("this.payloadData", payloadData);
    this.stepCompleted.emit(1);
return;
    this.domainVarifyService.androidIosConfig(payloadData).subscribe({
      next: (res) => {
        if (res) {
            this.alertService.showToast('success', 'Domain Created Successfully');
            this.stepCompleted.emit(1);
            this.stepAllowed.emit(2);
        }

      }, error: err => this.alertService.showToast('error', err)
    })
  }

}
