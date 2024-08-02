import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { CommissionIncomeComponent } from "./commission-income.component";

export default [
    {
        path: '',
        component: CommissionIncomeComponent,
        canActivate: [AuthGuard],
        data: {module: 'BO Menu Links', group: 'Account', operation: 'Commission Income', category: 'View'}
    }
] as Routes
