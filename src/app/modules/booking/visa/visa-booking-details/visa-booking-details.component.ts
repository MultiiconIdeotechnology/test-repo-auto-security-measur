import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { NgIf, NgFor, DatePipe, AsyncPipe, NgClass, JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Routes, visaStatus } from 'app/common/const';
import { SubAgentInfoComponent } from 'app/modules/masters/agent/sub-agent-info/sub-agent-info.component';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { VisaService } from 'app/services/visa.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSliderModule } from '@angular/material/slider';
import { SuccessDocumentDialogComponent } from './success-document-dialog/success-document-dialog.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { PaxInfoComponent } from './pax-info/pax-info.component';
import { DocumentKycComponent } from './document-kyc/document-kyc.component';
import { AccountDetailsComponent } from './account-details/account-details.component';
import { CompactLayoutComponent } from 'app/layout/layouts/vertical/compact/compact.component';
import { Security, bookingsVisaPermissions, messages } from 'app/security';
import { CommonUtils } from 'app/utils/commonutils';
import { Linq } from 'app/utils/linq';
import { FlightTabService } from 'app/services/flight-tab.service';
import { MatRippleModule } from '@angular/material/core';
import { VisaPriceChangeDialogComponent } from './visa-price-change-dialog/visa-price-change-dialog.component';

@Component({
    selector: 'app-visa-booking-details',
    templateUrl: './visa-booking-details.component.html',
    styleUrls: ['./visa-booking-details.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        AsyncPipe,
        RouterModule,
        ReactiveFormsModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatSelectModule,
        MatDatepickerModule,
        MatTooltipModule,
        MatMenuModule,
        MatSlideToggleModule,
        NgxMatTimepickerModule,
        NgxMatSelectSearchModule,
        NgClass,
        ClipboardModule,
        MatTableModule,
        MatSliderModule,
        JsonPipe,
        MatRippleModule,
        AccountDetailsComponent
    ]
})
export class VisaBookingDetailsComponent {
    mainData: any;
    column: string[] = ['action', 'name', 'status', 'date_of_birth', 'gender_type', 'passport_number', 'passport_valid_till', 'document', 'print'];
    travellers = new MatTableDataSource();

    segmentList: any[] = [];
    travellerDataList: any[] = [];
    baggageDataList: any[] = [];
    Status: any;
    priceDetails: any[] = [];
    Id: any;
    bookingDetail: any;
    accountDatail: any;
    printBase64URL: any;
    isRefundBtnShow: boolean = false;


