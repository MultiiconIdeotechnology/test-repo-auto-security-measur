import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { AirlineMonthlyComponent } from "./airline-monthly.component";

export default [
    {
        path: '',
        component: AirlineMonthlyComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Contracting-Reports', operation: 'Airline Monthly', category: 'View' }
    },
] as Routes