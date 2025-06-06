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
import { KycDocumentService } from 'app/services/kyc-document.service';
import { PspSettingService } from 'app/services/psp-setting.service';
import { AgentService } from 'app/services/agent.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { BontonComponent } from './bonton/bonton.component';
import { BontonDmccComponent } from './bonton-dmcc/bonton-dmcc.component';
import { ManageServiceFeeComponent } from './manage-service-fee/manage-service-fee.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AmendmentRequestEntryComponent } from 'app/modules/booking/amendment-requests-list/amendment-request-entry/amendment-request-entry.component';

@Component({
  selector: 'app-purchase-register-2.0',
  templateUrl: './purchase-register.component.html',
  styles: [],
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
    BontonComponent,
    BontonDmccComponent,
    ManageServiceFeeComponent,
    AmendmentRequestEntryComponent
  ],
})
export class PurchaseRegisterComponent
  extends BaseListingComponent
  implements OnDestroy {

  @ViewChild('bontonTable') bontonTableComponent: BontonComponent;
  @ViewChild('dmccTable') dmccTableComponent: BontonDmccComponent;

  activeTab: any = 0;
  selectedTableKey: any;
  isFilterShow: boolean = false;
  isLoading: boolean = false;
  subscriptionArr: any[] = [];
  tempActiveTab: any = 0;
  public startDate = new FormControl(new Date());
  public endDate = new FormControl(new Date());
  isDateChange: boolean = false;

  tableTypeList: any = [{ label: 'Bonton', value: 'bonton', index: 0 }, { label: 'Bonton DMCC', value: 'dmcc', index: 1 }];

  tabLoaded: any = {
    isTabOneLoaded: true,
    isTabTwoLoaded: false,
  }

  moduleMap = [
    { module_name: 'Bonton', filter_table_name: 'purchase_register_bonton', isFiltershow: false },
    { module_name: 'Bonton DMCC', filter_table_name: 'purchase_register_bonton_dmcc', isFiltershow: false },
  ];

  currentModule: any = module_name[this.moduleMap[0].module_name];
  currentFilterModule: any = filter_module_name[this.moduleMap[0].filter_table_name];

  constructor(
    private _filterService: CommonFilterService,
  ) {
    super('')
  }

  ngOnInit(): void {
    this.selectedTableKey = this.tableTypeList[0];

    this.startDate.valueChanges.subscribe(start => {
      console.log('Start date changed:', start);
      this.isDateChange = true;
    });

    this.endDate.valueChanges.subscribe(end => {
      console.log('End date changed:', end);
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

    if (this.activeTab == 1) {
      this.tabLoaded.isTabTwoLoaded = true;
    }
  }

  onDateRange(event: any) {
    console.log("event", event)
  }

  onRefreshCall() {
    if (this.activeTab == 0) {
      this.bontonTableComponent.refreshItems();
    } else if (this.activeTab == 1) {
      this.dmccTableComponent.refreshItems();
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

  //   dmccBontonTableArr: any[] = [
  //   { field: 'invoice_master.invoice_date', header: 'Date', type: 'custom', matchMode: 'custom' },
  //   { field: 'supplier_master.company_name', header: 'Name', type: 'text', matchMode: 'contains' },
  //   { field: 'invoice_number', header: 'Invoice No', type: 'text', matchMode: 'contains' },
  //   { field: 'booking_reference_number', header: 'Ref. No', type: 'text', matchMode: 'contains' },
  //   { field: 'pnr_number', header: 'PNR', type: 'text', matchMode: 'contains' },
  //   { field: 'billing_company_currency', header: 'Currency', type: 'text', matchMode: 'contains' },
  //   { field: 'roe', header: 'ROE', type: 'numeric', matchMode: 'equals', },
  //   { field: 'baseFare', header: 'Base Fare', type: 'numeric', matchMode: 'equals', },
  //   { field: 'service_charge', header: 'Service charge', type: 'numeric', matchMode: 'equals' },
  //   { field: 'tax', header: 'TAX', type: 'numeric', matchMode: 'equals' },
  //   { field: 'total_purchase', header: 'Total Purchase', type: 'numeric', matchMode: 'equals' },
  //   { field: 'discount', header: 'Discount', type: 'numeric', matchMode: 'equals' }
  // ];
}
