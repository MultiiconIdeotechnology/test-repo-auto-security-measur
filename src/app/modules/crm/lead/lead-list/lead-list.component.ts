import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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
import { AppConfig } from 'app/config/app-config';
import { Security, crmLeadPermissions, messages, module_name } from 'app/security';
import { takeUntil, debounceTime, Subject } from 'rxjs';
import { CRMLeadEntryComponent } from '../lead-entry/lead-entry.component';
import { InboxComponent } from '../inbox/inbox.component';
import { ArchiveComponent } from '../archive/archive.component';
import { ToasterService } from 'app/services/toaster.service';


@Component({
    selector: 'app-crm-lead-list',
    templateUrl: './lead-list.component.html',
    styles: [
        `
            .tbl-grid {
                grid-template-columns: 40px 350px 130px 180px 200px 200px 150px 200px 130px 100px;
            }

            .tbl-grid1 {
                grid-template-columns: 40px 150px 150px 150px 260px 250px 210px 210px;
            }
        `,
    ],
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
        ArchiveComponent
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
        private matDialog: MatDialog,
        private alertService: ToasterService,
    ) {
    }
    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.unsubscribe();
    }

    public getTabsPermission(tab: string): boolean {
        if (tab == 'inbox') {
            return Security.hasPermission(crmLeadPermissions.inboxTabPermissions)
        }
        if (tab == 'archive')
            return Security.hasPermission(crmLeadPermissions.archiveTabPermissions)
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

        this.searchInputControlArchive.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(AppConfig.searchDelay)
            )
            .subscribe((value) => {
                this.archive.searchInputControlArchive.patchValue(value)
            });
    }

    public tabChanged(event: any): void {
        const tabName = event?.tab?.ariaLabel;
        this.tabNameStr = tabName;
        this.tabName = tabName;

        switch (this.tabNameStr) {
            case 'Inbox':
                this.tab = 'inbox';
                this.inbox.refreshItems();
                break;

            case 'Archive':
                this.tab = 'archive';
                if (this.isSecound) {
                    this.archive.refreshItems()
                    this.isSecound = false
                }
                break;
        }
    }

    refreshItemsTab(tabString: any): void {
        if (tabString == 'Inbox') {
            this.inbox.refreshItems();
        }
        else {
            this.archive.refreshItems();
        }
    }

    createInternal(): void {
        if (!Security.hasNewEntryPermission(module_name.lead)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        this.matDialog.open(CRMLeadEntryComponent,
            { data: null, disableClose: true, })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.alertService.showToast(
                        'success',
                        'New record added',
                        'top-right',
                        true
                    );
                    this.inbox.refreshItems();
                }
            });
    }
}
