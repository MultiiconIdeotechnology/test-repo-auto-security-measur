import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DomainVerificationService } from 'app/services/domain-verification.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-verify-ssl',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
  ],
  templateUrl: './verify-ssl.component.html',
  styleUrls: ['./verify-ssl.component.scss']
})
export class VerifySslComponent {
  sslDomainsData: any = [];
  isLoading: boolean = false;
  isDomainFalse: boolean = false;
  wlId: any;
  @Input() data: any;
  @Output() stepCompleted = new EventEmitter<number>();
  @Output() previousPage = new EventEmitter<number>();
  @Output() stepAllowed = new EventEmitter<number>();

  constructor(
    private domainVarifyService: DomainVerificationService,
    private alertService: ToasterService,
  ) {
    this.domainVarifyService.createUpdateDomain$.subscribe((res: any) => {
      this.sslDomainsData = res?.ssl_domains;
      this.wlId = res?.wl_id
      this.isDomainFalse = this.isSslPointing();
    })
  }

  ngOnInit(){
  }

  isSslPointing() {
    return this.sslDomainsData?.some((item: any) => !item?.ssl_generated)
  }

  onDomainVerify() {
    this.isLoading = true;
    this.domainVarifyService.generateSSl(this.wlId, this.data?.subid).subscribe({
      next: (res) => {
        if (res) {
          this.alertService.showToast('success', 'SSL Verified Successfully');
          if (res && res?.['ssl_domains']) {
            this.sslDomainsData = res['ssl_domains']
          }
          this.isLoading = false
          this.isDomainFalse = this.isSslPointing();
          if(this.isDomainFalse){
            this.alertService.showToast('error', 'SSL verification unsuccessful');
          } else {
            this.alertService.showToast('success', 'SSL Verified Successfully');
          }
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
    if (this.data?.item_name?.toLowerCase().includes('android') ||
      this.data?.item_name?.toLowerCase().includes('ios')) {
      this.previousPage.emit(3);
    } else {
      this.previousPage.emit(3);
    }
  }

}
