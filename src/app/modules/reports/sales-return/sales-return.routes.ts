import { Routes } from "@angular/router";
import { AuthGuard } from "../../../core/auth/guards/auth.guard"
import { SalesReturnComponent } from "./sales-return.component";

export default [
    {
        path: '',
        component: SalesReturnComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Reports - Accounts', operation: 'Sales Return', category: 'View' }
    },
] as Routes