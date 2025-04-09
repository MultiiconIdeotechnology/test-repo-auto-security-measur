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
    { id: 1, step: 1, isActive: true, name: 'Open Devloper Account', minWidth: 10, isCompleted: false, isAllowed: true },
    { id: 2, step: 2, isActive: false, name: 'Manage Domain', minWidth: 7, isCompleted: false, isAllowed: false },
    { id: 3, step: 3, isActive: false, name: 'Verify Domain Pointing', minWidth: 10, isCompleted: false, isAllowed: false },
    { id: 4, step: 4, isActive: false, name: 'Verify SSL', minWidth: 5, isCompleted: false, isAllowed: false },
  ];

  constructor(
    public matDialogRef: MatDialogRef<DomainSslVerificationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {},
  ) {
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
      this.activeStepperId = id;

      this.stepperData.forEach((item: any) => {
        if (item.id == id) {
          item.isActive = true;
        } else {
          item.isActive = false;
        }
      })
  }

  onPrevious(){
    this.onPreviousPage(1);
  }

  
}
