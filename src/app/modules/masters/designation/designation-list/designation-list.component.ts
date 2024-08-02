import { module_name } from 'app/security';
import { Component } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { DesignationEntryComponent } from '../designation-entry/designation-entry.component';
import { ToasterService } from 'app/services/toaster.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { DesignationService } from 'app/services/designation.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';

@Component({
    selector: 'app-designation-list',
    templateUrl: './designation-list.component.html',
    styles: [
        `
            .tbl-grid {
                grid-template-columns: 40px 160px 170px 170px 170px 200px;
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
        MatTooltipModule,
        PrimeNgImportsModule
    ],
})
export class DesignationListComponent extends BaseListingComponent {
    module_name = module_name.designation;
    dataList = [];
    isFilterShow: boolean = false;

    columns = [
        {
            key: 'department_name',
            name: 'Department',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
        },
        {
            key: 'designation',
            name: 'Designation',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
        },
        {
            key: 'reporting_person_name',
            name: 'Reporting Persion',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
        },
        {
            key: 'remark',
            name: 'Remarks',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
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
            tooltip: true,
        },
    ];
    // cols = [];

    constructor(
        private designationService: DesignationService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog,
        public toasterService: ToasterService
    ) {
        super(module_name.designation);
        // this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'department_name';
        this.sortDirection = 'asc';
        this.Mainmodule = this;
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        this.designationService
            .getDesignationList(this.getNewFilterReq(event))
            .subscribe({
                next: (data) => {
                    this.isLoading = false;
                    this.dataList = data.data;
                    this.totalRecords = data.total;
                },
                error: (err) => {
                    this.alertService.showToast('error', err, 'top-right', true)
                    this.isLoading = false;
                },
            });
    }

    createInternal(model): void {
        this.matDialog
            .open(DesignationEntryComponent, {
                data: null,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.toasterService.showToast(
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
            .open(DesignationEntryComponent, {
                data: { data: record, readonly: false },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.toasterService.showToast(
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
        this.matDialog.open(DesignationEntryComponent, {
            data: { data: record, readonly: true },
            disableClose: true,
        });
    }

    deleteInternal(record): void {
        const label: string = 'Delete Designation';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.designation +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.designationService.delete(record.id).subscribe({
                        next: () => {
                            this.toasterService.showToast(
                                'success',
                                'Designation has been deleted!',
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

    ngOnDestroy(): void {
        // this.masterService.setData(this.key, this);
    }
}
