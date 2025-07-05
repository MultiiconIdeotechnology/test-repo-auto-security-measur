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
import { Security, filter_module_name, module_name, techDashPermissions } from 'app/security';
import { takeUntil, debounceTime, Subject } from 'rxjs';
import { TechDashboardPendingComponent } from '../pending/pending.component';
import { TechDashboardCompletedComponent } from '../completed/completed.component';
import { TechDashboardExpiredComponent } from '../expired/expired.component';
import { TechDashboardBlockedComponent } from '../blocked/blocked.component';
import { AgentService } from 'app/services/agent.service';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { ItemService } from 'app/services/item.service';
import { GlobalSearchService } from 'app/services/global-search.service';

@Component({
    selector: 'app-crm-tech-dashboard-list',
    templateUrl: './tech-dashboard-list.component.html',
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
        TechDashboardBlockedComponent
    ],
})
export class CRMTechDashboardListComponent implements OnDestroy {
    @ViewChild('pending') pending: TechDashboardPendingComponent;
    @ViewChild('completed') completed: TechDashboardCompletedComponent;
    @ViewChild('expired') expired: TechDashboardExpiredComponent;
    @ViewChild('blocked') blocked: TechDashboardBlockedComponent;

    module_name = module_name.techDashboard;
    filter_table_name = filter_module_name;
    public apiCalls: any = {};
    tabName: any
    tabNameStr: any = 'Pending'
    tab: string = 'Pending';

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
        if (tab == 'pending') {
            return Security.hasPermission(techDashPermissions.pendingTabPermissions)
        }
        if (tab == 'completed') {
            return Security.hasPermission(techDashPermissions.completedTabPermissions)
        }
        if (tab == 'expired') {
            return Security.hasPermission(techDashPermissions.expiredTabPermissions)
        }
        if (tab == 'blocked') {
            return Security.hasPermission(techDashPermissions.blockedTabPermissions)
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
            case 'Pending':
                this.tab = 'pending';
                this.pending?.refreshItems();
                break;

            case 'Completed':
                this.tab = 'completed';
                // if (this.isSecond) {
                this.completed?.refreshItems();
                this.isSecond = false;
                // }
                break;

            case 'Blocked':
                this.tab = 'blocked';
                // if (this.isThird) {
                this.blocked?.refreshItems();
                this.isThird = false;
                // }
                break;

            case 'Expired':
                this.tab = 'expired';
                // if (this.isFourth) {
                this.expired?.refreshItems();
                this.isFourth = false;
                // }
                break;
        }
    }

    openTabFiterDrawer() {
        if (this.tabNameStr == 'Pending') {
            this._filterService.openDrawer(this.filter_table_name.tech_dashboard_pending, this.pending.primengTable);
        } else if (this.tabNameStr == 'Completed') {
            this._filterService.openDrawer(this.filter_table_name.tech_dashboard_completed, this.completed.primengTable);
        } else if (this.tabNameStr == 'Blocked') {
            this._filterService.openDrawer(this.filter_table_name.tech_dashboard_blocked, this.blocked.primengTable);
        } else {
            this._filterService.openDrawer(this.filter_table_name.tech_dashboard_expired, this.expired.primengTable);
        }
    }

      toggleOverlayPanel(event: MouseEvent) {
    switch (this.tabNameStr) {
      case 'Pending':
        this.pending.toggleOverlayPanel(event);
        break;
      case 'Completed':
        this.completed.toggleOverlayPanel(event);
        break;
      case 'Blocked':
        this.blocked.toggleOverlayPanel(event);
        break;
        case 'Expired':
        this.expired.toggleOverlayPanel(event);
        break;
    }

  }

    refreshItemsTab(tabString: any): void {
        switch (tabString) {
            case 'Pending':
                this.pending?.refreshItems();
                break;
            case 'Completed':
                this.completed?.refreshItems();
                break;
            case 'Expired':
                this.expired?.refreshItems();
                break;
            case 'Blocked':
                this.blocked?.refreshItems();
                break;
        }
    }

    exportExcel(): void {
        if (this.tab == 'blocked')
            this.blocked.exportExcel()
        else
            this.expired.exportExcel()
    }

    pendingRefresh(event: any) {
        this.pending.searchInputControlPending.patchValue(event);
        this.pending?.refreshItems();
    }

    completedRefresh(event: any) {
        this.completed.searchInputControlCompleted.patchValue(event);
        this.completed?.refreshItems();
    }

    expiredRefresh(event: any) {
        this.expired.searchInputControlExpired.patchValue(event);
        this.expired?.refreshItems();
    }

    blockedRefresh(event: any) {
        this.blocked.searchInputControlBlocked.patchValue(event);
        this.blocked?.refreshItems();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.unsubscribe();
    }
}
