// import { MasterService } from './../services/master.service';
import { Component, OnInit, ViewChild, ElementRef, Inject, HostListener, signal } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { AppConfig } from "app/config/app-config";
import { AuthService } from "app/core/auth/auth.service";
// import { AlertService } from "app/services/alert.service";
import { GridUtils } from "app/utils/grid/gridUtils";
// import { Linq } from "app/utils/linq";
import { FilterRequest } from "app/_model/grid/filterRequest";
import { Subject } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";
// import { Security } from "app/security";
import { FormControl } from "@angular/forms";
import { MasterService } from "app/services/master.service";
import { ReflectionInjector } from "app/injector/reflection-injector";
import { Pdf } from "app/utils/export/pdf";
import { Excel } from "app/utils/export/excel";
import { ToasterService } from "app/services/toaster.service";
import { Security, messages } from "app/security";
import { LazyLoadEvent } from "primeng/api";
import { Table } from "primeng/table";
import { CommonFilterService } from "app/core/common-filter/common-filter.service";

export interface Column {
    field: string;
    header: string;
}

@Component({
    template: '',
})

export abstract class BaseListingComponent implements OnInit {

    //#region View Childs
    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('importFileDialog')
    importFileDialog: ElementRef;

    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sort: MatSort;

    @ViewChild('datatable') public primengTable: Table;

    public key: any;
    public sortColumn: any;
    public sortDirection: any;

    Mainmodule: any;

    isLoading = false;
    totalRecords: number = 0;
    tablesTotal: any;
    scrollHeight: string;
    scrollHeightWTab: string;
    //#endregion
    frozenObj: any = {};
     // for Date dropdown custom logic
    selectionMap = signal<Record<string, string>>({});

    protected masterService: MasterService;
    protected alertService: ToasterService;
    protected authService: AuthService;
    protected commonFilterService: CommonFilterService;
    searchInputControl = new FormControl('');

    protected dataColumns: IDataColumn[];
    protected currentSort: Sort;

    public _unsubscribeAll: Subject<any> = new Subject<any>();
    public reportTitle: string;
    public appConfig = AppConfig;
    public displayColumns = [];
    public dataSource = new MatTableDataSource<any[]>();

    constructor(
        @Inject(String) public module: string,
    ) {
        this.authService = ReflectionInjector.get(AuthService);
        this.masterService = ReflectionInjector.get(MasterService);
        this.alertService = ReflectionInjector.get(ToasterService);
        this.commonFilterService = ReflectionInjector.get(CommonFilterService);
        
        this.updateScrollHeight();
    }

    ngOnInit(): void {

    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        this.updateScrollHeight();
    }

    updateScrollHeight() {
        const headerHeight = 40; // Assuming header height is 56px, adjust as necessary
        const paginatorHeight = 20; // Assuming paginator height is 40px, adjust as necessary
        const headerTabHeight = 58;
        const availableHeight = window.innerHeight - headerHeight - paginatorHeight - 80; // Adjust the 100px padding as necessary
        this.scrollHeight = availableHeight + 'px';
        this.scrollHeightWTab = (availableHeight - headerTabHeight) + 'px';
    }

    ngAfterViewInit(): void {
        setTimeout(() => {

            const qw = this.masterService.getData(this.key, this.Mainmodule);
            if (!qw) {
                if (this._sort) {
                    this._sort.sort({
                        id: this.sortColumn,
                        start: this.sortDirection,
                        disableClear: true,
                    });
                }
            }

            // this.searchInputControl.valueChanges
            //     .pipe(
            //         takeUntil(this._unsubscribeAll),
            //         debounceTime(AppConfig.searchDelay)
            //     )
            //     .subscribe(() => {
            //         GridUtils.resetPaginator(this._paginator);
            //         this.refreshItems();
            //     });
        });

        document.addEventListener('scroll', this.preventScrollClose, true);
    }

    // To prevent the closing of filter dropdown on scroll
    preventScrollClose = (event: Event) => {
        const datepicker = document.querySelector('.p-datepicker');
        const pOverlay = document.querySelector('.p-overlay')
        if (datepicker || pOverlay) {
            event.stopPropagation();
        }
    };

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    onInit(): void {

    }

    resetPrimengTable(){
        this.primengTable?.reset();
    }

