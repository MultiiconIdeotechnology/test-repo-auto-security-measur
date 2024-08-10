import { ToasterService } from './../../../../services/toaster.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { NgIf, NgFor, DatePipe, CommonModule, NgClass } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterOutlet } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AppConfig } from 'app/config/app-config';
import { BaseListingComponent } from 'app/form-models/base-listing';
import {
    Security,
    messages,
    module_name,
    receiptPermissions,
} from 'app/security';
import { AccountService } from 'app/services/account.service';
import { Excel } from 'app/utils/export/excel';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PaymentFilterComponent } from '../payment-filter/payment-filter.component';
import { PaymentInfoComponent } from '../payment-list/payment-info/payment-info.component';
import { TimelineAgentProductInfoComponent } from 'app/modules/crm/timeline/product-info/product-info.component';
import { Linq } from 'app/utils/linq';
import { Routes } from 'app/common/const';
import { SubAgentInfoComponent } from 'app/modules/masters/agent/sub-agent-info/sub-agent-info.component';
import { RejectReasonComponent } from 'app/modules/masters/agent/reject-reason/reject-reason.component';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { Observable } from 'rxjs';
import { CommonUtils } from 'app/utils/commonutils';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AgentProductInfoComponent } from 'app/modules/crm/agent/product-info/product-info.component';
import { AgentService } from 'app/services/agent.service';

