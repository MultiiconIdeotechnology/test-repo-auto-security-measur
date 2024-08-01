import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToasterService } from 'app/services/toaster.service';
import { WalletService } from 'app/services/wallet.service';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-info-wallet',
  templateUrl: './info-wallet.component.html',
  styleUrls: ['./info-wallet.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    AsyncPipe,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    NgxMatSelectSearchModule,
    MatTooltipModule
  ]
})
export class InfoWalletComponent {

  record: any = {};
  title = "Wallet Info"
  fieldList: {};
  records: any = {};

  constructor(
    public matDialogRef: MatDialogRef<InfoWalletComponent>,
    public alertService: ToasterService,
    private walletService: WalletService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
  }

  ngOnInit() {
    if (this.record.id) {
      this.walletService.getWalletRechargeRecord(this.record.id).subscribe({
        next: (data) => {

          this.records = data;

          this.fieldList = [
            { name: 'Recharge For', value: data.recharge_for, },
            { name: 'Recharge For Name', value: data.recharge_for_name, },
            { name: 'Transaction Number', value: data.transaction_number, },
            { name: 'Ref. No', value: data.reference_number, },
            { name: 'Request Date', value: data.request_date_time ? DateTime.fromISO(data.request_date_time).toFormat('dd-MM-yyyy HH:mm:ss') : '' },
            { name: 'Currency', value: data.currency, },
            { name: 'Recharge Amount', value: data.recharge_amount, },
            { name: 'Settled Amount', value: data.settled_amount, },
            { name: 'MOP', value: data.mop, },
            { name: 'PSP Name', value: data.psp_name, },
            { name: 'PSP Ref Number', value: data.psp_ref_number, },
            { name: 'PSP Provider Name', value: data.psp_provider_name, },
            { name: 'Is Audited', value: data.is_audited ? 'Yes' : 'No' },
            { name: 'Audited By', value: data.audited_by_name},
            { name: 'Audited Date', value: data.audited_date_time ? DateTime.fromISO(data.audited_date_time).toFormat('dd-MM-yyyy HH:mm:ss') : '', },
            { name: 'Is Rejected', value: data.is_rejected ? 'Yes' : 'No' },
            { name: 'Rejected By', value: data.rejected_by_name},
            { name: 'Rejected Date', value: data.rejected_date_time ? DateTime.fromISO(data.rejected_date_time).toFormat('dd-MM-yyyy HH:mm:ss') : '', },
            { name: 'Reject Reason', value: data.reject_reason},
            { name: 'User Remark', value: data.user_remark},
            { name: 'Request From', value: data.request_from},
          ];
        },
        error: (err) => {
          this.alertService.showToast('error', err, 'top-right', true);
        },

      },
      )
    }
  }

}
