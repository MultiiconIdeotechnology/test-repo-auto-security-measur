import { Routes } from "@angular/router";
import { SupplierApiListComponent } from "./supplier-api-list/supplier-api-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: SupplierApiListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Settings', operation: 'Supplier API', category: 'View' }
    },
] as Routes