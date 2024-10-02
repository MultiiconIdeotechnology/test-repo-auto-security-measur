import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { ProductReceiptsComponent } from "./product-receipts.component";

export default [
    {
        path: '',
        component: ProductReceiptsComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Reports-Products', operation: 'Receipts', category: 'View' }
    },
] as Routes