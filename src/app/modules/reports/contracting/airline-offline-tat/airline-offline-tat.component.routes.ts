import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { AirlineOfflineTatComponent } from "./airline-offline-tat.component";

export default [
    {
        path: '',
        component: AirlineOfflineTatComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Contracting-Reports', operation: 'Airline Offline', category: 'View' }
    },
] as Routes