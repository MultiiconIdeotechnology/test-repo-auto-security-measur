import { Routes } from 'app/common/const';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { Component, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Security, filter_module_name, messageTemplatesPermissions, messages, module_name } from 'app/security';
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
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { Subscription } from 'rxjs';

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
    filter_table_name = filter_module_name.message_templates;
    private settingsUpdatedSubscription: Subscription;

    dataList = [];
    total = 0;

    cols: any = [
        { field: 'template_for_name', header: 'Template For Name', type: 'text' },
        { field: 'modify_date_time', header: 'Modify Date Time', type: 'date' },
    ];
    _selectedColumns: Column[];
    isFilterShow: boolean = false;

    constructor(
        private messageTemplatesService: MessageTemplatesService,
        private conformationService: FuseConfirmationService,
        private router: Router,
        private toasterService: ToasterService,
        private matDialog: MatDialog,
        public _filterService: CommonFilterService
    ) {
        super(module_name.messagetemplates);
        this.key = this.module_name;
        this.sortColumn = 'event_name';
        this.sortDirection = 'asc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit() {
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];

            // if (resp['table_config']['modify_date_time'] && resp['table_config']['modify_date_time']?.value) {
            //     resp['table_config']['modify_date_time'].value = new Date(resp['table_config']['modify_date_time']?.value);
            // }
            this.primengTable['filters'] = resp['table_config'];
            this._selectedColumns = resp['selectedColumns'] || [];
            this.isFilterShow = true;
            this.primengTable._filter();
        });
    }

    ngAfterViewInit() {
        // Defult Active filter show
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            // if (filterData['table_config']['modify_date_time'] && filterData['table_config']['modify_date_time']?.value) {
            //     filterData['table_config']['modify_date_time'].value = new Date(filterData['table_config']['modify_date_time']?.value);
            // }
            // this.primengTable['_sortField'] = filterData['sortColumn'];
            // this.sortColumn = filterData['sortColumn'];
            this._selectedColumns = filterData['selectedColumns'] || [];
            this.primengTable['filters'] = filterData['table_config'];
            this.isFilterShow = true;
        }
    }

    get selectedColumns(): Column[] {
        return this._selectedColumns;
    }

    set selectedColumns(val: Column[]) {
        if (Array.isArray(val)) {
            this._selectedColumns = this.cols.filter(col =>
                val.some(selectedCol => selectedCol.field === col.field)
            );
        } else {
            this._selectedColumns = [];
        }
    }

    refreshItems(event?: any): void {
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
        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }
}
