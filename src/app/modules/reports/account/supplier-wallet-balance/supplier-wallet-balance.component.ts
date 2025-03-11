import { DatePipe, CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterOutlet } from '@angular/router';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, filter_module_name, messages, module_name, supplierWalletBalancePermissions } from 'app/security';
import { Excel } from 'app/utils/export/excel';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { SupplierWalletBalanceService } from 'app/services/supplier-wallet-balance.service';
import { MatMenuModule } from '@angular/material/menu';

@Component({
    selector: 'app-supplier-wallet-balance',
    standalone: true,
    imports: [
        DatePipe,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatMenuModule,
        RouterOutlet,
        PrimeNgImportsModule],
    templateUrl: './supplier-wallet-balance.component.html',
    styleUrls: ['./supplier-wallet-balance.component.scss']
})
export class SupplierWalletBalanceComponent extends BaseListingComponent implements OnDestroy {
    dataList = [];
    total = 0;
    module_name = module_name.supplierWalletBalance;
    filter_table_name = filter_module_name.supplier_wallet_balance;
    private settingsUpdatedSubscription: Subscription;
    isFilterShow: boolean = false;
    selectedSupplier: any;
    supplierList: any[] = [];

    constructor(
        private supplierWalletService: SupplierWalletBalanceService,
        public _filterService: CommonFilterService
    ) {
        super(module_name.supplierWalletBalance)
        this.sortColumn = 'balance';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit(): void {
        this.getSupplier("");

        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
            this.selectedSupplier = resp['table_config']['provider_name']?.value;
            if (this.selectedSupplier && this.selectedSupplier.id) {
                const match = this.supplierList.find((item: any) => item.id == this.selectedSupplier?.id);
                if (!match) {
                    this.supplierList.push(this.selectedSupplier);
                }
            }

            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShow = true;
            this.primengTable._filter();
        });
    }

    ngAfterViewInit() {
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShow = true;
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            this.selectedSupplier = filterData['table_config']['provider_name']?.value;
            if (this.selectedSupplier && this.selectedSupplier.id) {
                const match = this.supplierList.find((item: any) => item.id == this.selectedSupplier?.id);
                if (!match) {
                    this.supplierList.push(this.selectedSupplier);
                }
            }
            this.primengTable['filters'] = filterData['table_config'];
        }
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        this.supplierWalletService.getSupplierBalance(this.getNewFilterReq(event)).subscribe({
            next: (data) => {
                this.dataList = data.data;
                this.totalRecords = data.total;
                this.isLoading = false;
            }, error: (err) => {
                this.alertService.showToast('error', err)
                this.isLoading = false
            }
        });
    }

    syncBalance() {
        if (!Security.hasPermission(supplierWalletBalancePermissions.supplierBalanceSyncPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.supplierWalletService.balanceSync().subscribe({
            next: () => {
                this.alertService.showToast('success', "Supplier Balance has been synced!", "top-right", true);
                this.refreshItems();
            },
            error: (err) => {
                this.alertService.showToast('error', err)
            }
        })
    }

    getSupplier(value: string) {
        this.supplierWalletService.getSupplierCombo(value, '').subscribe((data) => {
            this.supplierList = data;

            for (let i in this.supplierList) {
                this.supplierList[i].id_by_value = this.supplierList[i].company_name;
            }
        });
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    exportExcel(): void {
        if (!Security.hasExportDataPermission(module_name.supplierWalletBalance)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const filterReq = this.getNewFilterReq({});
        const req = Object.assign(filterReq);

        req.skip = 0;
        req.take = this.totalRecords;

        this.supplierWalletService.getSupplierBalance(req).subscribe(data => {
            Excel.export(
                'Supplier Wallet Balance',
                [
                    { header: 'Supplier', property: 'provider_name' },
                    { header: 'Current Balance', property: 'balance' },
                ],
                data.data, "Supplier Wallet Balance", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }]);
        });
    }

    ngOnDestroy(): void {

        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }
}
