import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AppConfig } from 'app/config/app-config';
import { Security, filter_module_name, messages, module_name, walletRechargePermissions } from 'app/security';
import { WalletService } from 'app/services/wallet.service';
import { DateTime } from 'luxon';
import { InfoWalletComponent } from '../info-wallet/info-wallet.component';
import { Subject, Subscription } from 'rxjs';
import { EntityService } from 'app/services/entity.service';
import { RejectReasonComponent } from 'app/modules/masters/agent/reject-reason/reject-reason.component';
import { Excel } from 'app/utils/export/excel';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { AgentService } from 'app/services/agent.service';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { UserService } from 'app/core/user/user.service';

@Component({
	selector: 'app-pending',
	templateUrl: './pending.component.html',
	styleUrls: ['./pending.component.scss'],
	styles: [],
	standalone: true,
	imports: [
		NgIf,
		NgFor,
		DatePipe,
		ReactiveFormsModule,
		MatIconModule,
		MatInputModule,
		MatButtonModule,
		MatProgressBarModule,
		MatTableModule,
		MatPaginatorModule,
		MatSortModule,
		MatFormFieldModule,
		MatMenuModule,
		MatDialogModule,
		MatTooltipModule,
		MatDividerModule,
		CommonModule,
		MatTabsModule,
		PrimeNgImportsModule,
		ClipboardModule
	],
})
export class PendingComponent extends BaseListingComponent {

	@Input() isFilterShowPending: boolean
	@Input() filterApiData: any;
	@Output() isFilterShowPendingChange = new EventEmitter<boolean>();
	searchInputControlPending = new FormControl('');
	filter_table_name = filter_module_name.wallet_recharge_pending;
	module_name = module_name.wallet
	dataList = [];
	total = 0;
	appConfig = AppConfig;
	pendingFilter: any = {};

	public key: any;
	public sortColumn: any;
	public sortDirection: any;
	Mainmodule: any;
	isLoading = false;
	public _unsubscribeAll: Subject<any> = new Subject<any>();
	agentList: any[] = [];
	pspList: any[] = [];
	mopList: any[] = [];

	selectedMop: any;
	selectedAgent: any;
	selectedPSP: any;
	public settingsUpdatedSubscription: Subscription;

	cols = [];

	constructor(
		private walletService: WalletService,
		private conformationService: FuseConfirmationService,
		private matDialog: MatDialog,
		private clipboard: Clipboard,
		public agentService: AgentService,
		private entityService: EntityService,
		public _filterService: CommonFilterService,
		private _userService: UserService,
	) {
		super(module_name.wallet)
		this.key = this.module_name;
		this.sortColumn = 'request_date_time';
		this.sortDirection = 'desc';
		this.Mainmodule = this;

		this.pendingFilter = {
			particularId: 'all',
			mop: '',
			psp: '',
			agency_name: '',
			FromDate: new Date(),
			ToDate: new Date(),
		};

		this.pendingFilter.FromDate.setDate(1);
		this.pendingFilter.FromDate.setMonth(this.pendingFilter.FromDate.getMonth());
		this._filterService.applyDefaultFilter(this.filter_table_name);
	}

