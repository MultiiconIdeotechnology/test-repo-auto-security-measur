import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { Security, filter_module_name, messages, module_name, whiteLablePermissions } from 'app/security';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { WhitelabelEntryComponent } from '../whitelabel-entry/whitelabel-entry.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { WlService } from 'app/services/wl.service';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
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
import { InstallmentComponent } from '../installment/installment.component';
import { takeUntil } from 'rxjs';
import { UserService } from 'app/core/user/user.service';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { isBoolean } from 'lodash';
import { AgentService } from 'app/services/agent.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
    selector: 'app-whitelabel-list',
    templateUrl: './whitelabel-list.component.html',
    styles: [`
    .tbl-grid {
      grid-template-columns:  40px 170px 250px 160px 200px 180px 100px 100px 120px 100px 80px;
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
        PrimeNgImportsModule
    ],
})
export class WhitelabelListComponent extends BaseListingComponent {
    module_name = module_name.whitelabel;
    filter_table_name = filter_module_name.whitelabel_customer;
    private settingsUpdatedSubscription: Subscription;
    dataList = [];
    user: any = {};
    total = 0;
    agentList:any[] = [];
    selectedAgent:any = {};

    checkList = [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
    ];
    
    cols: any = [
        { field: 'is_payment_due', header: 'Payment Due', isBoolean: true },
        { field: 'is_wl_expired', header: 'Wl Expired', isBoolean: true },
        { field: 'address_1', header: 'Address 1', isBoolean: false },
        { field: 'address_2', header: 'Address 2', isBoolean: false }
    ];
    _selectedColumns: Column[];
    isFilterShow: boolean = false;

    constructor(
        private wlService: WlService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog,
        private userService: UserService,
        private router: Router,
        private agentService: AgentService,
        public _filterService: CommonFilterService
    ) {
        super(module_name.whitelabel);
        this.key = this.module_name;
        this.sortColumn = 'wl_activation_date';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name)

        this.userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: any) => {
                this.user = user;
            });
    }

    ngOnInit() {
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            console.log("resp", resp)
            this.selectedAgent = resp['table_config']['agency_name']?.value;
            if(this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                  this.agentList.push(this.selectedAgent);
                }
            } 
            this.sortColumn = resp['sortColumn'];
            this.primengTable['_sortField'] = resp['sortColumn'];
            if(resp['table_config']['wl_expiry_date'].value){
                resp['table_config']['wl_expiry_date'].value = new Date(resp['table_config']['wl_expiry_date'].value);
            }
            if(resp['table_config']['wl_activation_date'].value){
                resp['table_config']['wl_activation_date'].value = new Date(resp['table_config']['wl_activation_date'].value);
            }
            this.primengTable['filters'] = resp['table_config'];
            this._selectedColumns = resp['selectedColumns'] || [];
            this.isFilterShow = true;
            this.primengTable._filter();
        });

         // To call Agent lis api on default data
         this.getAgent("");
    }

    ngAfterViewInit(){
        // Defult Active filter show
        if(this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            this.selectedAgent = filterData['table_config']['agency_name']?.value;
            if(filterData['table_config']['wl_expiry_date'].value){
                filterData['table_config']['wl_expiry_date'].value = new Date(filterData['table_config']['wl_expiry_date'].value);
            }
            if(filterData['table_config']['wl_activation_date'].value){
                filterData['table_config']['wl_activation_date'].value = new Date(filterData['table_config']['wl_activation_date'].value);
            }
            this.primengTable['filters'] = filterData['table_config'];
            this._selectedColumns = filterData['selectedColumns'] || [];
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

    refreshItems(event?:any): void {
        this.isLoading = true;

        var model = this.getNewFilterReq(event);
        if (Security.hasPermission(whiteLablePermissions.viewOnlyAssignedPermissions)) {
            model.relationmanagerId = this.user.id
        }

        this.wlService.getWlList(model).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                this.totalRecords = data.total;
            },
            error: (err) => {
                this.alertService.showToast(
                    'error',
                    err,
                    'top-right',
                    true
                );
                this.isLoading = false;
            },
        });
    }

       // function to get the Agent list from api
    getAgent(value: string) {
        this.agentService.getAgentComboMaster(value,true).subscribe((data) => {
            this.agentList = data;
            if(this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                  this.agentList.push(this.selectedAgent);
                }
            } 
            for (let i in this.agentList) {
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}${this.agentList[i].email_address}`;
                this.agentList[i].id_by_value = this.agentList[i].agency_name;
            }
        })
    }

    createInternal(model): void {
        this.matDialog
            .open(WhitelabelEntryComponent, {
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
            .open(WhitelabelEntryComponent, {
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
        this.matDialog.open(WhitelabelEntryComponent, {
            data: { data: record, readonly: true },
            disableClose: true,
        });
    }

    deleteInternal(record): void {
        const label: string = 'Delete WL';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.agency_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.wlService.delete(record.id).subscribe({
                        next: () => {
                            this.alertService.showToast(
                                'success',
                                'Whitelabel has been deleted!',
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

    EnableDisable(record): void {
        // if (!Security.hasPermission(whiteLablePermissions.enableDisablePermissions)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }

        // const label: string = record.is_disabled
        //     ? 'Enable Activity'
        //     : 'Disable Activity';
        // this.conformationService
        //     .open({
        //         title: label,
        //         message:
        //             'Are you sure to ' +
        //             label.toLowerCase() +
        //             ' ' +
        //             record.agency_name +
        //             ' ?',
        //     })
        //     .afterClosed()
        //     .subscribe((res) => {
        //         if (res === 'confirmed') {
        //             this.wlService.setEnableDisable(record.id).subscribe({
        //                 next: () => {
        //                     record.is_disabled = !record.is_disabled;
        //                     if (record.is_disabled) {
        //                         this.alertService.showToast(
        //                             'success',
        //                             'WL has been Disabled!',
        //                             'top-right',
        //                             true
        //                         );
        //                     } else {
        //                         this.alertService.showToast(
        //                             'success',
        //                             'WL has been Enabled!',
        //                             'top-right',
        //                             true
        //                         );
        //                     }
        //                 },
        //                 error: (err) => {
        //                     this.alertService.showToast('error', err, 'top-right', true);

        //                 },
        //             });
        //         }
        //     });
    }

    Installment(model: any): void {
        if (!Security.hasPermission(whiteLablePermissions.installmentsPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog
            .open(InstallmentComponent, {
                data: model,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => { });
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
        }
    }
}
