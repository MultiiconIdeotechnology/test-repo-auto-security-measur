import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AppConfig } from 'app/config/app-config';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { fareTypeMApperPermissions, filter_module_name, messages, module_name, Security } from 'app/security';
import { CommonFareTypeService } from 'app/services/commonFareType.service';
import { GlobalSearchService } from 'app/services/global-search.service';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
  selector: 'app-common-faretype',
  standalone: true,
  imports: [
    PrimeNgImportsModule,
    CommonModule,
    NgIf,
    NgFor,
    NgClass,
    MatButtonModule,
    MatIconModule,
    MatSortModule,
    MatMenuModule,

  ],
  templateUrl: './common-faretype.component.html',
  styleUrls: ['./common-faretype.component.scss']
})
export class CommonFaretypeComponent extends BaseListingComponent {
  @Input() selectedColumns: Column[];
  @Input() isFilterShowCommonFarType: boolean;
  @Output() isFilterShowCommonFarTypeChange = new EventEmitter<boolean>();
  @Input() dropdownFirstCallObj: any;
  @ViewChild('tabGroup') tabGroup;
  @ViewChild(MatPaginator) public _paginator: MatPaginator;
  @ViewChild(MatSort) public _sortInbox: MatSort;

  Mainmodule: any;
  module_name = module_name.fare_type_mapper;
  filter_table_name = filter_module_name.fare_type_mapper_common_fare_type;
  private settingsUpdatedSubscription: Subscription;
  cols = [];
  dataList = [];
  searchInputControlCommonFareType = new FormControl('');
  isLoading = false;
  public _unsubscribeAll: Subject<any> = new Subject<any>();
  public key: any;
  public sortColumn: any;
  public sortDirection: any;
  total = 0;
  appConfig = AppConfig;
  data: any
  filter: any = {}

  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    private commonFareTypeService: CommonFareTypeService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,

    public _filterService: CommonFilterService,
    public globalSearchService: GlobalSearchService,
    private sidebarDialogService: SidebarCustomModalService,
  ) {
    super(module_name.techDashboard);
    this.key = this.module_name;
    this.sortColumn = 'fare_type';
    this.sortDirection = 'asc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  ngOnInit(): void {
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {   
      this.primengTable['filters'] = resp['table_config'];
      this.isFilterShowCommonFarType = true;
      this.isFilterShowCommonFarTypeChange.emit(this.isFilterShowCommonFarType);
      this.primengTable._filter();
    });
    this.sidebarDialogService.onModalChange().pipe((takeUntil(this.destroy$))).subscribe((res: any) => {
      if (res && res.key == 'create-response-fareType') {
        let index = this.dataList.findIndex((item: any) => item.id == res.data.id);
        if (index != -1) {
          this.dataList[index] = res.data;
        } else {
          this.dataList.unshift(res.data);
        }
      }
    })

  }

  ngAfterViewInit() {
    // Defult Active filter show
   if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShowCommonFarType = true;
            this.isFilterShowCommonFarTypeChange.emit(this.isFilterShowCommonFarType);
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);         
            this.primengTable['filters'] = filterData['table_config'];
            // this.primengTable['_sortField'] = filterData['sortColumn'];
            // this.sortColumn = filterData['sortColumn'];
        }
  }

  refreshItems(event?: any): void {
    this.isLoading = true;
    const filterReq = this.getNewFilterReq(event);
    filterReq['Filter'] = this.searchInputControlCommonFareType.value;

    this.commonFareTypeService.getcommonFareTypeList(filterReq).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.dataList = data.data;
        this.totalRecords = data.total;
      },
      error: (err) => {
        this.alertService.showToast('error', err, 'top-right', true);
        this.isLoading = false;
      },
    });
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControlCommonFareType.value)
      return `no search results found for \'${this.searchInputControlCommonFareType.value}\'.`;
    else return 'No data to display';
  }


  viewDetail(record): void {
    // this.matDialog.open(TechInfoTabsComponent, {
    //   data: { data: record, readonly: true },
    //   disableClose: true,
    // });
  }

  editFareType(record: any): void {
    this.sidebarDialogService.openModal('common-fareType-edit', { data: record, title: 'Modify', edit: true });
  }

  deleteFareType(record): void {
    if (!Security.hasPermission(fareTypeMApperPermissions.deleteFareTypePermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    const label: string = 'Delete'
    this.conformationService.open({
      title: label,
      message: `Are you sure you want to delete the ${record.fare_type} ? `
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.commonFareTypeService.delete(record.id).subscribe({
          next: () => {
            this.alertService.showToast('success', "Common Fare Type has been deleted!", "top-right", true);
            this.refreshItems();
          }, error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);
          }
        })
      }
    })
  }

  ngOnDestroy(): void {

    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }
}
