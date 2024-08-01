import { Routes } from "@angular/router";
import { WalletComponent } from "./wallet.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: WalletComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Account', operation: 'Wallet Recharge', category: 'View' }
    }
] as Routes