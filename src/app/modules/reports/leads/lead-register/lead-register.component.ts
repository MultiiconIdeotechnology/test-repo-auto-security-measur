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
import { RouterOutlet } from '@angular/router';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { Security, filter_module_name, leadRegisterPermissions, messages, module_name } from 'app/security';
import { LeadsRegisterService } from 'app/services/leads-register.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FilterComponent } from './filter/filter.component';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { RmdialogComponent } from './rmdialog/rmdialog.component';
import { CallHistoryComponent } from 'app/modules/crm/lead/call-history/call-history.component';
import { ReshuffleComponent } from 'app/modules/masters/agent/reshuffle/reshuffle.component';
import { RMLogsComponent } from './rmlogs/rmlogs.component';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { EditLeadRegisterComponent } from './edit-lead-register/edit-lead-register.component';
import { ImportLeadsComponent } from './import-leads/import-leads.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { LeadStatusChangedLogComponent } from 'app/modules/crm/lead/lead-status-changed-log/lead-status-changed-log.component';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { EmployeeService } from 'app/services/employee.service';
import { AgentService } from 'app/services/agent.service';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-lead-register',
    templateUrl: './lead-register.component.html',
    styleUrls: ['./lead-register.component.scss'],
    styles: [],
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
export class LeadRegisterComponent extends BaseListingComponent implements OnDestroy {
    dataList = [];
    total = 0;
    module_name = module_name.leads_register
    filter_table_name = filter_module_name.leads_register;
    private settingsUpdatedSubscription: Subscription;
    leadFilter: any;
    deadLeadId: any;
    isFilterShow: boolean = false;

    selectedStatus: any;
    selectedPriority: any;
    selectedLeadType: any;
    selectedLeadSource: any;
    selectedKyc: any;
    leadList: any[] = [];
    employeeList: any[] = [];
    agentList: any[] = [];
    selectedRm:any;
    selectedLeadStatus:any;

    statusList: any[] = [
        { label: 'New', value: 'New', },
        { label: 'Live', value: 'Live', },
        { label: 'Converted', value: 'Converted', },
        { label: 'Dead', value: 'Dead', }
    ];

    priorityText: any[] = [
        { label: 'High', value: 'High' },
        { label: 'Medium', value: 'Medium' },
        { label: 'Low', value: 'Low' },
    ];

    leadType: any[] = [
        { label: 'B2B Partner', value: 'B2B Partner' },
        { label: 'WL', value: 'WL' },
        { label: 'Corporate', value: 'Corporate' },
        { label: 'Supplier', value: 'Supplier' },
        { label: 'Boost My Brand', value: 'Boost My Brand' },
        { label: 'Build My Brand', value: 'Build My Brand' },
        { label: 'IBCM', value: 'IBCM' }
    ];

