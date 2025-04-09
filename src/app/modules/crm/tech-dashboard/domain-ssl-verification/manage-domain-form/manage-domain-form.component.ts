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
    @Output() stepAllowed = new EventEmitter<number>();
    @Output() step1WebForm = new EventEmitter<boolean>();
  
    formGroup !:FormGroup
  
    constructor(
      private builder:FormBuilder,
      private domainVarifyService: DomainVerificationService,
      private alertService: ToasterService,
    ){
      
    }
  
    ngOnChanges(){
      console.log("wlSettingData on ngOnchanges", this.wlSettingData);
  
    }
  
    ngOnInit():void {
      this.formGroup = this.builder.group({
        id: [''],
        agent_id: [''],
        product_id:[''],
        partner_panel_url: [''],
        b2c_portal_url:[''],
        api_url: ['', Validators.required],
      });
  
      if(this.data?.item_name?.includes('B2C')){
        this.formGroup.get('b2c_portal_url').setValidators([Validators.required]);
        this.formGroup.get('partner_panel_url')?.clearValidators();
        this.formGroup.get('b2c_portal_url').patchValue(this.wlSettingData?.b2c_portal_url);
      } else if(this.data?.item_name?.includes('B2B')){
        this.formGroup.get('partner_panel_url').setValidators([Validators.required]);
        this.formGroup.get('b2c_portal_url')?.clearValidators();
        this.formGroup.get('partner_panel_url').patchValue(this.wlSettingData?.partner_panel_url);
      }
  
       // Update the validity status of the controls
       this.formGroup.get('b2c_portal_url')?.updateValueAndValidity();
       this.formGroup.get('partner_panel_url')?.updateValueAndValidity();
  
       this.formGroup.get('api_url').patchValue(this.wlSettingData?.api_url);

          // Emit validity whenever form status changes
     this.formGroup.statusChanges.subscribe(() => {
      this.step1WebForm.emit(this.formGroup.valid);
    });
    }
  
    onWebDomainFormVerify() {
      if(this.formGroup.invalid){
        this.alertService.showToast('error', 'Fill up required field to proceed');
        this.formGroup.markAllAsTouched();
        return;
      }
  
      let payloadData = this.formGroup.value;
      payloadData.agent_id = this.data?.agentid;
      payloadData.product_id = this.data?.subid;
  
      console.log("this.payloadData", payloadData);
      this.domainVarifyService.createDomain(payloadData).subscribe({
        next: (res) => {
          if (res) {
            payloadData.id = res.id;
            if (this.formGroup.get('id').value) {
            
            } else {
              this.formGroup.get('id').patchValue(res.id);
              this.alertService.showToast('success', 'Domain Created Successfully');
              this.stepCompleted.emit(1);
              this.stepAllowed.emit(3);
              this.domainVarifyService.createUpdateDomainSubject.next(res);
              // formDirective.resetForm()
            }
          }
  
        }, error: err => this.alertService.showToast('error', err)
      })
    }
}
