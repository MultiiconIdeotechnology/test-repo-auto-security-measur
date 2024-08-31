import { Component, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AgentService } from 'app/services/agent.service';
import { CityService } from 'app/services/city.service';
import { DesignationService } from 'app/services/designation.service';
import { EmployeeService } from 'app/services/employee.service';
import { ToasterService } from 'app/services/toaster.service';
import { dateRange } from 'app/common/const';
import { CommonUtils } from 'app/utils/commonutils';
import { Subject, filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { DateTime } from 'luxon';
import { Excel } from 'app/utils/export/excel';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-sub-agent-ledger',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    RouterOutlet,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSortModule,
    MatPaginatorModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    AsyncPipe,
    MatSnackBarModule,
    NgxMatSelectSearchModule,
  ],
  templateUrl: './sub-agent-ledger.component.html',
  styleUrls: ['./sub-agent-ledger.component.scss']
})
export class SubAgentLedgerComponent {

  columns = ['datetime', 'reference_number', 'particular', 'credit','debit',  'balance'];
  dataSource = new MatTableDataSource();
  loading: boolean = true;
  public DR = dateRange;
  tempData: any[] = [];
  data: any[] = []
  total: any;
  currentFilter: any;
  downloading: boolean = false;
  @ViewChild(MatPaginator) public _paginator: MatPaginator;
  @ViewChild(MatSort) public _sort: MatSort;
  searchInputControl = new FormControl('');
  public _unsubscribeAll: Subject<any> = new Subject<any>();
  public date = new FormControl();
  public startDate = new FormControl();
  public endDate = new FormControl();
  public StartDate: any;
  public EndDate: any;
  public dateRanges = [];
  @ViewChild(MatDatepickerToggle) toggle: MatDatepickerToggle<Date>;
  filterData: any;
  resList: any = {}
  firstAgent: any = {}
  agentList: any[] = [];
  public id = new FormControl('');
  public agentfilter = new FormControl('');
  isfrist: boolean = true
  idUrl: string;

  constructor(
    public formBuilder: FormBuilder,
    public cityService: CityService,
    public agentService: AgentService,
    public router: Router,
    public route: ActivatedRoute,
    public alertService: ToasterService,
    public designationService: DesignationService,
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

    this.agentfilter.valueChanges.pipe(
      filter((search) => !!search),
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.agentService.getAgentComboMasterDeshbord(value, true, this.idUrl, 'from_agent_dashboard');
      })
    ).subscribe({
      next: data => {
        this.agentList = data
        if (this.isfrist) {
          this.isfrist = false
          this.id.patchValue(this.agentList[0]?.id)
          // this.dateRanges = CommonUtils.valuesArray(dateRange);
          // this.date.patchValue(dateRange.last3Month);
          // this.updateDate(dateRange.last3Month)
        }

      }
    });

  }

  refreshItems(): void {
    this.loading = true;
    const request = {};
    request['agent_id'] = this.id.value
    request['service_for'] = this.filterData?.service_for || 'All'
    request['FromDate'] = this.filterData?.startDate || DateTime.fromJSDate(this.startDate.value).toFormat('yyyy-MM-dd');
    request['ToDate'] = this.filterData?.endDate || DateTime.fromJSDate(this.endDate.value).toFormat('yyyy-MM-dd');

    this.agentService.getLedger(request).subscribe({
      next: (res) => {
        this.dataSource.data = res.data;
        this.total = res.data.length;
        this.loading = false;
      }, error: err => {
        this.alertService.showToast('error', err);
        this.loading = false;
      },
    });
  }

  ngAfterViewInit(): void {
    this.searchInputControl.valueChanges.subscribe((text) => {
      this.dataSource.filter = text;
    });
    this.dataSource.paginator = this._paginator;
    this.dataSource.sort = this._sort;
  }

  exportExcel(): void {
    this.tempData = cloneDeep(this.dataSource.data);
    for (var dt of this.tempData) {
      dt.datetime = dt.datetime ? DateTime.fromISO(dt.datetime).toFormat('dd-MM-yyyy HH:mm') : '';
    }

    Excel.export(
      'Sub Agent Ledger',
      [
        { header: 'Date', property: 'datetime' },
        { header: 'Reference Number', property: 'reference_number' },
        { header: 'Particular', property: 'particular' },
        { header: 'Remark', property: 'remark' },
        { header: 'Credit', property: 'credit' },
        { header: 'Debit', property: 'debit' },
        { header: 'Balance', property: 'balance' },
      ],
      this.tempData, "Sub Agent Ledger", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }]);

  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

  public updateDate(event: any, isRefresh:boolean = true): void {

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
    if(isRefresh)
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


}
