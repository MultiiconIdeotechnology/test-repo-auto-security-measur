import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { CommissionExpenseComponent } from "./commission-expense.component";

export default [
    {
        path: '',
        component: CommissionExpenseComponent,
        canActivate: [AuthGuard],
        data: {module: 'BO Menu Links', group: 'Account', operation: 'Commission Expense', category: 'View'}
    }
] as Routes
