import { Routes } from "@angular/router";
import { VehicleListComponent } from "./vehicle-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: VehicleListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Inventory', operation: 'Vehicle', category: 'View' }
    }
] as Routes