    //#region Protected Methods
    protected handleDialogRef<T>(dialogRef: MatDialogRef<T>): void {
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.refreshItems();
            }
        });
    }

    //#endregion


    // Table Frozen Column
    isFrozenColumn(key: any, opetion?: any, noData?: any) {
        if (key) {
            if (this.frozenObj && this.frozenObj[key]) {
                this.frozenObj[key] = !this.frozenObj[key];
            } else {
                this.frozenObj[key] = true;
            }
        }
        if (opetion && opetion.length) {
            if (noData) {
                opetion.filter((field: any) => this.frozenObj[field] = false);
            } else {
                opetion.every((field: any) => this.frozenObj[field] = true);
            }
        }
    }
    // ###

    //#region Public Methods

    public setDataColumns(columns: IDataColumn[]): void {
        this.dataColumns = columns;
        this.displayColumns = columns.map(col => col.name);
    }

    public sortData(sort: Sort): void {
        this.currentSort = sort;
        this.refreshItems();
    }

    public refreshItems(): void {
    }

    //#endregion

    //#region Filter Request Methods

    public getFilterReq(): any {
        const filterReq = GridUtils.GetFilterReq(
            this.paginator,
            this.sort,
            this.searchInputControl.value,
            this.sortColumn,
            (this.sortDirection === 'desc' ? 1 : 0)
        );

        return filterReq;
    }

    // Primeng Filter  Request Methods
    public getNewFilterReq(event: LazyLoadEvent): any {
        const filterReq = GridUtils.GetPrimeNGFilterReq(
            event,
            this.primengTable,
            (this.commonFilterService?.activeFiltData || {}),
            this.searchInputControl.value,
            this.sortColumn,
            (this.sortDirection === 'desc' ? 1 : 0)
        );
        return filterReq;
    }

    public getExportFilterReq(): FilterRequest {
        const filterReq = this.getFilterReq();

        filterReq.Skip = 0;
        filterReq.Take = this.paginator.length;

        return filterReq;
    }

    public getExportFilterReqPermissioned(): FilterRequest {
        const filterReq = this.getFilterReq();

        filterReq.Skip = 0;
        filterReq.Take = this.paginator.length;

        return filterReq;
    }

    //#endregion

    //#region New Entry

    public create(model?: any): void {
        if (!Security.hasNewEntryPermission(this.module)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.createInternal(model);
    }

    protected createInternal(model: any): void {
    }

    //#endregion

    //#region Edit Entry

    public edit(model?: any): void {
        if (!Security.hasEditEntryPermission(this.module)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.editInternal(model);
    }

    protected editInternal(model: any): void {
    }

    //#endregion

    //#region View Detail Entry

    public view(model?: any): void {
        if (!Security.hasViewDetailPermission(this.module)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.viewInternal(model);
    }

    protected viewInternal(model: any): void {
    }

    //#endregion

    //#region Delete Entry

    public delete(model?: any, index?:number): void {
        if (!Security.hasDeleteEntryPermission(this.module)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.deleteInternal(model, index);
    }

    protected deleteInternal(model: any, index?:number): void {
    }

    //#endregion

    //#region Import Data

    public importData(model?: any): void {
        // if (!Security.hasImportDataPermission(this.module)) {
        //     this.alertService.error('Permission Denied.');
        //     return;
        // }

        this.importDataInternal(model);
    }

    protected importDataInternal(model?: any): void {
        if (this.importFileDialog) {
            this.importFileDialog.nativeElement.click();
        }
    }

    public exportDataExcel(model?: ExportDataModel): void {
        // if (!Security.hasExportDataPermission(this.module)) {
        //     this.alertService.error('Permission Denied.');
        //     return;
        // }

        this.exportDataExcelInternal(model);
    }

    protected exportDataExcelInternal(model: ExportDataModel): void {
        if (!model || !model.data) {
            console.warn('Export Model or Export Model Data is undefined');
            return;
        }

        Excel.export(
            this.reportTitle || this.module,
            this.dataColumns.filter(c => c.isExportable !== false).map(c => ({ header: c.displayName || c.propertyName, property: c.propertyName })),
            model.data);
    }

    //#endregion

    //#region Export Data PDF

    public exportDataPdf(model?: ExportDataModel): void {
        // if (!Security.hasExportDataPermission(this.module)) {
        //     this.alertService.error('Permission Denied.');
        //     return;
        // }

        this.exportDataPdfInternal(model);
    }

    protected exportDataPdfInternal(model: ExportDataModel): void {
        if (!model || !model.data) {
            console.warn('Export Model or Export Model Data is undefined');
            return;
        }

        Pdf.export(
            this.reportTitle || this.module,
            this.dataColumns.filter(c => c.isExportable !== false).map(c => ({ header: c.displayName || c.propertyName, property: c.propertyName })),
            model.data);
    }

    // Primeng Date Range Change
    onDateRangeChange(dates: Date[], filter: Function) {
        if (dates && dates.length === 2 && dates[0] && dates[1]) {
            const [startDate, endDate] = dates;

            const adjustedStartDate = new Date(startDate);
            adjustedStartDate.setHours(0, 0, 0, 0);

            const adjustedEndDate = new Date(endDate);
            adjustedEndDate.setHours(23, 59, 59, 999);

            filter([adjustedStartDate, adjustedEndDate]);
        } 
    }
}

export interface IDataColumn {
    propertyName: string;
    displayName?: string;
    isExportable?: boolean;
    isSortable?: boolean;
    defaultSort?: boolean;
    [key: string]: any;
}

export interface ExportDataModel {
    data: any[];
    [key: string]: any;
}
