import { CommonModule, NgFor } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToasterService } from 'app/services/toaster.service';
import { DateTime } from 'luxon';
import { Clipboard } from '@angular/cdk/clipboard';
import { AccountService } from 'app/services/account.service';

@Component({
    selector: 'app-payment-info',
    templateUrl: './payment-info.component.html',
    styleUrls: ['./payment-info.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        NgFor,
        MatIconModule,
        MatTooltipModule
    ],

})
export class PaymentInfoComponent {
    records: any = {};
    fieldList: any[] = [];
    payment: any;
    receipt: any;
    constructor(
        public matDialogRef: MatDialogRef<PaymentInfoComponent>,
        private clipboard: Clipboard,
        private alertService: ToasterService,
        private accountService: AccountService,
        @Inject(MAT_DIALOG_DATA) public data: any = {},
    ) {
    }

    ngOnInit() {
        if (this.data?.payment) {
            this.accountService.getPaymentRecord(this.data?.payment).subscribe({
                next: (data) => {
                    this.data.payment = data;
                    if (this.data.payment) {
                        this.fieldList = [
                            { name: 'Payment Date', value: this.data.payment.payment_request_date ? DateTime.fromISO(this.data.payment.payment_request_date).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
                            {
                                name: 'Status', value: this.data.payment.payment_status, class: this.data.payment.payment_status === 'Confirmed' ? 'text-green-600 font-semibold' :
                                    this.data.payment.payment_status === 'Pending' ? 'text-blue-600 font-semibold' :
                                        this.data.payment.payment_status === 'Reject' ? 'text-red-600 font-semibold' : ''
                            },
                            { name: 'Audit Date', value: this.data.payment.audit_date_time ? DateTime.fromISO(this.data.payment.audit_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
                            { name: 'Ref. No.', value: this.data.payment.payment_ref_no },
                            { name: 'Used For', value: this.data.payment.service_for },
                            { name: 'To', value: this.data.payment.payment_to },
                            { name: 'From', value: this.data.payment.payment_from },
                            { name: 'MOP', value: this.data.payment.mode_of_payment },
                            { name: 'Transaction Ref. No.', value: this.data.payment.transaction_ref_no },
                            { name: 'Supplier Amount', value: this.data.payment.supplier_currency + ' ' + this.data.payment.supplier_amount },
                            { name: 'Payment Amount', value: this.data.payment.payment_currency + ' ' + this.data.payment.payment_amount },
                            { name: 'ROE', value: this.data.payment.roe },
                            { name: 'Remark', value: this.data.payment.payment_remark },
                            { name: 'Reject Reason', value: this.data.payment.payment_reject_reason },
                        ]
                    }
                }
            });
        }

        if (this.data?.receipt) {
            this.accountService.getReceiptRecord(this.data?.receipt).subscribe({
                next: (data) => {
                    this.data.receipt = data;
                    if (this.data.receipt) {
                        this.fieldList = [
                            { name: 'Reference No.', value: this.data.receipt.receipt_ref_no },
                            {
                                name: 'Status', value: this.data.receipt.receipt_status, class: this.data.receipt.receipt_status === 'Confirmed' ? 'text-green-600 font-semibold' :
                                    this.data.receipt.receipt_status === 'Pending' ? 'text-blue-600 font-semibold' :
                                        this.data.receipt.receipt_status === 'Reject' ? 'text-red-600 font-semibold' : ''
                            },
                            { name: 'Receipt For', value: this.data.receipt.service_for },
                            { name: 'Booking Ref. No.', value: this.data.receipt.transaction_ref_no },
                            { name: 'Currency', value: this.data.receipt.payment_currency },
                            { name: 'Amount', value: this.data.receipt.payment_amount },
                            { name: 'ROE', value: this.data.receipt.roe },
                            { name: 'MOP', value: this.data.receipt.mode_of_payment },
                            { name: 'Request', value: this.data.receipt.receipt_request_date ? DateTime.fromISO(this.data.receipt.receipt_request_date).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
                            { name: 'Audit', value: this.data.receipt.audit_date_time ? DateTime.fromISO(this.data.receipt.audit_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
                            { name: 'PG', value: this.data.receipt.pg_name },
                            { name: 'PG Ref. No.', value: this.data.receipt.pg_payment_ref_no },
                            { name: 'Agent', value: this.data.receipt.agent_name }
                        ]
                        //   { name: 'Receipt Date', value: this.data.receipt.receipt_request_date? DateTime.fromISO(this.data.receipt.receipt_request_date).toFormat('dd-MM-yyyy HH:mm:ss').toString():''},
                        //   { name: 'Status', value: this.data.receipt.receipt_status, class: this.data.receipt.receipt_status === 'Confirmed' ? 'text-green-600 font-semibold' :
                        //   this.data.receipt.receipt_status === 'Pending' ? 'text-blue-600 font-semibold' :
                        //   this.data.receipt.receipt_status === 'Reject' ? 'text-red-600 font-semibold' : ''},
                        //   { name: 'Audit Date', value: this.data.receipt.audit_date_time? DateTime.fromISO(this.data.receipt.audit_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString():'' },
                        //   { name: 'Ref. No.', value: this.data.receipt.receipt_ref_no },
                        //   { name: 'Used For', value: this.data.receipt.service_for },
                        //   { name: 'To', value: this.data.receipt.receipt_to },
                        //   { name: 'From', value: this.data.receipt.receipt_from },
                        //   { name: 'MOP', value: this.data.receipt.mode_of_payment },
                        //   { name: 'Transaction Ref. No.', value: this.data.receipt.transaction_ref_no},
                        //   { name: 'Supplier Amount', value: this.data.receipt.supplier_currency + ' ' + this.data.receipt.supplier_amount},
                        //   { name: 'Payment Amount', value: this.data.receipt.payment_currency + ' ' + this.data.receipt.payment_amount},
                        //   { name: 'ROE', value: this.data.receipt.roe},
                        //   { name: 'Remark', value: this.data.receipt.receipt_remark},
                        //   { name: 'Reject Reason', value: this.data.receipt.receipt_reject_reason},
                    }
                }
            });
        }
    }

    copyLink(link: string): void {
        this.clipboard.copy(link);
        this.alertService.showToast('success', 'Copied');
    }
}