    kycList: any[] = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' },
    ]

    cols: Column[] = [
        { field: 'lead_assign_by', header: 'Assign By'},
        { field: 'lead_assign_by_date', header: 'Assign By Date'},
    ];
    _selectedColumns: Column[];
    leadStatus: any;

    constructor(
        private leadsRegisterService: LeadsRegisterService,
        private matDialog: MatDialog,
        public _filterService: CommonFilterService,
        private conformationService: FuseConfirmationService,
        private employeeService: EmployeeService,
        private agentService: AgentService
    ) {
        super(module_name.leads_register)
        // this.cols = this.columns.map(x => x.key);
        this.key = this.module_name;
        this.sortColumn = 'leadDate';
        this.sortDirection = 'desc';
        this.Mainmodule = this;

        this.leadFilter = {
            lead_type: 'All',
            lead_status: 'All',
            priority_text: 'All',
            relationship_manager_id: '',
            KYC_Status: 'All',
            lead_source: '',
            date: 'All',
            FromDate: null,
            ToDate: null
        };
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit() {
        this.getLeadStatus("");
        this.getEmployee("");
        // this.employeeList = this._filterService.originalRmList;

        this._filterService.selectionDateDropdown = "";
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            this._filterService.selectionDateDropdown = "";
            this.selectedRm = resp['table_config']['rm_Id']?.value;
            this.selectedLeadStatus = resp['table_config']['lead_source']?.value;

            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];
            if(resp['table_config']['supplier_name']){
                this.leadStatus = resp['table_config'].supplier_name?.value;
            }
            if (resp['table_config']['lastCall'].value) {
                resp['table_config']['lastCall'].value = new Date(resp['table_config']['lastCall'].value);
            }
            if (resp['table_config']['leadDate']?.value && Array.isArray(resp['table_config']['leadDate']?.value)) {
                this._filterService.selectionDateDropdown = 'custom_date_range';
                this._filterService.rangeDateConvert(resp['table_config']['leadDate']);
            }
            this.primengTable['filters'] = resp['table_config'];
            this._selectedColumns = resp['selectedColumns'] || [];
            this.isFilterShow = true;
            this.primengTable._filter();
        });
    }

    get selectedColumns(): Column[] {
        return this._selectedColumns;
    }

    set selectedColumns(val: Column[]) {
        if (Array.isArray(val)) {
            this._selectedColumns = this.cols.filter(col =>
                val.some(selectedCol => selectedCol.field === col.field)
            );
        } else {
            this._selectedColumns = [];
        }
    }

    ngAfterViewInit() {
        // Defult Active filter show
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);

            this.selectedRm = filterData['table_config']['rm_Id']?.value;
            this.selectedLeadStatus = filterData['table_config']['lead_source']?.value;

            if(filterData['table_config']['supplier_name']){
                this.leadStatus = filterData['table_config'].supplier_name?.value;
            }
            if (filterData['table_config']['lastCall'].value) {
                filterData['table_config']['lastCall'].value = new Date(filterData['table_config']['lastCall'].value);
            }
            if (filterData['table_config']['leadDate']?.value && Array.isArray(filterData['table_config']['leadDate']?.value)) {
                this._filterService.selectionDateDropdown = 'custom_date_range';
                this._filterService.rangeDateConvert(filterData['table_config']['leadDate']);
            }
            // this.primengTable['_sortField'] = filterData['sortColumn'];
            // this.sortColumn = filterData['sortColumn'];
            this.primengTable['filters'] = filterData['table_config'];
            this._selectedColumns = filterData['selectedColumns'] || [];
            this.isFilterShow = true;
        }
    }

    getFilter(): any {
        const filterReq = {};

        filterReq['lead_type'] = this.leadFilter?.lead_type == 'All' ? '' : this.leadFilter?.lead_type;
        filterReq['priority_text'] = this.leadFilter?.priority_text == 'All' ? '' : this.leadFilter?.priority_text;
        filterReq['relationship_manager_id'] = this.leadFilter?.relationship_manager_id?.id || '';
        filterReq['lead_status'] = this.leadFilter?.lead_status == 'All' ? '' : this.leadFilter?.lead_status;
        filterReq['lead_source'] = this.leadFilter?.lead_source.lead_source == 'All' ? '' : this.leadFilter?.lead_source.lead_source || '';
        filterReq['KYC_Status'] = this.leadFilter?.KYC_Status == 'All' ? '' : this.leadFilter?.KYC_Status;
        filterReq['date'] = this.leadFilter.date || 'Last Month';

        if (this.leadFilter.FromDate !== null) {
            filterReq['from_date'] = this.leadFilter.FromDate ? DateTime.fromJSDate(new Date(this.leadFilter.FromDate)).toFormat('yyyy-MM-dd') : null;
            filterReq['to_date'] = this.leadFilter.ToDate ? DateTime.fromJSDate(new Date(this.leadFilter.ToDate)).toFormat('yyyy-MM-dd') : null;
        }
        return filterReq;
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        let extraModel = this.getFilter();
        let oldModel = this.getNewFilterReq(event)
        let model = { ...extraModel, ...oldModel };
        this.leadsRegisterService.leadMasterRegisterList(model).subscribe({
            next: (data) => {
                this.dataList = data.data;
                this.total = data.total;
                this.totalRecords = data.total
                this.isLoading = false;
            }, error: (err) => {
                this.alertService.showToast('error', err)
                this.isLoading = false
            }
        });
    }

    // lead status data api to get data bind to dropdown on filter
    getLeadStatus(val: string) {
        this.leadsRegisterService.leadSouceCombo(val).subscribe({
            next: data => {
                this.leadList = data;

                for (let i in this.leadList) {
                    this.leadList[i].id_by_value = this.leadList[i].lead_source
                }
            }
        });
    }

    getEmployee(value: string) {
        this.employeeService.getemployeeCombo(value).subscribe({
            next: data => {
                this.employeeList = data;
            }
        });
    }

    filter() {
        this.matDialog
            .open(FilterComponent, {
                data: this.leadFilter,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.leadFilter = res;
                    this.refreshItems();
                }
            });
    }

    callHistory(record): void {
        if (!Security.hasPermission(leadRegisterPermissions.callHistoryPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        this.matDialog.open(CallHistoryComponent, {
            data: { data: record, readonly: true },
            disableClose: true
        });
    }

    reShuffle() {
        if (!Security.hasPermission(leadRegisterPermissions.reshufflePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(ReshuffleComponent, {
            data: 'Lead',
            disableClose: true,
        }).afterClosed().subscribe(res => {
            if (res) {
                // this.agentFilter = res;
                // this.refreshItems();
            }
        })
    }

    importLeads() {
        if (!Security.hasPermission(leadRegisterPermissions.importPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(ImportLeadsComponent, {
            data: null,
            disableClose: true
        }).afterClosed().subscribe(res => {
            if (res) {
                this.refreshItems();
            }
        })
    }

    getStatusColor(status: string): string {
        if (status == 'Converted' || status == 'Live') {
            return 'text-green-600';
        } else if (status == 'Dead') {
            return 'text-red-600';
        } else if (status == 'New') {
            return 'text-yellow-600';
        } else {
            return '';
        }
    }

    getStatusColorP(status: string): string {
        if (status == 'Low') {
            return 'text-pink-600';
        } else if (status == 'High') {
            return 'text-red-600';
        } else if (status == 'Medium') {
            return 'text-yellow-600';
        } else {
            return '';
        }
    }

    relationahipManager(record): void {
        if (!Security.hasPermission(leadRegisterPermissions.relationshipManagerPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(RmdialogComponent, {
            data: record,
            disableClose: true
        }).afterClosed().subscribe(res => {
            if (res) {

                const json = {
                    id: record.id,
                    relationship_manager_id: res.empId
                }
                this.leadsRegisterService.leadRMChange(json).subscribe({
                    next: () => {
                        this.alertService.showToast('success', "Relationship Manager Changed!");
                        this.refreshItems()
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);
                    },
                })
            }
        })
    }

    relationahipManagerLog(record): void {
        if (!Security.hasPermission(leadRegisterPermissions.relationshipManagerLogsPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(RMLogsComponent, {
            data: record,
            disableClose: true
        });
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    editLeadRegister(record): void {
        this.matDialog.open(EditLeadRegisterComponent, {
            data: { data: record, readonly: false },
            disableClose: true
        }).afterClosed().subscribe(res => {
            if (res) {
                this.refreshItems();
            }
        })
    }

    exportExcel(): void {
        if (!Security.hasExportDataPermission(module_name.leads_register)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // const req = this.getFilter();
        // req.Skip = 0;
        // req.Take = this.totalRecords;

        const filterReq = this.getNewFilterReq({});
        filterReq['Take'] = this.totalRecords;
        filterReq['lead_type'] = this.leadFilter?.lead_type == 'All' ? '' : this.leadFilter?.lead_type;
        filterReq['priority_text'] = this.leadFilter?.priority_text == 'All' ? '' : this.leadFilter?.priority_text;
        filterReq['relationship_manager_id'] = this.leadFilter?.relationship_manager_id?.id || '';
        filterReq['lead_status'] = this.leadFilter?.lead_status == 'All' ? '' : this.leadFilter?.lead_status;
        filterReq['lead_source'] = this.leadFilter?.lead_source.lead_source == 'All' ? '' : this.leadFilter?.lead_source.lead_source || '';
        filterReq['KYC_Status'] = this.leadFilter?.KYC_Status == 'All' ? '' : this.leadFilter?.KYC_Status;
        filterReq['date'] = this.leadFilter.date || 'Last Month';
        filterReq['Filter'] = this.searchInputControl.value ? this.searchInputControl.value : ""

        if (this.leadFilter.FromDate !== null && this.leadFilter.ToDate !== null) {
            filterReq['from_date'] = this.leadFilter.FromDate ? DateTime.fromJSDate(new Date(this.leadFilter.FromDate)).toFormat('yyyy-MM-dd') : null;
            filterReq['to_date'] = this.leadFilter.ToDate ? DateTime.fromJSDate(new Date(this.leadFilter.ToDate)).toFormat('yyyy-MM-dd') : null;
        }

        this.leadsRegisterService.leadMasterRegisterList(filterReq).subscribe(data => {
            for (var dt of data.data) {
                if (dt.lastCallFeedback == null) {
                    dt.lastCall = dt.lastCallFeedback == null ? null : DateTime.fromISO(dt.lastCall).toFormat('dd-MM-yyyy')
                }
                dt.leadDate = dt.leadDate ? DateTime.fromISO(dt.leadDate).toFormat('dd-MM-yyyy') : ''
                // dt.lastCall = DateTime.fromISO(dt.lastCall).toFormat('dd-MM-yyyy')
                dt.kycStarted = dt.kycStarted ? 'Yes' : 'No'
            }
            Excel.export(
                'Leads Register',
                [
                    { header: 'Calls', property: 'calls' },
                    { header: 'Status', property: 'status' },
                    { header: 'Priority', property: 'priority_text' },
                    { header: 'Agency', property: 'agency_name' },
                    { header: 'RM', property: 'rmName' },
                    { header: 'Type', property: 'lead_type' },
                    { header: 'Source', property: 'lead_source' },
                    { header: 'Contact Person', property: 'contact_person_name' },
                    { header: 'Email', property: 'contact_person_email' },
                    { header: 'Mobile', property: 'contact_person_mobile' },
                    { header: 'City', property: 'cityName' },
                    { header: 'Country', property: 'country_name' },
                    { header: 'KYC Started', property: 'kycStarted' },
                    { header: 'Last Feedback', property: 'lastCallFeedback' },
                    { header: 'Last Call', property: 'lastCall' },
                    { header: 'Lead Date', property: 'leadDate' },
                ],
                data.data, "Leads Register", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }]);
        });
    }

    deadLeadToLiveLead(record, index): void {
        if (!Security.hasPermission(leadRegisterPermissions.deadLeadToLiveLeadPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        this.deadLeadId = record?.id;
        const label: string = 'Dead Lead To Live Lead'
        this.conformationService.open({
            title: label,
            message: 'Are you sure to ' + record?.agency_name + ' ?',
            inputBox: 'Status Remark',
            customShow: true
        }).afterClosed().subscribe({
            next: (res) => {
                if (res?.action === 'confirmed') {
                    const newJson = {
                        id: this.deadLeadId,
                        status_remark: res?.statusRemark ? res?.statusRemark : ""
                    }

                    this.leadsRegisterService.deadLeadToLiveLead(newJson).subscribe({
                        next: (res) => {
                            if (res) {
                                // this.dataList.splice(index, 1);
                                this.refreshItems()
                            }
                            this.alertService.showToast('success', "Dead Lead To Live Lead Successfully!", "top-right", true);
                            this.isLoading = false;
                        }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
                    });
                }
            }
        })
    }

    statusChangedLog(record): void {
        // if (!Security.hasPermission(agentsPermissions.statusChangedLogsPermissions)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }

        this.matDialog.open(LeadStatusChangedLogComponent, {
            data: record,
            disableClose: true
        });
    }

    ngOnDestroy() {
        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }
}

