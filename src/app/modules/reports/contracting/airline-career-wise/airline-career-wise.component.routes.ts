import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { AirlineCareerWiseComponent } from "./airline-career-wise.component";

export default [
    {
        path: '',
        component: AirlineCareerWiseComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Contracting-Reports', operation: 'Airline Career', category: 'View' }
    },
] as Routes