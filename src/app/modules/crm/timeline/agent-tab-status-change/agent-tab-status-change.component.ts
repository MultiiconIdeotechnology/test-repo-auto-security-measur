import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { AppConfig } from 'app/config/app-config';
import { AgentService } from 'app/services/agent.service';
import { CityService } from 'app/services/city.service';
import { DesignationService } from 'app/services/designation.service';
import { EmployeeService } from 'app/services/employee.service';
import { LeadsRegisterService } from 'app/services/leads-register.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { Subject, takeUntil, debounceTime } from 'rxjs';

@Component({
    selector: 'app-agent-tab-status-change',
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
    templateUrl: './agent-tab-status-change.component.html',
    styleUrls: ['./agent-tab-status-change.component.scss']
})
export class TabAgentStatusChangeComponent {
    @Input() statusChangeLog: any = {}
    dataSource = new MatTableDataSource();

    loading: boolean = true;
    data: any[] = []
    total: any;
    searchInputControl = new FormControl('');
    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sort: MatSort;

    public _unsubscribeAll: Subject<any> = new Subject<any>();
    idUrl: any;

    columns = ['entry_date_time', 'current_status', 'entry_by', 'status_remark',];

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
        this.refreshItems();
    }

    // request['id'] = this.statusChangeLog?.agentid;
    refreshItems(): void {
        this.loading = true;
        const request = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value, 'entry_date_time', 1);
        request['module_for_id'] = this.statusChangeLog?.agentid;
        request['module_for'] = "agent_master";
        this.agentService.statusChangedLogsList(request).subscribe({
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
