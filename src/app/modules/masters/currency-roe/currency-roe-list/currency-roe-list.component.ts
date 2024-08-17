import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, currencyROEPermissions, filter_module_name, messages, module_name } from 'app/security';
import { CurrencyRoeService } from 'app/services/currency-roe.service';
import { CurrencyRoeEntryComponent } from '../currency-roe-entry/currency-roe-entry.component';
import { CurrencyRoeBulkDialogComponent } from '../currency-roe-bulk-dialog/currency-roe-bulk-dialog.component';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service'; 

@Component({
    selector: 'app-currency-roe-list',
    templateUrl: './currency-roe-list.component.html',
    styles: [],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        MatTableModule,
        MatSortModule,
        MatInputModule,
        MatButtonModule,
        MatTooltipModule,
        PrimeNgImportsModule
    ],
})
export class CurrencyRoeListComponent extends BaseListingComponent {

    module_name = module_name.currencyROE;
    filter_table_name = filter_module_name.currency_roe_master;
    private settingsUpdatedSubscription: Subscription;
    dataList = [];
    total = 0;
    isFilterShow: boolean = false;

    columns = [
        { key: 'from_currency_code', name: 'From Currency', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false, applied: true, tooltip: true },
        { key: 'to_currency_code', name: 'To Currency', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false, applied: true, tooltip: true },
        { key: 'actual_roe', name: 'ROE', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: 'center', indicator: false, applied: false, tooltip: true },
        { key: 'actual_markup', name: 'Actual Markup', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: 'center', indicator: false, applied: false, tooltip: true },
        { key: 'actual_markup_roe', name: 'Actual Markup ROE', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: 'center', indicator: false, applied: false, tooltip: true },
        { key: 'forex_actual_markup', name: 'Forex Actual Markup', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: 'center', indicator: false, applied: false, tooltip: true },
        { key: 'forex_actual_markup_roe', name: 'Forex Actual Markup ROE', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: 'center', indicator: false, applied: false, tooltip: true },
        { key: 'sync_date_time', name: 'Last Sync Date', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: true, class: '', is_sticky: false, align: 'center', indicator: false, applied: false, tooltip: true },
        // { key: 'to_currency_code', name: '', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: 'center', indicator: false, applied: false, tooltip: true },
        // { key: '.', name: '', is_date: false, date_formate: '', is_sortable: false, class: '', is_sticky: false, align: 'center', indicator: false, applied: false, tooltip: true },
    ]
    cols = [];

    constructor(
        private currencyRoeService: CurrencyRoeService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog,
        public _filterService: CommonFilterService
    ) {
        super(module_name.currencyROE)
        this.cols = this.columns.map(x => x.key);
        this.key = this.module_name;
        this.sortColumn = 'from_currency_code';
        this.sortDirection = 'asc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit(): void {
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            this.sortColumn = resp['sortColumn'];
            this.primengTable['_sortField'] = resp['sortColumn'];
            if(resp['table_config']['sync_date_time'].value){
                resp['table_config']['sync_date_time'].value = new Date(resp['table_config']['sync_date_time'].value);
            }
            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShow = true;
            this.primengTable._filter();
        });
    }

    ngAfterViewInit() {
        // Defult Active filter show
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
          this.isFilterShow = true;
          let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
          if(filterData['table_config']['sync_date_time'].value){
            filterData['table_config']['sync_date_time'].value = new Date(filterData['table_config']['sync_date_time'].value);
        }
          this.primengTable['filters'] = filterData['table_config'];
        }
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        this.currencyRoeService.getCurrencyRoeList(this.getNewFilterReq(event)).subscribe({
            next: data => {
                this.isLoading = false;
                this.dataList = data.data;
                this.totalRecords = data.total;
            }, error: err => {
                this.alertService.showToast('error', err, 'top-right', true)
                this.isLoading = false;
            }
        })
    }

    createInternal(model): void {
        this.matDialog.open(CurrencyRoeEntryComponent, {
            data: null,
            disableClose: true
        }).afterClosed().subscribe(res => {
            if (res) {
                this.alertService.showToast('success', "New record added", "top-right", true);
                this.refreshItems();
            }
        })
    }

    editInternal(record): void {
        this.matDialog.open(CurrencyRoeEntryComponent, {
            data: { data: record, readonly: false },
            disableClose: true
        }).afterClosed().subscribe(res => {
            if (res) {
                this.alertService.showToast('success', "Record modified", "top-right", true);
                this.refreshItems();
            }
        })
    }

    viewInternal(record): void {
        this.matDialog.open(CurrencyRoeEntryComponent, {
            data: { data: record, readonly: true },
            disableClose: true
        })
    }

    deleteInternal(record): void {
        const label: string = 'Delete Currency ROE'
        this.conformationService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.from_currency_code + ' ' + 'to' + ' ' + record.to_currency_code + ' ?'
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.currencyRoeService.delete(record.id).subscribe({
                    next: () => {
                        this.alertService.showToast('success', "Currency ROE has been deleted!", "top-right", true);
                        this.refreshItems();
                    }, error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);

                    },
                })
            }
        })
    }

    bulkUpdate(): void {
        if (!Security.hasPermission(currencyROEPermissions.ROEBulkUpdatePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(CurrencyRoeBulkDialogComponent, {
            data: null,
            disableClose: true
        }).afterClosed().subscribe(res => {
            if (res) {
                this.alertService.showToast('success', "ROE bulk has been updated!", "top-right", true);
                this.refreshItems();
            }
        })
    }

    sync(): void {
        if (!Security.hasPermission(currencyROEPermissions.ROESyncPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        this.currencyRoeService.sync().subscribe({
            next: () => {
                this.alertService.showToast('success', "Currency ROE has been Sync!", "top-right", true);
                this.refreshItems();
            }, error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
            },
        })
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    ngOnDestroy(): void {
        // this.masterService.setData(this.key, this)
        // document.removeEventListener('scroll', this.preventScrollClose, true);

        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }

}
