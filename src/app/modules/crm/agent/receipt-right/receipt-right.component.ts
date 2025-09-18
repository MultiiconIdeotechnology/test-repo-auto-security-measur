import { CdkDropList, CdkDrag, CdkDragPreview, CdkDragHandle } from '@angular/cdk/drag-drop';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation, Pipe, ViewChild, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDivider, MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatDrawer, MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { OnlyFloatDirective } from '@fuse/directives/floatvalue.directive';
import { FuseConfig, FuseConfigService, Scheme, Theme, Themes } from '@fuse/services/config';
import { Routes } from 'app/common/const';
import { JsonFile } from 'app/common/jsonFile';
import { CrmService } from 'app/services/crm.service';
import { EntityService } from 'app/services/entity.service';
import { ToasterService } from 'app/services/toaster.service';
import { DocValidationDTO, CommonUtils } from 'app/utils/commonutils';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { Subject, takeUntil, Subscription } from 'rxjs';

@Component({
    selector: 'receipt-right',
    templateUrl: './receipt-right.component.html',
    styles: [
        `
            receipt-right {
                position: static;
                display: block;
                flex: none;
                width: auto;
            }
        `,
    ],
    standalone: true,
    imports: [
        NgIf,
        NgClass,
        DatePipe,
        AsyncPipe,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        FuseDrawerComponent,
        MatButtonModule,
        NgFor,
        NgClass,
        MatTooltipModule,
        MatDividerModule,
        MatSnackBarModule,
        MatSlideToggleModule,
        NgxMatSelectSearchModule,
        MatDatepickerModule,
        MatMenuModule,
        NgxMatSelectSearchModule,
        NgxMatTimepickerModule,
        MatCheckboxModule,
        MatSidenavModule,
        CdkDropList,
        CdkDrag,
        CdkDragPreview,
        CdkDragHandle,
        RouterLink,
        TitleCasePipe,
        MatAutocompleteModule,
        RouterOutlet,
        MatOptionModule,
        OnlyFloatDirective
    ]
})
export class ReceiptRightComponent implements OnInit, OnDestroy {
    config: FuseConfig;
    layout: string;
    scheme: 'dark' | 'light';
    theme: string;
    themes: Themes;
    title = "Create Receipt";
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    @ViewChild('settingsDrawer') public settingsDrawer: MatSidenav;
    @Input() currencySymbol:any;

    readonly: boolean = false;
    record: any = {};
    btnTitle: string = 'Create';
    leadListRoute = Routes.crm.agents_route;
    disableBtn: boolean = false;
    formGroup: FormGroup;
    btnLabel = "Submit";
    todayDateTime = new Date();
    user: any;
    dataList = [];
    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sort: MatSort;
    searchInputControl = new FormControl('');

    serviceForList: any[] = [
        { value: 'Wallet', viewValue: 'Wallet' },
        { value: 'Online', viewValue: 'Online' },
    ];

    productId: any

    editpaymentAttachmentSelectedFile: any;
    editproofAttachmentSelectedFile: any;
    proofAttachmentSelectedFile: any = File;
    proofAttachjFile: JsonFile;
    paymentAttachmentSelectedFile: any = File;
    paymentAttachjFile: JsonFile;
    proofAttachmentFlag: boolean = false;
    showProofAttachment: boolean = false;
    paymentAttachmentFlag: boolean = false;

