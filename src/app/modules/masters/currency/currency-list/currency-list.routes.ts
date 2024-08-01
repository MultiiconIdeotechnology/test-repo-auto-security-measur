import { Routes } from "@angular/router";
import { CurrencyListComponent } from "./currency-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path     : '',
        component: CurrencyListComponent,
        canActivate: [AuthGuard],   
        data: {module: 'BO Menu Links', group: 'Masters', operation: 'Currency', category: 'View'}
    },
] as Routes;