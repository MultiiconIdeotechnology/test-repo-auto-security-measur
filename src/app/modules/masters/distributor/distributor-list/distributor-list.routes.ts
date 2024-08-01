import { Routes } from "@angular/router";
import { DistributorListComponent } from "./distributor-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: DistributorListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Customers', operation: 'Distributor', category: 'View' }
    },
] as Routes