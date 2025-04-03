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

  formGroup !:FormGroup

  constructor(
    private builder:FormBuilder,
    private domainVarifyService: DomainVerificationService,
    private alertService: ToasterService,
  ){

    this.domainVarifyService.createUpdateDomain$.subscribe((res: any) => {
      // this.sslDomainsData = res?.ssl_domains;
      this.wlId = res?.wl_id
      // this.isDomainFalse = this.isSslPointing();
    })
    
  }

  ngOnInit():void {
    this.formGroup = this.builder.group({
      wl_id : [""],
      txn_id : ["", Validators.required],
      account_name : ["", Validators.required],
      account_id : ["", Validators.required],
      password : [""],
      is_account_active : ["", Validators.required],
      product_id : [""]
    });

    if(this.data?.item_name?.toLowerCase().includes('ios')){
      console.log("this.data.itemname", this.data.item_name)
      this.formGroup.get('password').setValidators([Validators.required]);
    } else {
      this.formGroup.get('password')?.clearValidators();
    }

    this.formGroup.get('password')?.updateValueAndValidity();

  }

  add() {
    if(this.formGroup.invalid){
      this.alertService.showToast('error', 'Fill up required field to proceed');
      this.formGroup.markAllAsTouched();
      return;
    }

    let payloadData = this.formGroup.value;
    payloadData.agent_id = this.data?.agentid;
    payloadData.product_id = this.data?.subid;
    payloadData.wl_id = this.wlId;

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
            // formDirective.resetForm()
          }
        }

      }, error: err => this.alertService.showToast('error', err)
    })
  }


}
