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
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { GlobalSearchService } from 'app/services/global-search.service';
import { CancelledComponent } from '../cancelled/cancelled.component';
import { SslComponent } from '../ssl/ssl.component';
import { TechDashboardDomainComponent } from './domain/domain.component';
import { DomainInfoComponent } from './domain/domain-info/domain-info.component';
import { SelectedSslInfoComponent } from './domain/selected-ssl-info/selected-ssl-info.component';

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
        TechDashboardBlockedComponent,
        CancelledComponent,
        SslComponent,
        TechDashboardDomainComponent,
        DomainInfoComponent,
        SelectedSslInfoComponent
    ],
})
export class CRMTechDashboardListComponent implements OnDestroy {
    @ViewChild('pending') pending: TechDashboardPendingComponent;
    @ViewChild('completed') completed: TechDashboardCompletedComponent;
    @ViewChild('blocked') blocked: TechDashboardBlockedComponent;
    @ViewChild('expired') expired: TechDashboardExpiredComponent;
    @ViewChild('cancelled') cancelled: CancelledComponent;
    @ViewChild('domain') domain: TechDashboardDomainComponent;
    module_name = module_name.techDashboard;
    public apiCalls: any = {};
    tabName: any
    tabNameStr: any = 'Pending'
    tab: string = 'Pending';

    isSecond: boolean = true;
    isThird: boolean = true;
    isFourth: boolean = true;
    isFive: boolean = true;
    isSix: boolean = true;
    filterData: any = {};
    searchInputControlPending = new FormControl('');
    _unsubscribeAll: Subject<any> = new Subject<any>();
    searchInputControlCompleted = new FormControl('');
    searchInputControlExpired = new FormControl('');
    searchInputControlBlocked = new FormControl('');
    searchInputControlCancelled = new FormControl('');
    searchInputControlDomain = new FormControl('');

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
        if (tab == 'cancelled') {
            return Security.hasPermission(techDashPermissions.cancelledTabPermissions)
        }
        if (tab == 'domain') {
            return Security.hasPermission(techDashPermissions.domainTabPermissions)
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

            case 'Cancelled':
                this.tab = 'cancelled';
                // if (this.isFourth) {
                this.cancelled?.refreshItems();
                this.isFive = false;
                // }
                break;

            case 'Domain':
                this.tab = 'domain';
                // if (this.isFourth) {
                this.domain?.refreshItems();
                 this.isSix = false;
                // }
                break;

            // case 'SSL':
            //     this.tab = 'ssl';
            //     // if (this.isFourth) {
            //     this.ssl?.refreshItems();
            //     this.isSix = false;
            //     // }
            //     break;
        }
        //     case 'Expired':
        //         this.tab = 'expired';
        //         // if (this.isFourth) {
        //         this.expired?.refreshItems();
        //         this.isFourth = false;
        //         // }
        //         break;

            // case 'Domain':
            //     this.tab = 'domain';
            //     // if (this.isFourth) {
            //     this.domain?.refreshItems();
            //     // }
            //     break;
        }
    

    openTabFiterDrawer() {
        if (this.tabNameStr == 'Pending') {
            this._filterService.openDrawer(this.filter_table_name.tech_dashboard_pending, this.pending.primengTable);
        } else if (this.tabNameStr == 'Completed') {
            this._filterService.openDrawer(this.filter_table_name.tech_dashboard_completed, this.completed.primengTable);
        } else if (this.tabNameStr == 'Blocked') {
            this._filterService.openDrawer(this.filter_table_name.tech_dashboard_blocked, this.blocked.primengTable);
        } else if (this.tabNameStr == 'Cancelled') {
            this._filterService.openDrawer(this.filter_table_name.tech_dashboard_cancelled, this.cancelled.primengTable);
        }  else if (this.tabNameStr == 'expired') {
            this._filterService.openDrawer(this.filter_table_name.tech_dashboard_expired, this.expired.primengTable);
        } else if (this.tabNameStr == 'Domain') {
            this._filterService.openDrawer(this.filter_table_name.tech_dashboard_domain, this.domain.primengTable);
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
            case 'Cancelled':
                this.cancelled?.refreshItems();
                break;
            case 'Domain':
                this.domain?.refreshItems();
                break;
        }
    }

    exportExcel(): void {
        if (this.tab == 'pending' || this.tab == 'Pending')
            this.pending.exportExcel();
        else if (this.tab == 'completed')
            this.completed.exportExcel();
        else if (this.tab == 'blocked')
            this.blocked.exportExcel();
        else if (this.tab == 'cancelled')
            this.cancelled.exportExcel()
        else if(this.tab == 'domain')
            this.domain.exportExcel();
        else
            this.expired.exportExcel();
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

    cancelledRefresh(event: any) {
        this.cancelled.searchInputControlCancelled.patchValue(event);
        this.cancelled?.refreshItems();
    }
   
    domainRefresh(event:any) {
        this.domain.searchInputControlDomain.patchValue(event); 
        this.domain?.refreshItems();
    }

    generateSSL(){
        this.domain?.openSelectedDomain();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.unsubscribe();
    }
}
