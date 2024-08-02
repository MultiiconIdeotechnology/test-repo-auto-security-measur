import { RmChangeLogComponent } from './../rm-change-log/rm-change-log.component';
import { Component, Inject, Optional, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AgentService } from 'app/services/agent.service';
import { CityService } from 'app/services/city.service';
import { DesignationService } from 'app/services/designation.service';
import { EmployeeService } from 'app/services/employee.service';
import { ToasterService } from 'app/services/toaster.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { Routes } from 'app/common/const';
import { BasicDetailsComponent } from '../basic-details/basic-details.component';
import { SubAgentComponent } from '../sub-agent/sub-agent.component';
import { CallLogsComponent } from '../call-logs/call-logs.component';
import { AgentLedgerComponent } from '../agent-ledger/agent-ledger.component';
import { SubAgentLedgerComponent } from '../sub-agent-ledger/sub-agent-ledger.component';
import { LoginLogsComponent } from '../login-logs/login-logs.component';
import { ProductComponent } from '../product/product.component';
import { Security, agentPermissions, agentsPermissions, messages } from 'app/security';
import { EmployeeDialogComponent } from '../employee-dialog/employee-dialog.component';
import { KycInfoComponent } from '../kyc-info/kyc-info.component';
import { MarkupProfileDialogeComponent } from '../markup-profile-dialoge/markup-profile-dialoge.component';
import { BlockReasonComponent } from '../../supplier/block-reason/block-reason.component';
import { SetCurrencyComponent } from '../set-currency/set-currency.component';
import { WhitelabelEntryComponent } from '../../whitelabel/whitelabel-entry/whitelabel-entry.component';
import { TabStatusChangeComponent } from '../tab-status-change/tab-status-change.component';
import { AgentRMLogsComponent } from '../rmlogs/rmlogs.component';
import { BusinessAnalyticsComponent } from 'app/modules/crm/timeline/business-analytics/business-analytics.component';
import { AgentProductInfoComponent } from 'app/modules/crm/agent/product-info/product-info.component';

@Component({
    selector: 'app-agent-info',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        ReactiveFormsModule,
        FormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatSelectModule,
        NgIf,
        NgFor,
        AsyncPipe,
        NgxMatSelectSearchModule,
        MatDatepickerModule,
        RouterModule,
        NgxMatTimepickerModule,
        MatTooltipModule,
        MatMenuModule,
        MatSlideToggleModule,
        MatTabsModule,
        DatePipe,
        MatPaginatorModule,
        MatDividerModule,
        NgClass,
        BasicDetailsComponent,
        SubAgentComponent,
        RmChangeLogComponent,
        CallLogsComponent,
        AgentLedgerComponent,
        SubAgentLedgerComponent,
        LoginLogsComponent,
        ProductComponent,
        TabStatusChangeComponent,
        BusinessAnalyticsComponent,
        AgentProductInfoComponent
    ],
    templateUrl: './agent-info.component.html',
    styleUrls: ['./agent-info.component.scss']
})
export class AgentInfoComponent {

    @ViewChild('subagents') subagents: SubAgentComponent;
    @ViewChild('rmchangelog') rmchangelog: RmChangeLogComponent;
    @ViewChild('calllogs') calllogs: CallLogsComponent;
    @ViewChild('ledger') ledger: AgentLedgerComponent;
    @ViewChild('subagentledger') subagentledger: SubAgentLedgerComponent;
    @ViewChild('loginlogs') loginlogs: LoginLogsComponent;
    @ViewChild('products') products: ProductComponent;
    @ViewChild('statuschangelogs') statuschangelogs: TabStatusChangeComponent;
    @ViewChild('businessanalytics') businessAnalytics: BusinessAnalyticsComponent;

    tabName: any
    tabNameStr: any = 'Basic Details'
    tab: string = 'Basic Details'
    isSecound: boolean = true
    isThird: boolean = true
    isForth: boolean = true
    isFive: boolean = true
    isSix: boolean = true
    isSeven: boolean = true
    isEight: boolean = true
    isNine: boolean = true
    isTen: boolean = true

    idUrl: any;
    records: any = {};
    bankRecords: any[] = [];
    isbankapiCall: boolean = false
    disableBtn: boolean = false
    record: any = {}

    agentListRoute = Routes.customers.agent_route;

