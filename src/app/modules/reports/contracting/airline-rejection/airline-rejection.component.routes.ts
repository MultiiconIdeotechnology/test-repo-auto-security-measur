import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { AirlineRejectionComponent } from "./airline-rejection.component";

export default [
    {
        path: '',
        component: AirlineRejectionComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Contracting-Reports', operation: 'Airline Rejection', category: 'View' }
    },
] as Routes