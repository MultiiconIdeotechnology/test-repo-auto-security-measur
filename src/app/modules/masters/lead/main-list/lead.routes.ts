import { Routes } from "@angular/router";
import { MainListComponent } from "../main-list/main-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: MainListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Customers', operation: 'New Signup', category: 'View' }
    },
] as Routes