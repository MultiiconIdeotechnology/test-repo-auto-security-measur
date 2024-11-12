import { MatIconModule } from '@angular/material/icon';
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToasterService } from 'app/services/toaster.service';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-payment-link-copy',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    ClipboardModule,
    MatDividerModule
  ],
  templateUrl: './payment-link-copy.component.html',
  styleUrls: ['./payment-link-copy.component.scss']
})
export class PaymentLinkCopyComponent {
  fields = []
  user: any = {};
  called: boolean = false;
  link: any;

  constructor(
    public matDialogRef: MatDialogRef<PaymentLinkCopyComponent>,
    private alertService: ToasterService,
    private clipboard: Clipboard,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
        this.link = data;
  }

  openNewTab(){
     window.open("//" + this.link, '_blank');
  }

  getCopy(): void {
    this.clipboard.copy(this.link);
    this.alertService.showToast('success', 'Copied');
  }
}
