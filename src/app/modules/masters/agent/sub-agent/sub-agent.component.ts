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
import { AgentService } from 'app/services/agent.service';
import { CityService } from 'app/services/city.service';
import { DesignationService } from 'app/services/designation.service';
import { EmployeeService } from 'app/services/employee.service';
import { ToasterService } from 'app/services/toaster.service';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { AppConfig } from 'app/config/app-config';
import { EntityService } from 'app/services/entity.service';
import { ChangeEmailNumberComponent } from './change-email-number/change-email-number.component';

@Component({
  selector: 'app-sub-agent',
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
    MatDividerModule,
    ChangeEmailNumberComponent,
  ],
  templateUrl: './sub-agent.component.html',
  styleUrls: ['./sub-agent.component.scss']
})
export class SubAgentComponent {

  dataSource = new MatTableDataSource();
  loading: boolean = true;
  data: any[] = []
  total: any;
  @ViewChild(MatPaginator) public _paginator: MatPaginator;
  @ViewChild(MatSort) public _sort: MatSort;
  searchInputControl = new FormControl('');
  public _unsubscribeAll: Subject<any> = new Subject<any>();
  idUrl: any;


  columns = ['options', 'agent_code', 'agency_name', 'email_address', 'mobile_number', 'contact_person', 'contact_person_email', 'contact_person_number', 'balance', 'credit', 'entry_date_time'];

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
    private entityService: EntityService,
    private matDialog: MatDialog,
  ) {
    this.entityService.onrefreshChangeEmailNumberCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (item) => {
        this.refreshItems()
      }
    })
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.idUrl = params.get('id');
    })
  }

  refreshItems(): void {
    this.loading = true;
    const request = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value, 'agency_name', 1);
    request['AgentId'] = this.idUrl;

    this.agentService.getAgentList(request).subscribe({
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

  autologin(record: any) {

    this.agentService.autoLogin(record.id).subscribe({
      next: data => {
        window.open(data.url + 'sign-in/' + data.code);
      }, error: err => {
        this.alertService.showToast('error', err)
      }
    })

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

  changeEmail(data) {
    this.entityService.raiseChangeEmailNumberCall({ data: data, flag: 'email' })
  }

  changeNumber(data) {
    this.entityService.raiseChangeEmailNumberCall({ data: data, flag: 'mobile' })
  }


}
