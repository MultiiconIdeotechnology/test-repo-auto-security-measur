import { NgIf, NgFor, DatePipe, CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
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
import { BaseListingComponent, Column, Types } from 'app/form-models/base-listing';
import { Security, bookingsVisaPermissions, filter_module_name, messages, module_name } from 'app/security';
import { ToasterService } from 'app/services/toaster.service';
import { Excel } from 'app/utils/export/excel';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { Linq } from 'app/utils/linq';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MarkuppriceInfoComponent } from '../flight/flight/markupprice-info/markupprice-info.component';
import { VisaFilterComponent } from './visa-filter/visa-filter.component';
import { VisaService } from 'app/services/visa.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { UserService } from 'app/core/user/user.service';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AgentService } from 'app/services/agent.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { cloneDeep } from 'lodash';


@Component({
    selector: 'app-visa',
    templateUrl: './visa.component.html',
    styleUrls: ['./visa.component.scss'],
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
    ]
})
export class VisaComponent extends BaseListingComponent {
    module_name = module_name.visa;
    filter_table_name = filter_module_name.visa_booking;
    private settingsUpdatedSubscription: Subscription;
    dataList = [];
    total = 0;
    visaFilter: any;
    user: any = {};
    // cols: any = [
    //     { field: 'visa_type', header: 'Visa Type', isDate: false, type: 'text' },
    //     { field: 'length_of_stay', header: 'Length of Stay', isDate: false, type: 'numeric' },
    //     { field: 'customer_name', header: 'Customer Name', isDate: false, type: 'text' },
    //     { field: 'payment_request_time', header: 'Payment Request Time', isDate: true, type: 'date' },
    //     { field: 'payment_confirmation_time', header: 'Payment Confirmation Time', isDate: true, type: 'date' },
    //     { field: 'psp_ref_number', header: 'PSP Refrence No.', isDate: false, type: 'text' },
    //     { field: 'payment_fail_reason', header: 'Payment Fail Reason', isDate: false, type: 'text' },
    // ];
    agentList: any[] = [];
    isFilterShow: boolean = false;
    selectedAgent: any;
    statusList = ['Pending', 'Payment Confirmed', 'Payment Failed', 'Inprocess', 'Documents Rejected', 'Documents Revised', 'Applied', 'Success', 'Rejected'];

    types = Types;
    selectedColumns: Column[] = [];
    exportCol: Column[] = [];
    activeFiltData: any = {};

    private selectedOptionTwoSubjectThree = new BehaviorSubject<any>('');
    selectionDateDropdownThree$ = this.selectedOptionTwoSubjectThree.asObservable();

    private selectedOptionTwoSubjectFour = new BehaviorSubject<any>('');
    selectionDateDropdownFour$ = this.selectedOptionTwoSubjectFour.asObservable();

    updateSelectedOptionThree(option: string): void {
        this.selectedOptionTwoSubjectThree.next(option);
    }

    updateSelectedOptionFour(option: string): void {
        this.selectedOptionTwoSubjectFour.next(option);
    }

    cols: Column[] = [
        { field: 'visa_type', header: 'Visa Type', type: 'text' },
        { field: 'length_of_stay', header: 'Length of Stay', type: 'number', fixVal: 0 },
        { field: 'customer_name', header: 'Customer Name', type: 'text' },
        { field: 'payment_request_time', header: 'Payment Request Time', type: Types.dateTime, dateFormat: 'dd-MM-yyyy HH:mm:ss' },
        { field: 'payment_confirmation_time', header: 'Payment Confirmation Time', type: Types.dateTime, dateFormat: 'dd-MM-yyyy HH:mm:ss' },
        { field: 'psp_ref_number', header: 'PSP Refrence No.', type: 'text' },
        { field: 'payment_fail_reason', header: 'Payment Fail Reason', type: 'text' },
    ];


    constructor(
        private matDialog: MatDialog,
        private toasterService: ToasterService,
        private visaService: VisaService,
        private userService: UserService,
        private conformationService: FuseConfirmationService,
        private agentService: AgentService,
        public _filterService: CommonFilterService
    ) {
        super(module_name.visa);
        this.key = this.module_name;
        this.sortColumn = 'entry_date_time';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);

        this.visaFilter = {
            From: '',
            To: '',
            agent_id: '',
            date_: '',
            Status: 'All',
            FromDate: new Date(),
            ToDate: new Date(),

        };
        this.visaFilter.FromDate.setDate(1);
        this.visaFilter.FromDate.setMonth(this.visaFilter.FromDate.getMonth() - 3);

