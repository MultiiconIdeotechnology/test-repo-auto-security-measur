import { CdkDropList, CdkDrag, CdkDragPreview, CdkDragHandle } from '@angular/cdk/drag-drop';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { OnlyFloatDirective } from '@fuse/directives/floatvalue.directive';
import { Routes } from 'app/common/const';
import { JsonFile } from 'app/common/jsonFile';
import { UserService } from 'app/core/user/user.service';
import { CityService } from 'app/services/city.service';
import { CrmService } from 'app/services/crm.service';
import { DesignationService } from 'app/services/designation.service';
import { EntityService } from 'app/services/entity.service';
import { ToasterService } from 'app/services/toaster.service';
import { DocValidationDTO, CommonUtils } from 'app/utils/commonutils';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { Subject, takeUntil } from 'rxjs';


@Component({
    selector: 'purchase-product-entry-settings',
    templateUrl: './purchase-product-entry-settings.component.html',
    standalone: true,
    imports: [
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
        MatCheckboxModule,
        MatSidenavModule,
        CdkDropList,
        CdkDrag,
        CdkDragPreview,
        CdkDragHandle,
        RouterLink,
        FuseDrawerComponent,
        MatDividerModule,
        CommonModule,
        MatDatepickerModule,
        MatMenuModule,
        NgxMatSelectSearchModule,
        NgxMatTimepickerModule,
        OnlyFloatDirective
    ]
})
export class PurchaseProductEntrySettingsComponent implements OnInit, OnDestroy {
    @Input('agentId') agentId:any;
    @Input() currencySymbol:any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    @ViewChild('settingsDrawer') public settingsDrawer: MatSidenav;
    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sort: MatSort;

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
    dateBeforeAllow: Date;
    installmentList: number[] = [];
    selectedMaxInstallment: any;
    user: any;
    dataList = [];
    searchInputControl = new FormControl('');
    productDetail: any;
    productPurchaseMasterId: any;
    productId: any;
    productList: any[] = [];
    filteredProducts: any[] = [];
    isProductInitialChanged: boolean = false;
    fieldList: {};
    isEditFlag: any = {};
    editLeadId: any;
    addAgentId: any;
    editAgentId: any;
    addFlag: any;
    editFlag: any;
    productPrice: any;
    proofAttachment: any = false;
    editproofAttachmentSelectedFile: any;
    proofAttachmentSelectedFile: any = File;
    proofAttachjFile: JsonFile;
    proofAttachmentFlag: boolean = false;
    lowPriceFlag: boolean = false;
    searchCtrl = this.builder.control('');
    // currencySymbol:any;
    
