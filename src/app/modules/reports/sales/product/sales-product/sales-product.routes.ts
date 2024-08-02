import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { SalesProductComponent } from "./sales-product.component";

export default [
    {
        path: '',
        component: SalesProductComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Sales-Reports', operation: 'Products', category: 'View' }
    },
] as Routes