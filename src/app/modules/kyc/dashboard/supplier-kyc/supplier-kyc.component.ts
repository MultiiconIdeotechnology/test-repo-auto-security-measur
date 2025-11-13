import { Component, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { BaseListingComponent, Column, Types } from 'app/form-models/base-listing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { MainComponent } from '../main/main.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { module_name } from 'app/security';
import { EmployeeService } from 'app/services/employee.service';
import { KycDashboardService } from 'app/services/kyc-dashboard.service';
import { KycService } from 'app/services/kyc.service';
import { Subscription } from 'rxjs';
import { EntityService } from 'app/services/entity.service';
import { SupplierKycInfoComponent } from './supplier-kyc-info/supplier-kyc-info.component';
import { KycInfoComponent } from 'app/modules/masters/agent/kyc-info/kyc-info.component';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-supplier-kyc',
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
    MatFormFieldModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule,
    CommonModule,
    NgClass,
    RouterOutlet,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    PrimeNgImportsModule,
    MainComponent,
    SupplierKycInfoComponent
  ],
  templateUrl: './supplier-kyc.component.html',
  styleUrls: ['./supplier-kyc.component.scss']
})
export class SupplierKycComponent extends BaseListingComponent implements OnDestroy {

  module_name = module_name.supplier_kyc;
  total = 0;
  dataList = [];
  kycProfileList: any[] = [];

  types = Types;
  cols: Column[] = [
    { field: 'contact_person_name', header: 'Contact Person', type: Types.text },
  ];
  selectedColumns: Column[] = [];
  exportCol: Column[] = [];
  activeFiltData: any = {};


  statusList = [
    { label: 'Rejected', value: true },
    { label: 'Pending', value: false }
  ];


  private settingsUpdatedSubscription: Subscription;
  isFilterShow: boolean = false;


  constructor(
    private kycDashboardService: KycDashboardService,
    private kycService: KycService,
    private conformationService: FuseConfirmationService,
    private entityService: EntityService,
    private employeeService: EmployeeService,
    private matDialog: MatDialog,
    public _filterService: CommonFilterService
  ) {
    super(module_name.supplier_kyc)
    this.key = this.module_name;
    this.sortColumn = 'entry_date_time';
    this.sortDirection = 'desc';
    this.Mainmodule = this;

    this.selectedColumns = [
      { field: 'company_name', header: 'Supplier', type:Types.text },
      { field: 'profile_name', header: 'KYC Profile', type:Types.select },
      { field: 'email_address', header: 'Email', type:Types.text },
      { field: 'mobile_number', header: 'Mobile', type:Types.text },
      { field: 'city_name', header: 'City', type:Types.text },
      { field: 'entry_date_time', header: 'Date', type: Types.date, dateFormat: 'dd-MM-yyyy HH:mm:ss' },
      { field: 'update_date_time', header: 'Update Date', type: Types.date, dateFormat: 'dd-MM-yyyy HH:mm:ss' },
      { field: 'is_rejected', header: 'Status', type:Types.select }
    ];
    this.cols.unshift(...this.selectedColumns);
    this.exportCol = cloneDeep(this.cols);
  }

  ngOnInit(): void {
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
      this.primengTable['filters'] = resp['table_config'];
      this.isFilterShow = true;
      this.selectedColumns = this.checkSelectedColumn(resp['selectedColumns'] || [], this.selectedColumns);
      this.primengTable._filter();
    });

    this.getKycCombo();
  }

  ngAfterViewInit() {
    // Defult Active filter show
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);


      this.primengTable['filters'] = filterData['table_config'];
      this.selectedColumns = filterData['selectedColumns'] || [];
      // this.primengTable['_sortField'] = filterData['sortColumn'];
      // this.sortColumn = filterData['sortColumn'];
      this.isFilterShow = true;
      this.selectedColumns = this.checkSelectedColumn(filterData['selectedColumns'] || [], this.selectedColumns);
      this.onColumnsChange();
    } else {
      this.selectedColumns = this.checkSelectedColumn([], this.selectedColumns);
      this.onColumnsChange();
    }
  }

  onColumnsChange(): void {
    this._filterService.setSelectedColumns({ name: this.module_name, columns: this.selectedColumns });
  }

  checkSelectedColumn(col: any[], oldCol: Column[]): any[] {
    if (col.length) return col;
    else {
      var Col = this._filterService.getSelectedColumns({ name: this.module_name })?.columns || [];
      if (!Col.length)
        return oldCol;
      else
        return Col;
    }
  }

  isDisplayHashCol(): boolean {
    return this.selectedColumns.length > 0;
  }

  onSelectedColumnsChange(): void {
    this._filterService.setSelectedColumns({ name: this.module_name, columns: this.selectedColumns });
  }


  refreshItems(event?: any): void {
    this.isLoading = true;

    const request = this.getNewFilterReq(event)
    // request['Status'] = this.Status.value == 'All' ? '' : this.Status.value;

    this.kycService.getSupplierKycList(request).subscribe({
      next: data => {
        this.isLoading = false;
        this.dataList = data.data;
        this.totalRecords = data.total;
        this.total = data.total;
      }, error: err => {
        this.isLoading = false;
      }
    })
  }

  view(record) {
    this.entityService.raisesupplierKycInfo({ data: record })
  }

  setKYCVerify(record): void {
    // if (!Security.hasPermission(supplierPermissions.viewKYCPermissions)) {
    //     return this.alertService.showToast('error', messages.permissionDenied);
    // }

    this.matDialog.open(KycInfoComponent, {
      data: { record: record, supplier: true, isLead: 'Supplier' },
      disableClose: true
    }).afterClosed().subscribe(res => {

    })
  }

  getKycCombo() {
    this.kycService.getkycprofileCombo('Supplier').subscribe((data) => {
      this.kycProfileList = data;
    })
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }


  // get selectedColumns(): Column[] {
  //   return this._selectedColumns;
  // }

  // set selectedColumns(val: Column[]) {
  //   if (Array.isArray(val)) {
  //     this._selectedColumns = this.cols.filter(col =>
  //       val.some(selectedCol => selectedCol.field === col.field)
  //     );
  //   } else {
  //     this._selectedColumns = [];
  //   }
  // }

  displayColCount(): number {
    return this.selectedColumns.length + 1;
  }


  isValidDate(value: any): boolean {
    const date = new Date(value);
    return value && !isNaN(date.getTime());
  }

}
