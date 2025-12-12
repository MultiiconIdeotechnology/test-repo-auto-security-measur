import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { SupplierInventoryProfileComponent } from "./supplier-inventory-profile.component";

export default [
    {
        path: '',
        component: SupplierInventoryProfileComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Settings', operation: 'Supplier Inventory Profile', category: 'View' }
    },
] as Routes