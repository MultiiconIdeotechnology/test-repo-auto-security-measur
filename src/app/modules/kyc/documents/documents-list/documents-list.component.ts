import { Router } from '@angular/router';
import { Security, documentPermissions, filter_module_name, messages, module_name } from 'app/security';
import { Component, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DocumentsEntryComponent } from '../documents-entry/documents-entry.component';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { DocumentsFilterComponent } from '../documents-filter/documents-filter.component';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { RejectReasonComponent } from 'app/modules/masters/agent/reject-reason/reject-reason.component';
import { ToasterService } from 'app/services/toaster.service';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

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
        MatMenuModule,
        MatDialogModule,
        MatTooltipModule,
        MatDividerModule,
        CommonModule,
        PrimeNgImportsModule
    ],
})
export class DocumentsListComponent
    extends BaseListingComponent
    implements OnDestroy {
    total = 0;
    dataList = [];
    documentList: any[] = [];
    documentFilter: any;
    module_name = module_name.kycdocument;
    filter_table_name = filter_module_name.kyc_documents;
    private settingsUpdatedSubscription: Subscription;
    _selectedColumns: Column[];

    cols: any = [
        { field: 'rejection_note', header: 'Rejection Note', type:'text' },
        { field: 'reject_date_time', header: 'Reject Date Time', type: 'date'},
    ];
    isFilterShow: boolean = false;
    selectedStatus: string;
    selectedDocument: any;
    selectedMasterStatus: string;
    statusList = [
        { label: 'Audited', value: 'Audited' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'Pending', value: 'Pending' },
    ];

    selectMasterList = [
        { label: 'Agent', value: 'Agent' },
        { label: 'Sub Agent', value: 'Sub Agent' },
        { label: 'Customer', value: 'Customer' },
        { label: 'Supplier', value: 'Supplier' },
        { label: 'Employee', value: 'Employee' },
    ]

    constructor(
        private KycdocumentService: KycDocumentService,
        private conformationService: FuseConfirmationService,
        private toastrService: ToasterService,
        private kycDocService: KycDocumentService,
        private matDialog: MatDialog,
        public _filterService: CommonFilterService
    ) {
        super(module_name.kycdocument);
        this.key = this.module_name;
        this.sortColumn = 'entry_date_time';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);

        this.documentFilter = {
            MasterFor: '',
            Status: '',
            Particular: '',
            DocName: ''
        }
    }
    
    ngOnInit(): void {
        this.getDocList();

        // common filter
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp:any) => {
            this.selectedDocument = resp['table_config']['kyc_profile_doc_name']?.value;
            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];

            if (resp['table_config']?.['entry_date_time']?.value != null) {
                resp['table_config']['entry_date_time'].value = new Date(resp['table_config']['entry_date_time'].value);
            }
            if (resp['table_config']?.['reject_date_time']?.value != null) {
                resp['table_config']['reject_date_time'].value = new Date(resp['table_config']['reject_date_time'].value);
            }
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
            this.selectedDocument = filterData['table_config']['kyc_profile_doc_name']?.value;
            if (filterData['table_config']?.['entry_date_time']?.value != null) {
                filterData['table_config']['entry_date_time'].value = new Date(filterData['table_config']['entry_date_time'].value);
            }
            if (filterData['table_config']?.['reject_date_time']?.value != null) {
                filterData['table_config']['reject_date_time'].value = new Date(filterData['table_config']['reject_date_time'].value);
            }
            this.primengTable['filters'] = filterData['table_config'];
            this._selectedColumns = filterData['selectedColumns'] || [];
            // this.primengTable['_sortField'] = filterData['sortColumn'];
            // this.sortColumn = filterData['sortColumn'];
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


    getFilter(): any {
        const filterReq = {};
        // const filterReq = GridUtils.GetFilterReq(
        //     this._paginator,
        //     this._sort,
        //     this.searchInputControl.value
        // );
        filterReq["MasterFor"] = this.documentFilter?.MasterFor;
        filterReq["Status"] = this.documentFilter?.Status == "All" ? "" : this.documentFilter?.Status;
        filterReq["Particular"] = this.documentFilter?.Particular?.id || "";
        filterReq["DocName"] = this.documentFilter?.DocName?.document_name || "";
        return filterReq;
    }

    refreshItems(event?:any): void {
        this.isLoading = true;
        let extraModel = this.getFilter();
        let oldModel = this.getNewFilterReq(event)
        let model = {...extraModel, ...oldModel};
        this.KycdocumentService.getdocumentList(model).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                this.totalRecords = data.total;
                this.total = data.total;
            },
            error: (err) => {
                this.toastrService.showToast('error', err)
                this.isLoading = false;
            },
        });
    }

    filterDialog() {
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

       // Currency List api
    getDocList(){
        this.kycDocService.getDocumentTypeCombo("").subscribe((data) => {
            this.documentList = data;

            for(let i in this.documentList){
                this.documentList[i].id_by_value = this.documentList[i].document_name;
             }
        } );
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
        // this.masterService.setData(this.key, this);
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
