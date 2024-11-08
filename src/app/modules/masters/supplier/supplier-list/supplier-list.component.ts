import { Security, filter_module_name, messages, module_name, supplierPermissions } from 'app/security';
import { DatePipe, NgIf, NgFor, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BlockReasonComponent } from './../block-reason/block-reason.component';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { SupplierEntryComponent } from '../supplier-entry/supplier-entry.component';
import { SupplierService } from 'app/services/supplier.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AssignKycDialogComponent } from '../assign-kyc-dialog/assign-kyc-dialog.component';
import { KycInfoComponent } from '../../agent/kyc-info/kyc-info.component';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { PspSettingService } from 'app/services/psp-setting.service';
import { Subscription, takeUntil } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { SupplierEntryRightComponent } from '../supplier-entry-right/supplier-entry-right.component';
import { EntityService } from 'app/services/entity.service';
import { UserSupplierComponent } from '../user-supplier/user-supplier.component';
import { UserModifyComponent } from '../user-modify/user-modify.component';

@Component({
    selector: 'app-supplier-list',
    templateUrl: './supplier-list.component.html',
    styles: [`
    .tbl-grid {
      grid-template-columns:  40px 250px 280px 140px 280px 280px 180px 100px;
    }
    `],
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
        MatInputModule,
        MatButtonModule,
        MatTooltipModule,
        MatDividerModule,
        PrimeNgImportsModule,
        SupplierEntryRightComponent,
        UserModifyComponent
    ],
})

export class SupplierListComponent extends BaseListingComponent {
    module_name = module_name.supplier;
    filter_table_name = filter_module_name.supplier_master;
    private settingsUpdatedSubscription: Subscription;
    dataList = [];
    total = 0;
    _selectedColumns: Column[];
    isFilterShow: boolean = false;
    cols: any = [
        { field: 'currency', header: 'Base Currency', type: 'text' },
        { field: 'gst_number', header: 'GST Number', type: 'text' },
        { field: 'pan_number', header: 'PAN Number', type: 'text' },
    ];
    companyList: any[] = [];
    companyListName: any[] = [];

    kycList = ['Yes', 'No'];

    constructor(
        private supplierService: SupplierService,
        private conformationService: FuseConfirmationService,
        private pspsettingService: PspSettingService,
        private matDialog: MatDialog,
        public _filterService: CommonFilterService,
        private entityService: EntityService,
    ) {
        super(module_name.supplier);
        this.key = this.module_name;
        this.sortColumn = 'entry_date_time';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);

        this.entityService.onrefreshSupplierEntityCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                if (item) {
                    this.refreshItems();
                }
            }
        })
    }

    ngOnInit(): void {

        this.getCompanyList();

        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];
            if (resp['table_config']['entry_date_time'] && resp['table_config']['entry_date_time'].value) {
                resp['table_config']['entry_date_time'].value = new Date(resp['table_config']['entry_date_time'].value);
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
            if (filterData['table_config']['entry_date_time'].value) {
                filterData['table_config']['entry_date_time'].value = new Date(filterData['table_config']['entry_date_time'].value);
            }
            this.primengTable['filters'] = filterData['table_config'];
            this._selectedColumns = filterData['selectedColumns'] || [];
            this.isFilterShow = true;
        }
    }

    getCompanyList() {
        this.pspsettingService.getCompanyCombo("").subscribe((data) => {
            this.companyList = data;
            for (let el of data) {
                this.companyListName.push(el.company_name);
            }
        })
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
        this.supplierService.getSupplierList(this.getNewFilterReq(event)).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                this.totalRecords = data.total;
            },
            error: (err) => {
                this.alertService.showToast('error', err, "top-right", true)
                this.isLoading = false;
            },
        });
    }

    createInternal(model): void {
        this.entityService.raisesupplierEntityCall({ create: true })


        // this.matDialog
        //     .open(SupplierEntryComponent, {
        //         data: { data: null, iscreate: true },
        //         disableClose: true,
        //     })
        //     .afterClosed()
        //     .subscribe((res) => {
        //         if (res) 
        //        { this.alertService.showToast('success', "New record added", "top-right", true);
        //         this.refreshItems();}
        //     });
    }

    editInternal(record): void {
        this.entityService.raisesupplierEntityCall({ data: record, edit: true })

        // this.matDialog
        //     .open(SupplierEntryComponent, {
        //         data: { data: record, readonly: false, iscreate: false },
        //         disableClose: true,
        //     })
        //     .afterClosed()
        //     .subscribe((res) => {
        //         if (res) 
        //       {  this.alertService.showToast('success', "Record modified", "top-right", true);
        //         this.refreshItems();}
        //     });
    }

    viewInternal(record): void {
        this.entityService.raisesupplierEntityCall({ data: record, info: true })

        // this.matDialog.open(SupplierEntryComponent, {
        //     data: { data: record, readonly: true, iscreate: false },
        //     disableClose: true,
        // });
    }

    deleteInternal(record): void {
        const label: string = 'Delete Supplier';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.company_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.supplierService.delete(record.id).subscribe({
                        next: () => {
                            this.alertService.showToast('success', "Supplier has been deleted!", "top-right", true);
                            this.refreshItems();
                        },
                        error(err) {
                            this.alertService.showToast('error', err, "top-right", true);

                        },
                    });
                }
            });
    }

    blockUnblock(record: any): void {
        if (!Security.hasPermission(supplierPermissions.blockUnblockPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        if (record.is_block == false) {
            this.matDialog
                .open(BlockReasonComponent, {
                    data: record,
                    disableClose: true,
                })
                .afterClosed()
                .subscribe((res) => {
                    if (res) {
                        this.supplierService
                            .setBlockUnblock(record.id, res)
                            .subscribe({
                                next: () => {
                                    record.is_block = !record.is_block;
                                    if (record.is_block) {
                                        this.alertService.showToast('success', "Supplier has been blocked!", "top-right", true);
                                    }
                                },
                                error(err) {
                                    this.alertService.showToast('error', err, "top-right", true);

                                },
                            });
                    }
                });
        } else {
            const label: string = 'Unblock Supplier';
            this.conformationService
                .open({
                    title: label,
                    message:
                        'Are you sure to ' +
                        label.toLowerCase() +
                        ' ' +
                        record.company_name +
                        ' ?',
                })
                .afterClosed()
                .subscribe((res) => {
                    if (res === 'confirmed') {
                        this.supplierService
                            .setBlockUnblock(record.id, '')
                            .subscribe({
                                next: () => {
                                    record.is_block = !record.is_block;
                                    if (!record.is_block) {
                                        this.alertService.showToast('success', "Supplier has been Unblocked!", "top-right", true);
                                    }
                                },
                                error(err) {
                                    this.alertService.showToast('error', err, "top-right", true);

                                },
                            });
                    }
                });
        }
    }

    setKYCVerify(record): void {
        if (!Security.hasPermission(supplierPermissions.viewKYCPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(KycInfoComponent, {
            data: { record: record, supplier: true, isLead: 'Supplier' },
            disableClose: true
        }).afterClosed().subscribe(res => {

        })
    }

    userSupplier(record) {
        this.matDialog.open(UserSupplierComponent, {
            data: record,
            disableClose: true
        }).afterClosed().subscribe(res => {

        })
    }

    verifyKYC(record): void {
        if (!Security.hasPermission(supplierPermissions.auditUnauditKYCPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = record.is_kyc_completed
            ? 'Unaudit KYC'
            : 'Audit KYC';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' of ' +
                    record.company_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.supplierService.setKYCVerify(record.id).subscribe({
                        next: () => {
                            record.is_kyc_completed = !record.is_kyc_completed;
                            if (record.is_kyc_completed) {
                                this.alertService.showToast(
                                    'success',
                                    'KYC has been Audited!',
                                    'top-right',
                                    true
                                );
                            } else {
                                this.alertService.showToast(
                                    'success',
                                    'KYC has been Unaudited!',
                                    'top-right',
                                    true
                                );
                            }
                        },
                        error(err) {
                            this.alertService.showToast('error', err, "top-right", true);

                        },
                    });
                }
            });
    }

    kycProfile(record): void {
        if (!Security.hasPermission(supplierPermissions.assignKYCProfile)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(AssignKycDialogComponent, {
            data: record,
            disableClose: true
        }).afterClosed().subscribe(res => {
            if (res) {
                this.supplierService.assignKYCProfile(record.id, res.kyc_profile_id).subscribe({
                    next: () => {
                        this.alertService.showToast('success', "KYC Profile has been Added!", "top-right", true);
                        record.kyc_profile_id = res.kyc_profile_id;
                    },
                    error(err) {
                        this.alertService.showToast('error', err, "top-right", true);

                    },
                })
            }
        })
    }

    autologin(record: any) {
        // if (!Security.hasPermission(agentsPermissions.autoLoginPermissions)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }

        this.supplierService.autoLogin(record.id).subscribe({
            next: data => {
                window.open(data.url + 'sign-in/' + data.code);
            }, error: err => {
                this.alertService.showToast('error', err)
            }
        })
    }

    getNodataText(): string {
        if (this.isLoading) return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    ngOnDestroy(): void {
        // this.masterService.setData(this.key, this);

        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }
}
