import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DomainVerificationService } from 'app/services/domain-verification.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-verify-ssl-third-step',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
  ],
  templateUrl: './verify-ssl-third-step.component.html',
  styleUrls: ['./verify-ssl-third-step.component.scss']
})
export class VerifySslThirdStepComponent {
    sslDomainsData: any = [];
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
      this.domainVarifyService.createUpdateDomain$.subscribe((res: any) => {
        this.sslDomainsData = res?.ssl_domains;
        this.wlId = res?.wl_id
        this.isDomainFalse = this.isSslPointing();
      })
    }

    isSslPointing(){
      return this.sslDomainsData.some((item:any) => !item?.pointed)
    }
  
    onDomainVerify() {
      this.isLoading = true;
      this.domainVarifyService.generateSSl(this.wlId, this.data?.subid).subscribe({
        next: (res) => {
          if (res) {
              this.alertService.showToast('success', 'SSL Verified Successfully');
              this.isLoading = false
              this.isDomainFalse = false;
          }
        }, 
        error: (err) => {
          this.alertService.showToast('error', err)
          this.isLoading = false;
          this.isDomainFalse = false;
        }
         
      })
    }
  
    onPreviousPage() {
      this.previousPage.emit(2);
    }
  
}
