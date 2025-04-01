import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DomainVerificationService } from 'app/services/domain-verification.service';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-manage-domain-first-step',
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
  templateUrl: './manage-domain-first-step.component.html',
  styleUrls: ['./manage-domain-first-step.component.scss']
})
export class ManageDomainFirstStepComponent {
  @Input() data:any;
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
      id: [''],
      agent_id: [''],
      product_id:[''],
      partner_panel_url: [''],
      b2c_portal_url:[''],
      api_url: ['', Validators.required],
    });

    console.log("data in manage domain first step", this.data)
    if(this.data?.item_name.includes('B2c')){
      this.formGroup.get('b2c_portal_url').setValidators([Validators.required]);
      this.formGroup.get('partner_panel_url')?.clearValidators();
    } else if(this.data?.item_name.includes('B2B')){
      this.formGroup.get('partner_panel_url').setValidators([Validators.required]);
      this.formGroup.get('b2c_portal_url')?.clearValidators();
    }

     // Update the validity status of the controls
     this.formGroup.get('b2c_portal_url')?.updateValueAndValidity();
     this.formGroup.get('partner_panel_url')?.updateValueAndValidity();
  }


  add(formDirective: FormGroupDirective) {
    let payloadData = this.formGroup.value;
    payloadData.agent_id = this.data?.agentid;
    payloadData.product_id = this.data?.subid;

    console.log("this.payloadData", payloadData);
    this.domainVarifyService.create(payloadData).subscribe({
      next: (res) => {
        if (res) {
          payloadData.id = res.id;
          if (this.formGroup.get('id').value) {
          
          } else {
            this.formGroup.get('id').patchValue(res.id);
            this.alertService.showToast('success', 'Domain Created Successfully');
            this.stepCompleted.emit(1);
            this.domainVarifyService.createUpdateDomainSubject.next(res);
            formDirective.resetForm()
          }
        }

      }, error: err => this.alertService.showToast('error', err)
    })
  }

}
