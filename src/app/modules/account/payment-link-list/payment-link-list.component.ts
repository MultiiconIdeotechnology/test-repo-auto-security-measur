import { Clipboard } from '@angular/cdk/clipboard';
import { NgIf, NgFor, CommonModule, NgClass } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AppConfig } from 'app/config/app-config';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { Security, filter_module_name, messages, module_name } from 'app/security';
import { AccountService } from 'app/services/account.service';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { EntityService } from 'app/services/entity.service';
import { PaymentLinkComponent } from "./payment-link-entry/payment-link-entry.component";
import { AgentService } from 'app/services/agent.service';
import { BehaviorSubject, Subscription, takeUntil } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
    selector: 'app-payment-link-list',
    templateUrl: './payment-link-list.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        MatInputModule,
        MatButtonModule,
        MatTooltipModule,
        NgClass,
        MatDatepickerModule,
        MatSelectModule,
        NgxMatSelectSearchModule,
        PrimeNgImportsModule,
        PaymentLinkComponent
    ],
})
export class PaymentLinkListComponent extends BaseListingComponent implements OnDestroy {
    module_name = module_name.paymentLink;
    filter_table_name = filter_module_name.payment_link;
    private settingsUpdatedSubscription: Subscription;
    isLoading = false;
    flashMessage: 'success' | 'error' | null = null;
    dataList: any[] = [];
    infoList: any[] = [];
    total = 0;
    public Filter: any;
    public key: any = "entry_date_time";
    appConfig = AppConfig;
    settings: any;
    currentFilter: any;
    agentList: any[] = [];
    selectedAgent: any;
    private selectedOptionTwoSubjectThree = new BehaviorSubject<any>('');
    selectionDateDropdownThree$ = this.selectedOptionTwoSubjectThree.asObservable();

    updateSelectedOptionThree(option: string): void {
        this.selectedOptionTwoSubjectThree.next(option);
    }


