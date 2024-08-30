import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterOutlet } from '@angular/router';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { module_name } from 'app/security';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatDialog } from '@angular/material/dialog';
import { LeadsRegisterService } from 'app/services/leads-register.service';
import { AirlineService } from 'app/services/airline.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { ToasterService } from 'app/services/toaster.service';
import { HotelFilterComponent } from './hotel-filter/hotel-filter.component';

@Component({
  selector: 'app-hotel',
  standalone: true,
  templateUrl: './hotel.component.html',
  styleUrls: ['./hotel.component.scss'],
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
  ],
})
export class HotelComponent {

  module_name = module_name.report_hotel
  airlineFilter: any;
  dataList = [];
  total = 0;

  @ViewChild(MatPaginator) public _paginator: MatPaginator;
  @ViewChild(MatSort) public _sort: MatSort;
  searchInputControl = new FormControl('');


  dataSource = new MatTableDataSource();
  columns = [
    'company_name',
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
    'totalCount'];
  loading: boolean = true;


  constructor(
    private confirmService: FuseConfirmationService,
    private router: Router,
    private leadsRegisterService: LeadsRegisterService,
    private airlineService: AirlineService,
    private alertService: ToasterService,
    private matDialog: MatDialog,
  ) {
    // super(module_name.airline)
    // // this.cols = this.columns.map(x => x.key);
    // this.key = this.module_name;
    // this.sortColumn = 'leadDate';
    // this.sortDirection = 'desc';
    // this.Mainmodule = this;

    this.airlineFilter = {
      Type: 'Month Wise',
      Year: new Date().getFullYear(),
      Month: new Date().getMonth() + 1,
      status: 'Confirmed Count',
      tripType: 'Both',
      fromCity: '',
      toCity: '',
      Airline: '',
    };
  }

  ngOnInit() {
    this.refreshItems();
  }

  getFilter(): any {
    const filterReq = GridUtils.GetFilterReq(
      this._paginator,
      this._sort,
      this.searchInputControl.value,
      'payment_request_date', 1
    );

    // filterReq['Type'] = this.airlineFilter?.Type;
    filterReq['Year'] = this.airlineFilter?.Year;
    filterReq['Month'] = this.airlineFilter?.Month;
    filterReq['status'] = this.airlineFilter?.status;
    filterReq['tripType'] = this.airlineFilter?.tripType == 'Both' ? '' : this.airlineFilter?.tripType;
    filterReq['fromCity'] = this.airlineFilter?.fromCity?.id == 'All' ? '' : this.airlineFilter?.fromCity?.id ?? '';
    filterReq['toCity'] = this.airlineFilter?.toCity?.id == 'All' ? '' : this.airlineFilter?.toCity?.id ?? '';
    // filterReq['Airline'] = this.airlineFilter?.Airline?.id == 'All' ? '' : this.airlineFilter?.Airline?.id ?? '';
    return filterReq;
  }

  refreshItems(): void {
    // this.isLoading = true;
    // this.airlineService.getAirLineReport(this.getFilter()).subscribe({
    //   next: (data) => {
    //     this.dataList = data.data;
    //     this.total = data.total;
    //     this.isLoading = false;
    //   }, error: (err) => {
    //     this.alertService.showToast('error', err)
    //     this.isLoading = false
    //   }
    // });

    this.loading = true;
    this.airlineService.getAirLineReport(this.getFilter()).subscribe({
      next: (res) => {

        this.dataSource.data = res.data;
        this._paginator.length = res.total;
        this.loading = false;
      }, error: (err) => {
        this.alertService.showToast('error', err);
        this.loading = false;
      },
    });
  }

  filterModal() {
    this.matDialog
      .open(HotelFilterComponent, {
        data: this.airlineFilter,
        disableClose: true,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.airlineFilter = res;
          this.refreshItems();
        }
      });
  }

  getNodataText(): string {
    if (this.loading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }



}
