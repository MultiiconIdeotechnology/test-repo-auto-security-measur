import { Routes } from "@angular/router";
import { DesignationListComponent } from "./designation-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: DesignationListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'HR', operation: 'Designation', category: 'View' }
    }
] as Routes