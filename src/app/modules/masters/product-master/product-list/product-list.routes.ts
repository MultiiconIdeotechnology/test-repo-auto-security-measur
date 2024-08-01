import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { ProductListComponent } from "./product-list.component";

export default [
    {
        path: '',
        component: ProductListComponent,
        canActivate: [AuthGuard],   
        data: {module: 'BO Menu Links', group: 'Masters', operation: 'Products', category: 'View'}
    },
] as Routes