import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
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
import { AppConfig } from 'app/config/app-config';
import { Security, fareTypeMApperPermissions, filter_module_name, module_name, techDashPermissions } from 'app/security';
import { takeUntil, debounceTime, Subject } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { GlobalSearchService } from 'app/services/global-search.service';
import { TechDashboardPendingComponent } from 'app/modules/crm/tech-dashboard/pending/pending.component';
import { TechDashboardCompletedComponent } from 'app/modules/crm/tech-dashboard/completed/completed.component';
import { TechDashboardExpiredComponent } from 'app/modules/crm/tech-dashboard/expired/expired.component';
import { TechDashboardBlockedComponent } from 'app/modules/crm/tech-dashboard/blocked/blocked.component';
import { CommonFaretypeComponent } from './common-faretype/common-faretype.component';
import { SupplierFaretypeMapperTabComponent } from './supplier-faretype-mapper-tab/supplier-faretype-mapper-tab.component';

@Component({
    selector: 'app-supplier-faretype-mapper-main',
    standalone: true,
    imports: [
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
        TechDashboardPendingComponent,
        TechDashboardCompletedComponent,
        TechDashboardExpiredComponent,
        TechDashboardBlockedComponent,

        CommonFaretypeComponent,
        SupplierFaretypeMapperTabComponent


    ],
    templateUrl: './supplier-faretype-mapper-main.component.html',
    styleUrls: ['./supplier-faretype-mapper-main.component.scss']
})
export class SupplierFaretypeMapperMainComponent implements OnDestroy {
    @ViewChild('commonFareType') commonFareType: CommonFaretypeComponent;
    @ViewChild('supplierFareTypeMapper') supplierFareTypeMapper: SupplierFaretypeMapperTabComponent;
    // @ViewChild('commontFareType') commontFareType: CommonFaretypeComponent;
    // @ViewChild('supplierFareTypeMapper') supplierFareTypeMapper: SupplierFaretypeMapperTabComponent;

    module_name = module_name.fare_type_mapper;
    filter_table_name = filter_module_name;
    public apiCalls: any = {};
    tabName: any
    tabNameStr: any = 'Comman Fare Type'
    tab: string = 'Comman Fare Type';

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

    constructor(
        public _filterService: CommonFilterService,
        private globalSearchService: GlobalSearchService
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
        this.globalSearchService.getItemList();
        this.globalSearchService.getProductList();
    }

    public tabChanged(event: any): void {
        const tabName = event?.tab?.ariaLabel;
        this.tabNameStr = tabName;
        this.tabName = tabName;

        switch (this.tabNameStr) {
            case 'Comman Fare Type':
                this.tab = 'commonFareType';
                this.commonFareType?.refreshItems();
                break;

            case 'Supplier Fare Type Mapper':
                this.tab = 'supplierFareTypeMapper';
                if (this.isSecond) {
                    this.supplierFareTypeMapper?.refreshItems();
                    this.isSecond = false;
                }
                break;
        }
    }

    openTabFiterDrawer() {
        if (this.tabNameStr == 'Comman Fare Type') {
            this._filterService.openDrawer(this.filter_table_name.fare_type_mapper_common_fare_type, this.commonFareType.primengTable);
        } else {
            this._filterService.openDrawer(this.filter_table_name.fare_type_mapper_supplier_fare_type_mapper, this.supplierFareTypeMapper.primengTable);
        }
    }

    refreshItemsTab(tabString: any): void {
        switch (tabString) {
            case 'Comman Fare Type':
                this.commonFareType?.refreshItems();
                break;
            case 'Supplier Fare Type Mapper':
                this.supplierFareTypeMapper?.refreshItems();
                break;

        }
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

