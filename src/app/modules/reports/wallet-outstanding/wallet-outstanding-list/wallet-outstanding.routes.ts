import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { WalletOutstandingListComponent } from "./wallet-outstanding-list.component";


export default [
    {
        path: '',
        component: WalletOutstandingListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Reports - Accounts', operation: 'Wallet-Outstanding', category: 'View' }
    },
] as Routes