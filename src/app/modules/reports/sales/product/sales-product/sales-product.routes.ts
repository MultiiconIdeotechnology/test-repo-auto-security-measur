import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { SalesProductComponent } from "./sales-product.component";
import { ProductCollectionComponent } from "../product-collection/product-collection.component";
import { ProductReceiptsComponent } from "../product-receipts/product-receipts.component";
import { ProductTabComponent } from "../product-tab/product-tab.component";

export default [
    {
        path: '',
        component: ProductTabComponent,
        canActivate: [AuthGuard],
        // data: { module: 'BO Menu Links', group: 'Sales-Reports', operation: 'Products', category: 'View' }
    },
    {
        path: 'sales-product',
        component: SalesProductComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Sales-Reports', operation: 'Products', category: 'View' }
    },
     {
        path: 'collection',
        component: ProductCollectionComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Sales-Reports', operation: 'Products', category: 'View' }
    }, 
    {
        path: 'receipts',
        component: ProductReceiptsComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Sales-Reports', operation: 'Products', category: 'View' }
    },
] as Routes