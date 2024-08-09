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
    agentInfoList: any[] = [];
    paymentInfoList: any[] = [];
    amendmentInfoList: any[] = [];
    paxInfoList: any;
    b2bchargesList: any[] = [];
    chargesList: any[] = [];
    booking_id: any
    recordList: any;
    titleCharge: any;
    title = "Amendment Request Info"
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public alertService: ToasterService,
        public amendmentRequestsService: AmendmentRequestsService,
        private entityService: EntityService,
        private conformationService: FuseConfirmationService,
    ) {
        this.entityService.onAmendmentInfoCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                this.record = item?.data ?? {}
                this.getData();
                this.amendmentInfoDrawer.toggle();
            }
        });
    }

    ngOnInit(): void {

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
                            { name: 'Refund Amount', value: data.paymentbyInfo?.refund_amount },
                            { name: 'Refund Date', value: data.paymentbyInfo?.refund_datetime ? DateTime.fromISO(data.paymentbyInfo.refund_datetime).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
                            { name: 'Refund Reason', value: data.paymentbyInfo?.refund_reason || '-' },
                            { name: 'Refund Status', value: data.paymentbyInfo?.refund_status || '-' },
                        ];
                        this.amendmentInfoList = [
                            { name: 'Type', value: data.amendment_info.type, classes: '' },
                            { name: 'Supplier', value: data.amendment_info.supplier, classes: '' },
                            {
                                name: 'Status', value: data.amendment_info?.status_for_agent,
                                classes: this.getStatusColorForAgent(data.amendment_info?.status_for_agent)
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
                        let name1;
                        let name2;
                        if (this.recordList.is_refundable) {
                            name1 = 'Per Person Refund'
                            name2 = 'Total Refund'
                            this.titleCharge = 'Refund'
                        } else {
                            name1 = 'Per Person Charge'
                            name2 = 'Charge'
                            this.titleCharge = 'Charge'

                        }
                        this.b2bchargesList = [
                            { name: name1, value: data.b2bcharges.per_person_charge },
                            { name: name2, value: data.b2bcharges.charge },
                        ];
                        this.chargesList = [
                            { name: name1, value: data.charges.per_person_charge },
                            { name: name2, value: data.charges.charge },
                        ];
                        if (this.recordList.is_refundable) {
                            this.chargesList.unshift({ name: 'Cancellation Charge', value: data.charges.cancellation_charge })
                        }

                    }
                }, error: (err) => {
                    this.alertService.showToast('error', err)

                },

            });
        }
    }

    flightDetails() {
        // if (!Security.hasViewDetailPermission(module_name.bookingsFlight)) {
        //   return this.alertService.showToast('error', messages.permissionDenied);
        // }
        Linq.recirect('/booking/flight/details/' + this.booking_id);
    }

    openAgent(id: string): void {
        Linq.recirect(Routes.customers.agent_entry_route + '/' + this.recordList.agent_info.agent_id + '/readonly')
    }


    updateCharge(): void {
        // this.matDialogRef.close();
        this.amendmentInfoDrawer.close();
        this.entityService.raiseUpdateChargeCall({ data: this.record });

        // this.matDialog.open(UpdateChargeComponent, {
        //     data: this.record,
        //     disableClose: true
        // }).afterClosed().subscribe(res => {
        //     if (res) {
        //         this.alertService.showToast('success', "Charge has been Updated!", "top-right", true);
        //     }
        // })
    }

    sendMail() {
        this.conformationService.open({
            title: 'Send Mail',
            message: 'Are you sure want to Send Mail To Supplier ?'
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

    getStatusColorForAgent(status: string): string {
        if (status == 'Request Sent' || status == 'Inprocess') {
            return 'text-orange-600';
        } else if (status == 'Partial Payment Completed') {
            return 'text-yellow-600';
        } else if (status == 'Quotation Confirmed' || status == 'Completed') {
            return 'text-green-600';
        } else if (status == 'Quotation Rejected' || status == 'Rejected' || status == 'Cancelled') {
            return 'text-red-600';
        } else if (status == 'Quotation Received' || status == 'Payment Completed' || status == 'Refund Initiated') {
            return 'text-blue-600';
        } else {
            return '';
        }
    }

    inprocess(): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.inprocessPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.conformationService.open({
            title: 'Amendment Inprocess',
            message: 'Are you sure to inprocess this amendment process?',
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
        if (!Security.hasPermission(amendmentRequestsPermissions.refundInitiatePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.conformationService.open({
            title: 'Amendment Refund Initiate',
            message: 'Are you sure to refund initiate this amendment process?',
            icon: { show: true, name: 'heroicons_outline:check-circle', color: 'primary', }
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.amendmentRequestsService.amendmentRefundInitiate({ id: this.record.id }).subscribe({
                    next: (data) => {
                        this.alertService.showToast('success', "Amendment refund initiated!", "top-right", true);
                        this.amendmentInfoDrawer.close();
                        this.entityService.raiserefreshUpdateChargeCall(true);
                    }, error: (err) => {
                        this.alertService.showToast("error", err);
                    },
                })
            }
        })
    }

    complete(): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.completePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.conformationService.open({
            title: 'Amendment Complete',
            message: 'Are you sure to complete this amendment process?',
            icon: { show: true, name: 'heroicons_outline:check-circle', color: 'primary', }
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.amendmentRequestsService.completeAmendment(this.record.id).subscribe({
                    next: () => {
                        this.alertService.showToast('success', "Amendment completed!", "top-right", true);
                        this.amendmentInfoDrawer.close();
                        this.entityService.raiserefreshUpdateChargeCall(true);
                    }, error: (err) => {
                        this.alertService.showToast("error", err);
                    },
                })
            }
        })
    }

    confirmation(): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.confirmPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.conformationService.open({
            title: "Confirm Amendment",
            message: 'Are you sure want to confirm amendment by TA?'
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
                })
            }
        })
    }
}
