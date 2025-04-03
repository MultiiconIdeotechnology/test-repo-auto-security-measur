import { Component, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ManageDomainFormComponent } from './manage-domain-form/manage-domain-form.component';
import { VerifyDomainComponent } from './verify-domain/verify-domain.component';
import { VerifySslComponent } from './verify-ssl/verify-ssl.component';
import { ConsoleAccountFormComponent } from './console-account-form/console-account-form.component';
import { ManageMobileAppDomainFormComponent } from './manage-mobile-app-domain-form/manage-mobile-app-domain-form.component';
import { TitleStrategy } from '@angular/router';

@Component({
  selector: 'app-domain-ssl-verification',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    ManageDomainFormComponent,
    VerifyDomainComponent,
    VerifySslComponent,
    ConsoleAccountFormComponent,
    ManageMobileAppDomainFormComponent
  ],
  templateUrl: './domain-ssl-verification.component.html',
  styleUrls: ['./domain-ssl-verification.component.scss']
})
export class DomainSslVerificationComponent {

  @ViewChild('manageDomainForm') manageDomainFormComponent: any;
  @ViewChild('manageMobileAppForm') manageMobileAppFormComponent: any;
  @ViewChild('consoleAccountForm') consoleAccountFormComponent: any;
  activeStepperId: number = 1;
  record: any;
  wlSettingData: any;
  stepperData:any = [];

  stepperDataWeb = [
    { id: 1, step: 1, isActive: true, name: 'Manage Domain', minWidth: 7, isCompleted: false, isAllowed:true },
    { id: 3, step: 2, isActive: false, name: 'Verify Domain Pointing', minWidth: 10, isCompleted: false, isAllowed:false },
    { id: 4, step: 3, isActive: false, name: 'Verify SSL', minWidth: 5, isCompleted: false, isAllowed:false },
  ];

  stepperDataAndroidIos = [
    { id: 1, step: 1, isActive: true, name: 'Manage Domain', minWidth: 7, isCompleted: false, isAllowed: true },
    { id: 2, step: 2, isActive: false, name: 'Play Console Account', minWidth: 10, isCompleted: false, isAllowed: false },
    { id: 3, step: 3, isActive: false, name: 'Verify Domain Pointing', minWidth: 10, isCompleted: false, isAllowed: false },
    { id: 4, step: 4, isActive: false, name: 'Verify SSL', minWidth: 5, isCompleted: false, isAllowed: false },
  ];

  constructor(
    public matDialogRef: MatDialogRef<DomainSslVerificationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {},
  ) {
    console.log("data", data)
    this.record = data?.record;
    this.wlSettingData = data?.wlSettingList;
  }

  ngOnInit(): void {
    if (this.record?.item_name?.toLowerCase().includes('android') ||
      this.record?.item_name?.toLowerCase().includes('ios')) {
      this.stepperData = [...this.stepperDataAndroidIos];
    } else {
      this.stepperData = [...this.stepperDataWeb];
    }
  }

  onStepper(val: any) {
    // if(!val.isAllowed) {
    //   return;
    // }
    return;
    
    this.activeStepperId = val.id;
    this.stepperData.forEach((item: any) => {
      if (item.id == val.id) {
        item.isActive = true;
      } else {
        item.isActive = false;
      }
    })
  }

  onStepComplete(completedStepId: number) {
    this.stepperData.forEach(step => {
      step.isActive = false;
    });
  
    // Mark the completed step as completed
    const completedStep = this.stepperData.find(s => s.id === completedStepId);
    if (completedStep) {
      completedStep.isCompleted = true;
    }
  
    // Find and activate the next step
    const nextStep = this.stepperData.find(s => s.id > completedStepId);
    if (nextStep) {
      nextStep.isActive = true;
      this.activeStepperId = nextStep.id;
    } else {
      // If no next step, activate the completed step (last step case)
      if (completedStep) {
        completedStep.isActive = true;
        this.activeStepperId = completedStep.id;
      }
    }
  
  }

  onPreviousPage(id: number) {
    console.log("id>>>", id)
    // let isCompleted = this.stepperData.find((item: any) => item.id == id)?.isCompleted;
    // console.log("isCompleted", isCompleted)
    // if (isCompleted) {
      this.activeStepperId = id;

      this.stepperData.forEach((item: any) => {
        if (item.id == id) {
          item.isActive = true;
        } else {
          item.isActive = false;
        }
      })
    // }
  }

  onPrevious(){
    this.onPreviousPage(1);
  }

  onVerify() {
    if(this.activeStepperId == 1 ){
      if(this.record?.item_name?.toLowerCase().includes('android') ||this.record?.item_name?.toLowerCase().includes('ios')){
        console.log(">>>> in android ios next")
        this.manageMobileAppFormComponent.add();
      }else {
        this.manageDomainFormComponent.add()
      }
    } else if(this.activeStepperId == 2){
      this.consoleAccountFormComponent.add()
    }
  }

  onStepAllowed(idx:number){
    this.stepperData.forEach((item:any) => {
       if(item.id == idx){
        item.isAllowed = true;
       }
    })
  }
}
