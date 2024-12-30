import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { PgRefundListComponent } from "./pg-refund-list.component";


export default [
    {
        path: '',
        component: PgRefundListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Reports - Accounts', operation: 'Pg-Refund', category: 'View' }
    },
] as Routes