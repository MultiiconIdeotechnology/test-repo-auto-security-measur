import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { SupplierWalletBalanceComponent } from "./supplier-wallet-balance.component";


export default [
    {
        path: '',
        component: SupplierWalletBalanceComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Reports - Accounts', operation: 'Supplier-Balance', category: 'View' }
    },
] as Routes