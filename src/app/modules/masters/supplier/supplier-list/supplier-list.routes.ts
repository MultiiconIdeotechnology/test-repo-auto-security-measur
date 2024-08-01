import { Routes } from "@angular/router";
import { SupplierListComponent } from "./supplier-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: SupplierListComponent,
        canActivate: [AuthGuard],   
        data: {module: 'BO Menu Links', group: 'Masters', operation: 'Supplier', category: 'View'}
    },
] as Routes