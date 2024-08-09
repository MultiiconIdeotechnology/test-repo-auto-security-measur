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
import { AppConfig } from 'app/config/app-config';
import { Security, crmLeadPermissions, messages, module_name } from 'app/security';
import { takeUntil, debounceTime, Subject } from 'rxjs';
import { InboxComponent } from '../inbox/inbox.component';
import { ArchiveComponent } from '../archive/archive.component';
import { ToasterService } from 'app/services/toaster.service';
import { EntityService } from 'app/services/entity.service';
import { LeadEntrySettingsComponent } from '../lead-entry-settings/lead-entry-settings.component';

@Component({
    selector: 'app-crm-lead-list',
    templateUrl: './lead-list.component.html',
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
        InboxComponent,
        ArchiveComponent,
        LeadEntrySettingsComponent
    ],
})
export class CRMLeadListComponent implements OnDestroy {
    module_name = module_name.lead;
    @ViewChild('inbox') inbox: InboxComponent;
    @ViewChild('archive') archive: ArchiveComponent;

    public apiCalls: any = {};
    tabName: any
    tabNameStr: any = 'Inbox'
    tab: string = 'Inbox';
    isSecound: boolean = true
    isThird: boolean = true
    filterData: any = {};
    searchInputControlInbox = new FormControl('');
    _unsubscribeAll: Subject<any> = new Subject<any>();
    searchInputControlArchive = new FormControl('');
    dataList = [];
    dataListArchive = [];
    total = 0;

    constructor(
        private alertService: ToasterService,
        private entityService: EntityService
    ) {
        this.entityService.onrefreshleadEntityCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                this.inbox.refreshItems();
            }
        })
    }

    public getTabsPermission(tab: string): boolean {
        if (tab == 'inbox') {
            return Security.hasPermission(crmLeadPermissions.inboxTabPermissions)
        }
        if (tab == 'archive')
            return Security.hasPermission(crmLeadPermissions.archiveTabPermissions)
    }

    ngOnInit(): void {
    }

    public tabChanged(event: any): void {
        const tabName = event?.tab?.ariaLabel;
        this.tabNameStr = tabName;
        this.tabName = tabName;

        switch (this.tabNameStr) {
            case 'Inbox':
                this.tab = 'inbox';
                this.inbox?.refreshItems();
                break;

            case 'Archive':
                this.tab = 'archive';
                // if (this.isSecound) {
                    this.archive?.refreshItems()
                    // this.isSecound = false
                // }
                break;
        }
    }

    refreshItemsTab(tabString: any): void {
        if (tabString == 'Inbox') {
            this.inbox?.refreshItems();
        }
        else {
            this.archive?.refreshItems();
        }
    }

    inboxRefresh(event) {
        this.inbox.searchInputControlInbox.patchValue(event);
        this.inbox?.refreshItems();
    }

    archiveRefresh(event) {
        this.archive.searchInputControlArchive.patchValue(event)
        this.archive?.refreshItems();
    }

    createInternal(): void {
        if (!Security.hasNewEntryPermission(module_name.lead)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        // this.matDialog.open(CRMLeadEntryComponent,
        //     { data: null, disableClose: true, })
        //     .afterClosed()
        //     .subscribe((res) => {
        //         if (res) {
        //             this.inbox.refreshItems();
        //         }
        //     });
        this.entityService.raiseleadEntityCall({})
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.unsubscribe();
    }
}
