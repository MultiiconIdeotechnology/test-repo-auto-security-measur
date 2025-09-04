import { CdkDropList, CdkDrag, CdkDragPreview, CdkDragHandle } from '@angular/cdk/drag-drop';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { FuseConfig, FuseConfigService } from '@fuse/services/config';
import { Routes } from 'app/common/const';
import { CrmService } from 'app/services/crm.service';
import { EntityService } from 'app/services/entity.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'installment-right',
    templateUrl: './installment-right.component.html',
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
        MatOptionModule]
})
export class InstallmentRightComponent implements OnInit, OnDestroy {
    config: FuseConfig;
    title = "Edit Installment";
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    @ViewChild('settingsDrawer') public settingsDrawer: MatSidenav;

    readonly: boolean = false;
    record: any = {};
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

    constructor(
        private _fuseConfigService: FuseConfigService,
        private entityService: EntityService,
        public formBuilder: FormBuilder,
        public router: Router,
        public route: ActivatedRoute,
        public alertService: ToasterService,
        private crmService: CrmService,
    ) {
        this.entityService.onInstallmentCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                this.settingsDrawer.toggle();
                this.record = item ?? {}
                if (item?.edit) {
                    this.record = item?.data ?? {}
                    this.formGroup.get('installment_date').patchValue(this.record?.installment_date);
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
            installment_date: ['', Validators.required]
        });
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

        // if (this.readonly) {
        //     this.router.navigate([this.leadListRoute]);
        //     return;
        // }
        const json = this.formGroup.getRawValue();

        const newJson = {
            id: this.record?.id ? this.record?.id : "",
            NewInstallmentDate: json?.installment_date ? json?.installment_date : ""
        }

        this.disableBtn = true;
        this.crmService.updateInstallment(newJson).subscribe({
            next: () => {
                this.router.navigate([this.leadListRoute]);
                this.disableBtn = false;
                this.entityService.raiserefreshInstallmentCall(true);
                this.settingsDrawer.close()
                this.alertService.showToast('success', 'Record modified', 'top-right', true);
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.disableBtn = false;
            },
        });
    }
}
