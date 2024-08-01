import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewChild} from '@angular/core';
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
import { Security, crmLeadPermissions, module_name } from 'app/security';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AppConfig } from 'app/config/app-config';
import { InboxAgentComponent } from '../inbox/inbox-agent.component';
import { PartnersComponent } from "../partners/partners.component";

@Component({
    selector: 'app-crm-agent-list',
    templateUrl: './agent-list.component.html',
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
        InboxAgentComponent,
        PartnersComponent
    ]
})
export class CRMAgentListComponent implements OnDestroy{
    module_name = module_name.crmagent;
    @ViewChild('inbox') inbox: InboxAgentComponent;
    @ViewChild('partners') partners: PartnersComponent;

    public apiCalls: any = {};
    tabName: any
    tabNameStr: any = 'Inbox'
    tab: string = 'Inbox';
    isSecound: boolean = true
    isThird: boolean = true
    filterData: any = {};
    searchInputControlInbox = new FormControl('');
    _unsubscribeAll: Subject<any> = new Subject<any>();
    searchInputControlpartners = new FormControl('');

    dataList = [];
    dataListpartners = [];
    total = 0;

    constructor(
    ) {
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.unsubscribe();
    }

    public getTabsPermission(tab: string): boolean {
        if (tab == 'inbox') {
            return Security.hasPermission(crmLeadPermissions.agentInboxTabPermissions)
        }
        if (tab == 'partners')
            return Security.hasPermission(crmLeadPermissions.partnersTabPermissions)
    }


    ngOnInit(): void {
        this.searchInputControlInbox.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(AppConfig.searchDelay)
            )
            .subscribe((value) => {
                this.inbox.searchInputControlInbox.patchValue(value)
            });

        this.searchInputControlpartners.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(AppConfig.searchDelay)
            )
            .subscribe((value) => {
                this.partners.searchInputControlpartners.patchValue(value)
            });
    }

    public tabChanged(event: any): void {
        const tabName = event?.tab?.ariaLabel;
        this.tabNameStr = tabName;
        this.tabName = tabName;

        switch (tabName) {
            case 'Inbox':
                this.tab = 'inbox';
                this.inbox.refreshItems();
                break;

            case 'Partners':
                this.tab = 'partners';
                if (this.isSecound) {
                    this.partners.refreshItems()
                    this.isSecound = false
                }
                break;
        }
    }

    refreshItemsTab(tabString: any): void {
        if (tabString == 'Inbox')
            this.inbox.refreshItems();
        else
            this.partners.refreshItems();
    }
}
