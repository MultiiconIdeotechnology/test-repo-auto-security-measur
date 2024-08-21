import { Router } from '@angular/router';
import { filter_module_name, module_name } from 'app/security';
import { Component, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { CachingParameterService } from 'app/services/caching-parameters.service';
import { EntityService } from 'app/services/entity.service';
import { CachingParametersEntryComponent } from '../caching-parameters-entry/caching-parameters-entry.component';
import { takeUntil } from 'rxjs';
import { FlightTabService } from 'app/services/flight-tab.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
    selector: 'app-caching-parameters-list',
    templateUrl: './caching-parameters-list.component.html',
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
        MatInputModule,
        MatButtonModule,
        MatProgressBarModule,
        MatMenuModule,
        MatDialogModule,
        MatDividerModule,
        FormsModule,
        PrimeNgImportsModule,
        CachingParametersEntryComponent
    ],
})
export class CachingParametersListComponent
    extends BaseListingComponent
    implements OnDestroy {
    module_name = module_name.cachingparameters;
    filter_table_name = filter_module_name.caching_parameters_master;
    private settingsUpdatedSubscription: Subscription;
    dataList = [];
    total = 0;
    user: any;
    is_first: any;

    columns = [
        {
            key: 'supplier_name',
            name: 'Supplier',
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
            key: 'travel_type',
            name: 'Travel Type',
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
            key: 'trip_type',
            name: 'Trip Type',
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
            key: 'sector',
            name: 'Sector',
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
            key: 'today_travel',
            name: 'Today Travel',
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
            key: 'one_week_travel',
            name: 'One Week Travel',
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
            key: 'one_month_travel',
            name: 'One Month Travel',
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
            key: 'far_travel',
            name: 'Far Travel',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
        }
    ];

    cols: Column[];
    _selectedColumns: Column[];
    isFilterShow: boolean = false;
    supplierListAll : any[] = [];
    selectedSupplier:any;

    constructor(
        private cachingParameterService: CachingParameterService,
        private conformationService: FuseConfirmationService,
        private flighttabService: FlightTabService,
        private entityService: EntityService,
        public _filterService: CommonFilterService
    ) {
        super(module_name.city);
        // this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'supplier_name';
        this.sortDirection = 'asc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);

        this.entityService.onrefreshcachingParametersCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                if(item){
                    this.refreshItems();
                }
            }
        })
    }

    ngOnInit() {
        this.getSupplier("")

        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            this.sortColumn = resp['sortColumn'];
            this.primengTable['_sortField'] = resp['sortColumn'];
            if(resp['table_config']['supplier_name']){
                this.selectedSupplier = resp['table_config'].supplier_name?.value;
            }
            this.primengTable['filters'] = resp['table_config'];
            this._selectedColumns = resp['selectedColumns'] || [];
            this.isFilterShow = true;
            this.primengTable._filter();
        });
    }

    ngAfterViewInit(){
        // Defult Active filter show
        if(this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            if(filterData['table_config']['supplier_name']){
                this.selectedSupplier = filterData['table_config'].supplier_name?.value;
            }
            this.primengTable['filters'] = filterData['table_config'];
            this._selectedColumns = filterData['selectedColumns'] || [];
            this.isFilterShow = true;
        }
      }

    getSupplier(value) {
        this.flighttabService.getSupplierBoCombo(value).subscribe((data: any) => {
          this.supplierListAll = data;

          for (let i in this.supplierListAll) {
            this.supplierListAll[i].id_by_value = this.supplierListAll[i].company_name
        }
        })
      }

    get selectedColumns(): Column[] {
        return this._selectedColumns;
    }

    set selectedColumns(val: Column[]) {
        if (Array.isArray(val)) {
            this._selectedColumns = this.cols.filter(col =>
                val.some(selectedCol => selectedCol.field === col.field)
            );
        } else {
            this._selectedColumns = [];
        }
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        this.cachingParameterService.getCachingParametersList(this.getNewFilterReq(event)).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                this.totalRecords = data.total;
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
    }

    createInternal(model: any): void {
        this.entityService.raisecachingParametersCall({ data: null, title: 'Create Caching Parameters', create: true })
    }

    editInternal(record): void {
        this.entityService.raisecachingParametersCall({ data: record, title: 'Edit Caching Parameters', edit: true })
    }

    viewInternal(record): void {
        this.entityService.raisecachingParametersCall({ data: record, title: 'Caching Parameters Info', list: true })
    }

    deleteInternal(record): void {
        const label: string = 'Delete Caching Parameters';
        this.conformationService
            .open({
                title: label,
                message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.supplier_name + ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.cachingParameterService.delete(record.id).subscribe({
                        next: () => {
                            this.alertService.showToast(
                                'success',
                                'Caching Parameters has been deleted!',
                                'top-right',
                                true
                            );
                            this.refreshItems();
                        },
                        error: (err) => {
                            this.alertService.showToast(
                                'error',
                                err,
                                'top-right',
                                true
                            );
                        },
                    });
                }
            });
    }

    getNodataText(): string {
        if (this.isLoading) return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    ngOnDestroy(): void {
        // this.masterService.setData(this.key, this);
        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
          }
    }
}
