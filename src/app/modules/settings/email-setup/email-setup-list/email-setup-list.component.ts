import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Security, emailSetupPermissions, messages, module_name } from 'app/security';
import { ReactiveFormsModule } from '@angular/forms';
import { SendTestMailComponent } from '../send-test-mail/send-test-mail.component';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { EmailSetupEntryComponent } from '../email-setup-entry/email-setup-entry.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { EmailSetupService } from 'app/services/email-setup.service';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToasterService } from 'app/services/toaster.service';

@Component({
    selector: 'app-email-setup-list',
    templateUrl: './email-setup-list.component.html',
    styleUrls: ['./email-setup-list.component.scss'],
    styles: [
        `
          .tbl-grid {
              grid-template-columns: 40px 150px 250px 180px 120px 160px;
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
export class EmailSetupListComponent
    extends BaseListingComponent
    implements OnDestroy {
    module_name = module_name.emailsetup;
    dataList = [];
    total = 0;

    columns = [
        {
            key: 'email_for',
            name: 'Email For',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: true,
            is_boolean: false,
            tooltip: true,
            isicon: true,

        },
        {
            key: 'email_address',
            name: 'Email Address',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            is_boolean: false,
            tooltip: true
        },
        {
            key: 'display_name',
            name: 'Display Name',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            is_boolean: false,
            tooltip: true
        },
        {
            key: 'enable_ssl',
            name: 'SSL',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: 'header-center-view',
            is_sticky: false,
            align: '',
            indicator: false,
            is_boolean: true,
            tooltip: true
        },
        {
            key: 'test_mail_success',
            name: 'Test Mail Success',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            is_boolean: true,
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
            is_boolean: false,
            tooltip: true
        },
    ];
    cols = [];

    constructor(
        private emailSetupService: EmailSetupService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog,
        private toasterService: ToasterService
    ) {
        super(module_name.emailsetup);
        this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'display_name';
        this.sortDirection = 'asc';
        this.Mainmodule = this;
    }

    refreshItems(): void {
        this.isLoading = true;
        this.emailSetupService
            .getEmailSetupList(this.getFilterReq())
            .subscribe({
                next: (data) => {
                    this.isLoading = false;
                    this.dataList = data.data;
                    this._paginator.length = data.total;
                },
                error: (err) => {
                    this.alertService.showToast('error', err)
                    this.isLoading = false;
                },
            });
    }

    /***/
    createInternal(model): void {
        this.matDialog
            .open(EmailSetupEntryComponent, {
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
            .open(EmailSetupEntryComponent, {
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
        this.matDialog.open(EmailSetupEntryComponent, {
            data: { data: record, readonly: true },
            disableClose: true,
        });
    }

    deleteInternal(record): void {
        const label: string = 'Delete Email Setup';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.email_for +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.emailSetupService.delete(record.id).subscribe({
                        next: () => {
                            this.toasterService.showToast(
                                'success',
                                'Email Setup has been Deleted!',
                                'top-right',
                                true
                            );
                            this.refreshItems();
                        },
                        error: (err) => {
                            this.alertService.showToast('error', err, 'top-right', true);

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

    showBtn = false;

    passwordShow(data: any) {
        this.showBtn = !this.showBtn;
    }

    ngOnDestroy(): void {
        this.masterService.setData(this.key, this);
    }

    SetDefault(record): void {
        if (!Security.hasPermission(emailSetupPermissions.setasDefaultPermissions)) {
            return this.toasterService.showToast('error', messages.permissionDenied);
        }

        const label: string = 'Set Default Email Setup';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.email_for +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.emailSetupService.setDefault(record.id).subscribe({
                        next: () => {
                            this.refreshItems();
                            this.toasterService.showToast(
                                'success',
                                'Email Setup as Default!'
                            );
                        },
                        error: (err) => {
                            this.alertService.showToast('error', err)
                            this.isLoading = false;
                        },
                    });
                }
            });
    }

    public send(data: any): void {
        if (!Security.hasPermission(emailSetupPermissions.sendTestMailPermissions)) {
            return this.toasterService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(SendTestMailComponent, {
            data: { id: data.id, readonly: true },
            disableClose: true,
            panelClass: 'full-dialog',
        });
    }
}
