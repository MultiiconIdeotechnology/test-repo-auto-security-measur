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
import { module_name } from 'app/security';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatDialog } from '@angular/material/dialog';
import { LeadsRegisterService } from 'app/services/leads-register.service';
import { AirlineService } from 'app/services/airline.service';
import { AirlineFilterComponent } from './airline-filter/airline-filter.component';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { ToasterService } from 'app/services/toaster.service';
import { AppConfig } from 'app/config/app-config';
import { takeUntil, debounceTime, Subject } from 'rxjs';
import { InfoAirlineComponent } from './info-airline/info-airline.component';

@Component({
    selector: 'app-airline',
    standalone: true,
    templateUrl: './airline.component.html',
    styleUrls: ['./airline.component.scss'],
    styles: [`
  .tbl-grid {
    grid-template-columns: 40px 50px 110px 80px 190px 160px 130px 110px 180px 210px 120px 130px 120px 130px 120px 120px;
  }
  `],
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
export class AirlineComponent {
    status: any;
    type: any;
    module_name = module_name.airline
    airlineFilter: any;
    dataList = [];
    total = 0;
    monthTotal: number[] = [];
    monthTotal2: number[] = [];
    monthTotal3: number[] = [];
    monthTotal6: number[] = [];
    dayTotal4: number[] = [];
    dayTotal5: number[] = [];
    searchInputControl = new FormControl('');
    loading: boolean = true;
    public _unsubscribeAll: Subject<any> = new Subject<any>();

    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sort: MatSort;
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
    ];

    @ViewChild(MatPaginator) public _paginator1: MatPaginator;
    @ViewChild(MatSort) public _sort1: MatSort;
    dataSource1 = new MatTableDataSource();
    columns1 = [
        'company_name',
        'jan_Confirmed',
        'feb_Confirmed',
        'mar_Confirmed',
        'apr_Confirmed',
        'may_Confirmed',
        'jun_Confirmed',
        'jul_Confirmed',
        'aug_Confirmed',
        'sep_Confirmed',
        'oct_Confirmed',
        'nov_Confirmed',
        'dec_Confirmed',
    ];

    @ViewChild(MatPaginator) public _paginator2: MatPaginator;
    @ViewChild(MatSort) public _sort2: MatSort;
    dataSource2 = new MatTableDataSource();
    columns2 = [
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
        'dec'
    ];

    @ViewChild(MatPaginator) public _paginator3: MatPaginator;
    @ViewChild(MatSort) public _sort3: MatSort;
    dataSource3 = new MatTableDataSource();
    columns3 = [
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
        'dec'
    ];

    @ViewChild(MatPaginator) public _paginator4: MatPaginator;
    @ViewChild(MatSort) public _sort4: MatSort;
    dataSource4 = new MatTableDataSource();
    columns4 = [
    ];

    @ViewChild(MatPaginator) public _paginator5: MatPaginator;
    @ViewChild(MatSort) public _sort5: MatSort;
    dataSource5 = new MatTableDataSource();
    columns5 = [
    ];

    @ViewChild(MatPaginator) public _paginator6: MatPaginator;
    @ViewChild(MatSort) public _sort6: MatSort;
    dataSource6 = new MatTableDataSource();
    columns6 = [
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
        'dec'
    ];

    @ViewChild(MatPaginator) public _paginator7: MatPaginator;
    @ViewChild(MatSort) public _sort7: MatSort;
    dataSource7 = new MatTableDataSource();
    columns7 = [
    ];

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
        this.GFG_Fun();
        // this.searchInputControl.valueChanges
        //     .subscribe(() => {
        //         GridUtils.resetPaginator(this._paginator);
        //         this.refreshItems();
        //     });

        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(AppConfig.searchDelay)
            )
            .subscribe(() => {
                GridUtils.resetPaginator(this._paginator);
                // this.refreshItems();
                if (this.type == 'Month Wise' && (this.status == "Confirmed Count" || this.status == "Failed Count")) {
                    this.refreshItems();
                }
                if (this.type == 'Month Wise' && this.status == 'Confirmed Failed Count') {
                    this.refreshItems1();
                }
                if (this.type == 'Month Wise' && (this.status == 'Confirm Volume' || this.status == 'Failed Volume')) {
                    this.refreshItems2();
                }
                if (this.type == 'Month Wise' && this.status == 'Pax Count') {
                    this.refreshItems3();
                }
                if (this.type == 'Month Wise' && this.status == 'Markup') {
                    this.refreshItems6();
                }
                if (this.type == 'Day Wise' && (this.status == 'Confirmed Count' || this.status == 'Failed Count' || this.status == 'Pax Count' || this.status == 'Markup')) {
                    this.refreshItems4();
                }
                if (this.type == 'Day Wise' && (this.status == 'Confirm Volume' || this.status == 'Failed Volume')) {
                    this.refreshItems5();
                }
                if (this.type == 'Day Wise' && this.status == 'Confirmed Failed Count') {
                    this.refreshItems7();
                }
            });

        this.refreshItems();
    }

    info(record, month) {
        if (this.airlineFilter.Type == 'Day Wise' && this.airlineFilter.status == 'Pax Count') {
            return;
        } else {
            this.matDialog
                .open(InfoAirlineComponent, {
                    data: {
                        title: record.company_name,
                        supplier_id: record.supplier_id,
                        status: this.airlineFilter.status,
                        month: month,
                        year: this.airlineFilter.Year,
                        type: this.airlineFilter.Type
                    },
                    disableClose: true,
                })
                .afterClosed()
                .subscribe((res) => {
                })
        }

    }

    daysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }

    GFG_Fun() {
        let date = new Date();
        let month = this.airlineFilter?.Month;
        let year = this.airlineFilter?.Year;
    }

    getFilter(): any {
        this.GFG_Fun();
        const filterReq = GridUtils.GetFilterReq(
            this._paginator,
            this._sort,
            this.searchInputControl.value,
            'payment_request_date', 1
        );
        filterReq['Type'] = this.airlineFilter?.Type;
        filterReq['Year'] = this.airlineFilter?.Year;
        filterReq['Month'] = this.airlineFilter?.Month;
        filterReq['status'] = this.airlineFilter?.status;
        filterReq['tripType'] = this.airlineFilter?.tripType == 'Both' ? '' : this.airlineFilter?.tripType;
        filterReq['fromCity'] = this.airlineFilter?.fromCity?.id == 'All' ? '' : this.airlineFilter?.fromCity?.id ?? '';
        filterReq['toCity'] = this.airlineFilter?.toCity?.id == 'All' ? '' : this.airlineFilter?.toCity?.id ?? '';
        filterReq['Airline'] = this.airlineFilter?.Airline?.id == 'All' ? '' : this.airlineFilter?.Airline?.id ?? '';
        return filterReq;
    }

    refreshItems(): void {
        this.loading = true;
        this.airlineService.getAirLineReport(this.getFilter()).subscribe({
            next: (res) => {
                this.dataSource.data = res.data;
                this.monthTotal = res?.monthTotal;
                this._paginator.length = res.total;
                this.loading = false;
            }, error: (err) => {
                this.alertService.showToast('error', err);
                this.loading = false;
            },
        });
    }

    refreshItems1(): void {
        this.loading = true;
        this.airlineService.getAirLineReport(this.getFilter()).subscribe({
            next: (res) => {
                this.dataSource1.data = res.data;
                this._paginator1.length = res.total;
                this.loading = false;
            }, error: (err) => {
                this.alertService.showToast('error', err);
                this.loading = false;
            },
        });
    }

    refreshItems2(): void {
        this.loading = true;
        this.airlineService.getAirLineReport(this.getFilter()).subscribe({
            next: (res) => {
                this.dataSource2.data = res.data;
                this.monthTotal2 = res?.monthTotal;
                this._paginator2.length = res.total;
                this.loading = false;
            }, error: (err) => {
                this.alertService.showToast('error', err);
                this.loading = false;
            },
        });
    }

    refreshItems3(): void {
        this.loading = true;
        this.airlineService.getAirLineReport(this.getFilter()).subscribe({
            next: (res) => {
                this.dataSource3.data = res.data;
                this.monthTotal3 = res?.monthTotal;
                this._paginator3.length = res.total;
                this.loading = false;
            }, error: (err) => {
                this.alertService.showToast('error', err);
                this.loading = false;
            },
        });
    }

    refreshItems4(): void {
        this.loading = true;
        var json = this.getFilter()
        this.airlineService.getAirLineReport(json).subscribe({
            next: (res) => {
                if (json.status == 'Markup') {
                    res.data.forEach(x => {
                        // this.toFixedValue(x, i);
                        x.day1 = x?.day1?.toFixed(2);
                        x.day2 = x?.day2?.toFixed(2);
                        x.day3 = x?.day3?.toFixed(2);
                        x.day4 = x?.day4?.toFixed(2);
                        x.day5 = x?.day5?.toFixed(2);
                        x.day6 = x?.day6?.toFixed(2);
                        x.day7 = x?.day7?.toFixed(2);
                        x.day8 = x?.day8?.toFixed(2);
                        x.day9 = x?.day9?.toFixed(2);
                        x.day10 = x?.day10?.toFixed(2);
                        x.day11 = x?.day11?.toFixed(2);
                        x.day12 = x?.day12?.toFixed(2);
                        x.day13 = x?.day13?.toFixed(2);
                        x.day14 = x?.day14?.toFixed(2);
                        x.day15 = x?.day15?.toFixed(2);
                        x.day16 = x?.day16?.toFixed(2);
                        x.day17 = x?.day17?.toFixed(2);
                        x.day18 = x?.day18?.toFixed(2);
                        x.day19 = x?.day19?.toFixed(2);
                        x.day20 = x?.day20?.toFixed(2);
                        x.day21 = x?.day21?.toFixed(2);
                        x.day22 = x?.day22?.toFixed(2);
                        x.day23 = x?.day23?.toFixed(2);
                        x.day24 = x?.day24?.toFixed(2);
                        x.day25 = x?.day25?.toFixed(2);
                        x.day26 = x?.day26?.toFixed(2);
                        x.day27 = x?.day27?.toFixed(2);
                        x.day28 = x?.day28?.toFixed(2);
                        x.day29 = x?.day29?.toFixed(2);
                        x.day30 = x?.day30?.toFixed(2);
                        x.day31 = x?.day31?.toFixed(2);
                    })

                }

                this.dataSource4.data = res.data;

                this.dayTotal4 = res?.dayTotal;
                var Lastdate = new Date(this.airlineFilter?.Year, this.airlineFilter?.Month, 0).getDate();
                this.columns4 = [
                    'company_name',
                ];
                for (let index = 1; index <= Lastdate; index++) {
                    this.columns4.push('day' + index)
                }
                this._paginator4.length = res.total;
                this.loading = false;
            }, error: (err) => {
                this.alertService.showToast('error', err);
                this.loading = false;
            },
        });
    }

    toFixedValue(x: any, index: any) {
        let count = (index + 1);
        return x['day' + count].toFixed(2);
    }

    refreshItems5() {

        this.loading = true;
        this.airlineService.getAirLineReport(this.getFilter()).subscribe({
            next: (res) => {
                this.dataSource5.data = res.data;
                this.dayTotal5 = res.dayTotal;
                var Lastdate = new Date(this.airlineFilter?.Year, this.airlineFilter?.Month, 0).getDate();
                this.columns5 = [
                    'company_name',
                ];
                for (let index = 1; index <= Lastdate; index++) {
                    this.columns5.push('day' + index)
                }
                this._paginator5.length = res.total;
                this.loading = false;
            }, error: (err) => {
                this.alertService.showToast('error', err);
                this.loading = false;
            },
        });
    }

    refreshItems6(): void {

        this.loading = true;
        this.airlineService.getAirLineReport(this.getFilter()).subscribe({
            next: (res) => {
                this.dataSource6.data = res.data;
                this.monthTotal6 = res?.monthTotal;
                this._paginator6.length = res.total;
                this.loading = false;
            }, error: (err) => {
                this.alertService.showToast('error', err);
                this.loading = false;
            },
        });
    }


    refreshItems7(): void {
        this.loading = true;
        this.airlineService.getAirLineReport(this.getFilter()).subscribe({
            next: (res) => {
                this.dataSource7.data = res.data;
                var Lastdate = new Date(this.airlineFilter?.Year, this.airlineFilter?.Month, 0).getDate();
                this.columns7 = [
                    'company_name',
                ];
                for (let index = 1; index <= Lastdate; index++) {
                    this.columns7.push('day' + index + '_Confirmed')
                }
                this._paginator7.length = res.total;
                this.loading = false;
            }, error: (err) => {
                this.alertService.showToast('error', err);
                this.loading = false;
            },
        });
    }

    filter() {
        this.matDialog
            .open(AirlineFilterComponent, {
                data: this.airlineFilter,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.airlineFilter = res;
                    this.status = this.airlineFilter?.status;
                    this.type = this.airlineFilter?.Type;
                    if (this.type == 'Month Wise' && (this.status == "Confirmed Count" || this.status == "Failed Count")) {
                        this.refreshItems();
                    }
                    if (this.type == 'Month Wise' && this.status == 'Confirmed Failed Count') {
                        this.refreshItems1();
                    }
                    if (this.type == 'Month Wise' && (this.status == 'Confirm Volume' || this.status == 'Failed Volume')) {
                        this.refreshItems2();
                    }
                    if (this.type == 'Month Wise' && this.status == 'Pax Count') {
                        this.refreshItems3();
                    }
                    if (this.type == 'Month Wise' && this.status == 'Markup') {
                        this.refreshItems6();
                    }
                    if (this.type == 'Day Wise' && (this.status == 'Confirmed Count' || this.status == 'Failed Count' || this.status == 'Pax Count' || this.status == 'Markup')) {
                        this.refreshItems4();
                    }
                    if (this.type == 'Day Wise' && (this.status == 'Confirm Volume' || this.status == 'Failed Volume')) {
                        this.refreshItems5();
                    }
                    if (this.type == 'Day Wise' && this.status == 'Confirmed Failed Count') {
                        this.refreshItems7();
                    }
                }
            });
    }

    popInfo(data): void {
        // console.log(data);
    }

    getNodataText(): string {
        if (this.loading)
            return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }
}
