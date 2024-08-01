import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { AirlineComponent } from "./airline.component";

export default [
    {
        path: '',
        component: AirlineComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Contracting-Reports', operation: 'Airline', category: 'View' }
    },
] as Routes