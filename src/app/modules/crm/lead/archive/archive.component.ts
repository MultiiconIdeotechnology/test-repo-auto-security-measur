import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AppConfig } from 'app/config/app-config';
import { Security, filter_module_name, leadRegisterPermissions, messages, module_name } from 'app/security';
import { CrmService } from 'app/services/crm.service';
import { LeadsRegisterService } from 'app/services/leads-register.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject } from 'rxjs';
import { LeadStatusChangedLogComponent } from '../lead-status-changed-log/lead-status-changed-log.component';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { BaseListingComponent, Column, Types } from 'app/form-models/base-listing';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { OverlayPanel } from 'primeng/overlaypanel';
import { cloneDeep } from 'lodash';

@Component({
    selector: 'app-archive',
    templateUrl: './archive.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        AsyncPipe,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatSlideToggleModule,
        NgxMatSelectSearchModule,
        MatTooltipModule,
        MatAutocompleteModule,
        RouterOutlet,
        MatOptionModule,
        MatDividerModule,
        MatSortModule,
        MatTableModule,
        MatPaginatorModule,
        MatMenuModule,
        MatDialogModule,
        CommonModule,
        MatTabsModule,
        MatProgressBarModule,
        PrimeNgImportsModule
    ]
})
export class ArchiveComponent extends BaseListingComponent {
    @Input() isFilterShowArchive: boolean;
    @Output() isFilterShowArchiveChange = new EventEmitter<boolean>()
    @ViewChild('tabGroup') tabGroup;
    @ViewChild(MatPaginator) public _paginatorArchive: MatPaginator;
    @ViewChild(MatSort) public _sortArchive: MatSort;
    @ViewChild('op') overlayPanel!: OverlayPanel;

    Mainmodule: any;
    module_name = module_name.lead
    filter_table_name = filter_module_name.leads_archive;
    private settingsUpdatedSubscription: Subscription;
    total = 0;
    deadLeadId: any;
    statusList = ['Converted', 'Dead'];
    dataList: any;
    appConfig = AppConfig;
    isLoading: any;
    searchInputControlArchive = new FormControl('');
    data: any
    filter: any = {}

    types = Types;
    exportCol: Column[] = [];
    activeFiltData: any = {};
    cols: Column[] = [];
    selectedColumns: Column[] = [];

    public _unsubscribeAll: Subject<any> = new Subject<any>();
    public key: any;
    public sortColumn: any;
    public sortDirection: any;

    constructor(
        private crmService: CrmService,
        private matDialog: MatDialog,
        private conformationService: FuseConfirmationService,
        private leadsRegisterService: LeadsRegisterService,
        public _filterService: CommonFilterService
    ) {
        super(module_name.lead);
        this.key = this.module_name;
        this.sortColumn = 'last_call_date_time';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);

        this.selectedColumns = [
            { field: 'lead_status', header: 'Status', type: Types.select , isCustomColor:true},
            { field: 'agency_name', header: 'Agency', type: Types.text },
            { field: 'contact_person_email', header: 'Email', type: Types.text },
            { field: 'contact_person_mobile', header: 'Mobile', type: Types.text },
            { field: 'last_call_date_time', header: 'Last Status Date', type: Types.dateTime, dateFormat: 'dd-MM-yyyy' },
            { field: 'last_call_feedback', header: 'Last Remark', type: Types.text },
            { field: 'lead_source', header: 'Source', type: Types.text },
        ];

        this.cols.unshift(...this.selectedColumns);
        this.exportCol = cloneDeep(this.cols);
    }


    ngOnInit(): void {
        // common filter
        this._filterService.updateSelectedOption('');
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];
            // if (resp['table_config']['last_call_date_time'].value) {
            //     resp['table_config']['last_call_date_time'].value = new Date(resp['table_config']['last_call_date_time'].value);
            // }

            if (resp['table_config']['last_call_date_time']?.value != null && resp['table_config']['last_call_date_time'].value.length) {
                this._filterService.updateSelectedOption('custom_date_range');
                this._filterService.rangeDateConvert(resp['table_config']['last_call_date_time']);
            }
            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShowArchive = true;
            this.selectedColumns = this.checkSelectedColumn(resp['selectedColumns'] || [], this.selectedColumns);
            this.isFilterShowArchiveChange.emit(this.isFilterShowArchive);
            this.primengTable._filter();
        });

    }

    ngAfterViewInit() {
        // Defult Active filter show
        this._filterService.updateSelectedOption('');
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShowArchive = true;
            this.isFilterShowArchiveChange.emit(this.isFilterShowArchive);
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            // if (filterData['table_config']['last_call_date_time'].value) {
            //     filterData['table_config']['last_call_date_time'].value = new Date(filterData['table_config']['last_call_date_time'].value);
            // }

            if (filterData['table_config']['last_call_date_time']?.value != null && filterData['table_config']['last_call_date_time'].value.length) {
                this._filterService.updateSelectedOption('custom_date_range');
                this._filterService.rangeDateConvert(filterData['table_config']['last_call_date_time']);
            }
            this.primengTable['filters'] = filterData['table_config'];
            this.selectedColumns = this.checkSelectedColumn(filterData['selectedColumns'] || [], this.selectedColumns);
            this.onColumnsChange();
        } else {
            this.selectedColumns = this.checkSelectedColumn([], this.selectedColumns);
            this.onColumnsChange();
        }
    }

    onColumnsChange(): void {
        this._filterService.setSelectedColumns({ name: this.filter_table_name, columns: this.selectedColumns });
    }

    checkSelectedColumn(col: any[], oldCol: Column[]): any[] {
        if (col.length) return col
        else {
            var Col = this._filterService.getSelectedColumns({ name: this.filter_table_name })?.columns || [];
            if (!Col.length)
                return oldCol;
            else
                return Col;
        }
    }

    isDisplayHashCol(): boolean {
        return this.selectedColumns.length > 0;
    }


    toggleOverlayPanel(event: MouseEvent) {
        this.overlayPanel.toggle(event);
    }

    getStatusColor(status: string): string {
        if (status == 'Converted') {
            return 'text-green-600';
        } else if (status == 'Live') {
            return 'text-green-600';
        } else if (status == 'Dead') {
            return 'text-red-600';
        } else {
            return '';
        }
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControlArchive.value)
            return `no search results found for \'${this.searchInputControlArchive.value}\'.`;
        else return 'No data to display';
    }

    refreshItems(event?: any) {
        this.isLoading = true;
        if (this.searchInputControlArchive.value) { // Aa condtion tyarej add karivi jyare searchInput global variable na use karo hoy tyare
            event = {};
            event.first = event?.first || 0;
        }
        const filterReq = this.getNewFilterReq(event);
        filterReq['Filter'] = this.searchInputControlArchive.value;
        this.crmService.getArchiveLeadList(filterReq).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                this.totalRecords = data.total;
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
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

    ngOnDestroy(): void {

        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }

    displayColCount(): number {
        return this.selectedColumns.length + 1;
    }

    isValidDate(value: any): boolean {
        const date = new Date(value);
        return value && !isNaN(date.getTime());

    }
}
