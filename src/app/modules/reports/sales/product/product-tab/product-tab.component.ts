import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { ProductReceiptsComponent } from '../product-receipts/product-receipts.component';
import { SalesProductComponent } from '../sales-product/sales-product.component';
import { ProductCollectionComponent } from '../product-collection/product-collection.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { module_name, Security, filter_module_name } from 'app/security';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-product-tab',
    standalone: true,
    imports: [
        MatTabsModule,
        CommonModule,
        ProductReceiptsComponent,
        SalesProductComponent,
        ProductCollectionComponent,
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

    // @ViewChildren('tabComp') tabComponents!:QueryList<any>

    // @Input() activeTab: any;
    activeTab:any = 0;
    isFilterShow:boolean = false;
    isLoading:boolean = false;
    isTabOneLoaded:boolean = false;
    isTabTwoLoaded:boolean = false;
    isTabThreeLoaded:boolean = false;

    moduleMap = [
        { module_name: 'products', filter_table_name: 'report_sales_products' },
        { module_name: 'products_collection', filter_table_name: 'products_collection' },
        { module_name: 'products_receipts', filter_table_name: 'products_receipts' }
      ];
    
    currentModule:any = module_name[this.moduleMap[0].module_name];
    currentFilterModule:any = filter_module_name[this.moduleMap[0].filter_table_name];
      
      constructor(
          private router: Router,
          private _filterService:CommonFilterService,
        ) { 
            super('')
    }

    public tabChanged(event: any): void {
        this.activeTab = event?.index;
        this.isFilterShow = false;
        console.log("this.activeTab", this.activeTab)
        this.currentModule = module_name[this.moduleMap[this.activeTab].module_name];
        this.currentFilterModule = filter_module_name[this.moduleMap[this.activeTab].filter_table_name];
        if(this.activeTab == 1){
            this.isTabTwoLoaded = true;
        } else if(this.activeTab == 2){
            this.isTabThreeLoaded = true;
        }
    }

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
        }
    }

    onRefreshData(){
        if(this.activeTab == 0){
            this.productComponent.refreshItems();
        } else if (this.activeTab == 1){
            this.collectionComponent.refreshItems();
        } else if(this.activeTab == 2){
            this.receiptComponent.refreshItems();
        }
    }

    onSaveFilter(){
        
        if(this.activeTab == 0){
            this._filterService.openDrawer(this.currentFilterModule, this.productComponent.primengTable);;
        } else if (this.activeTab == 1){
            console.log("this.collectionComponent.primengTable", this.collectionComponent.primengTable)
            this._filterService.openDrawer(this.currentFilterModule, this.collectionComponent.primengTable);;
        } else if(this.activeTab == 2){
            console.log("this.receiptComponent.primengTable", this.receiptComponent.primengTable)
            this._filterService.openDrawer(this.currentFilterModule, this.receiptComponent.primengTable);;
        }
    }

    exportExcel(){
        if(this.activeTab == 0){
            this.productComponent.exportExcel();
        } else if (this.activeTab == 1){
            this.collectionComponent.exportExcel();
        } else if(this.activeTab == 2){
            this.receiptComponent.exportExcel();
        }
    }

}