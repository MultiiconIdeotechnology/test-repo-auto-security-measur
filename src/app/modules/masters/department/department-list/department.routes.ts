import { Routes } from "@angular/router";
import { DepartmentListComponent } from "./department-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path     : '',
        component: DepartmentListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'HR', operation: 'Department', category: 'View' }
    },
] as Routes;