	ngOnInit(): void {
		this.agentList = this._filterService.agentListById;
		setTimeout(() => {
			this.mopList = this.filterApiData.mopData;
			this.pspList = this.filterApiData.pspData;
		}, 1000);
		
		this._filterService.updateSelectedOption('');
		this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
			this._filterService.updateSelectedOption('');
			this.selectedAgent = resp['table_config']['agent_code_filter']?.value;
			this.selectedMop = resp['table_config']['mop']?.value;
			this.selectedPSP = resp['table_config']['psp_name']?.value;

			if (this.selectedAgent && this.selectedAgent.id) {
				const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
				if (!match) {
					this.agentList.push(this.selectedAgent);
				}
			}

			if (this.selectedMop && this.selectedMop.id) {
				const match = this.mopList.find((item: any) => item.id == this.selectedMop?.id);
				if (!match) {
					this.mopList.push(this.selectedMop);
				}
			}
			if (this.selectedPSP && this.selectedPSP.id) {
				const match = this.pspList.find((item: any) => item.id == this.selectedPSP?.id);
				if (!match) {
					this.pspList.push(this.selectedPSP);
				}
			}
			if (resp?.table_config?.request_date_time?.value != null && resp.table_config.request_date_time.value.length) {
				this._filterService.updateSelectedOption('custom_date_range');
				this._filterService.rangeDateConvert(resp.table_config.request_date_time);
			}
			this.isFilterShowPending = true;
			this.isFilterShowPendingChange.emit(this.isFilterShowPending);
			// this.sortColumn = resp['sortColumn'];
			// this.primengTable['_sortField'] = resp['sortColumn'];
			this.primengTable['filters'] = resp['table_config'];
			this.primengTable._filter();
		});
	}

	copyLink(element: any): void {
		if (element) {
			this.clipboard.copy(element.paymentlink);
			this.alertService.showToast('success', 'Copied');
		}
	}

	ngAfterViewInit() {
		// Defult Active filter show
		if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
			let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
			this.selectedMop = filterData['table_config']['mop']?.value;
			this.selectedPSP = filterData['table_config']['psp_name']?.value;
			this.isFilterShowPending = true;
			this.isFilterShowPendingChange.emit(this.isFilterShowPending);

			setTimeout(() => {
				this.selectedAgent = filterData['table_config']['agent_code_filter']?.value;
				if (this.selectedAgent && this.selectedAgent.id) {
					const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
					if (!match) {
						this.agentList.push(this.selectedAgent);
					}
				}
				if (this.selectedMop && this.selectedMop.id) {
					const match = this.mopList.find((item: any) => item.id == this.selectedMop?.id);
					if (!match) {
						this.mopList.push(this.selectedMop);
					}
				}
				if (this.selectedPSP && this.selectedPSP.id) {
					const match = this.pspList.find((item: any) => item.id == this.selectedPSP?.id);
					if (!match) {
						this.pspList.push(this.selectedPSP);
					}
				}
			}, 1000);
			if (filterData?.table_config?.request_date_time?.value != null && filterData.table_config.request_date_time.value.length) {
				this._filterService.updateSelectedOption('custom_date_range');
				this._filterService.rangeDateConvert(filterData.table_config.request_date_time);
			}
			this.primengTable['filters'] = filterData['table_config'];

			// this.primengTable['_sortField'] = filterData['sortColumn'];
			// this.sortColumn = filterData['sortColumn'];
		}
	}

	ngOnChanges() {
		this.mopList = this.filterApiData.mopData;
		this.pspList = this.filterApiData.pspData;
	}

	getAgentList(value: string) {
		this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
			this.agentList = data;
			for (let i in this.agentList) {
				this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`
			}
		})
	}

	generatePaymentLink(data: any) {
		if (!Security.hasPermission(walletRechargePermissions.generatePaymentLink)) {
			return this.alertService.showToast('error', messages.permissionDenied);
		}

		let newMessage: any;
		const label: string = 'Generate Payment Link'
		newMessage = 'Are you sure to ' + label.toLowerCase() + ' ?'
		this.conformationService.open({
			title: label,
			message: newMessage
		}).afterClosed().subscribe({
			next: (res) => {
				if (res === 'confirmed') {

					const executeMethod = () => {
						let json = {
							reference_table_id: data?.id ? data?.id : "",
							service_for: "Wallet",
							mop: data?.mop ? data?.mop : ""
						}
						this.walletService.generatePaymentLink(json).subscribe({
							next: (res) => {
								// let paymentLink: any;
								// // paymentLink = res.url;
								// paymentLink = "https://sandbox.partner.bontonholidays.com//payment-link/Py8oKMeAJxzDrz3hLS31aKuLM1wuDYR0cvLAQ5r8thpfoE2H079eHFAlaA0$R87LaA0$dy"
								// this.matDialog.open(PaymentLinkCopyComponent, {
								//     panelClass: 'full-dialog',
								//     data: paymentLink,
								//     disableClose: true
								// });

								this.alertService.showToast('success', "Payment link generated successfully!", "top-right", true);
								this.refreshItemsPending();
								this.entityService.raiseWalletAuditedCall(data.id);
							}, error: (err) => this.alertService.showToast('error', err, "top-right", true)
						});
					}

					// Method to execute a function after verifying OTP if needed
					this._userService.verifyAndExecute(
						{ title: 'account_wallet_recharge_generate_payment_link' },
						() => executeMethod()
					);
				}
			}
		})
	}

	getMopList(value: string) {
		this.walletService.getModeOfPaymentCombo(value).subscribe((data) => {
			this.mopList = data;

			for (let i in this.mopList) {
				this.mopList[i].id_by_value = this.mopList[i].mop;
			}
		})
	}

	getPSPList(value: string) {
		this.walletService.getPaymentGatewayCombo(value).subscribe((data) => {
			this.pspList = data;

			for (let i in this.pspList) {
				this.pspList[i].id_by_value = this.pspList[i].provider;
			}
		})
	}

	view(record) {
		if (!Security.hasViewDetailPermission(module_name.wallet)) {
			return this.alertService.showToast('error', messages.permissionDenied);
		}

		this.matDialog.open(InfoWalletComponent, {
			data: { data: record.id, readonly: true },
			disableClose: true
		})
	}

	Audit(data: any): void {
		if (!Security.hasPermission(walletRechargePermissions.auditUnauditPermissions)) {
			return this.alertService.showToast('error', messages.permissionDenied);
		}

		const label: string = 'Audit Wallet Recharge'
		this.conformationService.open({
			title: label,
			message: 'Are you sure to ' + label.toLowerCase() + ' ?'
		}).afterClosed().subscribe({
			next: (res) => {
				if (res === 'confirmed') {
					const executeMethod = () => {
						this.walletService.setRechargeAudit(data.id).subscribe({
							next: () => {
								this.alertService.showToast('success', "Wallet Recharge Audited", "top-right", true);
								this.refreshItemsPending();
								this.entityService.raiseWalletAuditedCall(data.id);
							}, error: (err) => this.alertService.showToast('error', err, "top-right", true)
						});
					}

					// Method to execute a function after verifying OTP if needed
					this._userService.verifyAndExecute(
						{ title: 'account_wallet_recharge_audit' },
						() => executeMethod()
					);
				}
			}
		})

	}

	// Reject(record: any): void {
	//   const label: string = 'Reject Wallet Recharge'
	//   this.conformationService.open({
	//     title: label,
	//     message: 'Are you sure to ' + label.toLowerCase() + ' ?'
	//   }).afterClosed().subscribe({
	//     next: (res) => {
	//       if (res === 'confirmed') {
	//         this.matDialog.open(RejectWalletReasoneComponent, {
	//           data: null,
	//           disableClose: true
	//         }).afterClosed().subscribe(resone => {
	//           if (!resone)
	//             return;
	//           this.walletService.setRechargeReject({ id: record.id, reject_reason: resone.reject_reasone }).subscribe({
	//             next: () => {
	//               this.alertService.showToast('success', "Wallet Recharge Rejected", "top-right", true);
	//               this.refreshItemsPending()
	//               this.entityService.raiseWalletRejectedCall(record.id);
	//             }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
	//           });
	//         })
	//       }
	//     }
	//   })

	// }

	Reject(record: any): void {
		if (!Security.hasPermission(walletRechargePermissions.rejectPermissions)) {
			return this.alertService.showToast('error', messages.permissionDenied);
		}

		this.matDialog.open(RejectReasonComponent, {
			disableClose: true,
			data: record,
			panelClass: 'full-dialog'
		}).afterClosed().subscribe({
			next: (resone) => {
				if (resone) {
					const executeMethod = () => {
						this.walletService.setRechargeReject({ id: record.id, reject_reason: resone }).subscribe({
							next: () => {
								this.alertService.showToast('success', "Wallet Recharge Rejected", "top-right", true);
								this.refreshItemsPending()
								this.entityService.raiseWalletRejectedCall(record.id);
							},
							error: (err) => this.alertService.showToast('error', err, "top-right", true)
						})
					}

					// Method to execute a function after verifying OTP if needed
					this._userService.verifyAndExecute(
						{ title: 'account_wallet_recharge_reject' },
						() => executeMethod()
					);
				}
			}
		})
	}

	refreshItemsPending(event?: any) {
		this.isLoading = true;
		const filterReq = this.getNewFilterReq(event);
		filterReq['Filter'] = this.searchInputControlPending.value;
		filterReq['Status'] = 'pending';
		filterReq['particularId'] = this.pendingFilter?.particularId == "all" ? '' : this.pendingFilter?.particularId;
		filterReq['mop'] = this.pendingFilter?.mop || '';
		filterReq['psp'] = this.pendingFilter?.psp || '';
		// filterReq['FromDate'] = DateTime.fromJSDate(new Date(this.pendingFilter.FromDate)).toFormat('yyyy-MM-dd');
		// filterReq['ToDate'] = DateTime.fromJSDate(new Date(this.pendingFilter.ToDate)).toFormat('yyyy-MM-dd');
		filterReq['FromDate'] = "";
		filterReq['ToDate'] = "";

		this.walletService.getWalletRechargeFilterList(filterReq).subscribe(
			{
				next: data => {
					this.isLoading = false;
					this.dataList = data.data;
					this.totalRecords = data.total;
				}, error: err => {
					this.alertService.showToast('error', err);

					this.isLoading = false;
				}
			}
		);
	}

	downloadfile(data: string) {
		window.open(data, '_blank')
	}

	getNodataTextPending(): string {
		if (this.isLoading)
			return 'Loading...';
		else if (this.searchInputControlPending.value)
			return `no search results found for \'${this.searchInputControlPending.value}\'.`;
		else return 'No data to display';
	}

	exportExcel(event?: any): void {
		if (!Security.hasExportDataPermission(this.module_name)) {
			return this.alertService.showToast('error', messages.permissionDenied);
		}

		const filterReq = this.getNewFilterReq(event);
		filterReq['Filter'] = this.searchInputControlPending.value;
		filterReq['Status'] = 'pending';
		filterReq['particularId'] = this.pendingFilter?.particularId == "all" ? '' : this.pendingFilter?.particularId;
		filterReq['mop'] = this.pendingFilter?.mop || '';
		filterReq['psp'] = this.pendingFilter?.psp || '';
		filterReq['FromDate'] = DateTime.fromJSDate(new Date(this.pendingFilter.FromDate)).toFormat('yyyy-MM-dd');
		filterReq['ToDate'] = DateTime.fromJSDate(new Date(this.pendingFilter.ToDate)).toFormat('yyyy-MM-dd');
		filterReq['Take'] = this.totalRecords;

		this.walletService.getWalletRechargeFilterList(filterReq).subscribe(data => {
			for (var dt of data.data) {
				dt.request_date_time = dt.request_date_time ? DateTime.fromISO(dt.request_date_time).toFormat('dd-MM-yyyy hh:mm a') : ''
				dt.entry_date_time = dt.entry_date_time ? DateTime.fromISO(dt.entry_date_time).toFormat('dd-MM-yyyy hh:mm a') : ''
				// dt.payment_amount = dt.payment_amount + ' ' + dt.payment_currency
			}
			Excel.export(
				'Wallet Recharge Pending',
				[
					{ header: 'Ref. No', property: 'reference_number' },
					{ header: 'Request.', property: 'request_date_time' },
					{ header: 'Agent Code', property: 'agent_code' },
					{ header: 'Agent', property: 'recharge_for_name' },
					{ header: 'Currency', property: 'currency' },
					{ header: 'Amount ', property: 'recharge_amount' },
					{ header: 'MOP', property: 'mop' },
					{ header: 'Remark', property: 'user_remark' },
				],
				data.data, "Wallet Recharge Pending", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }]);
		});
	}

	ngOnDestroy() {
		if (this.settingsUpdatedSubscription) {
			this.settingsUpdatedSubscription.unsubscribe();
			this._filterService.activeFiltData = {};
		}

	}

}