    constructor(
        public formBuilder: FormBuilder,
        public cityService: CityService,
        public agentService: AgentService,
        public router: Router,
        public route: ActivatedRoute,
        public alertService: ToasterService,
        public designationService: DesignationService,
        public employeeService: EmployeeService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog,
        // @Inject(MAT_DIALOG_DATA) public data: any = {}
        // @Optional() public dialogRef: MatDialogRef<AgentInfoComponent>,
        // @Optional() @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        // this.record = data?.data;
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.idUrl = params.get('id');
        })

        const request = {}
        request['MasterId'] = this.idUrl;
        request['Skip'] = 0;
        request['Take'] = 100
        request['OrderBy'] = "bank_name";
        request['Filter'] = "";
        request['OrderDirection'] = 1;

        this.agentService.getAgentRecord(this.idUrl).subscribe({
            next: data => {
                this.records = data;
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
            }
        })

        this.agentService.getBankList(request).subscribe({
            next: (res) => {
                this.bankRecords = res?.data;
                this.isbankapiCall = true
            }, error: err => {
                this.alertService.showToast('error', err);
                this.isbankapiCall = true

            },
        });
    }

    relationahipManagerAgent(): void {
        if (!Security.hasPermission(agentsPermissions.relationshipManagerPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(EmployeeDialogComponent, {
            data: this.records,
            disableClose: true
        }).afterClosed().subscribe(res => {
            if (res) {
                this.agentService.setRelationManager(this.records.id, res.empId).subscribe({
                    next: () => {
                        // record.is_blocked = !record.is_blocked;
                        this.alertService.showToast('success', "Relationship Manager Changed!");
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);
                        this.disableBtn = false;
                    }
                })
            }
        })
    }

    setKYCVerifyAgent(): void {
        if (!Security.hasPermission(agentsPermissions.viewKYCPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(KycInfoComponent, {
            data: { record: this.records, agent: true },
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

    setMarkupProfileAgent() {
        if (!Security.hasPermission(agentsPermissions.setMarkupProfilePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(MarkupProfileDialogeComponent, {
            data: this.records,
            disableClose: true
        }).afterClosed().subscribe(res => {
            if (res) {
                this.agentService.setMarkupProfile(this.records.id, res.transactionId).subscribe({
                    next: () => {
                        // record.is_blocked = !record.is_blocked;
                        this.alertService.showToast('success', "The markup profile has been set", "top-right", true);
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);
                        this.disableBtn = false;
                    }
                })
            }
        })
    }

    autologinAgent() {
        if (!Security.hasPermission(agentsPermissions.autoLoginPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.agentService.autoLogin(this.records.id).subscribe({
            next: data => {
                window.open(data.url + 'sign-in/' + data.code);
            }, error: err => {
                this.alertService.showToast('error', err)
            }
        })

    }

    setBlockUnblockAgent(): void {
        if (!Security.hasPermission(agentsPermissions.blockUnblockPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        if (this.records.is_blocked) {
            const label: string = 'Unblock Agent'
            this.conformationService.open({
                title: label,
                message: 'Are you sure to ' + label.toLowerCase() + ' ' + this.records.agency_name + ' ?'
            }).afterClosed().subscribe(res => {
                if (res === 'confirmed') {
                    this.agentService.setBlockUnblock(this.records.id).subscribe({
                        next: () => {
                            this.records.is_blocked = !this.records.is_blocked;
                            this.alertService.showToast('success', "Agent has been Unblock!", "top-right", true);
                        },
                        error: (err) => {
                            this.alertService.showToast('error', err, 'top-right', true);
                            this.disableBtn = false;
                        }
                    })
                }
            })
        } else {
            this.matDialog.open(BlockReasonComponent, {
                data: this.records,
                disableClose: true
            }).afterClosed().subscribe(res => {
                if (res) {
                    this.agentService.setBlockUnblock(this.records.id, res).subscribe({
                        next: () => {
                            this.records.is_blocked = !this.records.is_blocked;
                            this.alertService.showToast('success', "Agent has been Block!", "top-right", true);
                        },
                        error: (err) => {
                            this.alertService.showToast('error', err, 'top-right', true);
                            this.disableBtn = false;
                        }
                    })
                }
            })
        }
    }

    setEmailVerifyAgent(): void {
        if (!Security.hasPermission(agentsPermissions.verifyEmailPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = this.records.is_email_verified ? 'Unverify Email' : 'Verify Email'
        this.conformationService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' ' + this.records.email_address + ' ?'
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.agentService.setEmailVerifyAgent(this.records.id).subscribe({
                    next: () => {
                        this.records.is_email_verified = !this.records.is_email_verified;
                        if (this.records.is_email_verified) {
                            this.alertService.showToast('success', "Email has been verified", "top-right", true);
                        }
                    }
                })
            }
        })
    }

    setMobileVerifyAgent(): void {
        if (!Security.hasPermission(agentsPermissions.verifyMobilePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = this.records.is_mobile_verified ? 'Unverify Mobile' : 'Verify Mobile'
        this.conformationService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' ' + this.records.mobile_number + ' ?'
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.agentService.setMobileVerifyAgent(this.records.id).subscribe({
                    next: () => {
                        this.records.is_mobile_verified = !this.records.is_mobile_verified;
                        if (this.records.is_mobile_verified) {
                            this.alertService.showToast('success', "Mobile number has been verified", "top-right", true);
                        }
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);
                        this.disableBtn = false;
                    }
                })
            }
        })
    }

    setCurrencyAgent(): void {
        if (!Security.hasPermission(agentsPermissions.setCurrencyPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(SetCurrencyComponent, {
            data: this.records,
            disableClose: true
        }).afterClosed().subscribe(res => {
            if (res) {
                this.agentService.setBaseCurrency(this.records.id, res.base_currency_id).subscribe({
                    next: () => {
                        this.alertService.showToast('success', "The base currency has been set!", "top-right", true);
                        // this.refreshItems();
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);
                    }
                })
            }
        });
    }

    convertWlAgent() {
        if (!Security.hasPermission(agentsPermissions.convertToWLPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        this.matDialog
            .open(WhitelabelEntryComponent, {
                data: { data: this.records, send: 'Agent-WL' },
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
                    // this.refreshItems();
                }
            });
    }

    resetPasswordAgent() {
        const label: string = 'Reset Password'
        this.conformationService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' ' + this.records.agency_name + ' ?'
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.agentService.regenerateNewPassword(this.records.id).subscribe({
                    next: (res) => {
                        this.alertService.showToast('success', res.msg, "top-right", true);
                        // this.refreshItems()
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);
                    },
                })
            }
        })
    }

    wallettransfer(): void {
        if (!Security.hasPermission(agentsPermissions.walletTransferPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = 'Wallet Transfer'
        this.conformationService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' for ' + this.records.agency_name + ' ?'
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.agentService.transferOldToNew({ recharge_for_id: this.records.id, recharge_for: 'Agent' }).subscribe({
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

    relationahipManager(): void {
        if (!Security.hasPermission(agentsPermissions.relationshipManagerPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(EmployeeDialogComponent, {
            data: this.records,
            disableClose: true
        }).afterClosed().subscribe(res => {
            if (res) {
                this.agentService.setRelationManager(this.records.id, res.empId).subscribe({
                    next: () => {
                        // record.is_blocked = !record.is_blocked;
                        this.alertService.showToast('success', "Relationship Manager Changed!");
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);

                    },
                })
            }
        })
    }

    relationahipManagerLog(): void {
        if (!Security.hasPermission(agentsPermissions.relationshipManagerLogsPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(AgentRMLogsComponent, {
            data: this.records,
            disableClose: true
        });
    }

    delete(): void {

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
                    this.records.agency_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.agentService.removeAllSubagent(this.records.id).subscribe({
                        next: () => {
                            this.alertService.showToast(
                                'success',
                                'Remove all subagent has been deleted!',
                                'top-right',
                                true
                            );
                            // this.refreshItems();
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


    // Colse Btn
    colseBtn() {
        this.router.navigate([this.agentListRoute])
    }

    // Tab changes
    public tabChanged(event: any): void {
        const tabName = event?.tab?.ariaLabel;
        this.tabNameStr = tabName
        this.tabName = tabName

        switch (tabName) {
            case 'Basic Details':
                this.tab = 'Basic Details';
                break;

            case 'Business Analytics':
                this.tab = 'Business Analytics';
                if (this.isSecound) {
                    this.businessAnalytics?.ngOnInit();
                    this.isSecound = false;
                }
                break;

            case 'Sub Agents':
                this.tab = 'Sub Agents';
                if (this.isThird) {
                    this.subagents?.refreshItems()
                    this.isThird = false
                }
                break;

            case 'Ledger':
                this.tab = 'Ledger';
                if (this.isForth) {
                    this.ledger?.refreshItems()
                    this.isForth = false
                }
                break;

            case 'Sub Agent Ledger':
                this.tab = 'Sub Agent Ledger';
                if (this.isFive) {
                    this.subagentledger?.refreshItems()
                    this.isFive = false
                }
                break;

            case 'Products':
                this.tab = 'Products';
                if (this.isSix) {
                    this.products?.refreshItems()
                    this.isSix = false
                }
                break;

            case 'Call Logs':
                this.tab = 'Call Logs';
                if (this.isSeven) {
                    this.calllogs?.refreshItems()
                    this.isSeven = false
                }
                break;

            case 'RM Change Log':
                this.tab = 'RM Change Log';
                if (this.isEight) {
                    this.rmchangelog?.refreshItems()
                    this.isEight = false
                }
                break;

            case 'Status Change Logs':
                this.tab = 'Status Change Logs';
                if (this.isNine) {
                    this.statuschangelogs?.refreshItems()
                    this.isNine = false
                }
                break;

            case 'Login Logs':
                this.tab = 'Login Logs';
                if (this.isTen) {
                    this.loginlogs?.refreshItems()
                    this.isTen = false
                }
                break;


        }
    }

    public getTabsPermission(tab: string): boolean {
        if (tab == 'businessanalytics') {
            return Security.hasPermission(agentPermissions.businessanalyticsPermissions)
        }
    }
}
