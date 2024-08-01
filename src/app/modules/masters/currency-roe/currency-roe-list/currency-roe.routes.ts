import { Routes } from "@angular/router";
import { CurrencyRoeListComponent } from "./currency-roe-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path     : '',
        component: CurrencyRoeListComponent,
        canActivate: [AuthGuard],   
        data: {module: 'BO Menu Links', group: 'Masters', operation: 'Currency ROE', category: 'View'}
    },
] as Routes;