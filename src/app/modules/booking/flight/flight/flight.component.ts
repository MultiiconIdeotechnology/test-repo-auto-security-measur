
import { NgIf, NgFor, DatePipe, CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterOutlet } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Routes } from 'app/common/const';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { Security, bookingsFlightPermissions, filter_module_name, messages, module_name } from 'app/security';
import { FlightTabService } from 'app/services/flight-tab.service';
import { Excel } from 'app/utils/export/excel';
import { Linq } from 'app/utils/linq';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FlightFilterComponent } from './flight-filter/flight-filter.component';
import { MarkuppriceInfoComponent } from './markupprice-info/markupprice-info.component';
import { ImportPnrComponent } from './import-pnr/import-pnr.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToasterService } from 'app/services/toaster.service';
import { StatusUpdateComponent } from './status-update/status-update.component';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AgentService } from 'app/services/agent.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
    selector: 'app-flight',
    templateUrl: './flight.component.html',
    styleUrls: ['./flight.component.scss'],
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
export class FlightComponent extends BaseListingComponent {
    flightFilter: any;
    module_name = module_name.flight;
    filter_table_name = filter_module_name.flight_booking;
    private settingsUpdatedSubscription: Subscription;
    dataList = [];
    agentList: any[] = [];
    airportFromList: any[] = [];
    airportToList: any[] = [];
    supplierList: any[] = [];
    total = 0;
    isFilterShow: boolean = false;
    _selectedColumns: Column[];

    public startDate = new FormControl();
    public endDate = new FormControl();
    public StartDate: any;
    public EndDate: any;
    cols = [];
    selectedToAirport: any;
    selectedFromAirport: any;
    selectedSupplier: any;
    selectedAgent: any;
    selectionDateDropdown: any;
    statusList = [
        { label: 'Pending', value: 'Pending' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'Waiting for Payment', value: 'Waiting for Payment' },
        { label: 'Confirmed', value: 'Confirmed' },
        { label: 'Offline Pending', value: 'Offline Pending' },
        { label: 'Confirmation Pending', value: 'Confirmation Pending' },
        { label: 'Payment Failed', value: 'Payment Failed' },
        { label: 'Booking Failed', value: 'Booking Failed' },
        { label: 'Cancelled', value: 'Cancelled' },
        { label: 'Partially Cancelled', value: 'Partially Cancelled' },
        { label: 'Hold', value: 'Hold' },
        { label: 'Payment Completed', value: 'Payment Completed' },
        { label: 'Partial Payment Completed', value: 'Partial Payment Completed' },
        { label: 'Assign To Refund', value: 'Assign To Refund' },
    ];

    bookingFromList: any = [
        { label: 'Online', value: false },
        { label: 'Import', value: true }
    ]

    // dateRangeList: any[] = [
    //     { label: 'Today', value: 'today' },
    //     { label: 'Last 3 Days', value: 'Last 3 Days' },
    //     { label: 'This Week', value: 'This Week' },
    //     { label: 'This Month', value: 'This Month' },
    //     { label: 'Last 3 Months', value: 'Last 3 Months' },
    //     { label: 'Last 6 Months', value: 'Last 6 Months' },
    //     { label: 'Custom Date Range', value: 'Custom Date Range' }
    // ];
    dateRangeValue: Date[];
    // clipboard: any;
    // toastr: any;

    constructor(
        private flighttabService: FlightTabService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog,
        private toastr: ToasterService,
        private agentService: AgentService,
        private clipboard: Clipboard,
        private router: Router,
        public _filterService: CommonFilterService
    ) {
        super(module_name.flight);
        this.key = this.module_name;
        this.sortColumn = 'bookingDate';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);

