import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { AppConfig } from 'app/config/app-config';
import { Security, messages, module_name, techCollectionPermissions } from 'app/security';
import { CrmService } from 'app/services/crm.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject } from 'rxjs';
import { TechDialCallEntryComponent } from '../tech-dial-call-entry/tech-dial-call-entry.component';
import { TechCallHistoryComponent } from '../tech-call-history/tech-call-history.component';

@Component({
    selector: 'app-tech',
    templateUrl: './tech.component.html',
    styles: [
        `
            .tbl-grid {
                grid-template-columns: 40px 60px 100px 245px 120px 190px 100px 150px 150px;
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
        MatTabsModule
    ]
})
export class TechCollectionComponent {
    columns = [
        {
            key: 'calls',
            name: 'Calls',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            callAction: true
        },
        {
            key: 'acCode',
            name: 'A/C Code',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
        },
        {
            key: 'agencyName',
            name: 'Name',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: true,
            tooltip: true,
        },
        {
            key: 'mobile',
            name: 'Mobile',
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
            key: 'product',
            name: 'Product',
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
            key: 'amount',
            name: 'Amount',
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
            key: 'installmentDate',
            name: 'Installment Date',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: false,
        },
        {
            key: 'lastCallDate',
            name: 'Last call date',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: false
        }
    ];
    cols = [];
    dataList = [];
    searchInputControlTech = new FormControl('');

    @ViewChild('tabGroup') tabGroup;

    @ViewChild(MatPaginator) public _paginatorTech: MatPaginator;
    @ViewChild(MatSort) public _sortInbox: MatSort;

    Mainmodule: any;
    isLoading = false;
    public _unsubscribeAll: Subject<any> = new Subject<any>();
    public key: any;
    public sortColumn: any;
    public sortDirection: any;

    module_name = module_name.crmagent
    total = 0;
    appConfig = AppConfig;
    data: any
    filter: any = {}
    formattedDate: string = '';

    constructor(
        private crmService: CrmService,
        private alertService: ToasterService,
        private matDialog: MatDialog

    ) {
        this.cols = this.columns.map(x => x.key);
        this.key = this.module_name;
        this.sortColumn = 'priorityid';
        this.sortDirection = 'desc';
        this.Mainmodule = this
    }

    ngOnInit(): void {
        this.searchInputControlTech.valueChanges
            .subscribe(() => {
                GridUtils.resetPaginator(this._paginatorTech);
                this.refreshItems();
            });
        this.refreshItems();
    }

    refreshItems(): void {
        this.isLoading = true;
        const filterReq = GridUtils.GetFilterReq(
            this._paginatorTech,
            this._sortInbox,
            this.searchInputControlTech.value
        );
        this.crmService.getTechCollectionList(filterReq).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                this._paginatorTech.length = data.total;
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControlTech.value)
            return `no search results found for \'${this.searchInputControlTech.value}\'.`;
        else return 'No data to display';
    }

    getStatusColor(status: string): string {
        if (status == 'New') {
            return 'text-green-600';
        } else if (status == 'Active') {
            return 'text-blue-600';
        } else if (status == 'InActive') {
            return 'text-red-600';
        } else {
            return '';
        }
    }

    getPriorityIndicatorClass(priority: string): string {
        if (priority == 'High') {
            return 'bg-red-600';
        } else if (priority == 'Medium') {
            return 'bg-yellow-600';
        } else {
            return 'bullet-pink';
        }
    }

    dialCall(record): void {
        if (!Security.hasPermission(techCollectionPermissions.dailCallPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(TechDialCallEntryComponent, {
            data: { data: record, readonly: true },
            disableClose: true,
        }).afterClosed().subscribe(res => {
            if (res) {
                this.refreshItems();
            }
        })
    }

    callHistory(record): void {
        if (!Security.hasPermission(techCollectionPermissions.callHistoryPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        if (record?.calls > 0) {
            this.matDialog.open(TechCallHistoryComponent, {
                data: { data: record, readonly: true },
                disableClose: true
            });
        }
    }

    sendReminderEmail(record): void {
        // if (!Security.hasPermission(agentPermissions.marketingMaterialPermissions)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }
        // this.matDialog.open(MarketingMaterialsComponent, {
        //     data: { data: record, readonly: true },
        //     disableClose: true
        // });
    }

    paymentUpdate(record): void {
        // if (!Security.hasPermission(agentPermissions.marketingMaterialPermissions)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }
        // this.matDialog.open(MarketingMaterialsComponent, {
        //     data: { data: record, readonly: true },
        //     disableClose: true
        // });
    }

    timeline(record): void {
        // if (!Security.hasPermission(agentPermissions.marketingMaterialPermissions)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }
        // this.matDialog.open(MarketingMaterialsComponent, {
        //     data: { data: record, readonly: true },
        //     disableClose: true
        // });
    }
}
