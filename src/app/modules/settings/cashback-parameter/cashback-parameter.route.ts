import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { CashbackParameterComponent } from "./cashback-parameter.component";

export default [
    {
        path: '',
        component: CashbackParameterComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Settings', operation: 'Email Setup', category: 'View' }
    },
] as Routes