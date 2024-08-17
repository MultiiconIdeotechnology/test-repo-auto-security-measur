import { Routes } from 'app/common/const';
import { Router } from '@angular/router';
import { Security, agentsPermissions, filter_module_name, messages, module_name } from 'app/security';
import { Component } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EmployeeDialogComponent } from '../employee-dialog/employee-dialog.component';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { KycInfoComponent } from '../kyc-info/kyc-info.component';
import { BlockReasonComponent } from '../../supplier/block-reason/block-reason.component';
import { MarkupProfileDialogeComponent } from '../markup-profile-dialoge/markup-profile-dialoge.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AgentService } from 'app/services/agent.service';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { SetKycProfileComponent } from '../set-kyc-profile/set-kyc-profile.component';
import { SetCurrencyComponent } from '../set-currency/set-currency.component';
import { AgentFilterComponent } from '../agent-filter/agent-filter.component';
import { WhitelabelEntryComponent } from '../../whitelabel/whitelabel-entry/whitelabel-entry.component';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { UserService } from 'app/core/user/user.service';
import { takeUntil } from 'rxjs';
import { ReshuffleComponent } from '../reshuffle/reshuffle.component';
import { AgentEditComponent } from '../agent-edit/agent-edit.component';
import { AgentRMLogsComponent } from '../rmlogs/rmlogs.component';
import { AgentStatusChangedLogComponent } from '../status-changed-log/status-changed-log.component';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { CityService } from 'app/services/city.service';
import { CurrencyService } from 'app/services/currency.service';
import { EmployeeService } from 'app/services/employee.service';
import { Linq } from 'app/utils/linq';
import { MarkupprofileService } from 'app/services/markupprofile.service';
import { KycService } from 'app/services/kyc.service';
import { EntityService } from 'app/services/entity.service';
import { ChangeEmailNumberComponent } from '../sub-agent/change-email-number/change-email-number.component';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
    selector: 'app-agent-list',
    templateUrl: './agent-list.component.html',
    styles: [],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        CommonModule,
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
        PrimeNgImportsModule,
        ChangeEmailNumberComponent
    ]
})
export class AgentListComponent extends BaseListingComponent {
    module_name = module_name.agent;
    filter_table_name = filter_module_name.agent_customer;
    private settingsUpdatedSubscription: Subscription;
    agentFilter: any;
    user: any = {};
    dataList = [];
    _selectedColumns: Column[];
    isFilterShow: boolean = false;

    blockList = [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
    ];

    cols = [];

    // statusList = ['All', 'New', 'Active','Inactive','Dormant',];

    statusList = [
        { label: 'New', value: 'New' },
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Dormant', value: 'Dormant' }
    ];

    // blockList = [
    //     { label: 'All', value: 'All' },
    //     { label: 'Blocked', value: 'Blocked' },
    //     { label: 'Unblocked', value: 'Unblocked' },
    // ]
    cityList: any[] = [];
    selectedCurrency: string;
    selectedCity: string;
    currencyListAll: any[] = [];
    kycListAll: any[] = [];
    employeeList: any[] = [];
    markupList: any[] = [];
    selectedEmployee: any = {};
    selectedKycProfile!: string

    constructor(
        private agentService: AgentService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog,
        private userService: UserService,
        private cityService: CityService,
        private currencyService: CurrencyService,
        private kycService: KycService,
        private entityService: EntityService,
        private markupprofileService: MarkupprofileService,
        private employeeService: EmployeeService,
        private router: Router,
        public _filterService: CommonFilterService

    ) {
        super(module_name.agent)
        this.key = this.module_name;

        this.sortColumn = 'entry_date_time';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);

