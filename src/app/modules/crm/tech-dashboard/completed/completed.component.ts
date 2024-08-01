import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { AppConfig } from 'app/config/app-config';
import { module_name } from 'app/security';
import { CrmService } from 'app/services/crm.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-crm-tech-dashboard-completed',
    templateUrl: './completed.component.html',
    styles: [
        `
        .tbl-grid {
            grid-template-columns: 40px 100px 270px 230px 110px 140px 150px 120px;
        }
    `,
    ],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        AsyncPipe,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatSlideToggleModule,
        NgxMatSelectSearchModule,
        MatTooltipModule,
        MatAutocompleteModule,
        RouterOutlet,
        MatOptionModule,
        MatDividerModule,
        MatSortModule,
        MatTableModule,
        MatPaginatorModule,
        MatMenuModule,
        MatDialogModule,
        CommonModule,
        MatTabsModule,
        MatProgressBarModule,
    ]
})
export class TechDashboardCompletedComponent {
    cols = [];
    total = 0;

    columns = [
        {
            key: 'lead_status',
            name: 'Status',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
            toColor: true
        },
        {
            key: 'agency_name',
            name: 'Agency',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
        },
        {
            key: 'contact_person_email',
            name: 'Email',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
        },
        {
            key: 'contact_person_mobile',
            name: 'Mobile',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: false,
        },
        {
            key: 'last_call_date_time',
            name: 'Last Status Date',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: false,
        },
        {
            key: 'last_call_feedback',
            name: 'Last Remark',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: true,
        },
        {
            key: 'lead_source',
            name: 'Source',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: true,
        }
    ]
    dataList: any;
    appConfig = AppConfig;
    isLoading: any;
    searchInputControlCompleted = new FormControl('');
    @ViewChild('tabGroup') tabGroup;
    @ViewChild(MatPaginator) public _paginatorArchive: MatPaginator;
    @ViewChild(MatSort) public _sortArchive: MatSort;

    Mainmodule: any;
    public _unsubscribeAll: Subject<any> = new Subject<any>();
    public key: any;
    public sortColumn: any;
    public sortDirection: any;

    module_name = module_name.lead
    data: any
    filter: any = {}

    ngOnInit(): void {
        this.searchInputControlCompleted.valueChanges
            .subscribe(() => {
                GridUtils.resetPaginator(this._paginatorArchive);
                this.refreshItems();
            });
        this.refreshItems();
    }

    getStatusColor(status: string): string {
        if (status == 'Converted') {
            return 'text-green-600';
        } else if (status == 'Live') {
            return 'text-green-600';
        } else if (status == 'Dead') {
            return 'text-red-600';
        } else {
            return '';
        }
    }

    constructor(
        private crmService: CrmService,
        private alertService: ToasterService
    ) {
        this.cols = this.columns.map(x => x.key);
        this.key = this.module_name;
        this.sortColumn = 'priority_id';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControlCompleted.value)
            return `no search results found for \'${this.searchInputControlCompleted.value}\'.`;
        else return 'No data to display';
    }

    refreshItems() {
        this.isLoading = true;
        const filterReq = GridUtils.GetFilterReq(
            this._paginatorArchive,
            this._sortArchive,
            this.searchInputControlCompleted.value, "entry_date_time"
        );
        this.crmService.getArchiveLeadList(filterReq).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                this._paginatorArchive.length = data?.total;
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
    }
}
