import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { Routes } from 'app/common/const';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { CrmService } from 'app/services/crm.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { DocValidationDTO, CommonUtils } from 'app/utils/commonutils';
import { JsonFile } from 'app/common/jsonFile';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
    selector: 'app-receipt-info-entry',
    templateUrl: './receipt-info-entry.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
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
        MatSnackBarModule,
        MatSlideToggleModule,
        NgxMatSelectSearchModule,
        MatTooltipModule,
        MatAutocompleteModule,
        RouterOutlet,
        MatOptionModule,
        MatDividerModule,
        MatDatepickerModule,
        MatMenuModule,
        NgxMatTimepickerModule,
        MatDialogModule,
        CommonModule
    ]
})

export class ReceiptInfoEntryComponent {
    readonly: boolean = false;
    record: any = {};
    btnTitle: string = 'Create';
    leadListRoute = Routes.crm.agents_route;
    disableBtn: boolean = false;
    formGroup: FormGroup;
    title = "Create Receipt";
    btnLabel = "Submit";
    todayDateTime = new Date();
    user: any;
    dataList = [];
    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sort: MatSort;
    searchInputControl = new FormControl('');
    // serviceForList = ['Wallet', 'Online'];

    serviceForList: any[] = [
        { value: 'Wallet', viewValue: 'Wallet' },
        { value: 'Online', viewValue: 'Online' },
    ];

    editpaymentAttachmentSelectedFile: any;
    editproofAttachmentSelectedFile : any;
    proofAttachmentSelectedFile: File;
    proofAttachjFile: JsonFile;
    paymentAttachmentSelectedFile: File;
    paymentAttachjFile: JsonFile;
    proofAttachmentFlag: boolean = false;
    showProofAttachment: boolean = false;

    constructor(
        public matDialogRef: MatDialogRef<ReceiptInfoEntryComponent>,
        public formBuilder: FormBuilder,
        public router: Router,
        public route: ActivatedRoute,
        public alertService: ToasterService,
        private crmService: CrmService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        // super(module_name.crmagent);
        this.record = data ?? {}
    }

    ngOnInit(): void {
        this.formGroup = this.formBuilder.group({
            // date: ['', Validators.required],
            amount: ['', Validators.required],
            mop: ['', Validators.required],
            remark: [''],
            PaymentAttachment: [''],
            proofAttachment: [''],
        });

        if (this.record?.receiptid) {
            this.title = "Edit Receipt";
            this.formGroup.get('amount').patchValue(this.record?.payment_amount);
            this.formGroup.get('mop').patchValue(this.record?.mop);
            this.formGroup.get('remark').patchValue(this.record?.receipt_remark);
            this.editproofAttachmentSelectedFile = this.record?.proof_attachmentfile;
            this.editpaymentAttachmentSelectedFile = this.record?.payment_attachmentfile;

            if (this.record?.mop == 'Wallet') {
                this.showProofAttachment = true;
                // this.formGroup.get('proofAttachment').setValidators([Validators.required]);
            }
        }
    }

    onMopChange(event: MatSelectChange): void {
        const selectedMop = event.value;
        if (selectedMop === 'Wallet') {
            this.showProofAttachment = true;
            this.formGroup.get('proofAttachment').setValidators([Validators.required]);
        } else {
            this.showProofAttachment = false;
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

    refreshItems(): void {
        const filterReq = GridUtils.GetFilterReq(
            this._paginator,
            this._sort,
            this.searchInputControl.value
        );
        this.crmService.getProductPurchaseMasterList(filterReq).subscribe({
            next: (data) => {
                this.dataList = data.data;
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
            },
        });
    }

    onProofAttachmentFile(event: any) {
        const file = (event.target as HTMLInputElement).files[0];

        const extantion: string[] = ["pdf", "jpg", "jpeg", "png"];
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
        const extantion: string[] = ["pdf", "jpg", "jpeg", "png"];
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

    submit(): void {
        if (!this.formGroup.valid) {
            this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.formGroup.markAllAsTouched();
            return;
        }

        if (this.readonly) {
            this.router.navigate([this.leadListRoute]);
            return;
        }
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

        if (this.record?.receiptid) {
            const newJson = {
                id: this.record?.receiptid ? this.record?.receiptid : "",
                receipt_to_id: this.record?.agentid ? this.record?.agentid : "",
                payment_amount: json.amount ? json.amount : "",
                mode_of_payment: json.mop ? json.mop : "",
                receipt_remark: json.remark ? json.remark : "",
                payment_attachment: json.payment_attachment,
                proof_attachment: json.proof_attachment,
                service_for_id: this.record?.purid ? this.record?.purid : ""
            }

            this.crmService.createReceipt(newJson).subscribe({
                next: () => {
                    this.router.navigate([this.leadListRoute]);
                    this.disableBtn = false;
                    this.matDialogRef.close(true);
                    this.alertService.showToast('success', 'Record modified', 'top-right', true);
                },
                error: (err) => {
                    this.alertService.showToast('error', err, 'top-right', true);
                    this.disableBtn = false;
                },
            });
        }
        if (this.record?.id) {
            const newJson = {
                id: this.record?.id ? this.record?.id : "",
                receipt_to_id: this.record?.agentid ? this.record?.agentid : "",
                payment_amount: json.amount ? json.amount : "",
                mode_of_payment: json.mop ? json.mop : "",
                receipt_remark: json.remark ? json.remark : "",
                payment_attachment: json.payment_attachment,
                proof_attachment: json.proof_attachment,
                service_for_id: this.record?.id ? this.record?.id : ""
            }

            this.crmService.createReceipt(newJson).subscribe({
                next: () => {
                    this.router.navigate([this.leadListRoute]);
                    this.disableBtn = false;
                    this.matDialogRef.close(true);
                    this.alertService.showToast('success', 'New record added', 'top-right', true);
                },
                error: (err) => {
                    this.alertService.showToast('error', err, 'top-right', true);
                    this.disableBtn = false;
                },
            });
        }
    }
}
