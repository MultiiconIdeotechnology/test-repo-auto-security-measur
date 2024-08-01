import { Routes } from "@angular/router";
import { WhitelabelListComponent } from "./whitelabel-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: WhitelabelListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Customers', operation: 'White Lable', category: 'View' }
    },
] as Routes