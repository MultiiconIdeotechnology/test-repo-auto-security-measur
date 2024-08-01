import { Routes } from "@angular/router";
import { LedgerListComponent } from "./ledger-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: LedgerListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Reports - Accounts', operation: 'Ledger', category: 'View' }
    },
] as Routes