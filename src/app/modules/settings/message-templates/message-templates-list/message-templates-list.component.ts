import { Routes } from 'app/common/const';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { Component, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Security, messageTemplatesPermissions, messages, module_name } from 'app/security';
import { ReactiveFormsModule } from '@angular/forms';
import { ViewForTemplateComponent } from '../view-for-template/view-for-template.component';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MessageTemplatesService } from 'app/services/message-templates.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ToasterService } from 'app/services/toaster.service';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';


@Component({
    selector: 'app-message-templates-list',
    templateUrl: './message-templates-list.component.html',
    styles: [
        `
            .tbl-grid {
                grid-template-columns: 40px 150px 250px 140px 180px 250px 120px 140px 160px;
            }
        `,
    ],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatProgressBarModule,
        MatMenuModule,
        MatDialogModule,
        MatTooltipModule,
        MatDividerModule,
        PrimeNgImportsModule
    ],
})
export class MessageTemplatesListComponent
    extends BaseListingComponent
    implements OnDestroy {
    module_name = module_name.messagetemplates;
    dataList = [];
    total = 0;

    columns = [
        {
            key: 'template_for',
            name: 'Template For',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: true,
            inicon: false,
            tooltip: true
        },
        {
            key: 'event_name',
            name: 'Event',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            inicon: false,
            tooltip: true
        },
        {
            key: 'message_type',
            name: 'Message Type',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            inicon: false,
            tooltip: true
        },
        {
            key: 'message_title',
            name: 'Title',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            inicon: false,
            tooltip: true
        },
        {
            key: 'email_subject',
            name: 'Subject',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            inicon: false,
            tooltip: true
        },
        {
            key: 'message_template',
            name: 'Template',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: 'header-center-view',
            is_sticky: false,
            align: 'center',
            indicator: false,
            inicon: true,
            tooltip: true
        },
        {
            key: 'send_to',
            name: 'Send To',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            inicon: false,
            tooltip: true
        },
        // {
        //     key: 'send_from_name',
        //     name: 'Send From',
        //     is_date: false,
        //     date_formate: '',
        //     is_sortable: true,
        //     class: '',
        //     is_sticky: false,
        //     align: '',
        //     indicator: false,
        //     inicon: false,
        //     tooltip: true
        // },
        {
            key: 'individual_address',
            name: 'Individual Address',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            inicon: false,
            tooltip: true
        },
    ];
    cols = [];
    _selectedColumns: Column[];
    isFilterShow: boolean = false;

    constructor(
        private messageTemplatesService: MessageTemplatesService,
        private conformationService: FuseConfirmationService,
        private router: Router,
        private toasterService: ToasterService,
        private matDialog: MatDialog
    ) {
        super(module_name.messagetemplates);
        this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'event_name';
        this.sortDirection = 'asc';
        this.Mainmodule = this;
    }

    ngOnInit() {
        this.cols = [
            { field: 'template_for_name', header: 'Template For Name', type:'text' },
            { field: 'modify_date_time', header: 'Modify Date Time', type:'date' },
        ];
    }

    get selectedColumns(): Column[] {
        return this._selectedColumns;
    }

    set selectedColumns(val: Column[]) {
        this._selectedColumns = this.cols.filter((col) => val.includes(col));
    }

    refreshItems(event?:any): void {
        this.isLoading = true;
        this.messageTemplatesService
            .getMessageList(this.getNewFilterReq(event))
            .subscribe({
                next: (data) => {
                    this.isLoading = false;
                    this.dataList = data.data;
                    this.totalRecords = data.total;
                },
                error: (err) => {
                    this.toasterService.showToast('error', err)
                    this.isLoading = false;
                },
            });
    }
    createInternal(model): void {
        this.router.navigate([Routes.settings.messagetemplates_entry_route]);
    }

    editInternal(record): void {
        this.router.navigate([
            Routes.settings.messagetemplates_entry_route + '/' + record.id,
        ]);
    }

    viewInternal(record): void {
        this.router.navigate([
            Routes.settings.messagetemplates_entry_route +
            '/' +
            record.id +
            '/readonly',
        ]);
    }

    deleteInternal(record): void {
        const label: string = 'Delete Message Template';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.message_title +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.messageTemplatesService.delete(record.id).subscribe({
                        next: () => {
                            this.toasterService.showToast('success', 'Message Template has been Deleted!', "top-right", true);
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

    public OpenWindow(data: any): void {
        if (data.message_type.toLowerCase() == 'email') {
            const printWindow = window.open(
                '',
                '',
                'location=1,status=1,scrollbars=1,width=650,height=600'
            );
            printWindow.document.write(data.message_template);
            printWindow.document.close();
            printWindow.focus();
        } else {
            const dialogRef = this.matDialog.open(ViewForTemplateComponent, {
                panelClass: 'app-view-for-template',
                data: data,
                disableClose: true,
            });
            dialogRef.afterClosed().subscribe((res) => {
                res ? this.refreshItems() : null;
            });
        }
    }

    EnableDisable(record): void {
        if (!Security.hasPermission(messageTemplatesPermissions.enableDisablePermissions)) {
            return this.toasterService.showToast('error', messages.permissionDenied);
        }

        const label: string = record.is_enable
            ? 'Disable Message Template'
            : 'Enable Message Template';
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
                    this.messageTemplatesService
                        .setEnableDisable(record.id)
                        .subscribe({
                            next: () => {
                                record.is_enable = !record.is_enable;
                                if (record.is_enable) {
                                    this.alertService.showToast(
                                        'success',
                                        'Message Template has been Enabled!',
                                        'top-right',
                                        true
                                    );
                                } else {
                                    this.alertService.showToast(
                                        'success',
                                        'Message Template has been Disabled!',
                                        'top-right',
                                        true
                                    );
                                }
                            },
                            error: (err) => {
                                this.toasterService.showToast('error', err)
                                this.isLoading = false;
                            },
                        });
                }
            });
    }

    ngOnDestroy(): void {
        // this.masterService.setData(this.key, this);
    }
}
