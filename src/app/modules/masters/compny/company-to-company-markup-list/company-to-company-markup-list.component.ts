import { module_name } from 'app/security';
import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToasterService } from 'app/services/toaster.service';
import { CompanyToCompanyMarkupService } from 'app/services/company-to-company-markup.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { CompanyToCompanyEntryComponent } from '../company-to-company-markup-entry/company-to-company-markup-entry.component';
import { Subject } from 'rxjs';
import { AppConfig } from 'app/config/app-config';

@Component({
    selector: 'app-company-to-company-markup-list',
    templateUrl: './company-to-company-markup-list.component.html',
    styleUrls: ['./company-to-company-markup-list.component.scss'],
    styles: [
        `
            .tbl-grid {
                grid-template-columns: 40px 280px 280px 40px ;
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
        MatMenuModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatInputModule,
        MatButtonModule,
        MatTooltipModule
    ],
})
export class CompanyToCompanyMarkupListComponent {
    module_name = module_name.compny;
    dataList = [];
    total = 0;
    appConfig = AppConfig;


    columns = [
        {
            key: 'fromCompanyName',
            name: 'From Company Name',
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
            key: 'toCompanyName',
            name: 'To Company Name',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: true,
            tooltip: true
        },
        {
            key: 'markup_percentage',
            name: 'Markup',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true
        }
    ];
    cols = [];
    record: any = {};

    constructor(
        private companyToCompanyMarkupService: CompanyToCompanyMarkupService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog,
        public formBuilder: FormBuilder,
        private alertService: ToasterService,
        public matDialogRef: MatDialogRef<CompanyToCompanyMarkupListComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'entry_date_time';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this.record = data ?? {}
        this.refreshItems();
    }

    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sort: MatSort;
    Mainmodule: any;
    isLoading = false;
    public _unsubscribeAll: Subject<any> = new Subject<any>();
    public key: any;
    public sortColumn: any;
    public sortDirection: any;
    searchInputControl = new FormControl('');

    refreshItems(): void {
        const filterReq = GridUtils.GetFilterReq(
            this._paginator,
            this._sort,
            this.searchInputControl.value,
            "entry_date_time"
        );

        filterReq['id'] = this.record?.id ? this.record?.id : ""
        this.companyToCompanyMarkupService
            .getCompanyToCompanyMarkupList(filterReq)
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

    getNodataText(): string {
        if (this.isLoading) return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    createCompany(): void {
        this.matDialog
            .open(CompanyToCompanyEntryComponent, {
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

    editCompany(record): void {
        this.matDialog
            .open(CompanyToCompanyEntryComponent, {
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
        this.matDialog.open(CompanyToCompanyEntryComponent, {
            data: { data: record, readonly: true },
            disableClose: true,
        });
    }

    deleteCompany(record): void {
        const label: string = 'Delete Company to Company Markup';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.fromCompanyName +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.companyToCompanyMarkupService.delete(record.id).subscribe({
                        next: () => {
                            this.alertService.showToast(
                                'success',
                                'Company to Company Markup has been Deleted!',
                                'top-right',
                                true
                            );
                            this.refreshItems();
                        },
                        error: (err) => {
                            this.alertService.showToast('error', err)

                        },
                    });
                }
            });
    }
}
