import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
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
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, messages, module_name } from 'app/security';
import { RefferralService } from 'app/services/referral.service';
import { ToasterService } from 'app/services/toaster.service';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { ReferralEntryComponent } from '../referral-entry/referral-entry.component';
import { ReferralEditComponent } from '../referral-edit/referral-edit.component';


@Component({
    selector: 'app-referral-list',
    templateUrl: './referral-list.component.html',
    styleUrls: ['./referral-list.component.scss'],
    styles: [`
  .tbl-grid {
    // grid-template-columns:  40px 150px 140px 230px 70px 120px 120px 120px 100px;
    grid-template-columns:  40px 150px 140px 230px 120px 120px 120px 100px;
  }
  `],
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
        MatTabsModule
    ],
})
export class ReferralListComponent extends BaseListingComponent {

    module_name = module_name.Referrallink
    dataList = [];
    total = 0;


    constructor(
        private matDialog: MatDialog,
        public alertService: ToasterService,
        private conformationService: FuseConfirmationService,
        private toasterService: ToasterService,
        private refferralService: RefferralService,
        private clipboard: Clipboard,

    ) {
        super(module_name.Referrallink)
        this.cols = this.columns.map(x => x.key);
        this.key = this.module_name;
        this.sortColumn = 'entry_date_time';
        this.sortDirection = 'desc';
        this.Mainmodule = this
    }

    columns = [
        { key: 'referral_link_for', name: 'Referral Link For', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: true, is_boolean: false, tooltip: true },
        { key: 'referral_code', name: 'Referral Code', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: true, is_boolean: false, tooltip: true },
        { key: 'relationship_manager_name', name: 'RM Name', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: true, is_boolean: false, tooltip: true },
        { key: 'referral_link', name: 'Link', is_date: false, date_formate: '', is_sortable: false, class: 'header-center-view ', is_sticky: false, indicator: false, is_boolean: false, tooltip: true, isicon: true },
        // { key: 'no_of_visit', name: 'No Of Visit', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
        { key: 'no_of_leads', name: 'No Of Leads', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
        { key: 'no_of_signup', name: 'No Of Signup', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
        { key: 'entry_date_time', name: 'Date', is_date: true, date_formate: 'dd-MM-yyyy', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    ]
    cols = [];

    refreshItems(): void {
        this.isLoading = true;
        this.refferralService.getReferralLinkList(this.getFilterReq()).subscribe({
            next: data => {
                this.isLoading = false;
                this.dataList = data.data;
                this.total = data.total;
            }, error: err => {
                this.isLoading = false;
            }
        })
    }

    edit(record): void {
        if (!Security.hasEditEntryPermission(module_name.Referrallink)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        this.matDialog
            .open(ReferralEditComponent, {
                data: { data: record, readonly: true },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.refreshItems();
                }
            });
    }

    createReferral(): void {
        if (!Security.hasNewEntryPermission(module_name.Referrallink)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        this.matDialog.open(ReferralEntryComponent,
            { data: null })
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

    deleteInternal(record): void {
        if (!Security.hasNewEntryPermission(module_name.Referrallink)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = 'Delete Referral Link'
        this.conformationService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.referral_link + ' ?'
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.refferralService.delete(record.id).subscribe({
                    next: () => {
                        this.alertService.showToast('success', "Referral Link has been deleted!", "top-right", true);
                        this.refreshItems()
                    }
                })
            }
        })
    }

    linkCopy(link) {
        this.clipboard.copy(link);
        this.toasterService.showToast('success', 'Copied');
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

}
