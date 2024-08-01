import { Routes } from "@angular/router";
import { WithdrawListComponent } from "./withdraw-list/withdraw-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: WithdrawListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Account', operation: 'Withdraw', category: 'View' }
    }
] as Routes