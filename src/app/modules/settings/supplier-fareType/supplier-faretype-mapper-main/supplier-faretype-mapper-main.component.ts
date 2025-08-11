import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Security, fareTypeMApperPermissions, filter_module_name, module_name } from 'app/security';
import { Subject } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { GlobalSearchService } from 'app/services/global-search.service';
import { CommonFaretypeComponent } from './common-faretype/common-faretype.component';
import { SupplierFaretypeMapperTabComponent } from './supplier-faretype-mapper-tab/supplier-faretype-mapper-tab.component';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
import { CommonFareTypeEntryComponent } from "./common-faretype/common-fareType-entry/common-fareType-entry.component";
import { Column } from 'app/form-models/base-listing';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { SupplierTypeEntryComponent } from "./supplier-faretype-mapper-tab/supplier-type-entry/supplier-type-entry.component";

@Component({
    selector: 'app-supplier-faretype-mapper-main',
    standalone: true,
    imports: [
        PrimeNgImportsModule,
        NgIf,
        NgFor,
        DatePipe,
        ReactiveFormsModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatProgressBarModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatMenuModule,
        MatDialogModule,
        MatTooltipModule,
        MatDividerModule,
        CommonModule,
        MatTabsModule,
        CommonFaretypeComponent,
        SupplierFaretypeMapperTabComponent,
        CommonFareTypeEntryComponent,
        SupplierTypeEntryComponent
    ],
    templateUrl: './supplier-faretype-mapper-main.component.html',
    styleUrls: ['./supplier-faretype-mapper-main.component.scss']
})
export class SupplierFaretypeMapperMainComponent implements OnDestroy {
    @ViewChild('commonFareType') commonFareType: CommonFaretypeComponent;
    @ViewChild('supplierFareTypeMapper') supplierFareTypeMapper: SupplierFaretypeMapperTabComponent;


    module_name = module_name.fare_type_mapper;
    filter_table_name = filter_module_name;
    public apiCalls: any = {};
    tabName: any
    tabNameStr: any = 'Common'
    tab: string = 'Common';

    isSecond: boolean = true;
    isThird: boolean = true;
    isFourth: boolean = true;
    filterData: any = {};
    searchInputControlPending = new FormControl('');
    _unsubscribeAll: Subject<any> = new Subject<any>();
    searchInputControlCompleted = new FormControl('');
    searchInputControlExpired = new FormControl('');
    searchInputControlBlocked = new FormControl('');
    itemList = [];
    dataListArchive = [];
    total = 0;
    record: any;
    _selectedColumns: Column[];
    selectedColumns: Column[];

    cols: Column[] = [
        { field: 'entry_date_time', header: 'Create Date', type: 'date' },
        { field: 'modify_date_time', header: 'Modify Date', type: 'date' },
    ];

    cols1: Column[] = [
        { field: 'entry_date_time', header: 'Create Date' , type: 'date'},
        { field: 'modify_date_time', header: 'Modify Date', type: 'date' },
    ];

    constructor(
        public _filterService: CommonFilterService,
        private globalSearchService: GlobalSearchService,
        private sidebarDialogService: SidebarCustomModalService,
    ) { }

    public getTabsPermission(tab: string): boolean {
        if (tab == 'commonFareType') {
            return Security.hasPermission(fareTypeMApperPermissions.commonFareTypeTabTabPermissions)
        }
        if (tab == 'supplierFareTypeMapper') {
            return Security.hasPermission(fareTypeMApperPermissions.supplierFareTypeMapperTabPermissions)
        }

    }

    ngOnInit(): void {
        this.commonFareType?.refreshItems();
        //this.globalSearchService.getProductList();
    }

    public tabChanged(event: any): void {
        const tabName = event?.tab?.ariaLabel;
        this.tabNameStr = tabName;
        this.tabName = tabName;

        switch (this.tabNameStr) {
            case 'Common':
                this.tab = 'commonFareType';
                this.commonFareType?.refreshItems();
                break;

            case 'Supplier':
                this.tab = 'supplierFareTypeMapper';
                if (this.isSecond) {
                    this.supplierFareTypeMapper?.refreshItems();
                    this.isSecond = false;
                }
                break;
        }
    }

    openTabFiterDrawer() {
        if (this.tabNameStr == 'Common') {
            this._filterService.openDrawer(this.filter_table_name.fare_type_mapper_common_fare_type, this.commonFareType.primengTable);
        } else {
            this._filterService.openDrawer(this.filter_table_name.fare_type_mapper_supplier_fare_type_mapper, this.supplierFareTypeMapper.primengTable);
        }
    }



    refreshItemsTab(tabString: any): void {
        switch (tabString) {
            case 'Common':
                this.commonFareType?.refreshItems();
                break;
            case 'Supplier':
                this.supplierFareTypeMapper?.refreshItems();
                break;

        }
    }

    createInternal(): void {
        this.sidebarDialogService.openModal('common-fareType-create', null)
    }

    createInternalSupplier(): void {
        this.sidebarDialogService.openModal('supplier-fareType-create', null)
    }



    exportExcel(): void {
        // if (this.tab == 'blocked')
        //     this.blocked.exportExcel()
        // else
        //     this.expired.exportExcel()
    }

    commonFareTypeRefresh(event: any) {
        this.commonFareType.searchInputControlCommonFareType.patchValue(event);
        this.commonFareType?.refreshItems();
    }

    supplierFareTypeMapperRefresh(event: any) {
        this.supplierFareTypeMapper.searchInputControlSupplierFareTypeMapper.patchValue(event);
        this.supplierFareTypeMapper?.refreshItems();
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.unsubscribe();
    }
}

