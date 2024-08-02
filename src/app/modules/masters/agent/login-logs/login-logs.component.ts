import { Component, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AgentService } from 'app/services/agent.service';
import { CityService } from 'app/services/city.service';
import { DesignationService } from 'app/services/designation.service';
import { EmployeeService } from 'app/services/employee.service';
import { LeadsRegisterService } from 'app/services/leads-register.service';
import { ToasterService } from 'app/services/toaster.service';
import { AppConfig } from 'app/config/app-config';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { MatDatepickerModule, MatDatepickerToggle } from '@angular/material/datepicker';
import { dateRange } from 'app/common/const';
import { CommonUtils } from 'app/utils/commonutils';
import { DateTime } from 'luxon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-login-logs',
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
  ],
  templateUrl: './login-logs.component.html',
  styleUrls: ['./login-logs.component.scss']
})
export class LoginLogsComponent {

  public dateRanges = [];
  public date = new FormControl();
  public startDate = new FormControl();
  public endDate = new FormControl();
  public StartDate: any;
  public EndDate: any;
  filterData: any;
  DR = dateRange;
  @ViewChild(MatDatepickerToggle) toggle: MatDatepickerToggle<Date>;

  searchInternalFilter = new FormControl();
  Alldata: any[] = [];



  dataSource = new MatTableDataSource();

  loading: boolean = true;
  data: any[] = []
  total: any;
  searchInputControl = new FormControl('');
  @ViewChild(MatPaginator) public _paginator: MatPaginator;
  @ViewChild(MatSort) public _sort: MatSort;

  public _unsubscribeAll: Subject<any> = new Subject<any>();
  idUrl: any;

  columns = ['loginTime', 'ip_address', 'detail'];

  constructor(
    public formBuilder: FormBuilder,
    public cityService: CityService,
    public agentService: AgentService,
    public router: Router,
    public route: ActivatedRoute,
    public alertService: ToasterService,
    public designationService: DesignationService,
    public leadRegisterService: LeadsRegisterService,
    public employeeService: EmployeeService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
  ) {
    this.dateRanges = CommonUtils.valuesArray(dateRange);
    this.date.patchValue(dateRange.lastMonth);
    this.updateDate(dateRange.lastMonth, false)
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.idUrl = params.get('id');
    })

    // this.searchInternalFilter.valueChanges.subscribe(text => {
    //   const filterdData = this.Alldata.filter(x =>
    //     x.detail?.toLowerCase().includes(text.toLowerCase())
    //     || x.ip_address?.toLowerCase().includes(text.toLowerCase())
    //     || x.loginTime?.toString().toLowerCase().includes(text.toLowerCase())
    //   );
    //   // this.paginator.pageIndex = 0;
    //   // this.setPaginator(filterdData);
    // })

    if (!this.filterData) {
      this.StartDate = new Date();
      this.EndDate = new Date();
      this.StartDate.setDate(1);
      this.StartDate.setMonth(this.StartDate.getMonth());
      this.startDate.patchValue(this.StartDate);
      this.endDate.patchValue(this.EndDate);
    }
  }

  ngAfterViewInit(): void {
    this.searchInputControl.valueChanges.subscribe((text) => {
      this.dataSource.filter = text;
    });
    this.dataSource.paginator = this._paginator;
    this.dataSource.sort = this._sort;
  }

  refreshItems(): void {
    this.loading = true;
    const request = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value, 'loginTime', 1);
    request['from_date'] = DateTime.fromJSDate(this.startDate.value).toFormat('yyyy-MM-dd');
    request['to_date'] = DateTime.fromJSDate(this.endDate.value).toFormat('yyyy-MM-dd');
    request['Id'] = this.idUrl;

    this.agentService.getAgentLoginSession(request).subscribe({
      next: (res) => {
        this.dataSource.data = res.data;
        this._paginator.length = res.total;
        this.loading = false;
      }, error: err => {
        this.alertService.showToast('error', err);
        this.loading = false;
      },
    });
  }


  // ngAfterViewInit(): void {
  //   this.searchInputControl.valueChanges
  //     .pipe(
  //       takeUntil(this._unsubscribeAll),
  //       debounceTime(AppConfig.searchDelay)
  //     )
  //     .subscribe(() => {
  //       GridUtils.resetPaginator(this._paginator);
  //       this.refreshItems();
  //     });
  //   }

  public updateDate(event: any, isRefresh: boolean = true): void {

    if (event === dateRange.today) {
      this.StartDate = new Date();
      this.EndDate = new Date();
      this.StartDate.setDate(this.StartDate.getDate());
      this.startDate.patchValue(this.StartDate);
      this.endDate.patchValue(this.EndDate);
    }
    else if (event === dateRange.last3Days) {
      this.StartDate = new Date();
      this.EndDate = new Date();
      this.StartDate.setDate(this.StartDate.getDate() - 3);
      this.startDate.patchValue(this.StartDate);
      this.endDate.patchValue(this.EndDate);
    }
    else if (event === dateRange.lastWeek) {
      this.StartDate = new Date();
      this.EndDate = new Date();
      const dt = new Date(); // current date of week
      const currentWeekDay = dt.getDay();
      const lessDays = currentWeekDay === 0 ? 6 : currentWeekDay - 1;
      const wkStart = new Date(new Date(dt).setDate(dt.getDate() - lessDays));
      const wkEnd = new Date(new Date(wkStart).setDate(wkStart.getDate() + 6));

      this.StartDate = wkStart;
      this.EndDate = new Date();
      this.startDate.patchValue(this.StartDate);
      this.endDate.patchValue(this.EndDate);
    }
    else if (event === dateRange.lastMonth) {
      this.StartDate = new Date();
      this.EndDate = new Date();
      this.StartDate.setDate(1);
      this.StartDate.setMonth(this.StartDate.getMonth());
      this.startDate.patchValue(this.StartDate);
      this.endDate.patchValue(this.EndDate);
    }
    else if (event === dateRange.last3Month) {
      this.StartDate = new Date();
      this.EndDate = new Date();
      this.StartDate.setDate(1);
      this.StartDate.setMonth(this.StartDate.getMonth() - 3);
      this.startDate.patchValue(this.StartDate);
      this.endDate.patchValue(this.EndDate);
    }
    else if (event === dateRange.last6Month) {
      this.StartDate = new Date();
      this.EndDate = new Date();
      this.StartDate.setDate(1);
      this.StartDate.setMonth(this.StartDate.getMonth() - 6);
      this.startDate.patchValue(this.StartDate);
      this.endDate.patchValue(this.EndDate);
    }
    else if (event === dateRange.setCustomDate) {
      this.StartDate = new Date();
      this.EndDate = new Date();
      this.startDate.patchValue(this.StartDate);
      this.endDate.patchValue(this.EndDate);
    }
    if (isRefresh)
      this.refreshItems();
  }

  dateRangeChange(start, end): void {
    if (start.value && end.value) {
      this.StartDate = start.value;
      this.EndDate = end.value;
      this.refreshItems();
    }
  }

  cancleDate() {
    this.date.patchValue('Today');
    this.updateDate(dateRange.today);
  }

  getNodataText(): string {
    if (this.loading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else if (this.dataSource.filteredData.length === 0)
      return 'No data to display';
    return '';
  }
}
