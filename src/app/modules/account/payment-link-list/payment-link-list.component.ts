import { Clipboard } from '@angular/cdk/clipboard';
import { NgIf, NgFor, DatePipe, CommonModule, NgClass } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
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
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { Security, messages, module_name } from 'app/security';
import { AccountService } from 'app/services/account.service';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { EntityService } from 'app/services/entity.service';
import { PaymentLinkComponent } from "./payment-link-entry/payment-link-entry.component";
import { AgentService } from 'app/services/agent.service';
import { takeUntil } from 'rxjs';

@Component({
    selector: 'app-payment-link-list',
    templateUrl: './payment-link-list.component.html',
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
        PrimeNgImportsModule,
        PaymentLinkComponent
    ],
})

export class PaymentLinkListComponent extends BaseListingComponent implements OnDestroy {
    module_name = module_name.paymentLink;
    isLoading = false;
    flashMessage: 'success' | 'error' | null = null;
    dataList = [];
    infoList = [];
    total = 0;
    public Filter: any;
    public key: any = "entry_date_time";
    appConfig = AppConfig;
    settings: any;
    currentFilter: any;
    agentList: any[] = [];

    constructor(
        private accountService: AccountService,
        private confirmService: FuseConfirmationService,
        private agentService: AgentService,
        private clipboard: Clipboard,
        private entityService: EntityService
    ) {
        super(module_name.payment)
        this.key = 'entry_date_time';
        this.sortColumn = 'entry_date_time';
        this.sortDirection = 'desc';
        this.Mainmodule = this;

        this.entityService.onRefreshPaymentLinkEntityCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                if (item) {
                    this.refreshItems();
                }
            }
        })
    }

    cols = [];
    _selectedColumns: Column[];
    isFilterShow: boolean = false;
    selectedStatus: string;
    statusList = [
        { label: 'Pending', value: 'Pending' },
        { label: 'Success', value: 'Success' },
        { label: 'Confirmed', value: 'Confirmed' },
        { label: 'Failed', value: 'Failed' }
    ];

    ngOnInit() {
        this.getAgent("");
    }

    createPaymentLink(): void {
        if (!Security.hasNewEntryPermission(module_name.paymentLink)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        this.entityService.raisePaymentLinkEntityCall({ create: true })
    }

    editPaymentLink(record: any) {
        if (!Security.hasEditEntryPermission(module_name.paymentLink)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        this.entityService.raisePaymentLinkEntityCall({ data: record, title: 'Edit Payment Link', edit: true })
    }

    deletePaymentLink(record, index): void {
        if (!Security.hasDeleteEntryPermission(module_name.paymentLink)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        const label: string = 'Delete Payment Link'
        this.confirmService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.agent + ' ?'
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.accountService.deletePaymentLink(record.id).subscribe({
                    next: () => {
                        this.alertService.showToast('success', "Payment Link has been deleted!", "top-right", true);
                        if (res) {
                            this.dataList.splice(index, 1);
                        }
                        // this.refreshItems();
                    }, error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);
                    }
                })
            }
        })
    }

    viewInternal(record: any): void {
        this.entityService.raisePaymentLinkEntityCall({ data: record, title: 'Payment Link Info', list: true })
    }

    getAgent(value: string) {
        this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
            this.agentList = data;

            for (let i in this.agentList) {
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}${this.agentList[i].email_address}`
            }
        })
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        var newModel = this.getNewFilterReq(event);
        this.accountService.getPaymentLinkList(newModel).subscribe({
            next: (data) => {
                this.dataList = data.data;
                this.totalRecords = data.total;
                this.isLoading = false;
            }, error: (err) => {
                this.alertService.showToast('error', err)
                this.isLoading = false
            }
        });
    }

    public show: boolean = false;
    public buttonName: any = 'Show';


    info(record: any): void {
        this.entityService.raisePaymentLinkEntityCall({ data: record, title: 'Payment Link Info', list: true })
    }

    exportExcel(): void {
        if (!Security.hasExportDataPermission(this.module_name)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const filterReq = this.getNewFilterReq({});

        filterReq['status'] = this.currentFilter.status;
        filterReq['fromDate'] = DateTime.fromJSDate(this.currentFilter.fromDate).toFormat('yyyy-MM-dd');
        filterReq['toDate'] = DateTime.fromJSDate(this.currentFilter.toDate).toFormat('yyyy-MM-dd')
        filterReq['Take'] = this.totalRecords;

        this.accountService.getPaymentList(filterReq).subscribe(data => {
            for (var dt of data.data) {
                dt.payment_request_date = dt.payment_request_date ? DateTime.fromISO(dt.payment_request_date).toFormat('dd-MM-yyyy hh:mm a') : '';
                dt.audit_date_time = dt.audit_date_time ? DateTime.fromISO(dt.audit_date_time).toFormat('dd-MM-yyyy hh:mm a') : '';
                dt.payment_date = dt.payment_date ? DateTime.fromISO(dt.payment_date).toFormat('dd-MM-yyyy hh:mm a') : '';
                dt.payment_amount = dt.payment_amount + ' ' + dt.payment_currency
            }
            Excel.export(
                'Payment',
                [
                    { header: 'Transaction ID', property: 'transaction_ref_no' },
                    { header: 'Ref no.', property: 'payment_ref_no' },
                    { header: 'Status', property: 'payment_status' },
                    { header: 'To', property: 'payment_to' },
                    { header: 'For', property: 'service_for' },
                    { header: 'Amount', property: 'payment_amount' },
                    { header: 'Mode Of Payment', property: 'mode_of_payment' },
                    { header: 'Requested', property: 'payment_request_date' },
                    { header: 'Audited', property: 'audit_date_time' },
                    { property: 'payment_date', header: 'Payment Date' },
                    { property: 'payment_reject_reason', header: 'Payment Reject Reason' },
                    { property: 'payment_type', header: 'Payment Type' },
                ],
                data.data, "Payment", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }]);
        });
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }
}
