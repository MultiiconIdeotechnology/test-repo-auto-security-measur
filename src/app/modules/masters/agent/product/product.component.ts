import { Component, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AgentService } from 'app/services/agent.service';
import { CityService } from 'app/services/city.service';
import { DesignationService } from 'app/services/designation.service';
import { EmployeeService } from 'app/services/employee.service';
import { LeadsRegisterService } from 'app/services/leads-register.service';
import { ToasterService } from 'app/services/toaster.service';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AppConfig } from 'app/config/app-config';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { CrmService } from 'app/services/crm.service';
import { AgentProductInfoComponent } from 'app/modules/crm/agent/product-info/product-info.component';
import { EntityService } from 'app/services/entity.service';
import { agentPermissions, messages, Security } from 'app/security';
import { PurchaseProductEntrySettingsComponent } from "../../../crm/agent/purchase-product-entry-settings/purchase-product-entry-settings.component";
import { CRMSalesReturnRightComponent } from "../../../crm/agent/sales-return-right/sales-return-right.component";
import { GlobalSearchService } from 'app/services/global-search.service';

@Component({
    selector: 'app-product',
    standalone: true,
    imports: [
    CommonModule,
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    RouterOutlet,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSortModule,
    MatPaginatorModule,
    MatMenuModule,
    MatDividerModule,
    PurchaseProductEntrySettingsComponent,
    CRMSalesReturnRightComponent
],
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss']
})
export class ProductComponent {

    dataSource = new MatTableDataSource();

    loading: boolean = true;
    data: any[] = []
    total: any;
    searchInputControl = new FormControl('');
    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sort: MatSort;

    public _unsubscribeAll: Subject<any> = new Subject<any>();
    idUrl: any;

    columns = [
        'options',
        'product_name',
        'itemCount',
        'count',
        'product_status',
        'purchase_amount',
        'due_Amount',
        'start_integration',
        'entry_date_time',
    ];

    constructor(
        public formBuilder: FormBuilder,
        public cityService: CityService,
        public agentService: AgentService,
        public router: Router,
        public route: ActivatedRoute,
        public alertService: ToasterService,
        public designationService: DesignationService,
        public leadRegisterService: LeadsRegisterService,
        public employeeService: EmployeeService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog,
        private crmService: CrmService,
        private entityService: EntityService,
        private globalService: GlobalSearchService
    ) {

    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.idUrl = params.get('id');
        })
    }

    refreshItems(): void {
        this.loading = true;
        const request = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value, 'date', 1);
        request['agent_id'] = this.idUrl;

        this.crmService.getProductPurchaseMasterList(request).subscribe({
            next: (res) => {
                this.dataSource.data = res.data;
                this._paginator.length = res.total;
                console.log("data>>>", res.data[0]?.currencySymbol)
                if(res?.data && res.data?.length){
                    this.globalService.setCurrencySymbol(res.data[0]?.currencySymbol);
                }
                this.loading = false;
            }, error: err => {
                this.alertService.showToast('error', err);
                this.loading = false;
            },
        });
    }

    info(record): void {
        //     this.matDialog.open(TimelineAgentProductInfoComponent, {
        //       data: { data: record, agencyName: record.product_name, readonly: true, account_receipt: false},
        //       disableClose: true
        //   });
        this.matDialog.open(AgentProductInfoComponent, {
            data: { data: record, agencyName: record.product_name, readonly: true, agentInfo: true },
            disableClose: true
        });
    }

    ngAfterViewInit(): void {
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(AppConfig.searchDelay)
            )
            .subscribe(() => {
                GridUtils.resetPaginator(this._paginator);
                this.refreshItems();
            });
    }

    getStatusColor(status: string): string {
        if (status == 'Pending') {
            return 'text-yellow-600';
        } else if (status == 'Inprocess') {
            return 'text-green-600';
        } else if (status == 'Delivered') {
            return 'text-blue-600';
        } else if (status == 'Cancel' || status == 'Sales Return' || status == 'Expired' || status == 'Block' || status == 'Blocked' || status == 'Cancelled') {
            return 'text-red-600';
        }
        else {
            return '';
        }
    }

    editProduct(record) {
        this.entityService.raiseproductPurchaseCall({ editData: record, editFlag: true })
    }

    deleteProduct(record) {
        if (!Security.hasPermission(agentPermissions.deleteProductPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = 'Delete Purchase product'
        this.conformationService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.product_name + ' ?'
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                // const json = {
                //     id: record.id
                // }
                this.crmService.deletePurchaseProduct(record.id).subscribe({
                    next: (res) => {
                        if (res)
                            this.alertService.showToast('success', "Purchase product has been deleted!", "top-right", true);
                        this.refreshItems()
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, "top-right", true);
                    }
                })
            }
        })
    }

    cancelProduct(record) {
        if (!Security.hasPermission(agentPermissions.cancelProductPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = 'Cancel Purchase product';
        this.conformationService
            .open({
                title: label,
                message: 'Do you want to Cancel?',
                inputBox: 'Remark',
                customShow: true,
                dateCustomShow: false
            })
            .afterClosed()
            .subscribe((res) => {
                if (res?.action === 'confirmed') {
                    let newJson = {
                        id: record.id,
                        cancel_remark: res?.statusRemark ? res?.statusRemark : ""
                    }
                    this.crmService.cancelPurchaseProduct(newJson).subscribe({
                        next: (res) => {
                            this.alertService.showToast(
                                'success',
                                'Purchase product has been cancelled!',
                                'top-right',
                                true
                            );
                            this.refreshItems()
                        },
                        error: (err) => {
                            this.alertService.showToast(
                                'error',
                                err,
                                'top-right',
                                true
                            );
                        },
                    });
                }
            });
    }

    purchaseProductInfo(record): void {
        // if (!Security.hasNewEntryPermission(module_name.crmagent)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }
        // this.matDialog.open(AgentProductInfoComponent, {
        //     data: { data: record, agencyName: agencyName, readonly: true, purchase_product: true },
        //     disableClose: true
        // });
    }

    salesReturnProduct(record) {
        if (!Security.hasPermission(agentPermissions.salesReturnProductPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        this.entityService.raiseCRMSalesReturnCall({ add: true, data: record })
    }

    getStartIntegrationColor(data: any): any {
        if (data?.start_integration == true) {
            return 'text-green-600';
        } else if (data?.start_integration == false) {
            return 'text-red-600';
        } else {
            return '';
        }
    }

    expiryProduct(record) {
        if (!Security.hasPermission(agentPermissions.expiryProductPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = 'Expiry Product';
        this.conformationService
            .open({
                title: label,
                message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.product_name + ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    let payload = {
                        id: record.id
                    }
                    this.crmService.expiryProduct(payload).subscribe({
                        next: () => {
                            this.alertService.showToast(
                                'success',
                                'Product has been expired!',
                                'top-right',
                                true
                            );
                            this.refreshItems();
                        },
                        error: (err) => {
                            this.alertService.showToast(
                                'error',
                                err,
                                'top-right',
                                true
                            );
                        },

                    });
                }
            });
    }
}
