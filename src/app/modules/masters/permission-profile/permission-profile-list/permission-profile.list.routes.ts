import { Routes } from "@angular/router";
import { PermissionProfileListComponent } from "./permission-profile-list.component";
import { PermissionProfilePermissionsComponent } from "../permission-profile-permissions/permission-profile-permissions.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path     : '',
        component: PermissionProfileListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'HR', operation: 'Permission Profile', category: 'View' }
    },
    {
        path     : 'permission-profile-permissions/:id',
        component: PermissionProfilePermissionsComponent,
        canActivate: [AuthGuard],
        data: { module: 'Permission Profile', group: 'Listing', operation: 'Apply Permission', category: 'Entry' }
    },
] as Routes;