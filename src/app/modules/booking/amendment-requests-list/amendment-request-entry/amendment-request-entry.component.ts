// import { AmendmentRequestsService } from './../../../../services/amendment-requests.service';
import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToasterService } from 'app/services/toaster.service';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { AmendmentRequestsService } from 'app/services/amendment-requests.service';
import { Linq } from 'app/utils/linq';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { EntityService } from 'app/services/entity.service';
import { Subject, takeUntil } from 'rxjs';
import { Routes } from 'app/common/const';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { amendmentRequestsPermissions, messages, Security } from 'app/security';
import { MatDialog } from '@angular/material/dialog';
import { RefundInitiateComponent } from '../refund-initiate/refund-initiate.component';
import { CommonUtils } from 'app/utils/commonutils';
import { StatusLogComponent } from '../status-log/status-log.component';

@Component({
    selector: 'app-amendment-request-entry',
    templateUrl: './amendment-request-entry.component.html',
    styles: [`
        referral-settings {
            position: static;
            display: block;
            flex: none;
            width: 50%;
        }`
    ],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        NgClass,
        MatButtonModule,
        MatIconModule,
        DatePipe,
        AsyncPipe,
        NgxMatSelectSearchModule,
        MatDatepickerModule,
        NgxMatTimepickerModule,
        MatSlideToggleModule,
        MatTooltipModule,
        MatDividerModule,
        MatSidenavModule,
        FuseDrawerComponent
    ],
})
export class AmendmentRequestEntryComponent {
    @ViewChild('amendmentInfoDrawer') public amendmentInfoDrawer: MatSidenav;

