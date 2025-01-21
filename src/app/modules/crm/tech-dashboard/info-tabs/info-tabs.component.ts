import { CrmService } from 'app/services/crm.service';
import { Component, Inject, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { RouterOutlet } from '@angular/router';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToasterService } from 'app/services/toaster.service';
import { DateTime } from 'luxon';
import { AppConfig } from 'app/config/app-config';
import { tabStatusChangedLogComponent } from '../tab-status-changed-log/tab-status-changed-log.component';
import { MatDividerModule } from '@angular/material/divider';

@Component({
    selector: 'app-info-tabs',
    templateUrl: './info-tabs.component.html',
    styleUrls: ['./info-tabs.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        AsyncPipe,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        NgxMatSelectSearchModule,
        MatIconModule,
        MatMenuModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatInputModule,
        MatButtonModule,
        MatTooltipModule,
        RouterOutlet,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatTabsModule,
        MatCheckboxModule,
        tabStatusChangedLogComponent,
        MatDividerModule
    ],
})
export class TechInfoTabsComponent {
    record: any = {};
    fieldList: any = {};
    fieldListStatusChanged: any = {};
    isLoading: any;
    searchInputControl = new FormControl('');
    tabNameStr: any = 'Basic Details'
    tab: string = 'Basic Details';
    tabName: any;
    title: any;
    appConfig = AppConfig;

    @ViewChild('tabStatus') tabStatus: tabStatusChangedLogComponent;
    cols = [];
    total = 0;

    columns = [
        {
            key: 'date',
            name: 'Date',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: false
        },
        {
            key: 'status',
            name: 'Status',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
            toColor: true
        },
        {
            key: 'status_remark',
            name: 'Remark',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
        }
    ]

    constructor(
        public matDialogRef: MatDialogRef<TechInfoTabsComponent>,
        public alertService: ToasterService,
        private crmService: CrmService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        if (data)
            this.record = data?.data;
    }

    ngOnInit() {
        if (this.record.id) {
            this.fieldList = [
                { name: 'Item Code', value: this.record?.item_code },
                { name: 'Item', value: this.record?.item_name },
                { name: 'Product', value: this.record?.product_name },
                {
                    name: 'Status', value: this.record?.product_status,
                    class: this.record?.product_status === 'Pending' ? 'text-red-600 font-semibold text-base' :
                        this.record?.product_status === 'Inprocess' || this.record?.product_status == 'Google Closed Testing' ? 'text-yellow-600 font-semibold' :
                            this.record?.product_status === 'Delivered' ? 'text-green-600 font-semibold' :
                                this.record?.product_status === 'Waiting for Customer Update' ? 'text-blue-600 font-semibold' :
                                    this.record?.product_status === 'Waiting for Account Activation' ? 'text-blue-600 font-semibold' :
                                        this.record?.product_status === 'Rejected from Store' ? 'text-red-600 font-semibold' :
                                            this.record?.product_status === 'Blocked' ? 'text-red-600 font-semibold' :
                                                this.record?.product_status === 'Sales Return' ? 'text-red-600 font-semibold' :
                                                    this.record?.product_status === 'Expired' ? 'text-red-600 font-semibold' : ''
                },
                { name: 'Agent Code', value: this.record?.agentCode },
                { name: 'Agency Name', value: this.record?.agency_name },
                { name: 'RM', value: this.record?.rm },
                { name: 'Product Entry Date', value: this.record?.product_Entry_Date ? DateTime.fromISO(this.record?.product_Entry_Date).toFormat('dd-MM-yyyy').toString() : '' },
                { name: 'Is Integration Started', value: this.record?.is_integration_started ? 'Yes' : 'No' },
                { name: 'Integration Start By', value: this.record?.integration_start_by_id },
                { name: 'Integration Start Date', value: this.record?.integration_start_date_time ? DateTime.fromISO(this.record?.integration_start_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
                { name: 'Is Block', value: this.record?.is_block ? 'Yes' : 'No' },
                { name: 'Block By', value: this.record?.is_block_by },
                { name: 'Block Date Time', value: this.record?.block_date_time ? DateTime.fromISO(this.record?.block_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
                { name: 'Is Activated', value: this.record?.is_activated ? 'Yes' : 'No' },
                { name: 'Activated By', value: this.record?.activate_by },
                { name: 'Activation Date', value: this.record?.activation_date ? DateTime.fromISO(this.record?.activation_date).toFormat('dd-MM-yyyy').toString() : '' },
                { name: 'RM Remark', value: this.record?.special_status_remark }
            ]
        }
    }

    public tabChanged(event: any): void {
        const tabName = event?.tab?.ariaLabel;
        this.tabNameStr = tabName;
        this.tabName = tabName;

        switch (this.tabNameStr) {
            case 'Basic Details':
                this.tab = 'Basic Details';
                break;

            case 'Status Change Log':
                this.tab = 'Status Change Log';
                this.tabStatus?.refreshItems()
                break;
        }
    }

    getStatusColor(status: string): string {
        if (status == 'Pending') {
            return 'text-red-600';
        } else if (status == 'Inprocess' || status == 'Google Closed Testing') {
            return 'text-yellow-600';
        } else if (status == 'Delivered') {
            return 'text-green-600';
        } else if (status == 'Waiting for Customer Update') {
            return 'text-blue-600';
        } else if (status == 'Waiting for Account Activation') {
            return 'text-blue-600';
        } else if (status == 'Rejected from Store') {
            return 'text-red-600';
        } else if (status == 'Expired') {
            return 'text-red-600';
        }
        else {
            return '';
        }
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }
}