    bookingBy: any;
    paymentBy: any;
    mainDataAll: any;

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        private clipboard: Clipboard,
        private toastr: ToasterService,
        private classy: CompactLayoutComponent,
        private flighttabService: FlightTabService,
        private matDialog: MatDialog,
        private visaService: VisaService,
        private conformationService: FuseConfirmationService,
    ) {

    }
    visaRoute = Routes.booking.visa_route;
    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.Id = params.get('id');
            if (!this.Id) {
                return;
            }
            this.getVisaBookingRecord()
        })
        this.classy.toggleNavigation('mainNavigation');
    }

    view(data: any): void {
        this.matDialog.open(PaxInfoComponent, {
            disableClose: true,
            data: data
        });
    }

    generatanble(): boolean {
        const status: string[] = [visaStatus.Applied, visaStatus.Success, visaStatus.Rejected];
        return status.includes(this.bookingDetail.status);
    }

    generateInvoice(): void {
        const visa_booking_id = this.bookingDetail.visa_booking_id;
        this.visaService.GenerateInvoice(visa_booking_id).subscribe({
            next: (res) => {
                this.toastr.showToast('success', 'Invoice Generated');
                this.getVisaBookingRecord();
            }, error: (err) => {
                this.toastr.showToast('error', err);
            }
        })
    }

    printInvoice(): void {
        const invoice_id = this.bookingDetail.invoice_id;
        this.visaService.printInvoice(invoice_id).subscribe({
            next: (res) => {
                CommonUtils.downloadPdf(res.print, this.mainDataAll.invoice_no + '.pdf');
            }, error: (err) => {
                this.toastr.showToast('error', err);
            }
        })
    }

    startProcess() {
        if (!Security.hasPermission(bookingsVisaPermissions.startProcessPermissions)) {
            return this.toastr.showToast('error', messages.permissionDenied);
        }

        this.conformationService.open({
            title: 'Start Process',
            message: 'Are you sure to start process of visa ' + this.bookingDetail.booking_ref_no + ' ?'
        }).afterClosed().subscribe((res) => {
            if (res === 'confirmed') {
                this.visaService.visaStartProcess(this.Id).subscribe({
                    next: res => {
                        if (res) {
                            this.toastr.showToast('success', 'Start Process Successfully!');
                            this.getVisaBookingRecord();
                        }
                    }, error: err => {
                        this.toastr.showToast('error', err)
                    }
                })
            }
        });
    }

    onVisaRejectRefund() {
        if (!Security.hasPermission(bookingsVisaPermissions.refundPermission)) {
            return this.toastr.showToast('error', messages.permissionDenied);
        }

        this.conformationService.open({
            title: 'Refund Visa Application.',
            message: `Are you sure want to refund this visa application?`,
            actions: {
                confirm: {
                    show: true,
                    label: 'Yes, Refund',
                    color: 'primary',
                },
                cancel: {
                    show: true,
                    label: 'Cancel',
                },
            },
        })
            .afterClosed().subscribe((res) => {
                if (res === 'confirmed') {
                    this.visaService.visaamendmentRefund(this.Id).subscribe({
                        next: (res) => {
                            if (res && res['status']) {
                                this.toastr.showToast('success', 'Visa application refunded successfully');
                                this.getVisaBookingRecord();
                            }
                        },
                        error: (err) => {
                            this.toastr.showToast('error', err, 'top-right', true);
                        },

                    })
                }
            })
    }

    refund() {
        const label: string = 'Refund';
        this.conformationService
            .open({
                title: label,
                message: 'Are you sure want to ' + label.toLowerCase() + ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    const json = {
                        id: this.Id,
                        service: 'Visa'
                    }
                    this.flighttabService.visaAmendment(json).subscribe({
                        next: (res: any) => {
                            this.toastr.showToast('success', 'Refund is initiated!', 'top-right', true);
                            this.getVisaBookingRecord();
                        },
                        error: (err) => {
                            this.toastr.showToast('error', err, 'top-right', true);
                        },
                    });
                }
            });
    }

    getVisaBookingRecord() {
        this.visaService.getVisaBookingRecord(this.Id).subscribe({
            next: (res: any) => {
                this.bookingDetail = res;
                this.mainDataAll = res;
                this.accountDatail = res.account;
                this.bookingBy = res.bookingByInfo;
                this.mainDataAll = res;
                this.paymentBy = res.paymentByInfo;
                this.priceDetails = this.bookingDetail?.priceDetail
                this.priceDetails = Linq.groupBy(this.priceDetails, x => x.box)

                //   this.accountDatail = res.account;
                this.travellerDataList = res?.travellers;
                this.travellers = res?.travellers;
                this.isRefundBtnShow = res?.travellers?.some(x => !x.is_refunded && x.status?.toLowerCase() == "documents rejected");
            }, error: err => {
                this.toastr.showToast('error', err)
            }
        })
    }

    getColor(dataRecord: string): string {
        if (dataRecord === 'Pending' || dataRecord === 'Refunded')
            return 'bg-yellow-500';
        else if (dataRecord === 'Payment Confirmed' || dataRecord === 'Success')
            return 'bg-green-500';
        else if (dataRecord === 'Payment Failed' || dataRecord === 'Documents Rejected' || dataRecord === 'Rejected')
            return 'bg-red-500';
        else if (dataRecord === 'Inprocess' || dataRecord === 'Documents Revised' || dataRecord === 'Applied')
            return 'bg-blue-500';
        else
            return '';
    }

    close() {
        this.router.navigate([this.visaRoute])
    }

    showDoc(val): void {
        if (!Security.hasPermission(bookingsVisaPermissions.viewDocumentsPermissions)) {
            return this.toastr.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(DocumentKycComponent, {
            data: val,
            disableClose: true
        }).afterClosed().subscribe(res => {
            if (res)
                this.getVisaBookingRecord();
        })
    }

    agentInfo(data): void {
        if (data.is_master_agent == true) {
            // this.router.navigate([Routes.customers.agent_entry_route + '/' + data.agent_id + '/readonly'])
            Linq.recirect([Routes.customers.agent_entry_route + '/' + data.agent_id + '/readonly'])
        }
        else {
            this.matDialog.open(SubAgentInfoComponent, {
                data: { data: data, readonly: true, id: data.agent_id },
                disableClose: true
            })
        }
    }

    copyLink(link: string): void {
        this.clipboard.copy(link);
        this.toastr.showToast('success', 'Copied');
    }

    appliedAction(record) {
        if (!Security.hasPermission(bookingsVisaPermissions.applyForVisaPermissions)) {
            return this.toastr.showToast('error', messages.permissionDenied);
        }

        if (this.bookingDetail.status == 'Payment Confirmed') {
            return this.toastr.showToast('error', "Please ensure to start process before taking any action.");;
        }

        this.conformationService.open({
            title: 'Visa Applied',
            message: 'Are you sure visa applied for ' + record?.first_name.toLowerCase() + ' ' + record?.last_name.toLowerCase() + ' ?'
        }).afterClosed().subscribe((res) => {
            if (res === 'confirmed') {
                this.visaService.visaApplied(record.id).subscribe({
                    next: res => {
                        if (res) {
                            this.toastr.showToast('success', 'Visa Applied Successfully!');
                            this.getVisaBookingRecord();
                        }
                    }, error: err => {
                        this.toastr.showToast('error', err)
                    }
                })
            }
        });
    }

    successAction(record) {
        if (!Security.hasPermission(bookingsVisaPermissions.successVisaPermissions)) {
            return this.toastr.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(SuccessDocumentDialogComponent, {
            data: record,
            disableClose: true
        })
            .afterClosed().subscribe({
                next: (res) => {
                    if (res) {
                        this.visaService.visaSuccess(record.id, res).subscribe({
                            next: res => {
                                if (res) {
                                    this.printBase64URL = res?.url
                                    this.toastr.showToast('success', 'Visa Success!');
                                    this.getVisaBookingRecord()
                                }
                            }, error: err => {
                                this.toastr.showToast('error', err);
                            }
                        })
                    }
                }
            });
    }

    checkStatus() {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            const label: string = 'Check Status';
            this.conformationService
                .open({
                    title: label,
                    message: 'Are you sure want to ' + label.toLowerCase() + ' ?',
                })
                .afterClosed()
                .subscribe((res) => {
                    if (res === 'confirmed') {
                        const json = {
                            id: id,
                            service: 'Visa'
                        }
                        this.flighttabService.checkPaymentStatus(json).subscribe({
                            next: (res: any) => {
                                this.toastr.showToast('success', res.status, 'top-right', true);
                            },
                            error: (err) => {
                                this.toastr.showToast('error', err, 'top-right', true);

                            },
                        });
                    }
                });
        })
    }

    rejectAction(record) {
        if (!Security.hasPermission(bookingsVisaPermissions.rejectVisaPermissions)) {
            return this.toastr.showToast('error', messages.permissionDenied);
        }

        this.conformationService.open({
            title: 'Reject Visa',
            message: 'Are you sure to Reject Visa of ' + record?.first_name.toLowerCase() + ' ' + record?.last_name.toLowerCase() + ' ?'
        }).afterClosed().subscribe((res) => {
            if (res === 'confirmed') {
                this.visaService.visaReject(record.id).subscribe({
                    next: res => {
                        if (res) {
                            this.toastr.showToast('success', 'Visa Reject Successfully!');
                            this.getVisaBookingRecord();
                        }
                    }, error: err => {
                        this.toastr.showToast('error', err)
                    }
                })
            }
        });
    }

    priceChange() {
        console.log("mainDataAll", this.mainDataAll)
        this.matDialog
            .open(VisaPriceChangeDialogComponent, {
                data: null,
                disableClose: true, 
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) { }
            });
    }
}