@Component({
    selector: 'app-receipt-list',
    templateUrl: './receipt-list.component.html',
    styles: [
        `
            .tbl-grid {
                grid-template-columns: 40px 65px 107px 240px 95px 150px 220px 90px 90px 80px 75px 170px 170px 360px 120px 220px;
            }
        `,
    ],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatInputModule,
        MatButtonModule,
        MatTooltipModule,
        NgClass,
        RouterOutlet,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        NgxMatSelectSearchModule,
        MatTabsModule,
        PrimeNgImportsModule
    ],
})
export class ReceiptListComponent
    extends BaseListingComponent
    implements OnDestroy {
    module_name = module_name.receipts;
    isLoading = false;
    flashMessage: 'success' | 'error' | null = null;
    dataList = [];
    infoList = [];
    total = 0;
    public Filter: any;
    public key: any = 'payment_request_date';
    appConfig = AppConfig;
    settings: any;
    currentFilter: any;
    isFilterShow: boolean = false;

    constructor(
        private accountService: AccountService,
        private confirmService: FuseConfirmationService,
        private agentService: AgentService,
        private router: Router,
        private clipboard: Clipboard,
        private matDialog: MatDialog,
        private conformationService: FuseConfirmationService,
        private toasterService: ToasterService,
        private kycdocService: KycDocumentService
    ) {
        super(module_name.receipts);

        this.key = 'receipt_request_date';
        this.sortColumn = 'receipt_request_date';
        this.sortDirection = 'desc';
        this.Mainmodule = this;

        this.currentFilter = {
            status: 'All',
            payment_gateway: 'All',
            fromDate: new Date(),
            toDate: new Date(),
        };
        this.currentFilter.fromDate.setDate(1);
        this.currentFilter.fromDate.setMonth(
            this.currentFilter.fromDate.getMonth()
        );
    }

    selectedAgent:string;
    agentList: any[] = [];
    columns = [
        {
            key: 'index',
            name: 'Invoice',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: 'header-right-view',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            isicon: true,
            is_fixed: true
        },
        { key: 'payment_attachment', name: 'Attachments', is_date: false, date_formate: '', is_sortable: false, class: 'justify-center', is_sticky: true, indicator: false, is_boolean: false, tooltip: true, isicon: false, is_fixed2: true, indicator1: true },
        { key: 'receipt_ref_no', name: 'Reference No.', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: true, indicator: true, is_boolean: false, tooltip: true, isicon: false, is_fixed3: true },
        { key: 'receipt_status', name: 'Status', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true, iscolor: true, isicon: false },
        // {
        //     key: 'receipt_ref_no',
        //     name: 'Reference No.',
        //     is_date: false,
        //     date_formate: '',
        //     is_sortable: true,
        //     class: '',
        //     is_sticky: true,
        //     indicator: true,
        //     is_boolean: false,
        //     tooltip: false,
        //     isicon: false,
        // },
        // {
        //     key: 'receipt_status',
        //     name: 'Status',
        //     is_date: false,
        //     date_formate: '',
        //     is_sortable: true,
        //     class: '',
        //     is_sticky: false,
        //     indicator: false,
        //     is_boolean: false,
        //     tooltip: false,
        //     iscolor: true,
        //     isicon: false,
        // },
        {
            key: 'service_for',
            name: 'Receipt For',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            indicator: false,
            is_boolean: false,
            tooltip: false,
            isicon: false,
        },
        {
            key: 'transaction_ref_no',
            name: 'Booking Ref. No',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: true,
            indicator: false,
            is_boolean: false,
            tooltip: false,
            isicon: false,
            toBooking: true,
        },
        {
            key: 'payment_currency',
            name: 'Currency',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: true,
            indicator: false,
            is_boolean: false,
            tooltip: false,
            isicon: false,
        },
        {
            key: 'payment_amount',
            name: 'Amount',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            indicator: false,
            is_boolean: false,
            tooltip: false,
            isicon: false,
        },
        {
            key: 'roe',
            name: 'ROE',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            indicator: false,
            is_boolean: false,
            tooltip: false,
            isicon: false,
        },
        {
            key: 'mode_of_payment',
            name: 'MOP',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            indicator: false,
            is_boolean: false,
            tooltip: false,
            isicon: false,
        },
        {
            key: 'receipt_request_date',
            name: 'Request',
            is_date: true,
            date_formate: 'dd-MM-yyyy HH:mm:ss',
            is_sortable: true,
            class: '',
            is_sticky: false,
            indicator: false,
            is_boolean: false,
            tooltip: false,
            isicon: false,
        },
        {
            key: 'audit_date_time',
            name: 'Audit',
            is_date: true,
            date_formate: 'dd-MM-yyyy HH:mm:ss',
            is_sortable: true,
            class: '',
            is_sticky: false,
            indicator: false,
            is_boolean: false,
            tooltip: false,
            isicon: false,
        },
        {
            key: 'agent_name',
            name: 'Agent',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            indicator: false,
            is_boolean: false,
            tooltip: true,
            isicon: false,
            toAgent: true,
        },
        {
            key: 'pg_name',
            name: 'PG',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            indicator: false,
            is_boolean: false,
            tooltip: false,
            isicon: false,
        },
        {
            key: 'pg_payment_ref_no',
            name: 'PG Ref.No.',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            indicator: false,
            is_boolean: false,
            tooltip: false,
            isicon: false,
        },
    ];
    cols = [];
    selectedStatus: string;

    statusList: any[] = [
        { label: 'Confirmed', value: 'Confirmed' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Rejected', value: 'Rejected' },
    ];

    ngOnInit(): void {
        this.getAgent('');
    }

    // function to get the Agent list from api
    getAgent(value: string) {
        this.agentService.getAgentCombo(value).subscribe((data) => {
            this.agentList = data;

            for (let i in this.agentList) {
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}${this.agentList[i].email_address}`
            }
        })
    }

    getFilter(): any {
        let filterReq = {};
        // const filterReq = GridUtils.GetFilterReq(
        //     this._paginator,
        //     this._sort,
        //     this.searchInputControl.value
        // );
        // const filter = this.currentFilter;
        // filterReq['status'] = this.currentFilter.status;
        // filterReq['payment_gateway'] = 'All';
        // filterReq['fromDate'] = DateTime.fromJSDate(
        //     this.currentFilter.fromDate
        // ).toFormat('yyyy-MM-dd');
        // filterReq['toDate'] = DateTime.fromJSDate(
        //     this.currentFilter.toDate
        // ).toFormat('yyyy-MM-dd');
        return filterReq;
    }

    filter(): void {
        this.matDialog
            .open(PaymentFilterComponent, {
                data: { data: this.currentFilter, name: 'Receipt filter' },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.currentFilter = res;
                    this.refreshItems();
                }
            });
    }

    AuditUnaudit(record): void {
        if (
            !Security.hasPermission(receiptPermissions.auditUnauditPermissions)
        ) {
            return this.alertService.showToast(
                'error',
                messages.permissionDenied
            );
        }

        const label: string = record.is_audited
            ? 'Unaudit Receipt'
            : 'Audit Receipt';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.agent_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.accountService.setAuditUnaudit(record.id).subscribe({
                        next: () => {
                            record.is_audited = !record.is_audited;
                            if (record.is_audited) {
                                this.alertService.showToast(
                                    'success',
                                    'Receipt has been Audited!',
                                    'top-right',
                                    true
                                );
                                this.refreshItems();
                            } else {
                                this.alertService.showToast(
                                    'success',
                                    'Receipt has been Unaudited!',
                                    'top-right',
                                    true
                                );
                            }
                        },
                        error: (err) => {
                            this.toasterService.showToast('error', err);
                            this.isLoading = false;
                        },
                    });
                }
            });
    }

    Reject(record: any): void {
        if (!Security.hasPermission(receiptPermissions.rejectPermissions)) {
            return this.alertService.showToast(
                'error',
                messages.permissionDenied
            );
        }

        this.matDialog
            .open(RejectReasonComponent, {
                disableClose: true,
                data: record,
                panelClass: 'full-dialog',
            })
            .afterClosed()
            .subscribe({
                next: (res) => {
                    if (res) {
                        this.accountService.reject(record.id, res).subscribe({
                            next: () => {
                                this.alertService.showToast(
                                    'success',
                                    'Receipt Rejected',
                                    'top-right',
                                    true
                                );
                                this.refreshItems();
                            },
                            error: (err) =>
                                this.alertService.showToast(
                                    'error',
                                    err,
                                    'top-right',
                                    true
                                ),
                        });
                    }
                },
            });
    }

    product(record): void {
        this.matDialog.open(TimelineAgentProductInfoComponent, {
            data: {
                data: record,
                agencyName: record?.agent_name,
                readonly: true,
                account_receipt: true,
            },
            disableClose: true,
        });
    }

    viewInternal(data: any): void {
        this.matDialog.open(PaymentInfoComponent, {
            disableClose: true,
            data: { receipt: data.id },
        });
    }

    getStatusIndicatorClass(status: string): string {
        if (status == 'Pending') {
            return 'bg-yellow-600';
        } else if (status == 'Audited') {
            return 'bg-green-600';
        } else if (status == 'Rejected') {
            return 'bg-red-600';
        } else if (status == 'Confirmed') {
            return 'bg-green-600';
        } else {
            return 'bg-blue-600';
        }
    }

    viewData(record): void {
        // if (!Security.hasViewDetailPermission(module_name.bookingsFlight)) {
        //     return this.alertService.showToast(
        //         'error',
        //         messages.permissionDenied
        //     );
        // }

        if (record?.transaction_ref_no?.substring(0, 3) == 'FLT') {
            Linq.recirect('/booking/flight/details/' + record.product_id);
        }
        else if (record?.transaction_ref_no?.substring(0, 3) == 'VIS') {
            Linq.recirect('/booking/visa/details/' + record.product_id);
        }
        else if (record?.transaction_ref_no?.substring(0, 3) == 'BUS') {
            Linq.recirect('/booking/bus/details/' + record.product_id);
        }
        else if (record?.transaction_ref_no?.substring(0, 3) == 'HTL') {
            Linq.recirect('/booking/hotel/details/' + record.product_id);
        }
        else if (record?.transaction_ref_no?.substring(0, 3) == 'AGI') {
            Linq.recirect('/booking/group-inquiry/details/' + record.product_id);
        }
        else if (record?.service_for == 'Product Purchase') {
            this.matDialog.open(AgentProductInfoComponent, {
                data: {
                    data: record,
                    agencyName: record?.agent_name,
                    readonly: true,
                    account_receipt: true,
                },
                disableClose: true,
            });
        }
        else if (record?.transaction_ref_no?.substring(0, 3) == 'OSB') {
            Linq.recirect('/booking/offline-service/entry/' + record.product_id + '/readonly');
        }

    }

    viewAgentData(data): void {
        // this.router.navigate([Routes.customers.agent_entry_route + '/' + data.receiptfromid + '/readonly'])
        // const url = this.router.serializeUrl(this.router.createUrlTree([`${Routes.customers.agent_entry_route}/${data.receiptfromid}/readonly`]));
        // window.open(url, '_blank');

        Linq.recirect([Routes.customers.agent_entry_route + '/' + data.receipt_to_id + '/readonly']);

        // if (data.is_master_agent == true) {
        //     this.router.navigate([
        //         Routes.customers.agent_entry_route +
        //         '/' +
        //         data.agent_id +
        //         '/readonly',
        //     ]);
        // } else {
        //     this.matDialog.open(SubAgentInfoComponent, {
        //         data: { data: data, readonly: true, id: data.agent_id },
        //         disableClose: true,
        //     });
        // }
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        let extraModel = this.getFilter();
        let newModel = this.getNewFilterReq(event);
        let model = { ...extraModel, ...newModel }
        this.accountService.getReceiptList(model).subscribe({
            next: (data) => {
                this.dataList = data.data;
                // this.total = data.total;
                this.totalRecords = data.total;
                this.isLoading = false;
                if (this.dataList && this.dataList.length) {
                    setTimeout(() => {
                        this.isFrozenColumn('', ['index', 'payment_attachment','receipt_ref_no']);
                    }, 200);
                }
            },
            error: (err) => {
                this.alertService.showToast('error', err);
                this.isLoading = false;
            },
        });
    }

    public show: boolean = false;
    public buttonName: any = 'Show';

    info(data: any): void {
        // only one show tab
        // if(!data.show)
        // this.dataList.forEach(x => x.show = false)

        data.show = !data.show;
        this.infoList = [data];

        // Change the name of the button.
        if (this.show) this.buttonName = 'Hide';
        else this.buttonName = 'Show';
    }

    copyLink(link: string): void {
        this.clipboard.copy(link);
        this.alertService.showToast('success', 'Copied');
    }

    exportExcel(): void {
        if (!Security.hasExportDataPermission(this.module_name)) {
            return this.alertService.showToast(
                'error',
                messages.permissionDenied
            );
        }

        // const filterReq = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value);
        // const req = Object.assign(filterReq);
        // const req = this.getFilter();
        // req.Skip = 0;
        // req.Take = this._paginator.length;
        const filterReq = this.getNewFilterReq({});

        filterReq['Filter'] = this.searchInputControl.value;
        // filterReq['status'] = this.currentFilter.status;
        // filterReq['fromDate'] = DateTime.fromJSDate(
        //     this.currentFilter.fromDate
        // ).toFormat('yyyy-MM-dd');
        // filterReq['toDate'] = DateTime.fromJSDate(
        //     this.currentFilter.toDate
        // ).toFormat('yyyy-MM-dd');
        // filterReq['payment_gateway'] = 'All';
        filterReq['Take'] = this.totalRecords;

        this.accountService.getReceiptList(filterReq).subscribe((data) => {
            for (var dt of data.data) {
                dt.receipt_request_date = DateTime.fromISO(dt.receipt_request_date).toFormat('dd-MM-yyyy hh:mm a');
                dt.audit_date_time = DateTime.fromISO(dt.audit_date_time).toFormat('dd-MM-yyyy hh:mm a');
                dt.agent_name = dt.agent_Code + ' ' + dt.agent_name;
                // dt.payment_amount = dt.payment_amount + ' ' + dt.payment_currency
            }
            ['receipt_ref_no', 'receipt_status', 'service_for', 'transaction_ref_no', 'payment_currency', 'payment_amount', 'roe', 'mode_of_payment', 'receipt_request_date', 'audit_date_time', 'agent_name', 'pg_name', 'pg_payment_ref_no']
            Excel.export(
                'Receipt',
                [
                    { header: 'Reference No.', property: 'receipt_ref_no' },
                    { header: 'Status', property: 'receipt_status' },
                    { header: 'Receipt For', property: 'service_for' },
                    { header: 'Booking Ref. No', property: 'transaction_ref_no' },
                    { header: 'Currency', property: 'payment_currency' },
                    { header: 'Amount', property: 'payment_amount' },
                    { header: 'ROE', property: 'roe' },
                    { header: 'MOP', property: 'mode_of_payment' },
                    { header: 'Request', property: 'receipt_request_date' },
                    { header: 'Audit', property: 'audit_date_time' },
                    { header: 'Agent', property: 'agent_name' },
                    { header: 'PG', property: 'pg_name' },
                    { header: 'PG Ref.No.', property: 'pg_payment_ref_no' },
                ],
                data.data,
                'Receipt',
                [{ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }]
            );
        });
    }

    getNodataText(): string {
        if (this.isLoading) return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    downloadProoffile(data: any) {
        window.open(data, '_blank')
    }

    downloadPaymentfile(data: any) {
        window.open(data, '_blank')
    }

    downloadInvoice(bookingId: any) {
        // this.accountService.downloadInvoice(bookingId).subscribe({
        //     next: (res) => {
        //         window.open(res?.data, '_blank')
        //         this.alertService.showToast(
        //             'success',
        //             'Receipt Downloaded Successfully!',
        //             'top-right',
        //             true
        //         );
        //     },
        //     error: (err) =>
        //         this.alertService.showToast(
        //             'error', err, 'top-right', true
        //         ),
        // });

        this.accountService.downloadInvoice(bookingId).subscribe({
            next: (res) => {
                CommonUtils.downloadPdf(res.data, 'Receipt.pdf');
            }, error: (err) => {
                this.alertService.showToast('error', err);
            }
        })
    }
}
