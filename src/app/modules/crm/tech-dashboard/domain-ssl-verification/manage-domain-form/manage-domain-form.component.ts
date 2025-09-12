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
  selector: 'app-manage-domain-form',
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
  templateUrl: './manage-domain-form.component.html',
  styleUrls: ['./manage-domain-form.component.scss']
})
export class ManageDomainFormComponent {
    @Input() data:any;
    @Input() wlSettingData:any
    @Output() stepCompleted = new EventEmitter<number>();
  
    formGroup !:FormGroup
  
    constructor(
      private builder:FormBuilder,
      private domainVarifyService: DomainVerificationService,
      private alertService: ToasterService,
    ){
      
    }
  
    ngOnInit():void {
      this.formGroup = this.builder.group({
        agent_id: [''],
        product_id:[''],
        partner_panel_url: ['', Validators.required],
        b2c_portal_url:[''],
        api_url: ['', Validators.required],
      });

  
      if(this.data?.itemName?.includes('B2C')){
        this.formGroup.get('b2c_portal_url').setValidators([Validators.required]);
        this.formGroup.get('b2c_portal_url').patchValue(this.wlSettingData?.b2c_portal_url);
      } else if(this.data?.itemName?.includes('B2B')){
        this.formGroup.get('b2c_portal_url')?.clearValidators();
      }
      
      // Update the validity status of the controls
      this.formGroup.get('b2c_portal_url')?.updateValueAndValidity();
      this.formGroup.get('partner_panel_url')?.updateValueAndValidity();
      
      this.formGroup.get('partner_panel_url').patchValue(this.wlSettingData?.partner_panel_url);
       this.formGroup.get('api_url').patchValue(this.wlSettingData?.api_url);
    }
  
    onWebDomainFormVerify() {
      if(this.formGroup.invalid){
        this.alertService.showToast('error', 'Fill up required field to proceed');
        this.formGroup.markAllAsTouched();
        return;
      }
  
      let payloadData = this.formGroup.value;
      payloadData.agent_id = this.data?.agentId;
      payloadData.product_id = this.data?.productPurchaseId;
  
      this.domainVarifyService.createDomain(payloadData).subscribe({
        next: (res) => {
          if (res) {
              this.alertService.showToast('success', 'Domain Created Successfully');
              this.stepCompleted.emit(1);
              this.domainVarifyService.createUpdateDomainSubject.next(res);
              // formDirective.resetForm()
            }
  
        }, error: err => this.alertService.showToast('error', err)
      })
    }
}
