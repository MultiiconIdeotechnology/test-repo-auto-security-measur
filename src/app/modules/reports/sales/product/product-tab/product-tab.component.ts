import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { ProductReceiptsComponent } from './product-receipts/product-receipts.component';
import { SalesProductComponent } from './sales-product/sales-product.component';
import { ProductCollectionComponent } from './product-collection/product-collection.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { module_name, Security, filter_module_name } from 'app/security';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { TechServiceComponent } from './tech-service/tech-service.component';

@Component({
    selector: 'app-product-tab',
    standalone: true,
    imports: [
        MatTabsModule,
        CommonModule,
        ProductReceiptsComponent,
        SalesProductComponent,
        ProductCollectionComponent,
        TechServiceComponent,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule, 
        ReactiveFormsModule
    ],
    templateUrl: './product-tab.component.html'
})
export class ProductTabComponent extends BaseListingComponent {
    @ViewChild('productComponent') productComponent:SalesProductComponent;
    @ViewChild('collectionComponent') collectionComponent:ProductCollectionComponent;
    @ViewChild('receiptComponent') receiptComponent:ProductReceiptsComponent;
    @ViewChild('techServiceComponent') techServiceComponent:TechServiceComponent;

    activeTab:any = 0;
    isFilterShow:boolean = false;
    isLoading:boolean = false;
    subscriptionArr:any[] = [];

    tabLoaded:any = {
        isTabOneLoaded : false,
        isTabTwoLoaded : false,
        isTabThreeLoaded : false,
        isTabFourLoaded : false,
    }

    moduleMap = [
        { module_name: 'products', filter_table_name: 'report_sales_products', isFiltershow:false },
        { module_name: 'products_collection', filter_table_name: 'products_collection', isFiltershow:false },
        { module_name: 'products_receipts', filter_table_name: 'products_receipts', isFiltershow:false },
        { module_name: 'products_tech_service', filter_table_name: 'products_tech_service', isFiltershow:false },
      ];
    
    currentModule:any = module_name[this.moduleMap[0].module_name];
    currentFilterModule:any = filter_module_name[this.moduleMap[0].filter_table_name];
      
    constructor(
          private _filterService:CommonFilterService,
        ) { 
            super('')
    }

    public tabChanged(event: any): void {
        this.activeTab = event?.index;

        const components = [
            this.productComponent,
            this.collectionComponent,
            this.receiptComponent,
            this.techServiceComponent,
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

        if(this.activeTab == 1){
            this.tabLoaded.isTabTwoLoaded = true;
        } else if(this.activeTab == 2){
            this.tabLoaded.isTabThreeLoaded = true;
        } else if(this.activeTab == 3){
            this.tabLoaded.isTabFourLoaded = true;
        } 
    }

    // Global Filter on respective component 
    onGlobalSearch(val:any){
        if(this.activeTab == 0){
            this.productComponent.searchInputControl.patchValue(val);
            this.productComponent.refreshItems();
        } else if (this.activeTab == 1){
            this.collectionComponent.searchInputControl.patchValue(val);
            this.collectionComponent.refreshItems();
        } else if(this.activeTab == 2){
            this.receiptComponent.searchInputControl.patchValue(val);
            this.receiptComponent.refreshItems();
        } else if(this.activeTab == 3){
            this.techServiceComponent.searchInputControl.patchValue(val);
            this.techServiceComponent.refreshItems();
        }
    }

    // column filter search 
    onColumnFilter(){
        this.moduleMap[this.activeTab].isFiltershow = !this.moduleMap[this.activeTab].isFiltershow;
    }

    // Refresh Data on respective component
    onRefreshData(){
        if(this.activeTab == 0){
            this.productComponent.refreshItems();
        } else if (this.activeTab == 1){
            this.collectionComponent.refreshItems();
        } else if(this.activeTab == 2){
            this.receiptComponent.refreshItems();
        } else if(this.activeTab == 3){
            this.techServiceComponent.refreshItems();
        }
    }

    
  toggleOverlayPanel(event: MouseEvent) {
    switch (this.activeTab) {
      case 1:
        this.collectionComponent.toggleOverlayPanel(event);
        break;
    }
  }

   get isMoreColumnsDispley(): boolean {
    return this.activeTab != 0;
  }

    // saved filter on respective component
    onSaveFilter(){
        if(this.activeTab == 0){
            this._filterService.openDrawer(this.currentFilterModule, this.productComponent.primengTable);;
        } else if (this.activeTab == 1){
            this._filterService.openDrawer(this.currentFilterModule, this.collectionComponent.primengTable);;
        } else if(this.activeTab == 2){
            this._filterService.openDrawer(this.currentFilterModule, this.receiptComponent.primengTable);;
        } else if(this.activeTab == 3){
            this._filterService.openDrawer(this.currentFilterModule, this.techServiceComponent.primengTable);;
        }
    }

    // export excel on respective component
    exportExcel(){
        if(this.activeTab == 0){
            this.productComponent.exportExcel();
        } else if (this.activeTab == 1){
            this.collectionComponent.exportExcel();
        } else if(this.activeTab == 2){
            this.receiptComponent.exportExcel();
        }else if(this.activeTab == 3){
            this.techServiceComponent.exportExcel();
        }
    }

}