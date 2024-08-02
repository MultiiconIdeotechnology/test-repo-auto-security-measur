import { Component, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AppConfig } from 'app/config/app-config';
import { AgentService } from 'app/services/agent.service';
import { CityService } from 'app/services/city.service';
import { DesignationService } from 'app/services/designation.service';
import { EmployeeService } from 'app/services/employee.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LeadsRegisterService } from 'app/services/leads-register.service';

@Component({
  selector: 'app-rm-change-log',
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
  templateUrl: './rm-change-log.component.html',
  styleUrls: ['./rm-change-log.component.scss']
})
export class RmChangeLogComponent {

  dataSource = new MatTableDataSource();

  loading: boolean = true;
  data: any[] = []
  total: any;
  searchInputControl = new FormControl('');
  @ViewChild(MatPaginator) public _paginator: MatPaginator;
  @ViewChild(MatSort) public _sort: MatSort;

  public _unsubscribeAll: Subject<any> = new Subject<any>();
  idUrl: any;

  columns = [ 'date', 'rm', 'reason','changedBy',];

  constructor(
    public formBuilder: FormBuilder,
    public cityService: CityService,
    public agentService: AgentService,
    public router: Router,
    public route: ActivatedRoute,
    public alertService: ToasterService,
    public designationService: DesignationService,
    public leadRegisterService: LeadsRegisterService,
    public employeeService: EmployeeService
  ) {

  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.idUrl = params.get('id');
    })
  }

  refreshItems(): void {
    this.loading = true;
    const request = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value, 'date', 1);
    request['id'] = this.idUrl;

    this.agentService.relationshipManagerLogsList(request).subscribe({
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
        this.refreshItems();
      });
    }
}