        this.agentFilter = {
            relationmanagerId: '',
            currencyId: '',
            cityId: '',
            markupProfileId: '',
            kycProfileId: '',
            is_blocked: '',
            Status: 'All',
        }
        this.userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: any) => {
                this.user = user;
            });

        this.entityService.onrefreshChangeEmailNumberCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                this.refreshItems()
            }
        })

    }

    ngOnInit() {
        this.cols = [
            { field: 'is_blocked', header: 'Blocked' },
            { field: 'pan_number', header: 'PAN Number' },
            { field: 'gst_number', header: 'GST Number' },
            { field: 'markup_profile_name', header: 'Markup Profile' },
            { field: 'kyc_profile_name', header: 'KYC Profile' },
            { field: 'balance', header: 'Balance' },
            { field: 'web_last_login_time', header: 'Last Login' },
            { field: 'is_wl', header: 'WL' },
            { field: 'is_test', header: 'Read Only' },
            { field: 'subagent_count', header: 'Sub Agent Count' },
        ];

        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            // console.log("resp['table_config']", resp['table_config']);
            
            this.selectedEmployee = JSON.parse(JSON.stringify(resp['table_config']['rm_id_filters'].value));
            // const match = this.employeeList.find((item: any) => item.id == this.selectedEmployee.id);
            // if(!match) {
            //     this.employeeList.push(this.selectedEmployee);
            // }
            console.log("this.selectedEmployee", this.selectedEmployee);
            
            this.sortColumn = resp['sortColumn'];
            this.primengTable['_sortField'] = resp['sortColumn'];
            if(resp['table_config']['entry_date_time'].value){
                resp['table_config']['entry_date_time'].value = new Date(resp['table_config']['entry_date_time'].value);
            }
            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShow = true;
            this.primengTable._filter();
        });

        //filter api
        this.getCityList("");
        this.getCurrencyList();
        this.getKycList();
        this.getRelationManagerList("");
        this.getMarkupProfileList("");
    }

    ngAfterViewInit(){
        // Defult Active filter show
        if(this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShow = true;
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            // console.log("ngAfterViewInit");
            this.selectedEmployee = filterData['table_config']['rm_id_filters'].value || {};
            // const match = this.employeeList.find((item: any) => item.id == this.selectedEmployee.id);
            // if(!match) {
            //     this.employeeList.push(this.selectedEmployee);
            // }
            if(filterData['table_config']['entry_date_time'].value) {
                filterData['table_config']['entry_date_time'].value = new Date(filterData['table_config']['entry_date_time'].value);
            }
            this.primengTable['filters'] = filterData['table_config'];
        }
    }

    //  cityList Api
    getCityList(inp: string) {
        this.cityService.getCityCombo(inp).subscribe((data) => {
            this.cityList = data;
        });
    }

    // Currency List api
    getCurrencyList() {
        this.currencyService.getcurrencyCombo().subscribe((data) => {
            this.currencyListAll = data;
        })
    }

    getKycList() {
        this.kycService.getkycprofileCombo('agent').subscribe((data) => {
            this.kycListAll = data;
        })
    }

    // To get Relationship Manager data from employeelist api
    getRelationManagerList(value: any) {
        this.employeeService.getemployeeCombo(value).subscribe((data) => {
            this.employeeList = data;
        })
    }

    // Markup Profile
    getMarkupProfileList(value: any) {
        this.markupprofileService.getMarkupProfileCombo(value).subscribe((data) => {
            this.markupList = data;
        })
    }

    getStatusColor(status: string): string {
        if (status == 'New') {
            return 'text-blue-500';
        } else if (status == 'Dormant') {
            return 'text-yellow-600';
        } else if (status == 'Active') {
            return 'text-green-600';
        } else if (status == 'Inactive') {
            return 'text-red-600';
        } else {
            return '';
        }
    }

    changeEmail(data) {
        if (!Security.hasPermission(agentsPermissions.changeEmailPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.entityService.raiseChangeEmailNumberCall({ data: data, flag: 'email' })
    }

    changeNumber(data) {
        if (!Security.hasPermission(agentsPermissions.changeNumberPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.entityService.raiseChangeEmailNumberCall({ data: data, flag: 'mobile' })
    }

    get selectedColumns(): Column[] {
        return this._selectedColumns;
    }

    set selectedColumns(val: Column[]) {
        this._selectedColumns = this.cols.filter((col) => val.includes(col));
    }

    getFilter(): any {
        let filterReq = {};
        filterReq["relationmanagerId"] = this.agentFilter?.relationmanagerId?.id || "";
        filterReq["currencyId"] = this.agentFilter?.currencyId?.id || "";
        filterReq["cityId"] = this.agentFilter?.cityId?.id || "";
        filterReq["markupProfileId"] = this.agentFilter?.markupProfileId?.id || "";
        filterReq["kycProfileId"] = this.agentFilter?.kycProfileId?.id || "";
        filterReq["blocked"] = this.agentFilter?.blocked == "All" ? "" : this.agentFilter?.blocked;
        filterReq["Status"] = this.agentFilter?.Status == "All" ? "" : this.agentFilter?.Status;
        return filterReq;
    }

    filter() {
        this.matDialog.open(AgentFilterComponent, {
            data: this.agentFilter,
            disableClose: true,
        }).afterClosed().subscribe(res => {
            if (res) {
                this.agentFilter = res;
                this.refreshItems();
            }
        })
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        var newModel = this.getNewFilterReq(event);
        var extraModel = this.getFilter();
        var Model = { ...newModel, ...extraModel }

        if (Security.hasPermission(agentsPermissions.viewOnlyAssignedPermissions)) {
            Model.relationmanagerId = this.user.id
        }

        this.agentService.getAgentList(Model).subscribe({
            next: data => {
                this.isLoading = false;
                this.dataList = data.data;
                this.totalRecords = data.total;
                if (this.dataList && this.dataList.length) {
                    setTimeout(() => {
                        this.isFrozenColumn('', ['agent_code']);
                    }, 200);
                } else {
                    setTimeout(() => {
                        this.isFrozenColumn('', ['agent_code'], true);
                    }, 200);
                }
            }, error: err => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            }
        })
    }

    resetPassword(record): void {
        const label: string = 'Reset Password'
        this.conformationService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.agency_name + ' ?'
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.agentService.regenerateNewPassword(record.id).subscribe({
                    next: (res) => {
                        this.alertService.showToast('success', res.msg, "top-right", true);
                        this.refreshItems()
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);
                    },
                })
            }
        })
    }

    wallettransfer(record): void {
        if (!Security.hasPermission(agentsPermissions.walletTransferPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = 'Wallet Transfer'
        this.conformationService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' for ' + record.agency_name + ' ?'
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.agentService.transferOldToNew({ recharge_for_id: record.id, recharge_for: 'Agent' }).subscribe({
                    next: (data: any) => {
                        if (data.status)
                            this.alertService.showToast('success', "Wallet transfer successfully", "top-right", true);
                        else
                            this.alertService.showToast('success', "Something went wrong, please try again.", "top-right", true);
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);
                    },
                })
            }
        })
    }

    reShuffle() {
        if (!Security.hasPermission(agentsPermissions.reshufflePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(ReshuffleComponent, {
            data: 'Agent',
            disableClose: true,
        }).afterClosed().subscribe(res => {
            if (res) {
                // this.agentFilter = res;
                // this.refreshItems();
            }
        })
    }

    autologin(record: any) {
        if (!Security.hasPermission(agentsPermissions.autoLoginPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.agentService.autoLogin(record.id).subscribe({
            next: data => {
                window.open(data.url + 'sign-in/' + data.code);
            }, error: err => {
                this.alertService.showToast('error', err)
            }
        })

    }

    // createInternal(model): void {
    //   this.router.navigate([Routes.customers.agent_entry_route])
    // }

    editInternal(record): void {
        this.matDialog
            .open(AgentEditComponent, {
                data: { data: record },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.alertService.showToast('success', "Record modified", "top-right", true);
                    this.refreshItems();
                }
            });
    }

    viewInternal(record): void {
        // this.router.navigate([Routes.customers.agent_entry_route + '/' + record.id + '/readonly'])
        Linq.recirect(Routes.customers.agent_entry_route + '/' + record.id + '/readonly')
    }

    //New Info
    // viewNew(record): void {
    //     this.router.navigate([Routes.customers.agent_info_route + '/' + record.id + '/readonly'])
    // }

    deleteInternal(record): void {
        const label: string = 'Delete Agent'
        this.conformationService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.agency_name + ' ?'
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.agentService.delete(record.id).subscribe({
                    next: () => {
                        this.alertService.showToast('success', "Agent has been deleted!", "top-right", true);
                        this.refreshItems()
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);
                    },
                })
            }
        })
    }

    setBlockUnblock(record): void {
        if (!Security.hasPermission(agentsPermissions.blockUnblockPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        if (record.is_blocked) {
            const label: string = 'Unblock Agent'
            this.conformationService.open({
                title: label,
                message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.agency_name + ' ?'
            }).afterClosed().subscribe(res => {
                if (res === 'confirmed') {
                    this.agentService.setBlockUnblock(record.id).subscribe({
                        next: () => {
                            record.is_blocked = !record.is_blocked;
                            this.alertService.showToast('success', "Agent has been Unblock!", "top-right", true);
                            this.refreshItems();

                        },
                        error: (err) => {
                            this.alertService.showToast('error', err, 'top-right', true);
                        },
                    })
                }
            })
        } else {
            this.matDialog.open(BlockReasonComponent, {
                data: record,
                disableClose: true
            }).afterClosed().subscribe(res => {
                if (res) {
                    this.agentService.setBlockUnblock(record.id, res).subscribe({
                        next: () => {
                            record.is_blocked = !record.is_blocked;
                            this.alertService.showToast('success', "Agent has been Block!", "top-right", true);
                            this.refreshItems();

                        },
                        error: (err) => {
                            this.alertService.showToast('error', err, 'top-right', true);
                        },
                    })
                }
            })
        }
    }

    relationahipManager(record): void {
        if (!Security.hasPermission(agentsPermissions.relationshipManagerPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(EmployeeDialogComponent, {
            data: record,
            disableClose: true
        }).afterClosed().subscribe(res => {
            if (res) {
                this.refreshItems()
                // this.agentService.setRelationManager(record.id, res.empId).subscribe({
                //     next: () => {
                //         // record.is_blocked = !record.is_blocked;
                //         this.alertService.showToast('success', "Relationship Manager Changed!");
                //         this.refreshItems()
                //     },
                //     error: (err) => {
                //         this.alertService.showToast('error', err, 'top-right', true);

                //     },
                // })
            }
        })
    }

    relationahipManagerLog(record): void {
        if (!Security.hasPermission(agentsPermissions.relationshipManagerLogsPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(AgentRMLogsComponent, {
            data: record,
            disableClose: true
        });
    }

    setKYCVerify(record): void {
        if (!Security.hasPermission(agentsPermissions.viewKYCPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(KycInfoComponent, {
            data: { record: record, agent: true },
            disableClose: true
        }).afterClosed().subscribe(res => {
            if (res) {

                // this.agentService.setMarkupProfile(record.id, res.transactionId).subscribe({
                //   next: () => {
                //     // record.is_blocked = !record.is_blocked;
                //     this.alertService.showToast('success', "The markup profile has been set", "top-right", true);
                //   }
                // })
            }
        })
    }

    statusChangedLog(record): void {
        if (!Security.hasPermission(agentsPermissions.statusChangedLogsPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(AgentStatusChangedLogComponent, {
            data: record,
            disableClose: true
        });
    }

    setMarkupProfile(record): void {
        if (!Security.hasPermission(agentsPermissions.setMarkupProfilePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(MarkupProfileDialogeComponent, {
            data: record,
            disableClose: true
        }).afterClosed().subscribe(res => {
            if (res) {
                this.agentService.setMarkupProfile(record.id, res.transactionId).subscribe({
                    next: () => {
                        // record.is_blocked = !record.is_blocked;
                        this.alertService.showToast('success', "The markup profile has been set!", "top-right", true);
                        this.refreshItems();

                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);

                    },
                })
            }
        })
    }

    setEmailVerify(record): void {
        if (!Security.hasPermission(agentsPermissions.verifyEmailPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = record.is_email_verified ? 'Unverify Email' : 'Verify Email'
        this.conformationService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.email_address + ' ?'
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.agentService.setEmailVerifyAgent(record.id).subscribe({
                    next: () => {
                        record.is_email_verified = !record.is_email_verified;
                        if (record.is_email_verified) {
                            this.alertService.showToast('success', "Email has been verified!", "top-right", true);
                            this.refreshItems();

                        }
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);

                    },
                })
            }
        })
    }

    setMobileVerify(record): void {
        if (!Security.hasPermission(agentsPermissions.verifyMobilePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = record.is_mobile_verified ? 'Unverify Mobile' : 'Verify Mobile'
        this.conformationService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.mobile_number + ' ?'
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.agentService.setMobileVerifyAgent(record.id).subscribe({
                    next: () => {
                        record.is_mobile_verified = !record.is_mobile_verified;
                        if (record.is_mobile_verified) {
                            this.alertService.showToast('success', "Mobile number has been verified1", "top-right", true);
                            this.refreshItems();

                        }
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);

                    },
                })
            }
        })
    }

    setCurrency(record): void {
        if (!Security.hasPermission(agentsPermissions.setCurrencyPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(SetCurrencyComponent, {
            data: record,
            disableClose: true
        }).afterClosed().subscribe(res => {
            if (res) {
                this.agentService.setBaseCurrency(record.id, res.base_currency_id).subscribe({
                    next: () => {
                        this.alertService.showToast('success', "The base currency has been set!", "top-right", true);
                        this.refreshItems();
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);

                    },
                })
            }
        });
    }

    kycProfile(record): void {

        this.matDialog.open(SetKycProfileComponent, {
            data: record,
            disableClose: true
        }).afterClosed().subscribe(res => {
            if (res) {

                this.agentService.mapkycProfile(record.id, res.kyc_profile_id).subscribe({
                    next: () => {
                        // record.is_blocked = !record.is_blocked;
                        this.alertService.showToast('success', "KYC Profile has been Added!", "top-right", true);
                        record.kyc_profile_id = res.kyc_profile_id;
                        this.refreshItems();

                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);

                    },
                })
            }
        })
    }

    convertWl(record): void {
        if (!Security.hasPermission(agentsPermissions.convertToWLPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog
            .open(WhitelabelEntryComponent, {
                data: { data: record, send: 'Agent-WL' },
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

    exportExcel(): void {
        if (!Security.hasExportDataPermission(this.module_name)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        let filterReq = this.getNewFilterReq({});
        filterReq["Filter"] = this.searchInputControl.value;
        filterReq["relationmanagerId"] = this.agentFilter?.relationmanagerId?.id || "";
        filterReq["currencyId"] = this.agentFilter?.currencyId?.id || "";
        filterReq["cityId"] = this.agentFilter?.cityId?.id || "";
        filterReq["markupProfileId"] = this.agentFilter?.markupProfileId?.id || "";
        filterReq["kycProfileId"] = this.agentFilter?.kycProfileId?.id || "";
        filterReq["blocked"] = this.agentFilter?.blocked == "All" ? "" : this.agentFilter?.blocked;
        filterReq['Skip'] = 0;
        filterReq['Take'] = this.totalRecords;

        this.agentService.getAgentList(filterReq).subscribe(data => {
            for (var dt of data.data) {
                // dt.amendment_request_time = DateTime.fromISO(dt.amendment_request_time).toFormat('dd-MM-yyyy HH:mm:ss')
                dt.entry_date_time = DateTime.fromISO(dt.entry_date_time).toFormat('dd-MM-yyyy HH:mm:ss')
                dt.web_last_login_time = DateTime.fromISO(dt.web_last_login_time).toFormat('dd-MM-yyyy HH:mm:ss')
            }
            Excel.export(
                'Agents',
                [
                    { header: 'Code', property: 'agent_code' },
                    { header: 'Agency', property: 'agency_name' },
                    { header: 'Status', property: 'status' },
                    { header: 'RM', property: 'relation_manager_name' },
                    { header: 'Email', property: 'email_address' },
                    { header: 'Mobile', property: 'mobile_number' },
                    { header: 'Currency', property: 'base_currency' },
                    { header: 'Signup', property: 'entry_date_time' },
                    { property: 'is_blocked', header: 'Blocked' },
                    { property: 'pan_number', header: 'PAN Number' },
                    { property: 'gst_number', header: 'GST Number' },
                    { property: 'markup_profile_name', header: 'Markup Profile' },
                    { property: 'kyc_profile_name', header: 'KYC Profile' },
                    { property: 'balance', header: 'Balance' },
                    { property: 'web_last_login_time', header: 'Last Login' },
                    { property: 'is_wl', header: 'WL' },
                    { property: 'is_test', header: 'Read Only' },
                    { property: 'subagent_count', header: 'Sub Agent Count' },

                ],
                data.data, "Agents", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 17 } }]);
        });
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    delete(record): void {

        if (!Security.hasPermission(agentsPermissions.removeAllSubagentPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = 'Remove All Subagent';
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
                    this.agentService.removeAllSubagent(record.id).subscribe({
                        next: () => {
                            this.alertService.showToast(
                                'success',
                                'Remove all subagent has been deleted!',
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

    ngOnDestroy(): void {
        // this.masterService.setData(this.key, this);

        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }
}
