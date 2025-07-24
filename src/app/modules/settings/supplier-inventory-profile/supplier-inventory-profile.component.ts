import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent, Column, Types } from 'app/form-models/base-listing';
import { filter_module_name, messages, module_name, Security } from 'app/security';
import { ItemService } from 'app/services/item.service';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { MatDividerModule } from '@angular/material/divider';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
import { SupplierInventoryProfileEntryComponent } from './supplier-inventory-profile-entry/supplier-inventory-profile-entry.component';
import { SupplierInventoryProfileService } from 'app/services/supplier-inventory-profile.service';

@Component({
  selector: 'app-supplier-inventory-profile',
  templateUrl: './supplier-inventory-profile.component.html',
  styleUrls: ['./supplier-inventory-profile.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    PrimeNgImportsModule,
    MatDividerModule,
    SupplierInventoryProfileEntryComponent
  ],
})
export class SupplierInventoryProfileComponent extends BaseListingComponent {

  module_name = module_name.supplierinventoryprofile;
  filter_table_name = filter_module_name.supplier_inventory_profile;
  private settingsUpdatedSubscription: Subscription;
  dataList = [];
  total = 0;
  isFilterShow: boolean = false;

  selectedColumns: Column[] = [];
  types = Types;
  cols = [];

  actionList: any[] = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ]

  constructor(
    private supplierInventoryProfileService: SupplierInventoryProfileService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    public _filterService: CommonFilterService,
    private sidebarDialogService: SidebarCustomModalService,
  ) {
    super(module_name.supplierinventoryprofile)
    this.key = this.module_name;
    this.sortColumn = 'entry_date_time';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);

    this.selectedColumns = [
      { field: 'profile_name', header: 'Profile Name', type: Types.text },
      { field: 'entry_date_time', header: 'Created Date', type: Types.dateTime, dateFormat: 'dd-MM-yyyy' },
    ];

    this.cols.unshift(...this.selectedColumns);
  }

  ngOnInit(): void {
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
      // this.sortColumn = resp['sortColumn'];
      // this.primengTable['_sortField'] = resp['sortColumn'];
      if (resp['table_config']['entry_date_time'].value) {
        resp['table_config']['entry_date_time'].value = new Date(resp['table_config']['entry_date_time'].value);
      }
      this.primengTable['filters'] = resp['table_config'];
      this.isFilterShow = true;
      this.selectedColumns = this.checkSelectedColumn(resp['selectedColumns'] || [], this.selectedColumns);
      this.primengTable._filter();
    });
  }

  ngAfterViewInit() {
    // Defult Active filter show
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      this.isFilterShow = true;
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
      if (filterData['table_config']['entry_date_time'].value) {
        filterData['table_config']['entry_date_time'].value = new Date(filterData['table_config']['entry_date_time'].value);
      }
      this.primengTable['filters'] = filterData['table_config'];
      this.selectedColumns = this.checkSelectedColumn(filterData['selectedColumns'] || [], this.selectedColumns);
      this.onSelectedColumnsChange();

      // this.primengTable._filter();
    } else {
      this.selectedColumns = this.checkSelectedColumn([], this.selectedColumns);
      this.onSelectedColumnsChange();
    }
  }

  isDisplayHashCol(): boolean {
    return this.selectedColumns.length > 0;
  }

  getDisplayedColumns(): Column[] {
    return this.selectedColumns;
  }

  //check hidden-filter-column
  checkSelectedColumn(col: any[], oldCol: Column[]): any[] {
    if (col.length) return col
    else {
      var Col = this._filterService.getSelectedColumns({ name: this.filter_table_name })?.columns || [];
      if (!Col.length)
        return oldCol;
      else
        return Col;
    }
  }

  //save common-filter-column
  onSelectedColumnsChange(): void {
    this._filterService.setSelectedColumns({ name: this.filter_table_name, columns: this.selectedColumns });
  }

  displayColCount(): number {
    return this.selectedColumns.length + 1;
  }

  refreshItems(event?: any): void {
    this.isLoading = true;

    this.supplierInventoryProfileService.getSupplierInventoryProfileList(this.getNewFilterReq(event)).subscribe({
      next: data => {
        this.isLoading = false;
        this.dataList = data.data;
        this.totalRecords = data.total;
      }, error: err => {
        this.alertService.showToast('error', err, 'top-right', true)
        this.isLoading = false;
      }
    })

  }

  createSupplierProfile(): void {
    if (!Security.hasNewEntryPermission(module_name.supplierinventoryprofile)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    this.sidebarDialogService.openModal('create', null)
  }



  edit(record): void {
    if (!Security.hasEditEntryPermission(module_name.supplierinventoryprofile)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    this.sidebarDialogService.openModal('edit', record)
  }


  // deleteInternal(record): void {
  //   const label: string = 'Delete Item'
  //   this.conformationService.open({
  //     title: label,
  //     message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.item_name + ' ?'
  //   }).afterClosed().subscribe(res => {
  //     if (res === 'confirmed') {
  //       this.itemService.delete(record.id).subscribe({
  //         next: () => {
  //           this.alertService.showToast('success', "Item has been deleted!", "top-right", true);
  //           this.refreshItems();
  //         }, error: (err) => {
  //           this.alertService.showToast('error', err, 'top-right', true);
  //         }
  //       })
  //     }
  //   })
  // }


  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

  ngOnDestroy(): void {
    // this.masterService.setData(this.key, this)

    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }

}