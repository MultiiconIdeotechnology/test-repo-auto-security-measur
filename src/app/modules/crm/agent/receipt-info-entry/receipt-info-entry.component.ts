import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { Routes } from 'app/common/const';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { CrmService } from 'app/services/crm.service';
import { DateTime } from 'luxon';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { module_name } from 'app/security';

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

export class ReceiptInfoEntryComponent extends BaseListingComponent implements OnDestroy {
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
    serviceForList = ['Wallet', 'Online'];

    constructor(
        public matDialogRef: MatDialogRef<ReceiptInfoEntryComponent>,
        public formBuilder: FormBuilder,
        public router: Router,
        public route: ActivatedRoute,
        public alertService: ToasterService,
        private crmService: CrmService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        super(module_name.crmagent);
        this.record = data ?? {}
    }

    ngOnInit(): void {
        this.formGroup = this.formBuilder.group({
            // date: ['', Validators.required],
            amount: ['', Validators.required],
            mop: ['', Validators.required],
            remark: ['']
        });
    }

    numberOnly(event): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    refreshItems(): void {
        this.isLoading = true;
        const filterReq = GridUtils.GetFilterReq(
            this._paginator,
            this._sort,
            this.searchInputControl.value
        );
        this.crmService.getProductPurchaseMasterList(filterReq).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
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


        const newJson = {
            id: this.record?.id ? this.record?.id : "",
            receipt_from_id: this.record?.agentid ? this.record?.agentid : "",
            // service_for_id: this.record?.product_id ? this.record?.product_id : "",
            // receipt_request_date: json.date ? DateTime.fromJSDate(new Date(json.date)).toFormat('yyyy-MM-dd') : "",
            payment_amount: json.amount ? json.amount : "",
            mode_of_payment: json.mop ? json.mop : "",
            receipt_remark: json.remark ? json.remark : ""
        }

        this.crmService.createReceipt(newJson).subscribe({
            next: () => {
                this.router.navigate([this.leadListRoute]);
                this.disableBtn = false;
                this.matDialogRef.close(true);
                if (json.id) {
                    this.alertService.showToast('success', 'Record modified', 'top-right', true);
                } else {
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
