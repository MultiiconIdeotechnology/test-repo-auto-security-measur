import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DomainVerificationService } from 'app/services/domain-verification.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { ToasterService } from 'app/services/toaster.service';
import { DomainPointingDetailsComponent } from '../domain-pointing-details/domain-pointing-details.component';

@Component({
  selector: 'app-verify-domain',
  standalone: true,
  imports: [
    CommonModule,
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
  ],
  templateUrl: './verify-domain.component.html',
  styleUrls: ['./verify-domain.component.scss']
})
export class VerifyDomainComponent {
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
      return this.domainPointingData?.some((item:any) => !item?.pointed)
    }
  
    onDomainVerify() {
      this.isLoading = true;
      this.domainVarifyService.pingAndBind(this.wlId, this.data?.subid).subscribe({
        next: (res) => {
          if (res) {
            if(res && res?.['pointed_domains']){
              this.domainPointingData = res['pointed_domains']
            }
            this.isLoading = false
            this.isDomainFalse = this.isDomainPointing()
            if(this.isDomainFalse){
              this.alertService.showToast('error', 'Domain verification unsuccessful');
            } else {
              this.alertService.showToast('success', 'Domain Verified Successfully');
            }
          }
        }, 
        error: (err) => {
          this.alertService.showToast('error', err)
          this.isLoading = false;
        }
         
      })
    }
  
    onPreviousPage() {
      if(this.data?.item_name?.toLowerCase().includes('android') || this.data?.item_name?.toLowerCase().includes('ios')){
        this.previousPage.emit(2);
      } else {
        this.previousPage.emit(1);
      }
    }
  
    stepTwoCompleted(){
      this.stepCompleted.emit(3);
    }
}