        this.userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: any) => {
                this.user = user;
            });

        this.selectedColumns = [
            { field: 'booking_ref_no', header: 'Reference No.', type: Types.link, isFrozen: false, },
            { field: 'visa_status', header: 'Status', type: Types.select, isFrozen: false, isCustomColor: true },
            { field: 'entry_date_time', header: 'Date', type: Types.dateTime, dateFormat: 'dd-MM-yyyy HH:mm:ss' },
            { field: 'operation_person', header: 'Operation Person', type: Types.text },
            { field: 'agent', header: 'Agent', type: Types.select, },
            { field: 'purchase_price', header: 'Purchase Price', type: Types.number, fixVal: 2, class: 'text-right' },
            { field: 'user_type', header: 'Type', type: Types.text },
            { field: 'device', header: 'Device', type: Types.text },
            { field: 'payment_mode', header: 'MOP', type: Types.text },
            { field: 'destination_caption', header: 'Destination', type: Types.text },
            { field: 'travel_date', header: 'Travel Date', type: Types.dateTime, dateFormat: 'dd-MM-yyyy' },
            { field: 'pax', header: 'Pax', type: Types.number, fixVal: 0 },
            { field: 'payment_gateway', header: 'PG', type: Types.text },
            { field: 'ip_address', header: 'IP Address', type: Types.text }
        ];
        this.cols.unshift(...this.selectedColumns);
        this.exportCol = cloneDeep(this.cols);
    }

    visaStatusColors: { [key: string]: string } = {
        'Payment Confirmed': 'text-green-600',
        'Success': 'text-green-600',
        'Pending': 'text-yellow-600',
        'Payment Failed': 'text-red-600',
        'Rejected': 'text-red-600',
        'Documents Rejected': 'text-red-600',
        'Inprocess': 'text-blue-600',
        'Applied': 'text-blue-600',
        'Documents Revised': 'text-blue-600'
    };

    ngOnInit() {

        this.agentList = this._filterService.agentListById;

        // common filter   
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
            this._filterService.updateSelectedOption('');     
            this._filterService.updatedSelectionOptionTwo('');
            this.updateSelectedOptionThree('');
            this.updateSelectedOptionFour('');
            this.selectedAgent = resp['table_config']['agent_id_filters']?.value;
            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }

            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];

            if (resp['table_config']['entry_date_time']?.value != null && resp['table_config']['entry_date_time'].value.length) {
                this._filterService.updateSelectedOption('custom_date_range');
                this._filterService.rangeDateConvert(resp['table_config']['entry_date_time']);
            }        

            if (resp['table_config']['travel_date']?.value != null && resp['table_config']['travel_date'].value.length) {
                this._filterService.updatedSelectionOptionTwo('custom_date_range');
                this._filterService.rangeDateConvert(resp['table_config']['travel_date']);
            }

            if (resp['table_config']['payment_request_time']?.value != null && resp['table_config']['payment_request_time'].value.length) {
                this.updateSelectedOptionThree('custom_date_range');
                this._filterService.rangeDateConvert(resp['table_config']['payment_request_time']);
            }

            if (resp['table_config']['payment_confirmation_time']?.value != null && resp['table_config']['payment_confirmation_time'].value.length) {
                this.updateSelectedOptionFour('custom_date_range');
                this._filterService.rangeDateConvert(resp['table_config']['payment_confirmation_time']);
            }

            this.primengTable['filters'] = resp['table_config'];
            this.selectedColumns = resp['selectedColumns'] || [];
            this.isFilterShow = true;
            this.selectedColumns = this.checkSelectedColumn(resp['selectedColumns'] || [], this.selectedColumns);
            this.primengTable._filter();
        });
    }

    ngAfterViewInit() {
        // Defult Active filter show
        this._filterService.updateSelectedOption('');
        this._filterService.updatedSelectionOptionTwo('');
        this.updateSelectedOptionThree('');
        this.updateSelectedOptionFour('');
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            this.selectedAgent = filterData['table_config']['agent_id_filters']?.value;
            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }
        
            if (filterData['table_config']['entry_date_time']?.value != null && filterData['table_config']['entry_date_time'].value.length) {
                this._filterService.updateSelectedOption('custom_date_range');
                this._filterService.rangeDateConvert(filterData['table_config']['entry_date_time']);
            }
            if (filterData['table_config']['travel_date']?.value != null && filterData['table_config']['travel_date'].value.length) {
                this._filterService.updatedSelectionOptionTwo('custom_date_range');
                this._filterService.rangeDateConvert(filterData['table_config']['travel_date']);
            }          

            if (filterData['table_config']['payment_request_time']?.value != null && filterData['table_config']['payment_request_time'].value.length) {
                this.updateSelectedOptionThree('custom_date_range');
                this._filterService.rangeDateConvert(filterData['table_config']['payment_request_time']);
            }

             if (filterData['table_config']['payment_confirmation_time']?.value != null && filterData['table_config']['payment_confirmation_time'].value.length) {
                this.updateSelectedOptionFour('custom_date_range');
                this._filterService.rangeDateConvert(filterData['table_config']['payment_confirmation_time']);
            }
            this.primengTable['filters'] = filterData['table_config'];
            this.selectedColumns = this.checkSelectedColumn(filterData['selectedColumns'] || [], this.selectedColumns);
            this.onColumnsChange();
            // this.primengTable['_sortField'] = filterData['sortColumn'];
            // this.sortColumn = filterData['sortColumn'];
            // this.selectedColumns = filterData['selectedColumns'] || [];
            this.isFilterShow = true;

        } else {
            this.selectedColumns = this.checkSelectedColumn([], this.selectedColumns);
            this.onColumnsChange();
        }


    }

    onColumnsChange(): void {
        this._filterService.setSelectedColumns({ name: this.filter_table_name, columns: this.selectedColumns });
    }

    checkSelectedColumn(col: any[], oldCol: Column[]): any[] {
        if (col.length) return col;
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

    onSelectedColumnsChange(): void {
        this._filterService.setSelectedColumns({ name: this.filter_table_name, columns: this.selectedColumns });
    }


    // get selectedColumns(): Column[] {
    //     return this.selectedColumns;
    // }

    // set selectedColumns(val: Column[]) {
    //     if (Array.isArray(val)) {
    //         this._selectedColumns = this.cols.filter(col =>
    //             val.some(selectedCol => selectedCol.field === col.field)
    //         );
    //     } else {
    //         this._selectedColumns = [];
    //     }
    // }

    getFilter(): any {
        const filterReq = {};
        filterReq['date_'] = this.visaFilter.date_ ? DateTime.fromJSDate(new Date(this.visaFilter.date_)).toFormat('yyyy-MM-dd') : '';
        filterReq['FromDate'] = DateTime.fromJSDate(this.visaFilter.FromDate).toFormat('yyyy-MM-dd');
        filterReq['ToDate'] = DateTime.fromJSDate(this.visaFilter.ToDate).toFormat('yyyy-MM-dd');
        // const filterReq = GridUtils.GetFilterReq(
        //     this._paginator,
        //     this._sort,
        //     this.searchInputControl.value
        // );
        filterReq['FromDate'] = '';
        filterReq['ToDate'] = '';
        // filterReq['FromDate'] = DateTime.fromJSDate(this.visaFilter.FromDate).toFormat('yyyy-MM-dd');
        // filterReq['ToDate'] = DateTime.fromJSDate(this.visaFilter.ToDate).toFormat('yyyy-MM-dd');
        filterReq['date_'] = this.visaFilter.date_ ? DateTime.fromJSDate(new Date(this.visaFilter.date_)).toFormat('yyyy-MM-dd') : '';
        filterReq['agent_id'] = this.visaFilter?.agent_id?.id || '';
        filterReq['Status'] = this.visaFilter?.Status == 'All' ? '' : this.visaFilter?.Status;
        return filterReq;
    }

    getAgent(value: string) {
        this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
            this.agentList = data;

            for (let i in this.agentList) {
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`
            }
        });
    }

    filter() {
        this.matDialog
            .open(VisaFilterComponent, {
                data: this.visaFilter,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.visaFilter = res;
                    this.refreshItems();
                }
            });
    }

    viewField(data: any): void {
        if (data.price_Detail.length == null) {
            return;
        } else {
            this.matDialog
                .open(MarkuppriceInfoComponent, {
                    disableClose: true,
                    data: { data: data.price_Detail, title: "Price Details" },
                })
                .afterClosed()
                .subscribe({
                    next: (value) => { },
                });
        }
    }


    viewData(record): void {
        if (!Security.hasPermission(bookingsVisaPermissions.modifyPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // let queryParams: any= this.router.navigate([Routes.booking.booking_details_route + '/' + record.id + '/readonly'])
        Linq.recirect('/booking/visa/details/' + record.id);
    }

    bookingRef(record): void {
        if (!Security.hasPermission(bookingsVisaPermissions.modifyPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // if (record?.visa_status !== 'Payment Confirmed') {
        Linq.recirect('/booking/visa/details/' + record.id);
        // }
    }

    startProcess(record): void {
        this.conformationService.open({
            title: 'Start Process',
            message: 'Are you sure to start process of visa ' + record.booking_ref_no + ' ?'
        }).afterClosed().subscribe((res) => {
            if (res === 'confirmed') {
                this.visaService.visaStartProcess(record.id).subscribe({
                    next: res => {
                        if (res) {
                            this.alertService.showToast('success', 'Start Process Successfully!');
                        }
                    }, error: err => {
                        this.alertService.showToast('error', err)
                    }
                })
                Linq.recirect('/booking/visa/details/' + record.id);
            }
        });
    }

    refreshItems(event?: any) {
        this.isLoading = true;
        let extraModel = this.getFilter();
        let newModel = this.getNewFilterReq(event)
        var model = { ...extraModel, ...newModel };
        if (Security.hasPermission(bookingsVisaPermissions.viewOnlyAssignedPermissions)) {
            model.relationmanagerId = this.user.id
        }

        this.visaService.getVisaBookingList(model).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                this.totalRecords = data.total;
                if (this.dataList && this.dataList.length) {
                    setTimeout(() => {
                        this.isFrozenColumn('', ['booking_ref_no', 'visa_status']);
                    }, 200);
                } else {
                    setTimeout(() => {
                        this.isFrozenColumn('', ['booking_ref_no', 'visa_status'], true);
                    }, 200);
                }
            },
            error: (err) => {
                this.toasterService.showToast('error', err)
                this.isLoading = false;
            },
        });
    }

    getNodataText(): string {
        if (this.isLoading) return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    exportExcel(): void {
        if (!Security.hasExportDataPermission(module_name.bookingsVisa)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // const filterReq = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value);
        // const req = Object.assign(filterReq);

        // req.skip = 0;
        // req.take = this.totalRecords;
        const filterReq = this.getNewFilterReq({});
        filterReq['date_'] = this.visaFilter.date_ ? DateTime.fromJSDate(new Date(this.visaFilter.date_)).toFormat('yyyy-MM-dd') : '';
        filterReq['FromDate'] = DateTime.fromJSDate(this.visaFilter.FromDate).toFormat('yyyy-MM-dd');
        filterReq['ToDate'] = DateTime.fromJSDate(this.visaFilter.ToDate).toFormat('yyyy-MM-dd');
        filterReq['agent_id'] = this.visaFilter?.agent_id?.id || '';
        filterReq['Status'] = this.visaFilter?.Status == 'All' ? '' : this.visaFilter?.Status;
        filterReq['Take'] = this.totalRecords;

        this.visaService.getVisaBookingList(filterReq).subscribe(data => {
            for (var dt of data.data) {
                dt.travel_date = dt.travel_date ? DateTime.fromISO(dt.travel_date).toFormat('dd-MM-yyyy') : '';
                dt.entry_date_time = dt.entry_date_time ? DateTime.fromISO(dt.entry_date_time).toFormat('dd-MM-yyyy HH:mm:ss') : '';
                dt.payment_request_time = dt.payment_request_time ? DateTime.fromISO(dt.payment_request_time).toFormat('dd-MM-yyyy HH:mm:ss') : '';
                dt.payment_confirmation_time = dt.payment_confirmation_time ? DateTime.fromISO(dt.payment_confirmation_time).toFormat('dd-MM-yyyy HH:mm:ss') : '';

            }
            Excel.export(
                'Visa Booking',
                [
                    { header: 'Reference No.', property: 'booking_ref_no' },
                    { header: 'Status', property: 'visa_status' },
                    { header: 'Date', property: 'entry_date_time' },
                    { header: 'Operation Person', property: 'operation_person' },
                    { header: 'Agent', property: 'agent' },
                    { header: 'Purchase Price', property: 'purchase_price' },
                    { header: 'Type', property: 'user_type' },
                    { header: 'MOP', property: 'payment_mode' },
                    { header: 'Destination', property: 'destination_caption' },
                    { header: 'Travel Date', property: 'travel_date' },
                    { header: 'Pax', property: 'pax' },
                    { header: 'PG', property: 'payment_gateway' },
                    { header: 'IP Address', property: 'ip_address' },
                    { property: 'visa_type', header: 'Visa Type' },
                    { property: 'length_of_stay', header: 'Length of Stay' },
                    { property: 'customer_name', header: 'Customer Name' },
                    { property: 'payment_request_time', header: 'Payment Request Time' },
                    { property: 'payment_confirmation_time', header: 'Payment Confirmation Time' },
                    { property: 'psp_ref_number', header: 'PSP Refrence No.' },
                    { property: 'payment_fail_reason', header: 'Payment Fail Reason' },
                ],
                data.data, "Visa Booking", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }]);
        });
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

    onOptionClickThree(option: any, primengTable: any, field: any, key?: any) {
        this.selectedOptionTwoSubjectThree.next(option.id_by_value);
        
        if( option.id_by_value &&  option.id_by_value != 'custom_date_range'){
            primengTable.filter(option, field, 'custom');
        } 
    }

    onOptionClickFour(option: any, primengTable: any, field: any, key?: any) {
        this.selectedOptionTwoSubjectFour.next(option.id_by_value);
        
        if( option.id_by_value &&  option.id_by_value != 'custom_date_range'){
            primengTable.filter(option, field, 'custom');
        } 
    }

}
