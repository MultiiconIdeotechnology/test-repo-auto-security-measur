import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { FuseConfig, FuseConfigService } from '@fuse/services/config';
import { AccountService } from 'app/services/account.service';
import { AgentService } from 'app/services/agent.service';
import { EntityService } from 'app/services/entity.service';
import { ToasterService } from 'app/services/toaster.service';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { Subject, takeUntil, distinctUntilChanged, debounceTime, startWith, filter, switchMap } from 'rxjs';

@Component({
    selector: 'payment-link-entry',
    templateUrl: './payment-link-entry.component.html',
    standalone: true,
    styleUrls: ['./payment-link-entry.component.scss'],
    imports: [
        FuseDrawerComponent,
        MatDividerModule,
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        AsyncPipe,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatDatepickerModule,
        MatSlideToggleModule,
        MatTooltipModule,
        MatMenuModule,
        NgxMatSelectSearchModule,
        NgxMatTimepickerModule]
})
export class PaymentLinkComponent implements OnInit, OnDestroy {
    @ViewChild('settingsDrawer') public settingsDrawer: MatSidenav;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    agentList: any[] = [];
    disableBtn: boolean = false;
    record: any;
    readonly: any;
    create: boolean = false;
    edit: boolean = false;
    listFlag: boolean = false;
    config: FuseConfig;
    paymentLinkServiceList: any;
    todayDateTime = new Date();

