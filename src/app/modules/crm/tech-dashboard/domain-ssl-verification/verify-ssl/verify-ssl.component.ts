import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { DomainVerificationService } from 'app/services/domain-verification.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { ToasterService } from 'app/services/toaster.service';
import { DomainSslVerificationComponent } from '../domain-ssl-verification.component';


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
  isDomainFalse: boolean = true;
  wlId: any;
  @Input() data: any;
  @Input() fromKey: string = "";
  @Output() stepCompleted = new EventEmitter<number>();
  @Output() previousPage = new EventEmitter<number>();

  constructor(
    public matDialogRef: MatDialogRef<DomainSslVerificationComponent>,
    private domainVarifyService: DomainVerificationService,
    private alertService: ToasterService,
  ) {
    this.domainVarifyService.createUpdateDomain$.subscribe((res: any) => {
      this.sslDomainsData = res?.ssl_domains;
      this.wlId = res?.wl_id
      // this.isDomainFalse = this.isSslPointing();
    })

    this.domainVarifyService.verifyButton$.subscribe((res: boolean) => {
      this.isDomainFalse = res;
    })
  }

  ngOnInit() {
  }

  isSslPointing() {
    return this.sslDomainsData?.some((item: any) => !item?.ssl_generated)
  }

  onDomainVerify() {
    this.isLoading = true;
    this.domainVarifyService.generateSSl(this.wlId, this.data?.product_id).subscribe({
      next: (res) => {
        if (res) {
          this.alertService.showToast('success', 'SSL Verified Successfully');
          if (res && res?.['ssl_domains']) {
            this.sslDomainsData = res['ssl_domains']
          }
          this.isLoading = false
          this.isDomainFalse = this.isSslPointing();
          if (this.isDomainFalse) {
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
    this.previousPage.emit(3);
    this.domainVarifyService.verifyButtonSubject.next(true);
  }

  onCompleteProcess() {
    if (this.data?.item_name?.toLowerCase()?.includes('android') ||
      this.data?.item_name?.toLowerCase()?.includes('ios')) {
      this.matDialogRef.close();
      return;
    }
    
    this.isLoading = true;
    let payloadObj = {
      ServiceId: this.data.id ? this.data.id : "",
      // is_activated: true,
      AgentId: this.data?.agentId ? this.data.agentId : "",
      // product_id: this.data?.product_id
    }
    this.domainVarifyService.activate(payloadObj).subscribe({
      next: (res) => {
        if (res) {
          this.alertService.showToast('success', 'Product activated Successfully!');
          this.matDialogRef.close(this.fromKey);
          this.isLoading = false
        }
      },
      error: (err) => {
        this.alertService.showToast('error', err)
        this.isLoading = false;
      }

    })
  }

}
