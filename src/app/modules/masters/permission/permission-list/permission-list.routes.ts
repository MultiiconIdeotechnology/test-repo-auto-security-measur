import { Routes } from "@angular/router";
import { PermissionListComponent } from "./permission-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path     : '',
        component: PermissionListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'HR', operation: 'Permission Master', category: 'View' }
    },
] as Routes;