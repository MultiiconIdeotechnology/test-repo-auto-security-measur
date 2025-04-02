import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DomainPointingDetailsComponent } from '../domain-pointing-details/domain-pointing-details.component';
import { DomainVerificationService } from 'app/services/domain-verification.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-verify-domain-second-step',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
  ],
  templateUrl: './verify-domain-second-step.component.html',
  styleUrls: ['./verify-domain-second-step.component.scss']
})
export class VerifyDomainSecondStepComponent {
  domainPointingData: any = [];
  isLoading: boolean = false;
  isDomainFalse:boolean = false;
  wlId:any;
  @Input() data:any;
  @Output() stepCompleted = new EventEmitter<number>();
  @Output() previousPage = new EventEmitter<number>();

  constructor(
    private matDialog: MatDialog,
    private domainVarifyService: DomainVerificationService,
    private alertService: ToasterService,
  ) {

  }

  ngOnInit() {
    this.domainVarifyService.createUpdateDomain$.subscribe((res: any) => {
      this.domainPointingData = res?.pointed_domains;
      this.wlId = res?.wl_id
      this.isDomainFalse = this.isDomainPointing();
      console.log("isDomainFalse", this.isDomainFalse)
    })
  }

  getHelp() {
    this.matDialog.open(DomainPointingDetailsComponent, {
      disableClose: true,
      data: null,
      panelClass: 'zero-angular-dialog',
      autoFocus: false,
      width: '860px',
      minWidth: '800px',
      maxHeight: '900px'
    })
  }

  isDomainPointing(){
    return this.domainPointingData.some((item:any) => !item?.pointed)
  }

  onDomainVerify() {
    this.isLoading = true;
    this.domainVarifyService.pingAndBind(this.wlId, this.data?.subid).subscribe({
      next: (res) => {
        if (res) {
            this.alertService.showToast('success', 'Domain Verified Successfully');
            this.isLoading = false
            this.isDomainFalse = false;
        }
      }, 
      error: (err) => {
        this.alertService.showToast('error', err)
        this.isLoading = false;
      }
       
    })
  }

  onPreviousPage() {
    this.previousPage.emit(1);
  }

  stepTwoCompleted(){
    this.stepCompleted.emit(2);
  }

}
