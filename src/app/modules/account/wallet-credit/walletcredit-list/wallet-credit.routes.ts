import { Routes } from "@angular/router";
import { WalletcreditListComponent } from "./walletcredit-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: WalletcreditListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Account', operation: 'Wallet Credit', category: 'View' }
    },
] as Routes

