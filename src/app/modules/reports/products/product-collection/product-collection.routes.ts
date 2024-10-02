import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { ProductCollectionComponent } from "./product-collection.component";

export default [
    {
        path: '',
        component: ProductCollectionComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Reports-Products', operation: 'Collection', category: 'View' }
    },
] as Routes