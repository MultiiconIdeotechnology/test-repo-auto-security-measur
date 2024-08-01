import { module_name } from 'app/security';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { MessageEventsEntryComponent } from '../message-events-entry/message-events-entry.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MessageEventsService } from 'app/services/message-events.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ToasterService } from 'app/services/toaster.service';

@Component({
    selector: 'app-message-events-list',
    templateUrl: './message-events-list.component.html',
    styles: [
        `
            .tbl-grid {
                grid-template-columns: 40px 260px 500px 250px;
            }
        `,
    ],
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
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatMenuModule,
        MatDialogModule,
        MatTooltipModule,
        MatDividerModule,
    ],
})
export class MessageEventsListComponent
    extends BaseListingComponent
    implements OnDestroy {
    module_name = module_name.messageevents;
    dataList = [];
    total = 0;

    columns = [
        {
            key: 'event_name',
            name: 'Event Name',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true
        },
        {
            key: 'event_description',
            name: 'Event Description',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true
        },
        {
            key: '.',
            name: '',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true
        },
    ];
    cols = [];

    constructor(
        private messageeventService: MessageEventsService,
        private conformationService: FuseConfirmationService,
        public toasterService: ToasterService,
        private matDialog: MatDialog
    ) {
        super(module_name.messageevents);
        this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'event_name';
        this.sortDirection = 'asc';
        this.Mainmodule = this;
    }

    refreshItems(): void {
        this.isLoading = true;
        this.messageeventService
            .getMessageEventList(this.getFilterReq())
            .subscribe({
                next: (data) => {
                    this.isLoading = false;
                    this.dataList = data.data;
                    this._paginator.length = data.total;
                },
                error: (err) => {
                    this.toasterService.showToast('error', err)
                    this.isLoading = false;
                },
            });
    }

    createInternal(model): void {
        this.matDialog
            .open(MessageEventsEntryComponent, {
                data: null,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.alertService.showToast(
                        'success',
                        'New record added',
                        'top-right',
                        true
                    );
                    this.refreshItems();
                }
            });
    }

    editInternal(record): void {
        this.matDialog
            .open(MessageEventsEntryComponent, {
                data: { data: record, readonly: false },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.alertService.showToast(
                        'success',
                        'Record modified',
                        'top-right',
                        true
                    );
                    this.refreshItems();
                }
            });
    }

    viewInternal(record): void {
        this.matDialog.open(MessageEventsEntryComponent, {
            data: { data: record, readonly: true },
            disableClose: true,
        });
    }

    deleteInternal(record): void {
        const label: string = 'Delete Message Event';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.event_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.messageeventService.delete(record.id).subscribe({
                        next: () => {
                            this.toasterService.showToast(
                                'success',
                                'Message Event has been Deleted!',
                                'top-right',
                                true
                            );
                            this.refreshItems();
                        },
                        error: (err) => {
                            this.toasterService.showToast('error', err)
                            this.isLoading = false;
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
        this.masterService.setData(this.key, this);
    }
}
