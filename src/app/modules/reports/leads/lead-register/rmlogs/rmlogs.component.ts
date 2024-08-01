import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
import { LeadsRegisterService } from 'app/services/leads-register.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-rmlogs',
    templateUrl: './rmlogs.component.html',
    styles: [
        `
        .tbl-grid {
            grid-template-columns: 40px 110px 150px 150px 310px;
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
export class RMLogsComponent {
    cols = [];
    total = 0;

    columns = [
        {
            key: 'date',
            name: 'Date',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: false
        },
        {
            key: 'rm',
            name: 'RM',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true
        },
        {
            key: 'changedBy',
            name: 'Changed By',
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
            key: 'reason',
            name: 'Reason',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: true,
            tooltip: true,
        }
    ]

    dataList: any;
    appConfig = AppConfig;
    isLoading: any;
    searchInputControl = new FormControl('');
    @ViewChild('tabGroup') tabGroup;
    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sort: MatSort;

    Mainmodule: any;
    public _unsubscribeAll: Subject<any> = new Subject<any>();
    public key: any;
    public sortColumn: any;
    public sortDirection: any;
    record: any = {};

    module_name = module_name.crmagent
    filter: any = {}

    ngOnInit(): void {
        this.searchInputControl.valueChanges
            .subscribe(() => {
                GridUtils.resetPaginator(this._paginator);
                this.refreshItems();
            });
        this.refreshItems();
    }

    constructor(
        public matDialogRef: MatDialogRef<RMLogsComponent>,
        private alertService: ToasterService,
        private leadsRegisterService: LeadsRegisterService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        this.cols = this.columns.map(x => x.key);
        this.key = this.module_name;
        this.sortColumn = 'date';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        if (data)
            this.record = data;
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    refreshItems() {
        this.isLoading = true;
        const filterReq = GridUtils.GetFilterReq(
            this._paginator,
            this._sort,
            this.searchInputControl.value
        );
        filterReq['id']= this.record?.id;
        this.leadsRegisterService.relationshipManagerLogsList(filterReq).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                this._paginator.length = data.total;
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
    }
}
