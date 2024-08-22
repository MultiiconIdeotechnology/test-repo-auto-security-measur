import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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
import { Security, crmLeadPermissions, filter_module_name, module_name } from 'app/security';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AppConfig } from 'app/config/app-config';
import { TechCollectionComponent } from '../tech/tech.component';
import { TravelCollectionComponent } from '../travel/travel.component';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { AgentService } from 'app/services/agent.service';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
    selector: 'app-crm-collection-list',
    templateUrl: './collection-list.component.html',
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
        TechCollectionComponent,
        TravelCollectionComponent
    ],
})
export class CRMCollectionListComponent extends BaseListingComponent implements OnDestroy {
    module_name = module_name.collections;
    @ViewChild('tech') tech: TechCollectionComponent;
    @ViewChild('travel') travel: TravelCollectionComponent;
    filter_table_name = filter_module_name;

    dataList = [];
    total = 0;
    public apiCalls: any = {};
    tabName: any
    tabNameStr: any = 'Tech'
    tab: string = 'Tech';
    isSecound: boolean = true
    isThird: boolean = true
    filterData: any = {};
    searchInputControlTech = new FormControl('');
    _unsubscribeAll: Subject<any> = new Subject<any>();
    searchInputControlTravel = new FormControl('');
    dataListpartners = [];
    dropdownListObj: any = {};

    isFilterShowTech: boolean = false;
    isFilterShowTravel: boolean = false;

    constructor(
        private matDialog: MatDialog,
        private agentService: AgentService,
        public _filterService: CommonFilterService
    ) {
        super(module_name.collections)
        this.key = this.module_name;
        this.sortColumn = '';
        this.sortDirection = '';
        this.Mainmodule = this

    }

    public getTabsPermission(tab: string): boolean {
        if (tab == 'tech') {
            return Security.hasPermission(crmLeadPermissions.techCollectionTabPermissions)
        }
        if (tab == 'travel')
            return Security.hasPermission(crmLeadPermissions.travelCollectionPermissions)
    }

    ngOnInit(): void {
        // this.searchInputControlTech.valueChanges
        //     .pipe(
        //         takeUntil(this._unsubscribeAll),
        //         debounceTime(AppConfig.searchDelay)
        //     )
        //     .subscribe((value) => {
        //         this.tech.searchInputControlTech.patchValue(value)
        //     });

        // this.searchInputControlTravel.valueChanges
        //     .pipe(
        //         takeUntil(this._unsubscribeAll),
        //         debounceTime(AppConfig.searchDelay)
        //     )
        //     .subscribe((value) => {
        //         this.travel.searchInputControlTravel.patchValue(value)
        //     });

        // calling Api for defatult value for first time to get Agent list.
    }

    // Function to get the agentList  from api
    getAgent(value: string) {
        this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
            this.dropdownListObj['agentList'] = data;

            for (let i in this.dropdownListObj['agentList']) {
                this.dropdownListObj['agentList'][i]['agent_info'] =
                    `${this.dropdownListObj['agentList'][i].code}-${this.dropdownListObj['agentList'][i].agency_name}${this.dropdownListObj['agentList'][i].email_address}`;
                    this.dropdownListObj['agentList'][i].id_by_value = this.dropdownListObj['agentList'][i].agency_name;
            }
        })
    }

    public tabChanged(event: any): void {
        const tabName = event?.tab?.ariaLabel;
        this.tabNameStr = tabName;
        this.tabName = tabName;
        this.isDestroy();

        switch (tabName) {
            case 'Tech':
                this._filterService.applyDefaultFilter(this.filter_table_name.collections_tech);
                this.tab = 'tech';
                break;

            case 'Travel':
                this._filterService.applyDefaultFilter(this.filter_table_name.collections_travel);
                this.tab = 'travel';
                if (this.isSecound) {
                    this.travel?.refreshItems()
                    this.isSecound = false;
                }
            break;
        }
    }

    isDestroy() {
        this._filterService.activeFiltData = {};
        this.resetPrimengTable();
        if (this.tech.settingsTechSubscription) {
            this.tech.settingsTechSubscription.unsubscribe();
        }

        if (this.travel.settingsTravelSubscription) {
            this.travel.settingsTravelSubscription.unsubscribe();
        }
    }

    openTabFiterDrawer() {
        if (this.tabNameStr == 'Tech') {
          this._filterService.openDrawer(this.filter_table_name.collections_tech, this.tech.primengTable);
        } else {
          this._filterService.openDrawer(this.filter_table_name.collections_travel, this.travel.primengTable);
        }
    }

    refreshItemsTab(tabString: any): void {
        if (tabString == 'Tech')
            this.tech?.refreshItems();
        else
            this.travel?.refreshItems();
    }

    techRefresh(event:any) {
        this.tech.searchInputControlTech.patchValue(event)
        this.tech?.refreshItems();
    }

    travelRefresh(event:any) {
        this.travel.searchInputControlTravel.patchValue(event)
        this.travel?.refreshItems();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.unsubscribe();
    }
}
