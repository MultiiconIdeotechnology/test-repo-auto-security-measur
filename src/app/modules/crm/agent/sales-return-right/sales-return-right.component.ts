import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenav } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { Routes } from 'app/common/const';
import { CrmService } from 'app/services/crm.service';
import { EntityService } from 'app/services/entity.service';
import { ToasterService } from 'app/services/toaster.service';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-crm-sales-return-right',
    templateUrl: './sales-return-right.component.html',
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
        NgxMatSelectSearchModule,
        MatDatepickerModule,
        MatMenuModule,
        NgxMatSelectSearchModule,
        NgxMatTimepickerModule,
        RouterLink,
        RouterOutlet,
        CommonModule
    ]
})
export class CRMSalesReturnRightComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    @ViewChild('settingsDrawer') public settingsDrawer: MatSidenav;
    title = "Sales Return";
    readonly: boolean = false;
    record: any = {};
    leadListRoute = Routes.crm.agents_route;
    disableBtn: boolean = false;
    formGroup: FormGroup;
    btnLabel = "Submit";
    todayDateTime = new Date();
    @Input() salesReturnDetail: any;

    ngOnInit(): void {
        this.formGroup = this.formBuilder.group({
            id: [''],
            sales_return_amount: ['', Validators.required],
            sales_retrun_date: ['', Validators.required],
            sales_retrun_remark: ['', Validators.required]
        });
    }

    constructor(
        private entityService: EntityService,
        public formBuilder: FormBuilder,
        public router: Router,
        public alertService: ToasterService,
        private crmService: CrmService,
    ) {
        this.entityService.onCRMSalesReturnCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                this.settingsDrawer?.toggle();
                this.record = item?.data ?? {}
                if (item?.add) {
                    this.formGroup = this.formBuilder.group({
                        id: "",
                        sales_return_amount: "",
                        sales_retrun_date: "",
                        sales_retrun_remark: ""
                    });
                }

                const luxonDate = DateTime.fromJSDate(this.todayDateTime).toISODate();
                this.formGroup.get('sales_retrun_date').patchValue(luxonDate);
                this.formGroup.get('sales_return_amount').patchValue(this.record?.default_sales_Amount);
            }
        })
    }

    numberOnly(event): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
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
        if (this.readonly) {
            this.router.navigate([this.leadListRoute]);
            return;
        }

        const json = this.formGroup.getRawValue();

        // sales_return_amount: json?.sales_return_amount ? json?.sales_return_amount : "",
        const newJson = {
            id: this.record?.id ? this.record?.id : "",
            is_sales_return: false,
            sales_return_amount: json?.sales_return_amount ? json?.sales_return_amount : this.record?.default_sales_Amount,
            sales_retrun_date: json?.sales_retrun_date ? DateTime.fromISO(json.sales_retrun_date).toFormat('yyyy-MM-dd') : "",
            sales_retrun_remark: json?.sales_retrun_remark ? json?.sales_retrun_remark : ""
        }

        this.crmService.createSalesreturn(newJson).subscribe({
            next: () => {
                this.router.navigate([this.leadListRoute]);
                this.disableBtn = false;
                this.entityService.raiseCRMrefreshSalesReturnCall(true);
                this.settingsDrawer.close()
                this.alertService.showToast('success', 'New record added', 'top-right', true);
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.disableBtn = false;
            },
        });
    }
}