    record: any = {};
    isLoading: boolean = false;
    agentInfoList: any[] = [];
    paymentInfoList: any[] = [];
    PGRefundList: any[] = [];
    SupplierRefundDetailsList: any[] = [];
    amendmentInfoList: any[] = [];
    paxInfoList: any;
    chargesList: any[] = [];
    roeList: any[] = [];
    booking_id: any
    recordList: any;
    titleCharge: any;
    title = "Amendment Request Info"
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public alertService: ToasterService,
        public amendmentRequestsService: AmendmentRequestsService,
        private entityService: EntityService,
        private matDialog: MatDialog,
        private conformationService: FuseConfirmationService,
    ) {
        this.entityService.onAmendmentInfoCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                this.record = item?.data ?? {}
                this.getData();
                this.amendmentInfoDrawer.toggle();
            }
        });

        this.entityService.onraiserefreshUpdateChargeCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                this.cliarData();
            }
        });
    }

    cliarData() {
        this.recordList = null;
        this.agentInfoList = [];
        this.paymentInfoList = [];
        this.amendmentInfoList = [];
        this.paxInfoList = [];
        this.PGRefundList = [];
        this.SupplierRefundDetailsList = [];
        this.chargesList = [];
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    getData() {
        if (this.record && this.record.id) {
            this.amendmentRequestsService.getAirAmendmentRecord(this.record.id).subscribe({
                next: (data) => {
                    this.recordList = data
                    this.booking_id = data?.amendment_info?.air_booking_id
                    if (data) {
                        this.agentInfoList = [
                            { name: 'Name', value: data.agent_info.name },
                            { name: 'Email', value: data.agent_info.email },
                            { name: 'Contact', value: data.agent_info.contact },
                            { name: 'Wallet Balance', value: `${data.agent_info.currency_symbol} ${data.agent_info.walletBalance.toFixed(2)}` },
                            { name: 'Credit Balance', value: `${data.agent_info.currency_symbol} ${data.agent_info.creaditbalance.toFixed(2)}` },
                        ];
                        this.paymentInfoList = [
                            { name: 'MOP', value: data.paymentbyInfo?.mop },
                            { name: 'Wallet', value: data.paymentbyInfo?.wallet },
                            { name: 'PG Name', value: data.paymentbyInfo?.pg_name || '-' },
                            { name: 'PG Payment', value: data.paymentbyInfo?.pg_payment },
                            { name: 'PG Ref No', value: data.paymentbyInfo?.pg_ref_no || '-' },
                            { name: 'PG Status', value: data.paymentbyInfo?.pg_status || '-' },
                            { name: 'PG Amount', value: data.paymentbyInfo?.pg_amount },
                            { name: 'PG Charge', value: data.paymentbyInfo?.pg_charge },
                            { name: 'PG Error', value: data.paymentbyInfo?.pg_error || '-' },
                            { name: 'PG Settlement', value: data.paymentbyInfo?.pg_settlement },
                        ];
                        this.amendmentInfoList = [
                            { name: 'Type', value: data.amendment_info.type, classes: '' },
                            { name: 'Supplier', value: data.amendment_info.supplier, classes: '' },
                            {
                                name: 'Status', value: data.amendment_info?.status,
                                classes: this.getStatusColor(data.amendment_info?.status)
                            },
                            { name: 'Request Date', value: data.amendment_info.req_date ? DateTime.fromISO(data.amendment_info.req_date).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '', classes: '' },
                            { name: 'PNR', value: data.amendment_info.pnr, classes: '' },
                            { name: 'GDS PNR', value: data.amendment_info.gds_pnr, classes: '' },
                            { name: 'Flight No', value: data.amendment_info.air_booking_no, classes: '', toFlight: true },
                            { name: 'Pax', value: data.amendment_info.information, classes: '', toPax: true },
                            { name: 'Remark', value: data.amendment_info.remark, classes: '', isShowRemark: data.amendment_info.remark ? false : true },
                            { name: 'Agent Remark', value: data.remark, classes: '' },
                        ];

                        if (data.amendment_info.type === 'Reissue Quotation') {
                            this.paxInfoList = data.pax_info.map(pax => [
                                { name: 'Passenger Name', value: pax.passenger_name },
                                { name: 'Segment Detail', value: pax.traveller_detail },
                                { name: 'Old Booking Date', value: pax.old_booking_date ? DateTime.fromISO(pax.old_booking_date).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
                                { name: 'New Booking Date', value: pax.new_booking_date ? DateTime.fromISO(pax.new_booking_date).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
                            ]);
                        } else if (data.amendment_info.type === 'Baggage Quotation(SSR)') {
                            this.paxInfoList = data.pax_info.map(pax => [
                                { name: 'Passenger Name', value: pax.passenger_name },
                                { name: 'Segment Detail', value: pax.traveller_detail },
                                { name: 'Baggage', value: pax.extra_baggage },
                            ]);
                        } else {
                            let isFlag = true
                            if (this.recordList.amendment_info.type == 'Correction Quotation') {
                                isFlag = false;
                            }
                            this.paxInfoList = data.pax_info.map(pax => [
                                { name: 'Passenger Name', value: pax.passenger_name, toCorrection: false },
                                { name: 'New Passenger Name', value: pax.new_passenger_name, toCorrection: isFlag },
                                { name: 'Segment Detail', value: pax.traveller_detail, toCorrection: false },
                            ]);

                        }

                        this.PGRefundList = [
                            { name: this.recordList.is_refundable ? 'Refund Mode' : 'Payment Mode', value: data.pgRefund.refund_mode },
                            { name: this.recordList.is_refundable ? 'Refund Amount' : 'Payment Amount', value: `INR ${(data.pgRefund?.refund_amount?.toFixed(2) || '0.00')}` },
                            { name: this.recordList.is_refundable ? 'Refund Date' : 'Payment Date', value: data.pgRefund?.refund_date ? DateTime.fromJSDate(new Date(data.pgRefund?.refund_date)).toFormat('dd-MM-yyyy HH:mm:ss') : '-' },
                            { name: 'PSP Name', value: data.pgRefund?.psp_name || '-' },
                            { name: 'PSP Ref. No.', value: data.pgRefund?.psp_ref_no || '-' },
                        ];
                        if (this.recordList.is_refundable)
                            this.PGRefundList.push({ name: 'Credit Invoice', value: data.pgRefund.credit_invoice })
                        this.PGRefundList.push({ name: 'Debit Invoice', value: data.pgRefund.debit_invoice })

                        this.SupplierRefundDetailsList = [
                            { name: this.recordList.is_refundable ? 'Refund Amount' : 'Payment Amount', value: `INR ${(data.supplier_refund_details?.refund_amount?.toFixed(2) || '0.00')}` },
                            { name: this.recordList.is_refundable ? 'Refund Date' : 'Payment Date', value: data.supplier_refund_details?.refund_date ? DateTime.fromJSDate(new Date(data.supplier_refund_details?.refund_date)).toFormat('dd-MM-yyyy HH:mm:ss') : '-' },
                            { name: 'Audit By', value: data.supplier_refund_details?.audit_by || '-' },
                            { name: 'Audit Date', value: data.supplier_refund_details?.audit_date ? DateTime.fromJSDate(new Date(data.supplier_refund_details?.audit_date)).toFormat('dd-MM-yyyy HH:mm:ss') : '-' },
                        ]
                        let name1;
                        let name2;
                        if (this.recordList.is_refundable) {
                            name1 = 'Per Pax Refund'
                            name2 = 'Total Refund'
                            this.titleCharge = 'Quotation'
                        } else {
                            name1 = 'Per Pax Charge'
                            name2 = 'Total Charge'
                            this.titleCharge = 'Quotation'
                        }

                        this.titleCharge = 'Quotation'
                        this.chargesList = [
                            { name: this.recordList.is_refundable ? "Cancellation Charge" : "Charge", value: `INR ${(data.charges?.cancellation_charge?.toFixed(2) || '0.00')}` },
                            { name: "Bonton Markup", value: `INR ${(data.b2bcharges?.bonton_markup?.toFixed(2) || '0.00')}` },
                            { name: name1, value: `INR ${(data.charges?.per_person_charge?.toFixed(2) || '0.00')}` },
                            { name: "No. of Pax", value: data.pax_info.length },
                            { name: name2, value: `INR ${(data.charges?.charge?.toFixed(2) || '0.00')}` },
                        ];

                        if (data.currency != "INR") {
                            this.roeList = [
                                { name: "Total Amount", value: `INR ${(data.charges?.charge?.toFixed(2) || '0.00')}` },
                                { name: "ROE", value: data.b2bcharges?.roe },
                                { name: `${data.currency} Amount`, value: `${data.currency} ${(data.b2bcharges?.roe * data.charges?.converted_charge)?.toFixed(2)}` },
                            ];
                        } else {
                            this.roeList = [];
                        }
                        // // if (this.recordList.is_refundable) {
                        //     this.chargesList.unshift({ name: 'Cancellation Charge', value: `${data.currency_symbol} ${(data.charges?.cancellation_charge?.toFixed(2) || '0.00')}` })
                        // }

                    }
                }, error: (err) => {
                    this.alertService.showToast('error', err)

                },

            });
        }
    }

    statusLogs(): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.statusLogsPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(StatusLogComponent, {
            data: { id: this.record.id },
            disableClose: true
        })
    }

    cancelReq() {
        if (!Security.hasPermission(amendmentRequestsPermissions.cancelAmendmentPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(RefundInitiateComponent, {
            autoFocus: false,
            disableClose: false,
            data: {
                title: "Cancel Amendment",
                desc: "Are you sure want to cancel amendment?",
                icon: 'heroicons_outline:exclamation-triangle',
                color: 'warn',
                value1: {
                    required: true,
                    type: 'textarea',
                    label: 'Reason',
                },
                isForm: true
            },
            panelClass: 'app-refund-initiate',
        }).afterClosed().subscribe(res => {
            if (!res.status)
                return;

            this.amendmentRequestsService.amendmentCancel({ id: this.record.id, note: res.value1 }).subscribe({
                next: (data) => {
                    this.alertService.showToast('success', "Amendment canceled successfully!", "top-right", true);
                    this.amendmentInfoDrawer.close();
                    this.entityService.raiserefreshUpdateChargeCall(true);
                }, error: (err) => {
                    this.alertService.showToast("error", err);
                },
            })
        })

    }

    flightDetails() {
        Linq.recirect('/booking/flight/details/' + this.booking_id);
    }

    openAgent(id: string): void {
        Linq.recirect(Routes.customers.agent_entry_route + '/' + this.recordList.agent_info.agent_id + '/readonly')
    }


    updateCharge(): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.updateChargePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.amendmentInfoDrawer.close();
        this.entityService.raiseUpdateChargeCall({ data: this.record });
    }

    sendMail() {
        if (!Security.hasPermission(amendmentRequestsPermissions.sendMailToSupplierPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.conformationService.open({
            title: 'Send Mail',
            message: 'Do you want to resend the quotation request mail to a supplier?'
        }).afterClosed().subscribe({
            next: (res) => {
                if (res === 'confirmed') {
                    this.amendmentRequestsService.SendAmendmentEmailToSupplier(this.record.id).subscribe({
                        next: (value: any) => {
                            this.alertService.showToast('success', value.status, "top-right", true);
                        }, error: (err) => {
                            this.alertService.showToast('error', err, "top-right", true);
                        },
                    });
                }
            }
        })
    }
    getStatusColor(status: string): string {
        if (status == 'Refund Process' || status == 'Inprocess' || status == 'Account Audit') {
            return 'text-orange-600';
        } else if (status == 'Quotation Sent' || status == "Partial Payment Completed") {
            return 'text-yellow-600';
        } else if (status == 'Quotation Confirmed By TA' || status == 'Completed' || status == 'Confirm' || status == 'Quotation Confirmed') {
            return 'text-green-600';
        } else if (status == 'Request to Supplier Failed' || status == "Quotation Rejected By TA" || status == "Rejected" || status == "Cancelled" || status == "Account Rejected") {
            return 'text-red-600';
        } else if (status == 'Request Sent to Supplier' || status == "Confirmation Sent To Supplier" || status == "Payment Completed" || status == "Refund Completed") {
            return 'text-blue-600';
        } else {
            return '';
        }
    }

    inprocess(): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.confirmationSenttoSupplierPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.conformationService.open({
            title: 'Amendment Inprocess',
            message: `Kindly send confirmation mail to supplier before you set amendment to inprocess. Do you want to mark as inprocess?`,
            icon: { show: true, name: 'heroicons_outline:check-circle', color: 'primary', }
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.amendmentRequestsService.amendmentInprocess({ id: this.record.id }).subscribe({
                    next: (data) => {
                        this.alertService.showToast('success', "Amendment inprocessed!", "top-right", true);
                        this.amendmentInfoDrawer.close();
                        this.entityService.raiserefreshUpdateChargeCall(true);
                    }, error: (err) => {
                        this.alertService.showToast("error", err);
                    },
                })
            }
        })
    }

    refundInitiate(): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.refundInitiate_ConfirmedBySupplierPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(RefundInitiateComponent, {
            autoFocus: false,
            disableClose: false,
            data: {
                title: this.recordList.is_refundable ? "Amendment Refund Initiate" : "Amendment Confirmed by Supplier",
                desc: this.recordList.is_refundable ?
                    "Do you want to process refund for this amendment? By giving confirmation Travel agent will receive refund amount to back to source."
                    : "Do you want to process Confirmed by Supplier for this amendment? By giving confirmation, the Travel agent will receive a completion of this amendment.",
                document: this.recordList.confirmation_proof,
                document_title: 'Confirmation Proof',
                icon: 'heroicons_outline:check-circle',
                color: 'primary',
                remark: 'Please attach the supplier\'s mail screenshot.'
            },
            panelClass: 'app-refund-initiate',
        }).afterClosed().subscribe(res => {
            if (!res.status)
                return;

            this.amendmentRequestsService.amendmentRefundInitiate({ id: this.record.id, file: res.document }).subscribe({
                next: (data) => {
                    this.alertService.showToast('success', "Amendment refund initiated!", "top-right", true);
                    this.amendmentInfoDrawer.close();
                    this.entityService.raiserefreshUpdateChargeCall(true);
                }, error: (err) => {
                    this.alertService.showToast("error", err);
                },
            })
        })
    }


    AccountReject(): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.accountRejectPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(RefundInitiateComponent, {
            autoFocus: false,
            disableClose: false,
            data: {
                title: "Amendment Reject",
                desc: "Do you want to reject this amendment?",
                // document: this.recordList.rejection_proof,
                // document_title: 'Rejection Proof',
                icon: 'heroicons_outline:exclamation-triangle',
                color: 'warn',
                // remark: 'Please attach the supplier\'s mail screenshot.',
                value1: {
                    required: true,
                    type: 'textarea',
                    label: 'Reason',
                },
                isForm: true
            },
            panelClass: 'app-refund-initiate',
        }).afterClosed().subscribe(res => {
            if (!res.status)
                return;

            this.amendmentRequestsService.accountRejectAmendmentReq({ id: this.record.id, note: res.value1 }).subscribe({
                next: (data) => {
                    this.alertService.showToast('success', "Amendment rejected successfully!", "top-right", true);
                    this.amendmentInfoDrawer.close();
                    this.entityService.raiserefreshUpdateChargeCall(true);
                }, error: (err) => {
                    this.alertService.showToast("error", err);
                },
            })
        })
    }

    Reject(): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.rejectPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(RefundInitiateComponent, {
            autoFocus: false,
            disableClose: false,
            data: {
                title: "Amendment Reject",
                desc: "Do you want to reject this amendment?",
                document: this.recordList.rejection_proof,
                document_title: 'Rejection Proof',
                required_document: false,
                icon: 'heroicons_outline:exclamation-triangle',
                color: 'warn',
                remark: 'Please attach the supplier\'s mail screenshot.',
                value1: {
                    required: true,
                    type: 'textarea',
                    label: 'Reason',
                },
                isForm: true
            },
            panelClass: 'app-refund-initiate',
        }).afterClosed().subscribe(res => {
            if (!res.status)
                return;

            this.amendmentRequestsService.rejectAmendment({ id: this.record.id, file: res.document, reject_reason: res.value1 }).subscribe({
                next: (data) => {
                    this.alertService.showToast('success', "Amendment rejected successfully!", "top-right", true);
                    this.amendmentInfoDrawer.close();
                    this.entityService.raiserefreshUpdateChargeCall(true);
                }, error: (err) => {
                    this.alertService.showToast("error", err);
                },
            })
        })
    }

    complete(): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.accountCompletePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(RefundInitiateComponent, {
            autoFocus: false,
            disableClose: false,
            data: {
                title: "Amendment Complete",
                desc: "Are you sure to complete this amendment process?",
                icon: 'heroicons_outline:check-circle',
                color: 'primary',
                isForm: true,
                value1: {
                    required: true,
                    type: 'number',
                    label: this.recordList.is_refundable ? 'Supplier Refund Amount' : 'Supplier Charges',
                },
                isDateRequired: true,
            },
            panelClass: 'app-refund-initiate',
        }).afterClosed().subscribe(res => {
            if (!res.status)
                return;

            this.amendmentRequestsService.completeAmendment({ id: this.record.id, date: res.date, amount: Number(res.value1.toString()) }).subscribe({
                next: () => {
                    this.alertService.showToast('success', "Amendment completed!", "top-right", true);
                    this.amendmentInfoDrawer.close();
                    this.entityService.raiserefreshUpdateChargeCall(true);
                }, error: (err) => {
                    this.alertService.showToast("error", err);
                },
            })
        })
    }

    confirmation(): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.confirmByTAPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        if (this.recordList.is_refundable) {
            this.conformationService.open({
                title: "Confirm Amendment",
                message: 'Do you want to confirm amendment quotation on be half of Travel Agent?'
            }).afterClosed().subscribe(ress => {
                if (ress === 'confirmed') {
                    this.amendmentRequestsService.confirmAmendment({ id: this.record.id }).subscribe({
                        next: (res) => {
                            this.alertService.showToast('success', 'Amendment Confirmed!');
                            this.amendmentInfoDrawer.close();
                            this.entityService.raiserefreshUpdateChargeCall(true);
                        }, error: (err) => {
                            this.alertService.showToast('error', err)
                        }
                    });
                }
            })
        } else {
            this.matDialog.open(RefundInitiateComponent, {
                autoFocus: false,
                disableClose: false,
                data: {
                    title: "Amendment Confirm By TA",
                    desc: "Do you want to process Confirm By TA for this amendment? By giving confirmation, Agent's wallet will deducted as per amendment price.",
                    icon: 'heroicons_outline:check-circle',
                    color: 'primary',
                    balance: {
                        wallet_Balance: this.recordList.agent_info.walletBalance,
                        credit_Balance: this.recordList.agent_info.creaditbalance,
                        purchase_Price: this.recordList.charges?.charge || 0.00,
                        currency_symbol: this.recordList.currency_symbol,
                    }
                },
                panelClass: 'app-refund-initiate',
            }).afterClosed().subscribe(res => {
                if (!res.status)
                    return;

                this.isLoading = true;
                const json = {
                    amendment_id: this.record.id,
                    payment_method: "Wallet",
                    payment_mode: "Wallet"
                }
                this.amendmentRequestsService.amendmentChargesDeduction(json).subscribe({
                    next: (res) => {
                        if (res) {
                            this.alertService.showToast('success', 'Amendment Confirmed!');
                            this.amendmentInfoDrawer.close();
                            this.entityService.raiserefreshUpdateChargeCall(true);
                        }
                        this.isLoading = false;
                    }, error: (err) => {
                        this.alertService.showToast('error', err);
                        this.isLoading = false;
                    }
                });
            })
        }
    }

    invoice(id: string, name: string): void {
        this.amendmentRequestsService.printInvoice(id).subscribe({
            next: (res) => {
                CommonUtils.downloadPdf(res?.data, name + '.pdf');
            }, error: (err) => {
                this.alertService.showToast('error', err);
            }
        })
    }
}