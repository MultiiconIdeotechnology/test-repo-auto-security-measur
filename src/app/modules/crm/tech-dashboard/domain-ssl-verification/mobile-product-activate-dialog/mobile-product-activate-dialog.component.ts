import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToasterService } from 'app/services/toaster.service';
import { DomainVerificationService } from 'app/services/domain-verification.service';
import { CrmService } from 'app/services/crm.service';

@Component({
  selector: 'app-mobile-product-activate-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './mobile-product-activate-dialog.component.html',
  styleUrls: ['./mobile-product-activate-dialog.component.scss']
})
export class MobileProductActivateDialogComponent {
  isLoading: boolean = false;
  formGroup: FormGroup;
  record: any = {};
  index: any;
  getWLSettingList: any = {};

  constructor(
    public matDialogRef: MatDialogRef<MobileProductActivateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {},
    private builder: FormBuilder,
    private alertService: ToasterService,
    private domainVarifyService: DomainVerificationService,
  ) {
    this.record = data?.record || {};
    this.getWLSettingList = data?.getWLSettingList;
    this.index = data?.index;
    this.formGroup = this.builder.group({
      android_app_url: [''],
      ios_app_url: [''],
    })

    // setting
    if (this.record?.item_name.toLowerCase()?.includes('android')) {
      this.formGroup.get('android_app_url').setValidators(Validators.required);
      this.formGroup.get('ios_app_url').clearValidators();
      this.formGroup.get('android_app_url').patchValue(this.getWLSettingList.android_app_url);
    } else {
      this.formGroup.get('ios_app_url').setValidators(Validators.required);
      this.formGroup.get('android_app_url').clearValidators();
      this.formGroup.get('ios_app_url').patchValue(this.getWLSettingList.ios_app_url);
    }
    this.formGroup.get('ios_app_url').updateValueAndValidity();
    this.formGroup.get('android_app_url').updateValueAndValidity();

  }

  onActivate() {
    if (this.formGroup.invalid) {
      return;
    }

    this.isLoading = true;
    const isRiseProduct = this.record?.item_name?.toLowerCase().includes('rise');

    if (isRiseProduct || this.getWLSettingList) {
      this.createDomain()
      this.activateMobileProduct()
    } else {
      this.alertService.showToast('error', 'WL not found ', 'top-right', true);
      this.isLoading = false;
    }

  }

  // api just to save app url
  createDomain() {
    let payloadData = this.formGroup.value;
    payloadData.agent_id = this.record?.agentid;
    payloadData.product_id = this.record?.subid;
    this.domainVarifyService.createDomain(payloadData).subscribe({
      next: (res) => {
        if (res) {
          console.log("App URL saved successfully");
        }

      }, error: (err) => {
        this.alertService.showToast('error', err);
      }
    })
  }

  // final step to activate andoroid/ios product
  activateMobileProduct() {
    let payloadObj = {
      id: this.record?.id,
      is_activated: true,
      agent_id: this.record?.agentid,
      product_id: this.record?.product_id
    }
    this.domainVarifyService.activate(payloadObj).subscribe({
      next: (res) => {
        if (res) {
          this.alertService.showToast('success', 'Product activated Successfully!');
          this.matDialogRef.close('pending');
          this.isLoading = false
        }
      },
      error: (err) => {
        this.alertService.showToast('error', err)
        this.isLoading = false;
      }

    })
  }

}