    constructor(
        public builder: FormBuilder,
        public cityService: CityService,
        public router: Router,
        public route: ActivatedRoute,
        public designationService: DesignationService,
        public crmService: CrmService,
        public entityService: EntityService,
        public alertService: ToasterService,
        private _userService: UserService,
        // @Inject(MAT_DIALOG_DATA) public data: any = {},
        // @Inject(MAT_DIALOG_DATA) public editFlag: any = {}
    ) {
        this.dateBeforeAllow = this.calculateDateBeforeDays(0);
        // this.isEditFlag = this.isEditFlag?.editFlag;
        // this.record = data?.data ?? {}
        this.formGroup = this.builder.group({
            product: ['', Validators.required],
            rm_remark: [''],
            id: [''],
            price: ['', Validators.required],
            installments: ['', Validators.required],
            // installmentsArray: this.formBuilder.array([])
            installmentsArray: [[]],
            proofAttachment: ['']
        });

        this.entityService.onproductPurchaseCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                this.settingsDrawer?.toggle()
                if (item) {
                    if (item?.addFlag) {
                        this.addAgentId = item?.data.agentid;
                        this.addFlag = item?.addFlag;
                    }

                    // pending installmentsArray
                    this.formGroup.patchValue({
                        product: "",
                        rm_remark: "",
                        id: "",
                        price: "",
                        installments: "",
                    });
                    this.installmentsArray = [];

                    this.proofAttachmentSelectedFile = {};
                    this.editproofAttachmentSelectedFile = "";

                    this.proofAttachment = false;
                    if (item?.editFlag) {
                        if (item?.editData?.proof_attachment) {
                            this.proofAttachment = true;
                        }
                        this.editAgentId = item?.editData?.agentid;
                        this.editRecord = item?.editData ?? {}

                        this.editproofAttachmentSelectedFile = this.editRecord?.proof_attachment_file;
                    }

                    this.record = item ?? {}
                    if (!item?.editFlag) {
                        this.proofAttachment = false;
                        // this.getProducts();
                        
                        this.searchCtrl.valueChanges.subscribe((searchTerm) => {
                            if (searchTerm) {
                                this.filteredProducts = this.productList.filter((product) =>
                                    product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
                                );
                            } else {
                                this.filteredProducts = [...this.productList]; // Reset to full list when search is cleared
                            }
                        });
                    }
                    else {
                        this.getProductDetail();
                    }
                }
            }
        })
    }

    ngOnInit(): void {
        this._userService.user$.pipe((takeUntil(this._unsubscribeAll))).subscribe((user: any) => {
            this.user = user;
        });

        if(this.agentId){
            if(this.productList && !this.productList?.length){
                this.getProducts();
            }
        }
    }

    calculateDateBeforeDays(days: number): Date {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date;
    }

    onDateChange(index: number): void {
        if (index > 0) {
            const prevDate = new Date(this.installmentsArray[index - 1].installment_date);
            this.installmentsArray[index].minDate = prevDate;
        }
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

    numberOnly(event): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    onProductSelectionChange(selectedProduct: any): void {
        this.proofAttachment = false;
        this.productDetail = this.productList?.find(x => x.id == selectedProduct);
        this.productId = this.productDetail?.id;
        this.formGroup.get('product').patchValue(this.productDetail?.id);
        this.formGroup.get('price').patchValue(this.productDetail?.one_time_cost);
        this.productPrice = this.productDetail?.one_time_cost;
        this.formGroup.get('installments').patchValue(this.productDetail?.max_installment > 1 ? 1 : this.productDetail?.max_installment);
        this.selectedMaxInstallment = this.productDetail?.max_installment;
        this.isProductInitialChanged = true;
        if (this.isProductInitialChanged) {
            this.onInstallmentsChange(1)
        }
    }

    onPriceChange(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        const newValue = inputElement.value;
        if (this.productPrice > newValue) {
            this.proofAttachment = true;
            if (this.proofAttachmentSelectedFile && this.proofAttachmentSelectedFile?.name) {
                this.lowPriceFlag = false;
            } else {
                this.lowPriceFlag = true;
            }
            // this.formGroup.get('proofAttachment').setValidators(Validators.required);
            // this.formGroup.get('proofAttachment').updateValueAndValidity();
        } else {
            // this.formGroup.get('proofAttachment').clearValidators();
            this.proofAttachment = false;
            this.lowPriceFlag = false;
        }
    }

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
        this.editproofAttachmentSelectedFile = false;
        // this.alertService.showToast('success', 'Payment Attachment file successfully');
        (event.target as HTMLInputElement).value = '';

        if (file) {
            this.proofAttachmentSelectedFile = file;
            this.editproofAttachmentSelectedFile = false;
            this.formGroup.get('proofAttachment').setValue(file);
            this.proofAttachmentFlag = true;
            if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
                this.formGroup.get('proofAttachment').clearValidators();
            }
        } else {
            this.proofAttachmentSelectedFile = null;
        }
        this.lowPriceFlag = false;
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
            this.formGroup.addControl(`date${index}`, this.builder.control(item.date, Validators.required));
            this.formGroup.addControl(`amount${index}`, this.builder.control(item.amount, Validators.required));
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
        this.productPurchaseMasterId = ""
        this.crmService.getProductNameList({AgentId :this.agentId}).subscribe({
            next: (data) => {
                this.productList = data;
                this.filteredProducts = [...this.productList]; // Initialize filtered list
                if (this.record?.id1) {
                    this.formGroup.patchValue(this.record);
                    this.formGroup.get("product").patchValue(this.record?.product_id);
                    this.formGroup.get('price').patchValue(this.record?.purchase_amount);
                    this.formGroup.get('installments').patchValue(this.record?.count);
                    this.selectedMaxInstallment = this.record?.max_installment;
                    if (this.record && this.record.installment) {
                        this.patchInstallments(this.record.installment);
                    }
                    this.productPurchaseMasterId = "";
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
                    this.productPurchaseMasterId = res?.[0]?.id;
                }
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
            },
        });
    }

    patchInstallments(installments): void {
        this.formGroup.setControl('installmentsArray', this.builder.array([]));
        this.installmentsArray = installments;
        installments.forEach((installment, index) => {
            this.formGroup.addControl(`date${index}`, this.builder.control(new Date(installment.installment_date), Validators.required));
            this.formGroup.addControl(`amount${index}`, this.builder.control(installment.installment_amount, Validators.required));
        });
    }

    submit(): void {
        if (this.readonly) {
            this.router.navigate([this.leadListRoute]);
            return;
        }
        this.disableBtn = true;

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

        // agent_id: this.record?.agentid ? this.record?.agentid : this.record?.editData?.agentid,

        // if (!json.proofAttachment) {
        //     this.disableBtn = false;
        //     this.alertService.showToast('error', 'Proof Attachment is required.')
        //     return;
        // }

        if (!this.proofAttachjFile) {
            json.proof_attachment = {
                fileName: '',
                fileType: '',
                base64: '',
            };
        } else {
            json.proof_attachment = this.proofAttachjFile
        }

        // if (!this.record) {
        //     if (json.proof_attachment == null || !json.proof_attachment.fileName) {
        //         this.disableBtn = false;
        //         this.alertService.showToast('error', 'Proof Attachment is required.')
        //         return;
        //     }
        // }

        const newJson = {
            agent_id: this.addFlag ? this.addAgentId : this.editAgentId,
            id: this.productPurchaseMasterId ? this.productPurchaseMasterId : "",
            product_id: this.productId ? this.productId : "",
            purchase_amount: json?.price,
            max_installment: json?.installments,
            installmentArr: this.installmentsArray,
            rm_remark: json.rm_remark,
            proof_attachment: json.proof_attachment
        };

        // if (this.formGroup.get("price").value != "" && totalAmount != 0 && this.validateDates() == true) {
        if (this.validateDates() == true) {
            this.crmService.createPurchaseProduct(newJson).subscribe({
                next: () => {
                    this.router.navigate([this.leadListRoute]);
                    this.disableBtn = false;
                    this.entityService.raiserefreshproductPurchaseCall(true);
                    this.settingsDrawer.close();
                    this.productPurchaseMasterId = ""
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
            return this.dateBeforeAllow;
            // return this.todayDateTime;
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
            return this.dateBeforeAllow;
        // return this.todayDateTime
        else {
            let maxDate = new Date(this.installmentsArray[index - 1].installment_date.toString())
            maxDate.setDate(maxDate.getDate() + 1)
            return maxDate
        }
    }

    public compareWith(v1: any, v2: any) {
        return v1 && v2 && v1 === v2;
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
