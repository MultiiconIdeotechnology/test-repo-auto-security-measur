import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { BusComponent } from "./bus.component";

export default [
    {
        path: '',
        component: BusComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Contracting-Reports', operation: 'Bus', category: 'View' }
    },
] as Routes