    constructor(
        private _router: Router,
        private _fuseConfigService: FuseConfigService,
        private entityService: EntityService,
        public formBuilder: FormBuilder,
        public router: Router,
        public route: ActivatedRoute,
        public alertService: ToasterService,
        private crmService: CrmService,
        // @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        this.entityService.onreceiptCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                this.settingsDrawer.toggle()
                this.record = item ?? {}
                this.productId = this.record?.id

                this.formGroup.patchValue({
                    amount: "",
                    mop: "",
                    remark: "",
                    PaymentAttachment: "",
                    proofAttachment: ""
                });

                this.proofAttachmentSelectedFile = {};
                this.paymentAttachmentSelectedFile = {};
                this.editpaymentAttachmentSelectedFile = "";
                this.editproofAttachmentSelectedFile = "";

                this.title = "Create Receipt";
                if (item?.edit) {
                    this.record = item?.data ?? {}

                    if (this.record?.receiptId) {
                        this.title = "Edit Receipt";
                        this.formGroup.get('amount').patchValue(this.record?.paymentAmount);
                        this.formGroup.get('mop').patchValue(this.record?.mop);
                        this.formGroup.get('remark').patchValue(this.record?.receiptRemark);
                        this.editproofAttachmentSelectedFile = this.record?.proofAttachment;
                        this.editpaymentAttachmentSelectedFile = this.record?.paymentAttachment;

                        if (this.record?.mop == 'Wallet') {
                            this.showProofAttachment = true;
                            this.paymentAttachmentFlag = false;
                        }
                        if (this.record?.mop == 'Online'){
                            this.showProofAttachment = false;
                            this.paymentAttachmentFlag = true;
                        }
                    }
                }
            }
        })
    }


    ngOnInit(): void {
        // Subscribe to config changes
        this._fuseConfigService.config$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config: FuseConfig) => {
                // Store the config
                this.config = config;
            });

        this.formGroup = this.formBuilder.group({
            // date: ['', Validators.required],
            amount: ['', Validators.required],
            mop: ['', Validators.required],
            remark: [''],
            PaymentAttachment: [''],
            proofAttachment: [''],
        });
    }

    onMopChange(event: MatSelectChange): void {
        const selectedMop = event.value;
        if (selectedMop === 'Wallet') {
            this.showProofAttachment = true;
            this.paymentAttachmentFlag = false;
            this.formGroup.get('proofAttachment').setValidators([Validators.required]);
        } else {
            this.showProofAttachment = false;
            this.paymentAttachmentFlag = true;
            this.formGroup.get('proofAttachment').clearValidators();
        }
        this.formGroup.get('proofAttachment').updateValueAndValidity();
    }

    numberOnly(event): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    // refreshItems(): void {
    //     const filterReq = GridUtils.GetFilterReq(
    //         this._paginator,
    //         this._sort,
    //         this.searchInputControl.value
    //     );
    //     this.crmService.getProductPurchaseMasterList(filterReq).subscribe({
    //         next: (data) => {
    //             this.dataList = data.data;
    //         },
    //         error: (err) => {
    //             this.alertService.showToast('error', err, 'top-right', true);
    //         },
    //     });
    // }

    onProofAttachmentFile(event: any) {
        const file = (event.target as HTMLInputElement).files[0];

        const extantion: string[] = ["pdf", "jpg", "jpeg", "png", "webp"];
        var validator: DocValidationDTO = CommonUtils.isDocValid(file, extantion, 2024, null);
        if (!validator.valid) {
            this.alertService.showToast('error', validator.alertMessage, 'top-right', true);
            (event.target as HTMLInputElement).value = '';
            return;
        }
        this.proofAttachmentSelectedFile = event.target.files[0];
        CommonUtils.getJsonFile(file, (reader, jFile) => {
            this.proofAttachjFile = jFile;
            this.editproofAttachmentSelectedFile = false;
        });

        if (file) {
            this.proofAttachmentSelectedFile = file;
            this.editproofAttachmentSelectedFile = false;
            this.formGroup.get('proofAttachment').setValue(file);
            this.proofAttachmentFlag = false;
            if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
                this.formGroup.get('proofAttachment').clearValidators();
            }
        } else {
            this.proofAttachmentSelectedFile = null;
            if (this.formGroup.get('mop').value === 'wallet') {
                this.proofAttachmentFlag = true;
            }
        }
    }

    onPaymentAttachmentFile(event: any) {
        const file = (event.target as HTMLInputElement).files[0];
        const extantion: string[] = ["pdf", "jpg", "jpeg", "png", "webp"];
        var validator: DocValidationDTO = CommonUtils.isDocValid(file, extantion, 2024, null);
        if (!validator.valid) {
            this.alertService.showToast('error', validator.alertMessage, 'top-right', true);
            (event.target as HTMLInputElement).value = '';
            return;
        }
        this.paymentAttachmentSelectedFile = event.target.files[0];
        CommonUtils.getJsonFile(file, (reader, jFile) => {
            this.paymentAttachjFile = jFile;
            this.editpaymentAttachmentSelectedFile = false;
        });
        this.editpaymentAttachmentSelectedFile = false;
        // this.alertService.showToast('success', 'Payment Attachment file successfully');
        (event.target as HTMLInputElement).value = '';
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
        // if (this.readonly) {
        //     this.router.navigate([this.leadListRoute]);
        //     return;
        // }
        const json = this.formGroup.getRawValue();

        if (!this.proofAttachjFile) {
            json.proof_attachment = {
                fileName: '',
                fileType: '',
                base64: '',
            };
        } else {
            json.proof_attachment = this.proofAttachjFile
        }

        if (!this.paymentAttachjFile) {
            json.payment_attachment = {
                fileName: '',
                fileType: '',
                base64: '',
            };
        } else {
            json.payment_attachment = this.paymentAttachjFile
        }

        if (this.record?.receiptId) {
            const newJson = {
                id: this.record?.receiptId ? this.record?.receiptId : "",
                receiptToId: this.record?.agentId ? this.record?.agentId : "",
                paymentAmount: json.amount ? json.amount : "",
                modeOfPayment: json.mop ? json.mop : "",
                receiptRemark: json.remark ? json.remark : "",
                PaymentAttachment: json.payment_attachment,
                ProofAttachment: json.proof_attachment,
                serviceForId: this.productId || ""
            }

            this.crmService.createReceiptNew(newJson).subscribe({
                next: (res) => {
                    if(res){
                        this.router.navigate([this.leadListRoute]);
                        this.disableBtn = false;
                        this.entityService.raiserefreshReceiptCall(true);
                        this.settingsDrawer.close()
                        this.alertService.showToast('success', 'Record modified', 'top-right', true);
                    }
                },
                error: (err) => {
                    this.alertService.showToast('error', err, 'top-right', true);
                    this.disableBtn = false;
                },
            });
        }
        if (this.record?.data?.id) {
            const newJson = {
                id: "",
                receiptToId: this.record?.data?.agentId ? this.record?.data?.agentId : "",
                paymentAmount: json.amount ? json.amount : "",
                modeOfPayment: json.mop ? json.mop : "",
                receiptRemark: json.remark ? json.remark : "",
                PaymentAttachment: json.payment_attachment,
                ProofAttachment: json.proof_attachment,
                serviceForId: this.record?.data?.id ? this.record?.data?.id : ""
            }

            this.crmService.createReceiptNew(newJson).subscribe({
                next: (res) => {
                    if(res){
                        this.router.navigate([this.leadListRoute]);
                        this.disableBtn = false;
                        this.settingsDrawer.close();
                        this.entityService.raiserefreshReceiptCall(true);
                        this.alertService.showToast('success', 'New record added', 'top-right', true);
                    }
                },
                error: (err) => {
                    this.alertService.showToast('error', err, 'top-right', true);
                    this.disableBtn = false;
                },
            });
        }
    }
}
