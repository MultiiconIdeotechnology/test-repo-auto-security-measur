import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { UserService } from 'app/core/user/user.service';
import { Subject, takeUntil } from 'rxjs';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { module_name } from 'app/security';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { OnlyFloatDirective } from '@fuse/directives/floatvalue.directive';

@Component({
    selector: 'app-purchase-product-entry',
    templateUrl: './purchase-product-entry.component.html',
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
        CommonModule,
        OnlyFloatDirective
    ]
})

export class PurchaseProductEntryComponent {
    readonly: boolean = false;
    record: any = {};
    editRecord: any = {};
    btnTitle: string = 'Create';
    leadListRoute = Routes.crm.agents_route;
    disableBtn: boolean = false;
    formGroup: FormGroup;
    title = "Product Purchase";
    btnLabel = "Submit";
    productNameList: any[] = [];
    selectedProductList: any;
    installmentsArray = [];
    todayDateTime = new Date();
    installmentList: number[] = [];
    selectedMaxInstallment: any;
    user: any;
    dataList = [];
    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sort: MatSort;
    searchInputControl = new FormControl('');
    productDetail: any;
    productPurchaseMasterId: any;
    productId: any;
    productList: any[] = [];
    isProductInitialChanged: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<PurchaseProductEntryComponent>,
        public formBuilder: FormBuilder,
        public router: Router,
        public route: ActivatedRoute,
        public alertService: ToasterService,
        private _userService: UserService,
        private crmService: CrmService,
        @Inject(MAT_DIALOG_DATA) public data: any = {},
        @Inject(MAT_DIALOG_DATA) public editData: any = {}

    ) {
        // super(module_name.crmagent);
        this.record = data ?? {}
        this.editRecord = editData ?? {}
        if (!this.editRecord?.editFlag) {
            // this.getProducts();
        }
        else {
            this.getProductDetail();
        }
    }

    onDateChange(index: number): void {
        if (index > 0) {
            const prevDate = new Date(this.installmentsArray[index - 1].installment_date);
            this.installmentsArray[index].minDate = prevDate;
        }
    }

    ngOnInit(): void {
        this.formGroup = this.formBuilder.group({
            product: ['', Validators.required],
            rm_remark: [''],
            id: [''],
            price: ['', Validators.required],
            installments: ['', Validators.required],
            // installmentsArray: this.formBuilder.array([])
            installmentsArray: [[]]
        });

        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: any) => {
                this.user = user;
            });

        // this.getInstallmentOptions(7);
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

    onProductSelectionChange(selectedProduct: any): void {
        this.productDetail = this.productList?.find(x => x.id == selectedProduct);
        this.productId = this.productDetail?.id;
        this.formGroup.get('product').patchValue(this.productDetail?.id);
        this.formGroup.get('price').patchValue(this.productDetail?.one_time_cost);
        this.formGroup.get('installments').patchValue(this.productDetail?.max_installment > 1 ? 1 : this.productDetail?.max_installment);
        this.selectedMaxInstallment = this.productDetail?.max_installment;
        this.isProductInitialChanged = true;
        if (this.isProductInitialChanged) {
            this.onInstallmentsChange(1)
        }
    }

    onInstallmentsChange(value: number): void {
        this.isProductInitialChanged = false;

        this.installmentsArray = [];
        for (let index = 1; index <= value; index++) {
            var date = new Date()
            date.setDate(new Date().getDate() + (index - 1))
            this.installmentsArray.push({ installment_date: date, installment_amount: 0 })
            // this.dateSet(new Date(), index + 1)
        }
    }

    createFormControls(): void {
        this.installmentsArray.forEach((item, index) => {
            this.formGroup.addControl(`date${index}`, this.formBuilder.control(item.date, Validators.required));
            this.formGroup.addControl(`amount${index}`, this.formBuilder.control(item.amount, Validators.required));
        });
    }

    getInstallmentOptions(maxInstallment: number): number[] {
        const installmentList: number[] = [];
        for (let i = 1; i <= maxInstallment; i++) {
            installmentList.push(i);
        }
        return installmentList;
    }

    getProducts() {
        this.crmService.getProductNameList({}).subscribe({
            next: (data) => {
                this.productList = data;
                if (this.record?.id1) {
                    this.formGroup.patchValue(this.record);
                    this.formGroup.get("product").patchValue(this.record?.product_id);
                    this.formGroup.get('price').patchValue(this.record?.purchase_amount);
                    this.formGroup.get('installments').patchValue(this.record?.count);
                    this.selectedMaxInstallment = this.record?.max_installment;
                    if (this.record && this.record.installment) {
                        this.patchInstallments(this.record.installment);
                    }
                    // this.productId = this.record?.product_id;
                    // this.productId = this.record?.id;
                    // this.productPurchaseMasterId = this.record?.id1;
                }
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
            },
        });
    }

    getProductDetail() {
        const filterReq = GridUtils.GetFilterReq(
            this._paginator,
            this._sort,
            "",
        );
        // filterReq['agent_id'] = this.record?.editData?.agentid ? this.record?.editData?.agentid : "",
        filterReq['Id'] = this.record?.editData?.product_id ? this.record?.editData?.id : ""
        this.crmService.getProductInfoList(filterReq).subscribe({
            next: (res) => {
                this.productList = res[0];
                if (this.record?.editData?.id) {
                    this.formGroup.patchValue(res?.[0]);
                    this.formGroup.get("product").patchValue(res?.[0]?.product_name);
                    this.formGroup.get('price').patchValue(res?.[0]?.purchase_amount);
                    this.formGroup.get('rm_remark').patchValue(res?.[0]?.rm_remark);
                    this.formGroup.get('installments').patchValue(res?.[0]?.installmentCount);
                    this.selectedMaxInstallment = res?.[0]?.max_installment;
                    this.installmentsArray = res?.[0]?.installment?.map(x => ({ installment_amount: x.installment_amount, installment_date: x.installment_date }));
                    this.productId = res?.[0]?.productid;
                    this.productPurchaseMasterId = res?.[0]?.id1;
                }
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
            },
        });
    }

    public compareWith(v1: any, v2: any) {
        return v1 && v2 && v1.id === v2.id;
    }

    patchInstallments(installments): void {
        this.formGroup.setControl('installmentsArray', this.formBuilder.array([]));
        this.installmentsArray = installments;
        installments.forEach((installment, index) => {
            this.formGroup.addControl(`date${index}`, this.formBuilder.control(new Date(installment.installment_date), Validators.required));
            this.formGroup.addControl(`amount${index}`, this.formBuilder.control(installment.installment_amount, Validators.required));
        });
    }

    submit(): void {
        if (this.readonly) {
            this.router.navigate([this.leadListRoute]);
            return;
        }

        let totalAmount = 0;
        this.installmentsArray.forEach(installment => {
            totalAmount += installment.installment_amount;
        });


        const price = parseFloat(this.formGroup.get("price").value);
        // if (price != 0 && totalAmount != 0 ) {
        if (totalAmount !== price) {
            this.alertService.showToast('error', 'Product price and total installment amount are not the same.', 'top-right', true);
            return;
        }
        // }

        const json = this.formGroup.getRawValue();
        const newJson = {
            agent_id: this.record?.agentid ? this.record?.agentid : this.record?.editData?.agentid,
            id: this.productPurchaseMasterId ? this.productPurchaseMasterId : "",
            product_id: this.productId ? this.productId : "",
            purchase_amount: json?.price,
            max_installment: json?.installments,
            installmentArr: this.installmentsArray,
            rm_remark: json.rm_remark
        };

        if (this.formGroup.get("price").value != "" && totalAmount != 0 && this.validateDates() == true) {
            this.crmService.createPurchaseProduct(newJson).subscribe({
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

    validateDates() {
        const dates = this.installmentsArray.map(installment => new Date(installment.installment_date));
        for (let i = 0; i < dates.length - 1; i++) {
            const currentDate = dates[i];
            const nextDate = dates[i + 1];
            if (currentDate >= nextDate) {
                this.alertService.showToast('error', 'Please choose second installment date is greater than first installment date.', 'top-right', true);
                return false;
            }
        }
        return true;
    }

    getMinDate(index: number): Date | null {
        if (index === 0) {
            return this.todayDateTime;
        }
        const previousInstallmentDate = this.installmentsArray[index - 1]?.installment_date;
        if (!previousInstallmentDate) {
            return null;
        }
        const minDate = new Date(previousInstallmentDate);
        minDate.setDate(minDate.getDate() + 1);
        return minDate;
    }

    dateSet(installment: any, i: any) {
        const todayDate = new Date(installment.installment_date);
        todayDate.setDate(todayDate.getDate() + 1);
        if (this.installmentsArray && this.installmentsArray[i + 1]) {
            this.installmentsArray[i + 1].maxDate = todayDate;
        }
    }

    getMaxDate(index: number) {
        if (index == 0)
            return this.todayDateTime
        else {
            let maxDate = new Date(this.installmentsArray[index - 1].installment_date.toString())
            maxDate.setDate(maxDate.getDate() + 1)
            return maxDate
        }
    }
}
