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
import { LeadsService } from 'app/services/leads.service';
import { ToasterService } from 'app/services/toaster.service';
import { WithdrawService } from 'app/services/withdraw.service';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-info-withdraw',
  templateUrl: './info-withdraw.component.html',
  styleUrls: ['./info-withdraw.component.scss'],
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
export class InfoWithdrawComponent {

  record: any = {};
  title = "Withdraw Info"
  fieldList: {};
  records: any = {};

  constructor(
    public matDialogRef: MatDialogRef<InfoWithdrawComponent>,
    public alertService: ToasterService,
    public withdrawService: WithdrawService,
    private leadsService: LeadsService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
  }

  ngOnInit() {
    if (this.record.id) {
      this.withdrawService.getWalletWithdrawRecord(this.record.id).subscribe({
        next: (data) => {

          this.records = data;

          this.fieldList = [
            { name: 'Agency Name', value: data.agent_name, },
            { name: 'Withdraw Status', value: data.withdraw_status, },
            { name: 'Withdraw Currency', value: data.withdraw_currency, },
            { name: 'Withdraw Amount', value: data.withdraw_amount, },
            { name: 'Agent Remark', value: data.agent_remark, },
            { name: 'Is Audited', value: data.is_audited ? 'Yes' : 'No', },
            { name: 'Audit By', value: data.audit_by, },
            { name: 'Audit Date', value: data.audit_date_time ? DateTime.fromISO(data.audit_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
            { name: 'Is Rejected', value: data.is_rejected ? 'Yes' : 'No', },
            { name: 'Reject By', value: data.reject_by, },
            { name: 'Reject Date', value: data.reject_date_time ? DateTime.fromISO(data.reject_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
            { name: 'Reject Remark', value: data.reject_remark, },
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
