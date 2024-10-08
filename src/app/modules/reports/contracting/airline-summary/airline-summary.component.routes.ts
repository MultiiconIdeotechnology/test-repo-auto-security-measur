import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { AirlineSummaryComponent } from "./airline-summary.component";

export default [
    {
        path: '',
        component: AirlineSummaryComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Contracting-Reports', operation: 'Airline Summary', category: 'View' }
    },
] as Routes