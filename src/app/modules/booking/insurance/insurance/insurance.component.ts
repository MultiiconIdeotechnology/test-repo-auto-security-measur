import { Component } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
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
import { RouterOutlet } from '@angular/router';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { BaseListingComponent, Column, Types } from 'app/form-models/base-listing';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { UserService } from 'app/core/user/user.service';
import { bookingsInsurancePermissions, filter_module_name, messages, module_name, Security } from 'app/security';
import { AgentService } from 'app/services/agent.service';
import { ToasterService } from 'app/services/toaster.service';
import { Subscription, takeUntil } from 'rxjs';
import { InsuranceService } from 'app/services/insurance.service';
import { Linq } from 'app/utils/linq';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-insurance',
  standalone: true,
  templateUrl: './insurance.component.html',
  styleUrls: ['./insurance.component.scss'],
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
export class InsuranceComponent extends BaseListingComponent {

  module_name = module_name.insurance;
  filter_table_name = filter_module_name.insurance_booking;
  private settingsUpdatedSubscription: Subscription;
  user: any = {};
  dataList = [];
  total = 0;
  isFilterShow: boolean = false;
  statusList = ['Pending', 'Confirmed', 'Payment Failed', 'Inprocess', 'Failed', 'Applied', 'Success', 'Rejected', 'Partial Cancelled'];

  types = Types;
  selectedColumns: Column[] = [];
  exportCol: Column[] = [];
  activeFiltData: any = {};
  cols: Column[] = [
    { field: 'pax', header: 'No of Pax', type: Types.number, fixVal: 0 },
    { field: 'planName', header: 'Policy Name', type: 'text', },
    { field: 'psp_ref_number', header: 'PSP Reference No.', type: 'text' },
  ];
  agentList: any[] = [];
  selectedAgent: any;
  insuranceFilter: any;





  constructor(
    private toasterService: ToasterService,
    private insuranceService: InsuranceService,
    private userService: UserService,
    private agentService: AgentService,
    public _filterService: CommonFilterService
  ) {
    super(module_name.insurance);
    this.key = this.module_name;
    this.sortColumn = 'bookingDate';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);

    this.insuranceFilter = {
      From: '',
      To: '',
      agent_id: '',
      date_: '',
      Status: 'All',
      FromDate: new Date(),
      ToDate: new Date(),

    };
    this.insuranceFilter.FromDate.setDate(1);
    this.insuranceFilter.FromDate.setMonth(this.insuranceFilter.FromDate.getMonth() - 3);

