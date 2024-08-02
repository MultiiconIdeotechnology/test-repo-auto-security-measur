import { Component, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
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
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AppConfig } from 'app/config/app-config';
import { AgentService } from 'app/services/agent.service';
import { CityService } from 'app/services/city.service';
import { DesignationService } from 'app/services/designation.service';
import { EmployeeService } from 'app/services/employee.service';
import { LeadsRegisterService } from 'app/services/leads-register.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { CrmService } from 'app/services/crm.service';
import { CallRemarkComponent } from './call-remark/call-remark.component';

@Component({
  selector: 'app-call-logs',
  standalone: true,
  imports: [
    CommonModule,
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
    MatDividerModule
  ],
  templateUrl: './call-logs.component.html',
  styleUrls: ['./call-logs.component.scss']
})
export class CallLogsComponent {

  dataSource = new MatTableDataSource();

  loading: boolean = true;
  data: any[] = []
  total: any;
  searchInputControl = new FormControl('');
  @ViewChild(MatPaginator) public _paginator: MatPaginator;
  @ViewChild(MatSort) public _sort: MatSort;

  public _unsubscribeAll: Subject<any> = new Subject<any>();
  idUrl: any;

  columns = [ 'entry_date_time', 'entry_by_id_Name', 'master_call_purpose','feedback','rm_remark'];

  constructor(
    public formBuilder: FormBuilder,
    public cityService: CityService,
    public agentService: AgentService,
    public router: Router,
    public route: ActivatedRoute,
    public alertService: ToasterService,
    public designationService: DesignationService,
    public leadRegisterService: LeadsRegisterService,
    private crmService: CrmService,
    public employeeService: EmployeeService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
  ) {

  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.idUrl = params.get('id');
    })
  }

  remark(data:any){
    this.matDialog.open(CallRemarkComponent, {
      data: data,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (!res) {
        return
      }
    })
  }

  refreshItems(): void {
    this.loading = true;
    const request = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value, 'entry_date_time', 1);
    request['MasterId'] = this.idUrl;
    request['MasterFor'] = "agent_signup";

    this.crmService.getCallHistoryList(request).subscribe({
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

  ngAfterViewInit(): void {
    this.searchInputControl.valueChanges
      .pipe(
        takeUntil(this._unsubscribeAll),
        debounceTime(AppConfig.searchDelay)
      )
      .subscribe(() => {
        GridUtils.resetPaginator(this._paginator);
        // this.refreshItems();
      });
    }

}
