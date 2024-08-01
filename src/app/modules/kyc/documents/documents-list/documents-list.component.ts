import { Router } from '@angular/router';
import { Security, documentPermissions, messages, module_name } from 'app/security';
import { Component, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DocumentsEntryComponent } from '../documents-entry/documents-entry.component';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { KycDocumentService } from 'app/services/kyc-document.service';
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
import { DocumentsFilterComponent } from '../documents-filter/documents-filter.component';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { RejectReasonComponent } from 'app/modules/masters/agent/reject-reason/reject-reason.component';
import { ToasterService } from 'app/services/toaster.service';

@Component({
    selector: 'app-documents-list',
    templateUrl: './documents-list.component.html',
    styles: [`
    .tbl-grid {
      grid-template-columns:  40px 120px 140px 160px 180px 180px 180px 160px 180px;
    }
    `],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
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
        CommonModule
    ],
})
export class DocumentsListComponent
    extends BaseListingComponent
    implements OnDestroy {
    total = 0;
    dataList = [];

    documentFilter: any;
    module_name = module_name.kycdocument;

    columns = [
        {
            key: 'file_url',
            name: 'Document',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: 'header-center-view',
            is_sticky: false,
            align: '',
            indicator: false,
            isicon: true,
        },
        {
            key: 'document_of',
            name: 'Document Of',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            isicon: false,
            tooltip: true
        },
        {
            key: 'is_audited',
            name: 'Status',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: true,
            isicon: false,
        },
        {
            key: 'document_user_name',
            name: 'Particular',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            isicon: false,
            tooltip: true
        },
        {
            key: 'kyc_profile_name',
            name: 'Profile',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            isicon: false,
            tooltip: true
        },
        {
            key: 'kyc_profile_doc_name',
            name: 'Profile Doc',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            isicon: false,
            tooltip: true
        },
        {
            key: 'audit_by_name',
            name: 'Audited By',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            isicon: false,
            tooltip: true
        },
        {
            key: 'entry_date_time',
            name: 'Upload',
            is_date: true,
            date_formate: 'dd-MM-yyyy HH:mm:ss',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            isicon: false,
        },
    ];
    cols = [];

    constructor(
        private KycdocumentService: KycDocumentService,
        private conformationService: FuseConfirmationService,
        private toastrService: ToasterService,
        private matDialog: MatDialog,
    ) {
        super(module_name.kycdocument);
        this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'entry_date_time';
        this.sortDirection = 'desc';
        this.Mainmodule = this;

        this.documentFilter = {
            MasterFor: '',
            Status: '',
            Particular: '',
            DocName: ''
        }
    }


    getFilter(): any {
        const filterReq = GridUtils.GetFilterReq(
            this._paginator,
            this._sort,
            this.searchInputControl.value
        );
        filterReq["MasterFor"] = this.documentFilter?.MasterFor;
        filterReq["Status"] = this.documentFilter?.Status == "All" ? "" : this.documentFilter?.Status;
        filterReq["Particular"] = this.documentFilter?.Particular?.id || "";
        filterReq["DocName"] = this.documentFilter?.DocName?.document_name || "";
        return filterReq;
    }

    refreshItems(): void {
        this.isLoading = true;
        this.KycdocumentService.getdocumentList(this.getFilter()).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                this._paginator.length = data.total;
                this.total = data.total;

            },
            error: (err) => {
                this.toastrService.showToast('error', err)
                this.isLoading = false;
            },
        });
    }

    filter() {
        this.matDialog.open(DocumentsFilterComponent, {
            data: this.documentFilter,
            disableClose: true,
        }).afterClosed().subscribe(res => {
            if (res) {
                this.documentFilter = res;
                this.refreshItems();
            }
        })
    }

    createInternal(model): void {
        this.matDialog
            .open(DocumentsEntryComponent, {
                data: null,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res)
                    this.alertService.showToast(
                        'success',
                        'New record added',
                        'top-right',
                        true
                    );
                this.refreshItems();
            });
    }

    editInternal(record): void {
        this.matDialog
            .open(DocumentsEntryComponent, {
                data: { data: record, readonly: false },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res)
                    this.alertService.showToast(
                        'success',
                        'Record modified',
                        'top-right',
                        true
                    );
                this.refreshItems();
            });
    }

    viewInternal(record): void {
        this.matDialog.open(DocumentsEntryComponent, {
            data: { data: record, readonly: true },
            disableClose: true,
        });
    }

    deleteInternal(record): void {
        const label: string = 'Delete Kyc Document';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.kyc_profile_doc_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.KycdocumentService.delete(record.id).subscribe({
                        next: () => {
                            this.alertService.showToast(
                                'success',
                                'Kyc Document has been deleted!',
                                'top-right',
                                true
                            );
                            this.refreshItems();
                        },
                        error: (err) => {
                            this.toastrService.showToast('error', err)
                            this.isLoading = false;
                        },
                    });
                }
            });
    }

    downloadfile(str: string) {
        window.open(str, '_blank');
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

    Audit(data: any): void {
        if (!Security.hasPermission(documentPermissions.auditUnauditPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = 'Audit Document'
        this.conformationService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' ?'
        }).afterClosed().subscribe({
            next: (res) => {
                if (res === 'confirmed') {
                    this.KycdocumentService.verify(data.id).subscribe({
                        next: () => {
                            this.alertService.showToast('success', "Document Audited", "top-right", true);
                            this.refreshItems();
                        }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
                    });
                }
            }
        })
    }

    Reject(record: any): void {
        if (!Security.hasPermission(documentPermissions.rejectPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(RejectReasonComponent, {
            disableClose: true,
            data: record,
            panelClass: 'full-dialog'
        }).afterClosed().subscribe({
            next: (res) => {
                if (res) {
                    this.KycdocumentService.reject(record.id, res).subscribe({
                        next: () => {
                            this.alertService.showToast('success', "Document Rejected", "top-right", true);
                            this.refreshItems()
                        },
                        error: (err) => this.alertService.showToast('error', err, "top-right", true)
                    })
                }
            }
        })
    }
}
