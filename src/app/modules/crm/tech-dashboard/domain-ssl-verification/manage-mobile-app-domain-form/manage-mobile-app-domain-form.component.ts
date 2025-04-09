import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DomainVerificationService } from 'app/services/domain-verification.service';
import { ToasterService } from 'app/services/toaster.service';
@Component({
  selector: 'app-manage-mobile-app-domain-form',
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
  templateUrl: './manage-mobile-app-domain-form.component.html',
  styleUrls: ['./manage-mobile-app-domain-form.component.scss']
})
export class ManageMobileAppDomainFormComponent {

  @Input() data: any;
  @Input() wlSettingData: any
  @Output() stepCompleted = new EventEmitter<number>();
  @Output() stepAllowed = new EventEmitter<number>();

  formGroup !: FormGroup

  constructor(
    private builder: FormBuilder,
    private domainVarifyService: DomainVerificationService,
    private alertService: ToasterService,
  ) {

  }

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      agent_id: [''],
      product_id: [''],
      partner_panel_url: [''],
      b2c_portal_url: [''],
      api_url: ['', Validators.required],
      app_name: ['', Validators.required],
      store_app_name: ['', Validators.required],
      support_email: ['', [Validators.required, this.customEmailRegexValidator()]],
      gmail_id: ['', Validators.required],
      password: ['', Validators.required],
    });

    console.log("wlSettingData", this.wlSettingData);

    if (this.data?.item_name.includes('B2C')) {
      this.formGroup.get('b2c_portal_url').setValidators([Validators.required]);
      this.formGroup.get('partner_panel_url')?.clearValidators();
      this.formGroup.get('b2c_portal_url').patchValue(this.wlSettingData?.b2c_portal_url);
    } else if (this.data?.item_name.includes('B2B')) {
      this.formGroup.get('partner_panel_url').setValidators([Validators.required]);
      this.formGroup.get('b2c_portal_url')?.clearValidators();
      this.formGroup.get('partner_panel_url').patchValue(this.wlSettingData?.partner_panel_url);
    }

    // Update the validity status of the controls
    this.formGroup.get('b2c_portal_url')?.updateValueAndValidity();
    this.formGroup.get('partner_panel_url')?.updateValueAndValidity();

    this.formGroup.patchValue({
      api_url: this.wlSettingData?.api_url,
      app_name: this.wlSettingData?.app_name,
      store_app_name: this.wlSettingData?.store_app_name,
      support_email: this.wlSettingData?.support_email,
      gmail_id: this.wlSettingData?.gmail_id,
      password: this.wlSettingData?.password,
    })
  }

  //email validation function
  customEmailRegexValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const valid = emailRegex.test(control.value);

      return valid ? null : { invalidEmail: true };
    };
  }

  add() {
    this.stepCompleted.emit(1);
    return;
    
    if (this.formGroup.invalid) {
      this.alertService.showToast('error', 'Fill up required field to proceed');
      this.formGroup.markAllAsTouched();
      console.log("this.formGroup.value", this.formGroup.value)
      return;
    }

    let payloadData = this.formGroup.value;
    payloadData.agent_id = this.data?.agentid;
    payloadData.product_id = this.data?.subid;

    console.log("this.payloadData", payloadData);
    this.domainVarifyService.createDomain(payloadData).subscribe({
      next: (res) => {
        if (res) {
            this.alertService.showToast('success', 'Domain Created Successfully');
            this.stepCompleted.emit(1);
            this.stepAllowed.emit(2)
            this.domainVarifyService.createUpdateDomainSubject.next(res);
        }

      }, error: err => this.alertService.showToast('error', err)
    })
  }

}