    this.userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user: any) => {
        this.user = user;
      });


    this.selectedColumns = [
      { field: 'booking_ref_no', header: 'Reference No.', type: Types.link, isFrozen: false, },
      { field: 'status', header: 'Status', type: Types.select, isFrozen: false, isCustomColor: true },
      { field: 'bookingDate', header: 'Date', type: Types.dateTime, dateFormat: 'dd-MM-yyyy HH:mm:ss' },
      { field: 'supplier', header: 'Supplier', type: Types.text },
      { field: 'policyNumber', header: 'Policy No', type: Types.text },
      { field: 'purchase_price', header: 'Purchase Price', type: Types.number, fixVal: 2 },
      { field: 'user_type', header: 'Type', type: Types.text },
      { field: 'device', header: 'Device', type: Types.text },
      { field: 'mop', header: 'MOP', type: Types.text },
      { field: 'agent_name', header: 'Agent', type: Types.select, },
      { field: 'startDate', header: 'Travel From Date', type: Types.date, dateFormat: 'dd-MM-yyyy' },
      { field: 'endDate', header: 'Travel To Date', type: Types.date, dateFormat: 'dd-MM-yyyy' },
      { field: 'duration', header: 'Duration', type: Types.number, fixVal: 0 },
      { field: 'payment_gateway', header: 'PG', type: Types.text },
      { field: 'travelType', header: 'Travel Type', type: Types.text },
      { field: 'device', header: 'Device', type: Types.text },
      { field: 'ip_address', header: 'IP Address', type: Types.text }
    ];

    this.cols.unshift(...this.selectedColumns);
    this.exportCol = cloneDeep(this.cols);


  }

  ngOnInit() {
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
      this.sortColumn = resp['sortColumn'];
      this.primengTable['_sortField'] = resp['sortColumn'];
      this.isFilterShow = true;
      //this.selectDateRanges(resp['table_config']);
      this.primengTable['filters'] = resp['table_config'];
      this.selectedColumns = this.checkSelectedColumn(resp['selectedColumns'] || [], this.selectedColumns);
      this.primengTable._filter();
    });


    this.agentList = this._filterService.agentListByValue;

    // common filter
    this._filterService.updateSelectedOption('');
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
      this._filterService.updateSelectedOption('');
      this.selectedAgent = resp['table_config']['agent_name']?.value;
      if (this.selectedAgent && this.selectedAgent.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }

      if (resp['table_config']['bookingDate']?.value && Array.isArray(resp['table_config']['bookingDate']?.value)) {
        this._filterService.selectionDateDropdown = 'custom_date_range';
        this._filterService.rangeDateConvert(resp['table_config']['bookingDate']);
      }
      if (resp['table_config']['startDate']?.value != null) {
        resp['table_config']['startDate'].value = new Date(resp['table_config']['startDate'].value);
      }
      if (resp['table_config']?.['endDate']?.value != null) {
        resp['table_config']['endDate'].value = new Date(resp['table_config']['endDate'].value);
      }

      this.primengTable['filters'] = resp['table_config'];
      this.selectedColumns = resp['selectedColumns'] || [];
      this.isFilterShow = true;
      this.primengTable._filter();
    });


  }

  ngAfterViewInit() {
    // Defult Active filter show
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
      this.selectedAgent = filterData['table_config']['agent_name']?.value;
      if (this.selectedAgent && this.selectedAgent.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }

      if (filterData['table_config']['bookingDate']?.value && Array.isArray(filterData['table_config']['bookingDate']?.value)) {
        this._filterService.selectionDateDropdown = 'custom_date_range';
        this._filterService.rangeDateConvert(filterData['table_config']['bookingDate']);
      }
      if (filterData['table_config']['startDate']?.value != null) {
        filterData['table_config']['startDate'].value = new Date(filterData['table_config']['startDate'].value);
      }
      if (filterData['table_config']?.['endDate']?.value != null) {
        filterData['table_config']['endDate'].value = new Date(filterData['table_config']['endDate'].value);
      }
      this.primengTable['filters'] = filterData['table_config'];
      // this.primengTable['_sortField'] = filterData['sortColumn'];
      // this.sortColumn = filterData['sortColumn'];
      this.selectedColumns = filterData['selectedColumns'] || [];
      this.isFilterShow = true;
    }

    const filter = this._filterService.getDefaultFilterByGridName({ gridName: this.filter_table_name });
    if (filter && filter?.gridConfiguration) {
      this.activeFiltData = filter;
      this.isFilterShow = true;
      let filterData = JSON.parse(filter.gridConfiguration);
      this.primengTable['filters'] = filterData['table_config'];
      this.primengTable['_sortField'] = filterData['sortColumn'];
      this.sortColumn = filterData['sortColumn'];
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

  getStatusColor(status: string): string {
    if (status == 'Pending' || status == 'Offline Pending' || status == 'Confirmation Pending' || status == 'Partially Cancelled' || status == 'Partial Cancelled' || status == 'Hold Released') {
      return 'text-orange-600';
    } else if (status == 'Waiting for Payment' || status == 'Partial Payment Completed' || status == 'Assign To Refund' || status == 'Payment Completed') {
      return 'text-yellow-600';
    } else if (status == 'Confirmed') {
      return 'text-green-600';
    } else if (status == 'Payment Failed' || status == 'Booking Failed' || status == 'Cancelled' || status == 'Rejected' || status == 'Failed') {
      return 'text-red-600';
    } else if (status == 'Hold') {
      return 'text-blue-600';
    } else {
      return '';
    }
  }

  // get selectedColumns(): Column[] {
  //   return this._selectedColumns;
  // }

  // set selectedColumns(val: Column[]) {
  //   if (Array.isArray(val)) {
  //     this._selectedColumns = this.cols.filter(col =>
  //       val.some(selectedCol => selectedCol.field === col.field)
  //     );
  //   } else {
  //     this._selectedColumns = [];
  //   }
  // }

  bookingRef(record): void {
    if (!Security.hasPermission(bookingsInsurancePermissions.modifyPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    Linq.recirect('/booking/insurance/details/' + record.id);
  }

  refreshItems(event?: any) {
    this.isLoading = true;
    this.insuranceService.getInsuranceBookingList(this.getNewFilterReq(event)).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.dataList = data.data;
        this.dataList.forEach(x =>{
          x.duration = Number(x.duration || "0");
          x.duration = Number(x.duration);
        })
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
        this.toasterService.showToast('error', err)
        this.isLoading = false;
      },
    });
  }

  getAgent(value: string) {
    this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
      this.agentList = data;

      for (let i in this.agentList) {
        this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`;
        this.agentList[i].id_by_value = this.agentList[i].agency_name;
      }
    })
  }

  exportExcel(): void {
    if (!Security.hasExportDataPermission(module_name.bookingsVisa)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    const filterReq = this.getNewFilterReq({});
    filterReq['date_'] = this.insuranceFilter.date_ ? DateTime.fromJSDate(new Date(this.insuranceFilter.date_)).toFormat('yyyy-MM-dd') : '';
    filterReq['FromDate'] = DateTime.fromJSDate(this.insuranceFilter.FromDate).toFormat('yyyy-MM-dd');
    filterReq['ToDate'] = DateTime.fromJSDate(this.insuranceFilter.ToDate).toFormat('yyyy-MM-dd');
    filterReq['agent_id'] = this.insuranceFilter?.agent_id?.id || '';
    filterReq['Status'] = this.insuranceFilter?.Status == 'All' ? '' : this.insuranceFilter?.Status;
    filterReq['Take'] = this.totalRecords;

    this.insuranceService.getInsuranceBookingList(filterReq).subscribe(data => {
      for (var dt of data.data) {
        dt.bookingDate = dt.bookingDate ? DateTime.fromISO(dt.bookingDate).toFormat('dd-MM-yyyy HH:mm:ss') : '';
        dt.startDate = dt.startDate ? DateTime.fromISO(dt.startDate).toFormat('dd-MM-yyyy HH:mm:ss') : '';
        dt.endDate = dt.endDate ? DateTime.fromISO(dt.endDate).toFormat('dd-MM-yyyy HH:mm:ss') : '';

      }
      Excel.export(
        'Insurance Booking',
        [
          { header: 'Reference No.', property: 'booking_ref_no' },
          { header: 'Status', property: 'status' },
          { header: 'Date', property: 'bookingDate' },
          { header: 'Supplier', property: 'supplier' },
          { header: 'Policy No', property: 'policyNumber' },
          { header: 'Purchase Price', property: 'purchase_price' },
          { header: 'Type', property: 'user_type' },
          { header: 'Device', property: 'device' },
          { header: 'MOP', property: 'mop' },
          { header: 'Agent', property: 'agent_name' },
          { header: 'Travel From Date', property: 'startDate' },
          { header: 'Travel To Date', property: 'endDate' },
          { header: 'Duration', property: 'duration' },
          { header: 'PG', property: 'payment_gateway' },
          { header: 'Travel Type', property: 'travelType' },
          { header: 'Device', property: 'device', },
          { header: 'IP Address', property: 'ip_address' },
          { header: 'No of Pax', property: 'pax' },
          { header: 'Policy Name', property: 'planName' },
          { header: 'PSP Reference No.', property: 'psp_ref_number' },

        ],
        data.data, "Insurance Booking", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }]);
    });
  }

  getNodataText(): string {
    if (this.isLoading) return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
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
