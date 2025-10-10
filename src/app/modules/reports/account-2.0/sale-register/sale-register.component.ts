import { filter_module_name, messages, module_name, Security } from 'app/security';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AppConfig } from 'app/config/app-config';
import { AccountService } from 'app/services/account.service';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { Linq } from 'app/utils/linq';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AmendmentRequestEntryComponent } from 'app/modules/booking/amendment-requests-list/amendment-request-entry/amendment-request-entry.component';
import { SupplierService } from 'app/services/supplier.service';
import { dateRange } from 'app/common/const';
import { CommonUtils } from 'app/utils/commonutils';
import { SaleRegisterBontonComponent } from './sale-register-bonton/sale-register-bonton.component';
import { SaleRegisterDmccComponent } from './sale-register-dmcc/sale-register-dmcc.component';
@Component({
  selector: 'app-sale-register',
  standalone: true,
  imports: [
    DatePipe,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatMenuModule,
    MatDialogModule,
    MatDividerModule,
    MatDatepickerModule,
    FormsModule,
    PrimeNgImportsModule,
    MatTooltipModule,
    MatSelectModule,
    SaleRegisterBontonComponent,
    SaleRegisterDmccComponent,
  ],
  templateUrl: './sale-register.component.html',
  styleUrls: ['./sale-register.component.scss']
})
export class SaleRegisterComponent extends BaseListingComponent
  implements OnDestroy {
  @ViewChild('bontonTable') bontonTableComponent: SaleRegisterBontonComponent;
  @ViewChild('dmccTable') dmccTableComponent: SaleRegisterDmccComponent;

  activeTab: any = 0;
  selectedTableKey: any;
  isFilterShow: boolean = false;
  isLoading: boolean = false;
  subscriptionArr: any[] = [];
  tempActiveTab: any = 0;
  public startDate = new FormControl(new Date());
  public endDate = new FormControl(new Date());
  date: any = new FormControl('');
  dateRangeList = dateRange;
  dateRanges: any;
  isDateChange: boolean = false;
  supplierList: any = [];
  selectedTab = 0;
  lastSearchString: any = {
    bontonFilter: '',
    dmccFilter: ''
  }

  tableTypeList: any = [{ label: 'Bonton', value: 'bonton', index: 0 }, { label: 'Bonton DMCC', value: 'dmcc', index: 1 }];

  tabLoaded: any = {
    isTabOneLoaded: true,
    isTabTwoLoaded: false,
  }

  moduleMap = [
    { module_name: 'sale_register_2', filter_table_name: 'sale_register_bonton', isFiltershow: false },
    { module_name: 'sale_register_2', filter_table_name: 'sale_register_dmcc', isFiltershow: false },
  ];

  currentModule: any = module_name[this.moduleMap[0].module_name];
  currentFilterModule: any = filter_module_name[this.moduleMap[0].filter_table_name];

  constructor(
    private _filterService: CommonFilterService,
    private supplierService: SupplierService,
  ) {
    super('');
    this.dateRanges = CommonUtils.valuesArray(dateRange);
    this.date.patchValue(dateRange.lastWeek);
    this.updateDate(dateRange.lastWeek)
  }

  ngOnInit(): void {
    this.getSupplier("");
    this.selectedTableKey = this.tableTypeList[0];

    this.startDate.valueChanges.subscribe(start => {
      this.isDateChange = true;
    });

    this.endDate.valueChanges.subscribe(end => {
      this.isDateChange = true;
    });
  }

  onTableChange(event: any): void {
    this.selectedTableKey = this.tableTypeList[event.index];
    this.activeTab = event.index;
    const components = [
      this.bontonTableComponent,
      this.dmccTableComponent
    ];

    // manage subscription for saved filter data on tab
    components.forEach((comp, idx) => {
      if (comp) {
        if (idx === this.activeTab) {
          comp.startSubscription();
        } else {
          comp.stopSubscription();
        }
      }
    });


    this.currentModule = module_name[this.moduleMap[this.activeTab].module_name];
    this.currentFilterModule = filter_module_name[this.moduleMap[this.activeTab].filter_table_name];

    if (this.activeTab == 0) {
      this.searchInputControl.patchValue(this.lastSearchString['bontonFilter']);
    } else {
      this.searchInputControl.patchValue(this.lastSearchString['dmccFilter']);
    }
  }

  toggleOverlayPanel(event: MouseEvent) {
    if (this.activeTab === 0 && this.bontonTableComponent) {
      this.bontonTableComponent.toggleOverlayPanel(event);
    } else if (this.activeTab === 1 && this.dmccTableComponent) {
      this.dmccTableComponent.toggleOverlayPanel(event);
    }
  }

  onRefreshCall() {
    if (this.activeTab == 0) {
      this.selectedTab = 0;
      if (this.bontonTableComponent) {
        this.bontonTableComponent.refreshItems();
      }
    } else if (this.activeTab == 1) {
      // this.tabLoaded.isTabTwoLoaded = true;
      this.selectedTab = 1;
      if (this.dmccTableComponent) {
        this.dmccTableComponent.refreshItems();
      }
    }
  }

  // Global Filter on respective component 
  onGlobalSearch(val: any) {
    if (this.activeTab == 0) {
      this.bontonTableComponent.searchInputControl.patchValue(val);
      this.bontonTableComponent.refreshItems();
    } else if (this.activeTab == 1) {
      this.dmccTableComponent.searchInputControl.patchValue(val);
      this.dmccTableComponent.refreshItems();
    }
  }

  // Global on input change filter
  onInputChange(val: any) {
    if (this.activeTab == 0) {
      this.lastSearchString.bontonFilter = val;  // if global filter needed to save for each component differently then just save the value to only active tab component
      this.lastSearchString.dmccFilter = val;    // remove this one if filter value need to be saved for bonton component
      this.bontonTableComponent.searchInputControl.patchValue(val);
      if (val == '') {
        this.bontonTableComponent.refreshItems();
      }
    } else if (this.activeTab == 1) {
      this.lastSearchString.bontonFilter = val; // remove this line if filter value needed to be saved for dmcc 
      this.lastSearchString.dmccFilter = val;
      this.dmccTableComponent.searchInputControl.patchValue(val);
      if (val == '') {
        this.dmccTableComponent.refreshItems();
      }
    }
  }

  // column filter search 
  onColumnFilter() {
    this.moduleMap[this.activeTab].isFiltershow = !this.moduleMap[this.activeTab].isFiltershow;
  }

  // Refresh Data on respective component
  onRefreshData() {
    if (this.activeTab == 0) {
      this.bontonTableComponent.refreshItems();
    } else if (this.activeTab == 1) {
      this.dmccTableComponent.refreshItems();
    }
  }

  // saved filter on respective component
  onSaveFilter() {
    if (this.activeTab == 0) {
      this._filterService.openDrawer(this.currentFilterModule, this.bontonTableComponent.primengTable);;
    } else if (this.activeTab == 1) {
      this._filterService.openDrawer(this.currentFilterModule, this.dmccTableComponent.primengTable);;
    }
  }

  // export excel on respective component
  exportExcel() {
    if (this.activeTab == 0) {
      this.bontonTableComponent.exportExcel();
    } else if (this.activeTab == 1) {
      this.dmccTableComponent.exportExcel();
    }
  }


  getSupplier(value: string) {
    this.supplierService.getSupplierCombo(value, '').subscribe((data) => {
      this.supplierList = data;

      for (let i in this.supplierList) {
        this.supplierList[i].id_by_value = this.supplierList[i].company_name;
      }
    });
  }


  public updateDate(event: any): void {
    let start: Date;
    let end: Date;

    const today = new Date();

    switch (event) {
      case dateRange.today:
        start = new Date(today);
        end = new Date(today);
        break;

      case dateRange.last3Days:
        start = new Date(today);
        start.setDate(start.getDate() - 3);
        end = new Date(today);
        break;

      case dateRange.lastWeek:
        const dow = today.getDay(); // 0 (Sun) to 6 (Sat)
        const offset = dow === 0 ? 6 : dow - 1;
        start = new Date(today);
        start.setDate(today.getDate() - offset);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;

      case dateRange.lastMonth:
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0); // last day of last month
        break;

      case dateRange.last3Month:
        start = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        end = new Date(today);
        break;

      case dateRange.last6Month:
        start = new Date(today.getFullYear(), today.getMonth() - 6, 1);
        end = new Date(today);
        break;

      case dateRange.setCustomDate:
        // Do not patch anything — user will select manually
        return;
    }

    this.startDate.patchValue(start);
    this.endDate.patchValue(end);
  }

  cancleDate() {
    this.date.patchValue('Today');
    this.updateDate(dateRange.today);
  }
}