    /**
     * Constructor for PaymentLinkListComponent
     * @param accountService Service for handling account-related operations
     * @param confirmService Service for showing confirmation dialogs
     * @param agentService Service for handling agent-related operations
     * @param clipboard Service for clipboard operations
     * @param entityService Service for entity management operations
     * @param _filterService Service for common filter operations
     * @returns void
     */
    constructor(
        private accountService: AccountService,
        private confirmService: FuseConfirmationService,
        private agentService: AgentService,
        private clipboard: Clipboard,
        private entityService: EntityService,
        public _filterService: CommonFilterService
    ) {
        // Initialize parent component with module name
        super(module_name.paymentLink);
        // Set default sorting key and direction
        this.key = 'entry_date_time';
        this.sortColumn = 'entry_date_time';
        this.sortDirection = 'desc';
        // Set reference to this module
        this.Mainmodule = this;
        // Apply default filter settings
        this._filterService.applyDefaultFilter(this.filter_table_name);

        // Subscribe to payment link refresh events
        this.entityService.onRefreshPaymentLinkEntityCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                if (item) {
                    // Refresh items when refresh event is triggered
                    this.refreshItems();
                }
            }
        })
    }

    cols: Column[] = [];
    _selectedColumns: Column[] = [];
    isFilterShow: boolean = false;
    selectedStatus: string;
    statusList = [
        { label: 'Pending', value: 'Pending' },
        { label: 'Success', value: 'Success' },
        { label: 'Confirmed', value: 'Confirmed' },
        { label: 'Failed', value: 'Failed' }
    ];

    /**
     * Angular lifecycle hook that initializes the component
     * @returns void
     */
    ngOnInit() {
        // Load initial agent list
        this.getAgent("");
        // common filter
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
            this._filterService.updateSelectedOption('');
            this._filterService.updatedSelectionOptionTwo('');
            this.updateSelectedOptionThree('');
            this.selectedAgent = resp['table_config']['agent']?.value;

            // Add selected agent to list if not already present
            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }

            if (resp['table_config']['entry_date_time']?.value != null && resp['table_config']['entry_date_time'].value.length) {
                this._filterService.updateSelectedOption('custom_date_range');
                this._filterService.rangeDateConvert(resp['table_config']['entry_date_time']);
            }

            if (resp['table_config']['payment_date_time']?.value != null && resp['table_config']['payment_date_time'].value.length) {
                this._filterService.updatedSelectionOptionTwo('custom_date_range');
                this._filterService.rangeDateConvert(resp['table_config']['payment_date_time']);
            }

            if (resp['table_config']['expiry_date']?.value != null && resp['table_config']['expiry_date'].value.length) {
                this.updateSelectedOptionThree('custom_date_range');
                this._filterService.rangeDateConvert(resp['table_config']['expiry_date']);
            }
            // Apply filters to the table
            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShow = true;
            this.primengTable._filter();
        });
    }

    /**
     * Angular lifecycle hook called after the component's view has been fully initialized
     * @returns void
     */
    ngAfterViewInit() {
        // Defult Active filter show
        this._filterService.updateSelectedOption('');
        this._filterService.updatedSelectionOptionTwo('');
        this.updateSelectedOptionThree('');
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShow = true;
            // Parse and apply saved filter configuration
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            this.selectedAgent = filterData['table_config']['agent']?.value;

            if (filterData['table_config']['entry_date_time']?.value != null && filterData['table_config']['entry_date_time'].value.length) {
                this._filterService.updateSelectedOption('custom_date_range');
                this._filterService.rangeDateConvert(filterData['table_config']['entry_date_time']);
            }

            if (filterData['table_config']['payment_date_time']?.value != null && filterData['table_config']['payment_date_time'].value.length) {
                this._filterService.updatedSelectionOptionTwo('custom_date_range');
                this._filterService.rangeDateConvert(filterData['table_config']['payment_date_time']);
            }

            if (filterData['table_config']['entry_date_time']?.value != null && filterData['table_config']['entry_date_time'].value.length) {
                this.updateSelectedOptionThree('custom_date_range');
                this._filterService.rangeDateConvert(filterData['table_config']['entry_date_time']);
            }
            // Apply parsed filters to the table
            this.primengTable['filters'] = filterData['table_config'];
        }
    }

    /**
     * Copies a payment link to the clipboard if its status is Pending
     * @param link The payment link URL to copy
     * @param status The current status of the payment link
     * @returns void
     */
    copyLink(link: string, status: any): void {
        // Only allow copying links with Pending status
        if (status == "Pending") {
            // Copy the link to clipboard
            this.clipboard.copy(link);
            // Show success notification
            this.alertService.showToast('success', 'Copied');
        }
    }

    /**
     * Opens the payment link creation dialog if user has permission
     * @returns void
     */
    createPaymentLink(): void {
        // Check if user has permission to create new payment links
        if (!Security.hasNewEntryPermission(module_name.paymentLink)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        // Trigger the payment link creation dialog
        this.entityService.raisePaymentLinkEntityCall({ create: true })
    }

    /**
     * Opens the payment link edit dialog if user has permission
     * @param record The payment link record to edit
     * @returns void
     */
    editPaymentLink(record: any) {
        // Check if user has permission to edit payment links
        if (!Security.hasEditEntryPermission(module_name.paymentLink)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        // Trigger the payment link edit dialog with the selected record
        this.entityService.raisePaymentLinkEntityCall({ data: record, title: 'Edit Payment Link', edit: true })
    }

    /**
     * Deletes a payment link after user confirmation if they have permission
     * @param record The payment link record to delete
     * @param index The index of the record in the data list
     * @returns void
     */
    deletePaymentLink(record: any, index: number): void {
        // Check if user has permission to delete payment links
        if (!Security.hasDeleteEntryPermission(module_name.paymentLink)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        const label: string = 'Delete Payment Link'
        // Show confirmation dialog before deletion
        this.confirmService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.agent + ' ?'
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                // Proceed with deletion if user confirms
                this.accountService.deletePaymentLink(record.id).subscribe({
                    next: () => {
                        // Show success message and remove item from list
                        this.alertService.showToast('success', "Payment Link has been deleted!", "top-right", true);
                        if (res) {
                            this.dataList.splice(index, 1);
                        }
                    }, error: (err) => {
                        // Show error message if deletion fails
                        this.alertService.showToast('error', err, 'top-right', true);
                    }
                })
            }
        })
    }

    /**
     * Opens the payment link view dialog to display detailed information
     * @param record The payment link record to view
     * @returns void
     */
    viewInternal(record: any): void {
        // Trigger the payment link view dialog with the selected record
        this.entityService.raisePaymentLinkEntityCall({ data: record, title: 'Payment Link Info', list: true })
    }

    /**
     * Retrieves the list of agents from the service
     * @param value Search value to filter agents
     * @returns void
     */
    getAgent(value: string) {
        // Fetch agent list from service
        this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
            this.agentList = data;

            // Ensure selected agent is in the list
            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }

            // Format agent information for display
            for (let i in this.agentList) {
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}${this.agentList[i].email_address}`;
                this.agentList[i].id_by_value = this.agentList[i].agency_name;
            }
        })
    }

    /**
     * Refreshes the payment link list with current filters
     * @param event Optional event object containing pagination or sorting information
     * @returns void
     */
    refreshItems(event?: any): void {
        // Set loading state
        this.isLoading = true;
        // Build filter request model
        var newModel = this.getNewFilterReq(event);
        // Fetch updated payment link list
        this.accountService.getPaymentLinkList(newModel).subscribe({
            next: (data) => {
                // Update data list and total records
                this.dataList = data.data;
                this.totalRecords = data.total;
                this.isLoading = false;
            }, error: (err) => {
                // Show error message and stop loading
                this.alertService.showToast('error', err)
                this.isLoading = false
            }
        });
    }

    public show: boolean = false;
    public buttonName: any = 'Show';

    /**
     * Opens the payment link information dialog to display detailed information
     * @param record The payment link record to display information for
     * @returns void
     */
    info(record: any): void {
        // Trigger the payment link info dialog with the selected record
        this.entityService.raisePaymentLinkEntityCall({ data: record, title: 'Payment Link Info', list: true })
    }

    /**
     * Toggles the credit card active status for an agent after user confirmation
     * @param data The agent data containing credit card status
     * @returns void
     */
    setCCActiveDeactive(data: any) {
        // Determine action label based on current status
        const label: string = !data.is_cc_active ? 'Allow Credit card' : 'Deny Credit card';
        // Show confirmation dialog
        this.confirmService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' ?'
        }).afterClosed().subscribe({
            next: (res) => {
                if (res === 'confirmed') {
                    // Update credit card status if user confirms
                    this.agentService.setCreditcardActiveDeactive(data.id).subscribe({
                        next: (res) => {
                            if (res && res['status']) {
                                // Show appropriate success message
                                if (!data.is_cc_active) {
                                    this.alertService.showToast('success', "Credit card method has been allowed", "top-right", true);
                                } else {
                                    this.alertService.showToast('success', "Credit card method has been denied", "top-right", true);
                                }

                                // Toggle the credit card status
                                data.is_cc_active = !data.is_cc_active;
                            }

                        }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
                    });
                }
            }
        })
    }

    /**
     * Exports payment link data to Excel format if user has permission
     * @returns void
     */
    exportExcel(): void {
        // Check if user has permission to export data
        if (!Security.hasExportDataPermission(this.module_name)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // Build filter request for export
        const filterReq = this.getNewFilterReq({});
        filterReq['status'] = this.currentFilter?.status;
        filterReq['fromDate'] = DateTime.fromJSDate(this.currentFilter?.fromDate).toFormat('yyyy-MM-dd');
        filterReq['toDate'] = DateTime.fromJSDate(this.currentFilter?.toDate).toFormat('yyyy-MM-dd')
        filterReq['Take'] = this.totalRecords;

        // Fetch payment data for export
        this.accountService.getPaymentList(filterReq).subscribe(data => {
            // Format date fields and payment amount for export
            for (var dt of data.data) {
                dt.payment_request_date = dt.payment_request_date ? DateTime.fromISO(dt.payment_request_date).toFormat('dd-MM-yyyy hh:mm a') : '';
                dt.audit_date_time = dt.audit_date_time ? DateTime.fromISO(dt.audit_date_time).toFormat('dd-MM-yyyy hh:mm a') : '';
                dt.payment_date = dt.payment_date ? DateTime.fromISO(dt.payment_date).toFormat('dd-MM-yyyy hh:mm a') : '';
                dt.payment_amount = dt.payment_amount + ' ' + dt.payment_currency
            }
            // Export data to Excel with specified columns and formatting
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

    /**
     * Returns appropriate text to display when there is no data
     * @returns string The appropriate message based on current state
     */
    getNodataText(): string {
        // Show loading message if data is being fetched
        if (this.isLoading)
            return 'Loading...';
        // Show no search results message if search is active
        else if (this.searchInputControl?.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        // Show default no data message
        else return 'No data to display';
    }

    /**
     * Angular lifecycle hook called when the component is destroyed
     * @returns void
     */
    ngOnDestroy(): void {
        // Clean up subscriptions to prevent memory leaks
        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            // Reset active filter data
            this._filterService.activeFiltData = {};
        }
    }

    onOptionClickThree(option: any, primengTable: any, field: any, key?: any) {
        this.selectedOptionTwoSubjectThree.next(option.id_by_value);

        if (option.id_by_value && option.id_by_value != 'custom_date_range') {
            primengTable.filter(option, field, 'custom');
        } else if (option.id_by_value == 'custom_date_range') {
            primengTable.filter(null, field, 'custom');
        }
    }
}