        this.flightFilter = {
            fromCity: '',
            toCity: '',
            booking_date: '',
            status: ['All'],
            fromcityfilter: '',
            supplier_id: [{
                "id": "all",
                "company_name": "All"
            }],
            FromDate: new Date(),
            ToDate: new Date(),
        };
        this.flightFilter.FromDate.setDate(1);
        this.flightFilter.FromDate.setMonth(this.flightFilter.FromDate.getMonth() - 3);
    }

    ngOnInit() {

        this.getAgentList("", true);
        this.getAirportFromList("");
        this.getAirportToList("");
        this.getSupplierList();

        // common filter
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
            this.selectedAgent = resp['table_config']['agent_id_filters']?.value;
            this.selectedSupplier = resp['table_config']['supplier_name']?.value;
            this.selectedFromAirport = resp['table_config']['from_id_filtres']?.value;
            this.selectedToAirport = resp['table_config']['to_id_filtres']?.value;


            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }

            if (this.selectedFromAirport && this.selectedFromAirport.id) {
                const match = this.airportFromList.find((item: any) => item.id == this.selectedFromAirport?.id);
                if (!match) {
                    this.airportFromList.push(this.selectedFromAirport);
                }
            }

            if (this.selectedToAirport && this.selectedToAirport.id) {
                const match = this.airportToList.find((item: any) => item.id == this.selectedToAirport?.id);
                if (!match) {
                    this.airportToList.push(this.selectedToAirport);
                }
            }

            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];
            if (resp['table_config']['bookingDate']?.value != null && resp['table_config']['bookingDate'].value.length) {
                this._filterService.rangeDateConvert(resp['table_config']['bookingDate']);
            }
            if (resp['table_config']['travelDate']?.value != null) {
                resp['table_config']['travelDate'].value = new Date(resp['table_config']['travelDate'].value);
            }
            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShow = true;
            this.primengTable._filter();
        });

    }

    ngAfterViewInit() {
        // Defult Active filter show
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShow = true;
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            this.selectedAgent = filterData['table_config']['agent_id_filters']?.value;
            this.selectedSupplier = filterData['table_config']['supplier_name']?.value;
            this.selectedFromAirport = filterData['table_config']['from_id_filtres']?.value;
            this.selectedToAirport = filterData['table_config']['to_id_filtres']?.value;

            if (filterData['table_config']['bookingDate'].value && filterData['table_config']['bookingDate'].value.length) {
                this._filterService.rangeDateConvert(filterData['table_config']['bookingDate']);
            }
            if (filterData['table_config']['travelDate'].value) {
                filterData['table_config']['travelDate'].value = new Date(filterData['table_config']['travelDate'].value);
            }
            this.primengTable['filters'] = filterData['table_config'];
            // this.primengTable['_sortField'] = filterData['sortColumn'];
            // this.sortColumn = filterData['sortColumn'];
        }
    }

    // get selectedColumns(): Column[] {
    //     return this._selectedColumns;
    // }

    // set selectedColumns(val: Column[]) {
    //     if (Array.isArray(val)) {
    //       this._selectedColumns = this.cols.filter(col =>
    //         val.some(selectedCol => selectedCol.field === col.field)
    //       );
    //     } else {
    //       this._selectedColumns = [];
    //     }
    //   }

    copy(link) {
        this.clipboard.copy(link);
        this.toastr.showToast('success', 'Copied');
    }
    
    // onOptionClick(option: any) {
    //     this.selectionDateDropdown = option.value;
    //     const today = new Date();
    //     let startDate = new Date(today);
    //     let endDate = new Date(today);
    
    //     switch (option.label) {
    //         case 'Today':
    //             break;
    //         case 'Last 3 Days':
    //             startDate.setDate(today.getDate() - 3);
    //             break;
    //         case 'This Week':
    //             startDate.setDate(today.getDate() - today.getDay());
    //             break;
    //         case 'This Month':
    //             startDate.setDate(1); 
    //             break;
    //         case 'Last 3 Months':
    //             startDate.setMonth(today.getMonth() - 3);
    //             startDate.setDate(1); 
    //             break;
    //         case 'Last 6 Months':
    //             startDate.setMonth(today.getMonth() - 6);
    //             startDate.setDate(1); 
    //             break;
    //         case 'Custom Date Range':
    //             startDate.setHours(0, 0, 0, 0);
    //             endDate.setHours(23, 59, 59, 999);
    //             this.dateRangeValue = [startDate, endDate];
    //             const customRange = [startDate.toISOString(), endDate.toISOString()].join(",");
    //             this.primengTable.filter(customRange, 'bookingDate', 'custom');
    //             return;
    //         default:
    //             return;
    //     }
    
    //     startDate.setHours(0, 0, 0, 0);
    //     endDate.setHours(23, 59, 59, 999);
    
    //     const range = [startDate.toISOString(), endDate.toISOString()].join(",");
    //     this.primengTable.filter(range, 'bookingDate', 'custom');
    // }
    

    // onDateRangeCancel() {
    //     this.selectionDateDropdown = 'today'
    // }

    getFilter(): any {
        const filterReq = {};
        filterReq['FromDate'] = '';
        filterReq['ToDate'] = '';
        // filterReq['FromDate'] = DateTime.fromJSDate(this.flightFilter.FromDate).toFormat('yyyy-MM-dd');
        // filterReq['ToDate'] = DateTime.fromJSDate(this.flightFilter.ToDate).toFormat('yyyy-MM-dd');
        filterReq['agent_for'] = this.flightFilter?.agent_for;
        filterReq['agent_id'] = this.flightFilter?.agent_id?.id || '';
        filterReq['from'] = this.flightFilter?.fromCity?.id == 'All' ? '' : this.flightFilter?.fromCity?.id;
        filterReq['to'] = this.flightFilter?.toCity?.id == 'All' ? '' : this.flightFilter?.toCity?.id;
        filterReq['supplier_id'] = this.flightFilter?.supplier_id?.map(x => x.id).join(',') == 'all' ? '' : this.flightFilter?.supplier_id?.map(x => x.id).join(',');
        // filterReq['status'] = this.flightFilter?.status == 'All' ? '' : this.flightFilter?.status;
        filterReq['status'] = this.flightFilter?.status == 'All' ? '' : this.flightFilter?.status.join(',');

        return filterReq;
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        let extraModel = this.getFilter();
        let regularModel = this.getNewFilterReq(event);
        let model = { ...extraModel, ...regularModel };
        this.flighttabService.getAirBookingList(model).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                this.totalRecords = data.total;
                if (this.dataList && this.dataList.length) {
                    setTimeout(() => {
                        this.isFrozenColumn('', ['booking_ref_no', 'status']);
                    }, 200);
                } else {
                    setTimeout(() => {
                        this.isFrozenColumn('', ['booking_ref_no', 'status'], true);
                    }, 200);
                }
            },
            error: (err) => {
                this.isLoading = false;
            },
        });
    }

    onTableFilter() {
        this.isFilterShow = !this.isFilterShow;
    }

    // Api to get the Agent list data
    getAgentList(value: string, bool = true) {
        this.agentService.getAgentComboMaster(value, bool).subscribe((data: any) => {
            this.agentList = data;

            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }

            for (let i in this.agentList) {
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`
            }
        });
    }

    // Api to get the Airportlist Data (from)
    getAirportFromList(value: any) {
        this.flighttabService.getAirportMstCombo(value).subscribe((data: any) => {
            this.airportFromList = data;

            if (this.selectedFromAirport && this.selectedFromAirport.id) {
                const match = this.airportFromList.find((item: any) => item.id == this.selectedFromAirport?.id);
                if (!match) {
                    this.airportFromList.push(this.selectedFromAirport);
                }
            }

            // if (!value) {
            //     this.airportToList = data;
            // }
        })
    }

    // Api to get the Airportlist Data (To)
    getAirportToList(value: any) {
        this.flighttabService.getAirportMstCombo(value).subscribe((data: any) => {
            this.airportToList = data;

            if (this.selectedToAirport && this.selectedToAirport.id) {
                const match = this.airportToList.find((item: any) => item.id == this.selectedToAirport?.id);
                if (!match) {
                    this.airportToList.push(this.selectedToAirport);
                }
            }
        })
    }

    // Api to get the Supplier List
    getSupplierList() {
        this.flighttabService.getSupplierBoCombo('Airline').subscribe((data: any) => {
            this.supplierList = data;

            for (let i in this.supplierList) {
                this.supplierList[i].id_by_value = this.supplierList[i].company_name;
            }
        })
    }

    importPnr() {
        if (!Security.hasPermission(bookingsFlightPermissions.importPNRPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(ImportPnrComponent,
            { data: null, disableClose: true, })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.alertService.showToast('success', 'New record added', 'top-right', true);
                    this.refreshItems();
                }
            });
    }

    viewField(data: any): void {
        if (data.fields.length == null) {
            return;
        } else {
            this.matDialog
                .open(MarkuppriceInfoComponent, {
                    disableClose: true,
                    data: { data: data.fields, title: "Markups & Price" },
                })
                .afterClosed()
                .subscribe({
                    next: (value) => { },
                });
        }
    }

    viewData(record): void {
        if (!Security.hasViewDetailPermission(module_name.bookingsFlight)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // let queryParams: any= this.router.navigate([Routes.booking.booking_details_route + '/' + record.id + '/readonly'])
        Linq.recirect('/booking/flight/details/' + record.id);
    }

    filter() {
        this.matDialog
            .open(FlightFilterComponent, {
                data: this.flightFilter,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.flightFilter = res;
                    this.refreshItems();
                }
            });
    }

    statusUpdate(data) {
        if (!Security.hasPermission(bookingsFlightPermissions.statusUpdatePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        this.matDialog
            .open(StatusUpdateComponent, {
                data: data,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    // this.flightFilter = res;
                    this.refreshItems();
                }
            });
    }

    getStatusColor(status: string): string {
        if (status == 'Pending' || status == 'Offline Pending' || status == 'Confirmation Pending' || status == 'Partially Cancelled' || status == 'Hold Released') {
            return 'text-orange-600';
        } else if (status == 'Waiting for Payment' || status == 'Partial Payment Completed' || status == 'Assign To Refund' || status == 'Payment Completed') {
            return 'text-yellow-600';
        } else if (status == 'Confirmed') {
            return 'text-green-600';
        } else if (status == 'Payment Failed' || status == 'Booking Failed' || status == 'Cancelled' || status == 'Rejected' || status == 'Hold Failed') {
            return 'text-red-600';
        } else if (status == 'Hold') {
            return 'text-blue-600';
        } else {
            return '';
        }
    }

    getNodataText(): string {
        if (this.isLoading) return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    offlinePnr() {
        if (!Security.hasPermission(bookingsFlightPermissions.offlinePNRPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.router.navigate([Routes.booking.booking_details_offline_route])
    }

    exportExcel(): void {
        if (!Security.hasExportDataPermission(module_name.bookingsFlight)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // const filterReq = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value);
        // const req = Object.assign(filterReq);

        // req.skip = 0;
        // req.take = this.totalRecords;
        const filterReq = this.getNewFilterReq({});

        filterReq['FromDate'] = DateTime.fromJSDate(this.flightFilter.FromDate).toFormat('yyyy-MM-dd');
        filterReq['ToDate'] = DateTime.fromJSDate(this.flightFilter.ToDate).toFormat('yyyy-MM-dd');
        filterReq['agent_for'] = this.flightFilter?.agent_for;
        filterReq['agent_id'] = this.flightFilter?.agent_id?.id || '';
        filterReq['fromCity'] = this.flightFilter?.fromCity?.id || '';
        filterReq['toCity'] = this.flightFilter?.toCity?.id || '';
        filterReq['supplier_id'] = this.flightFilter?.supplier_id?.map(x => x.id).join(',') == 'all' ? '' : this.flightFilter?.supplier_id?.map(x => x.id).join(',');
        filterReq['status'] = this.flightFilter?.status.join(',');
        filterReq['Filter'] = this.searchInputControl.value;
        filterReq['Take'] = this.totalRecords;

        this.flighttabService.getAirBookingList(filterReq).subscribe(data => {
            for (var dt of data.data) {
                dt.bookingDate = dt.bookingDate ? DateTime.fromISO(dt.bookingDate).toFormat('dd-MM-yyyy HH:mm:ss') : '';
                dt.travelDate = dt.travelDate ? DateTime.fromISO(dt.travelDate).toFormat('dd-MM-yyyy HH:mm:ss') : '';
                dt.from = dt.from + ' to ' + dt.to + ' - ' + dt.cabin;
                dt.pax = 'Adult: ' + dt.adults + ', child: ' + dt.child + ', Infants:' + dt.infants;
                // dt.fieldslist = '';
                // for (var fl of dt.fields) {
                //   dt.fieldslist = dt.fieldslist + fl.key + ' - ' + fl.value + ', ';
                // }
            }
            Excel.export(
                'Flight Booking',
                [
                    { header: 'Reference No.', property: 'booking_ref_no' },
                    { header: 'Status', property: 'status' },
                    { header: 'Date', property: 'bookingDate' },
                    { header: 'PNR', property: 'pnr' },
                    { header: 'GDS PNR', property: 'gds_pnr' },
                    { header: 'Supplier', property: 'supplier_name' },
                    { header: 'Carrier', property: 'operating_carrier' },
                    { header: 'Purchase Price', property: 'purchase_price' },
                    { header: 'Type', property: 'user_type' },
                    { header: 'MOP', property: 'mop' },
                    { header: 'Agent', property: 'agent_name' },
                    { header: 'From', property: 'from_airport_code' },
                    { header: 'To', property: 'to_airport_code' },
                    { header: 'Travel Date', property: 'travelDate' },
                    { header: 'Trip Type', property: 'tripType' },
                    { header: 'Cabin', property: 'cabin' },
                    { header: 'Device', property: 'device' },
                    { header: 'Supplier Ref.No.', property: 'supplier_ref_no' },
                    { header: 'PG', property: 'payment_gateway_name' },
                    { header: 'Travel Type', property: 'travelType' },
                    { header: 'IP Address', property: 'ipAddress' },
                ],
                data.data, "Flight Booking", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }]);
        });
    }

    ngOnDestroy(): void {
        // this.masterService.setData(this.key, this);

        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }
}
