import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { FirstTransactionComponent } from "./first-transaction.component";

export default [
    {
        path: '',
        component: FirstTransactionComponent,
        canActivate: [AuthGuard],
        data: {module: 'BO Menu Links', group: 'Account', operation: 'First Transaction', category: 'View'}
    }
] as Routes
