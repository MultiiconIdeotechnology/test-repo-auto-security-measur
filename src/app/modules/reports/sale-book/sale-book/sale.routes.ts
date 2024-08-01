import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { SaleBookComponent } from "./sale-book.component";

export default [
    {
        path: '',
        component: SaleBookComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Reports - Accounts', operation: 'Sale Book', category: 'View' }
    },
] as Routes