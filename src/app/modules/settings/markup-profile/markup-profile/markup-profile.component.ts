import { Routes } from 'app/common/const';
import { Router } from '@angular/router';
import { Security, markupProfilePermissions, messages, module_name } from 'app/security';
import { Component, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { AgentListDialogComponent } from '../agent-list-dialog/agent-list-dialog.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ToasterService } from 'app/services/toaster.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MarkupprofileService } from 'app/services/markupprofile.service';

@Component({
    selector: 'app-markup-profile',
    templateUrl: './markup-profile.component.html',
    styles: [
        `
            .tbl-grid {
                grid-template-columns: 40px 260px 160px 80px;
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
export class MarkupProfileComponent
    extends BaseListingComponent
    implements OnDestroy {
    module_name = module_name.markupprofile;
    dataList = [];
    total = 0;

    columns = [
        {
            key: 'profile_name',
            name: 'Profile Name',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: true,
            applied: false,
            tooltip: true
        },
        {
            key: 'assigned_to_length',
            name: 'Applied On',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            applied: true,
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
            applied: false,
            tooltip: true
        },
    ];
    cols = [];

    constructor(
        private markupprofileService: MarkupprofileService,
        private conformationService: FuseConfirmationService,
        private router: Router,
        public toasterService: ToasterService,
        private matDialog: MatDialog
    ) {
        super(module_name.markupprofile);
        this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'profile_name';
        this.sortDirection = 'asc';
        this.Mainmodule = this;
    }

    refreshItems(): void {
        this.isLoading = true;
        this.markupprofileService
            .getMarkupProfileList(this.getFilterReq())
            .subscribe({
                next: (data) => {
                    this.isLoading = false;
                    this.dataList = data.data;
                    this._paginator.length = data.total;

                    this.dataList.forEach((row) => {
                        row['assigned_to_length'] = row['assigned_to'].length;
                    });
                },
                error: (err) => {
                    this.toasterService.showToast('error', err)
                    this.isLoading = false;
                },
            });
    }

    createInternal(model): void {
        this.router.navigate([Routes.settings.markupprofile_entry_route]);
    }

    editInternal(record): void {
        this.router.navigate([
            Routes.settings.markupprofile_entry_route + '/' + record.id,
        ]);
    }

    viewInternal(record): void {
        this.router.navigate([
            Routes.settings.markupprofile_entry_route +
            '/' +
            record.id +
            '/readonly',
        ]);
    }

    deleteInternal(record): void {
        const label: string = 'Delete Markup Profile';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.profile_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.markupprofileService.delete(record.id).subscribe({
                        next: () => {
                            this.refreshItems();
                            this.toasterService.showToast(
                                'success',
                                'Markup Profile has been Deleted!'
                            );
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

    opanAgentsListDialog(rowData: any) {
        const assignedToList = rowData['assigned_to'];
        if (assignedToList.length <= 0) return;
        this.matDialog.open(AgentListDialogComponent, {
            disableClose: true,
            data: assignedToList,
        });
    }

    ngOnDestroy(): void {
        this.masterService.setData(this.key, this);
    }

    SetDefault(record): void {
        if (!Security.hasPermission(markupProfilePermissions.setasDefaultPermissions)) {
            return this.toasterService.showToast('error', messages.permissionDenied);
        }

        const label: string = 'Set Default Markup Profile';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.profile_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.markupprofileService.setDefault(record.id).subscribe({
                        next: () => {
                            this.refreshItems();
                            this.toasterService.showToast(
                                'success',
                                'Markup Profile Set as Default!'
                            );
                        },
                        error: (err) => {
                            this.toasterService.showToast('error', err)
                            this.isLoading = false;
                        },
                    });
                }
            });
    }
}