    constructor(
        private _router: Router,
        private entityService: EntityService,
        private accountService: AccountService,
        private builder: FormBuilder,
        private agentService: AgentService,
        public alertService: ToasterService,
        private _fuseConfigService: FuseConfigService,
    ) {
        this.entityService.onPaymentLinkEntityCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                this.settingsDrawer?.toggle()

                this.formGroup.patchValue({
                    id: "",
                    agent_id: "",
                    agentfilter: "",
                    service_for: "",
                    mop: "",
                    service_ref_no: "",
                    amount: "",
                    remark: "",
                    expiry_date: ""
                })

                if (item?.list) {
                    this.listFlag = true;
                    let json = {
                        id: item?.data.id ? item?.data.id : ""
                    }
                    this.accountService.getPaymentLinkRecord(json).subscribe({
                        next: (data) => {
                            this.listFlag = true
                            this.title = "Payment Link Info"
                            this.record = data;
                        }, error: (err) => {
                            this.alertService.showToast('error', err)
                        }
                    });
                }

                this.create = item?.create;
                this.edit = item?.edit;

                this.formGroup
                    .get('agentfilter')
                    .valueChanges.pipe(
                        filter((search) => !!search),
                        startWith(''),
                        debounceTime(200),
                        distinctUntilChanged(),
                        switchMap((value: any) => {
                            return this.agentService.getAgentComboMaster(value, true);
                        })
                    )
                    .subscribe({
                        next: data => {
                            this.agentList = data
                            // this.agentList = [];
                            // this.agentList.push({ "id": "", "agency_name": "All" })
                            // this.agentList.push(...data)
                            if (this.create) {
                                this.title = "Create Payment Link"
                                this.listFlag = false;
                                this.edit = false;

                                this.formGroup.get("agent_id").patchValue(this.agentList[0]?.id);
                                this.formGroup.get("service_for").patchValue("Wallet");
                                // let mopPatchValue = ""
                                this.formGroup.get("mop").patchValue("Online");
                            }
                        }
                    });

                if (this.edit) {
                    this.record = item?.data;
                    this.listFlag = false;
                    this.create = false;
                    this.edit = true;
                    this.title = "Edit Payment Link"
                    if (this.record?.id) {
                        this.formGroup.get('agentfilter').patchValue(this.record?.agent)
                        this.formGroup.get('agent_id').patchValue(this.record?.agent_id);
                    }
                    this.formGroup.patchValue(this.record)
                }
            }
        })
    }

    formGroup: FormGroup;
    title = 'Payment Link';
    btnLabel = 'Submit';

    mopType: any[] = [
        { value: 'Online', viewValue: 'Online' },
    ];

    ngOnInit(): void {
        this._fuseConfigService.config$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config: FuseConfig) => {
                this.config = config;
            });

        this.formGroup = this.builder.group({
            id: [''],
            agent_id: [''],
            agentfilter: [''],
            service_for: ['', Validators.required],
            mop: ['', Validators.required],
            service_ref_no: ['', Validators.required],
            amount: ['', Validators.required],
            remark: [''],
            expiry_date: ['', Validators.required]
        });
        this.serviceCombo();

        this.formGroup.get('service_ref_no').valueChanges.subscribe(value => {
            const uppercaseValue = value.toUpperCase();
            this.formGroup.get('service_ref_no').setValue(uppercaseValue, { emitEvent: false });
        });
    }

    serviceCombo() {
        this.accountService.getPaymentLinkService().subscribe({
            next: (data) => {
                this.disableBtn = false;
                this.paymentLinkServiceList = data;
            },
            error: (err) => {
                this.disableBtn = false;
                this.alertService.showToast('error', err, 'top-right', true);
            }
        });
    }

    onServiceFor(val:string){
        if(val == 'Wallet'){
            this. mopType = [
                { value: 'Online', viewValue: 'Online' },
              ];
              this.formGroup.get("mop").patchValue("Online");
        } else {
            this.mopType = [
                { value: 'Both', viewValue: 'Both' },
                { value: 'Wallet', viewValue: 'Wallet' },
                { value: 'Online', viewValue: 'Online' },
              ];
            this.formGroup.get("mop").patchValue("Both");
        }
    }
    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }


    submit(): void {
        if (!this.formGroup.valid) {
            this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.formGroup.markAllAsTouched();
            return;
        }

        this.disableBtn = true;
        const json = this.formGroup.getRawValue();

        if (this.create && !this.edit) {
            const newJson = {
                id: "",
                agent_id: json.agent_id ? json.agent_id : "",
                service_for: json.service_for ? json.service_for : "",
                service_ref_no: json.service_ref_no ? json.service_ref_no : "",
                amount: json.amount ? json.amount : "",
                mop: json.mop ? json.mop : "Both",
                remark: json.remark ? json.remark : "",
                expiry_date: json.expiry_date ? DateTime.fromJSDate(new Date(this.formGroup.get('expiry_date').value)).toFormat('yyyy-MM-dd') : ""
            }
            this.accountService.createPaymentLink(newJson).subscribe({
                next: () => {
                    this.disableBtn = false;
                    this.settingsDrawer.close();
                    this.entityService.raiseRefreshPaymentLinkEntityCall(true);
                    this.alertService.showToast('success', 'New record added', 'top-right', true);
                },
                error: (err) => {
                    this.disableBtn = false;
                    this.alertService.showToast('error', err, 'top-right', true);
                }
            });
        }

        if (this.edit && !this.create) {
            const newJson = {
                id: this.record?.id ? this.record?.id : "",
                agent_id: json.agent_id ? json.agent_id : "",
                service_for: json.service_for ? json.service_for : "",
                service_ref_no: json.service_ref_no ? json.service_ref_no : "",
                mop: json.mop ? json.mop : "Both",
                amount: json.amount ? json.amount : "",
                remark: json.remark ? json.remark : "",
                expiry_date: json.expiry_date ? DateTime.fromJSDate(new Date(this.formGroup.get('expiry_date').value)).toFormat('yyyy-MM-dd') : ""
            }
            this.accountService.createPaymentLink(newJson).subscribe({
                next: () => {
                    this.disableBtn = false;
                    this.settingsDrawer.close();
                    this.entityService.raiseRefreshPaymentLinkEntityCall(true);
                    this.alertService.showToast('success', 'Modified record', 'top-right', true);
                },
                error: (err) => {
                    this.disableBtn = false;
                    this.alertService.showToast('error', err, 'top-right', true);
                }
            });
        }
    }

    numberOnly(event: any): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }
}
