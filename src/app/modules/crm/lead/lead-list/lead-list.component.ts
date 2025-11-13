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
import { Security, crmLeadPermissions, filter_module_name, messages, module_name } from 'app/security';
import { takeUntil, Subject } from 'rxjs';
import { InboxComponent } from '../inbox/inbox.component';
import { ArchiveComponent } from '../archive/archive.component';
import { ToasterService } from 'app/services/toaster.service';
import { EntityService } from 'app/services/entity.service';
import { LeadEntrySettingsComponent } from '../lead-entry-settings/lead-entry-settings.component';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { Column } from 'app/form-models/base-listing';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { CrmService } from 'app/services/crm.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';

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
        LeadEntrySettingsComponent,
        PrimeNgImportsModule
    ],
})
export class CRMLeadListComponent implements OnDestroy {
    @ViewChild('inbox') inbox: InboxComponent;
    @ViewChild('archive') archive: ArchiveComponent;
    module_name = module_name.lead;
    filter_table_name = filter_module_name;

    public apiCalls: any = {};
    tabName: any
    tabNameStr: any = 'Inbox'
    tab: string = 'Inbox';
    isSecound: boolean = true
    isLoading: boolean = false
    isThird: boolean = true
    filterData: any = {};
    searchInputControlInbox = new FormControl('');
    _unsubscribeAll: Subject<any> = new Subject<any>();
    searchInputControlArchive = new FormControl('');
    _selectedColumns: Column[];
    dataList = [];
    dataListArchive = [];
    total = 0;
    // cols: Column[] = [
    //     { field: 'lead_assign_by', header: 'Assign By' },
    //     { field: 'lead_assign_by_date', header: 'Assign By Date' },
    // ];

    constructor(
        private alertService: ToasterService,
        private entityService: EntityService,
        public _filterService: CommonFilterService,
        private crmService: CrmService,
        private conformationService: FuseConfirmationService,
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

    toggleOverlayPanel(event: MouseEvent) {
        switch (this.tabNameStr) {
            case 'Inbox':
                this.inbox.toggleOverlayPanel(event);
                break;
            case 'Archive':
                this.archive.toggleOverlayPanel(event);
                break;
        }

    }

    openTabFiterDrawer() {
        if (this.tabNameStr == 'Inbox') {
            this._filterService.openDrawer(this.filter_table_name.leads_inbox, this.inbox.primengTable);
        } else if (this.tabNameStr == 'Archive') {
            this._filterService.openDrawer(this.filter_table_name.leads_archive, this.archive.primengTable);
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

    // Get Leads
    getLeads() {
        const label: string = 'New Leads'
        this.conformationService.open({
            title: label,
            message: 'Are you sure you want to get new leads?',
        }).afterClosed().subscribe({
            next: (res) => {
                if (res === 'confirmed') {
                    this.isLoading = true;
                    this.crmService.getdeadLeadbyrm({}).subscribe({
                        next: (data) => {
                            this.inbox?.refreshItems();
                            this.alertService.showToast('success', "Leads get successfully ", "top-right", true);
                            this.isLoading = false;
                        },
                        error: (err) => {
                            this.alertService.showToast('error', err, 'top-right', true);
                            this.isLoading = false;
                        },
                    });
                }
            }
        });
    }

    onleadSubmit(key: string) {
        if (key == 'submit') {
            this.inbox?.refreshItems()
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.unsubscribe();
    }
}
