import { Component, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ManageDomainFirstStepComponent } from './manage-domain-first-step/manage-domain-first-step.component';
import { VerifyDomainSecondStepComponent } from './verify-domain-second-step/verify-domain-second-step.component';
import { VerifySslThirdStepComponent } from './verify-ssl-third-step/verify-ssl-third-step.component';

@Component({
  selector: 'app-b2b-b2c-domain-verification',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    ManageDomainFirstStepComponent,
    VerifyDomainSecondStepComponent,
    VerifySslThirdStepComponent
  ],
  templateUrl: './b2b-b2c-domain-verification.component.html',
  styleUrls: ['./b2b-b2c-domain-verification.component.scss']
})
export class B2bB2cDomainVerificationComponent {
  @ViewChild('firstStepForm') FirstStepFormComponent:any;
  activeStepperId:number = 1;

  stepperData = [
    {id:1, step:1, isActive:true, name:'Manage Domain', minWidth:7, isCompleted:false},
    {id:2, step:2, isActive:false, name:'Verify Domain Pointing', minWidth:10, isCompleted:false},
    {id:3, step:3, isActive:false, name:'Verify SSL', minWidth:5, isCompleted:false},
  ]

  constructor(
    public matDialogRef: MatDialogRef<B2bB2cDomainVerificationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {},

  ){
    console.log("data", data)
  }

  ngOnInit():void {

  }

  onStepper(val:any){
    // if(!val.isCompleted){
    //   return;
    // }

    this.stepperData.forEach((item:any) => {
      if(item.id == val.id){
        item.isActive = true;
        this.activeStepperId = item.id;
        // item.isCompleted = true;
      } else {
        item.isActive = false;
      }
    });

    
  }

  onVerify(){
    this.FirstStepFormComponent.add()
  }

}
