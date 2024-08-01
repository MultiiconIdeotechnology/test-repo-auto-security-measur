import { Routes } from "@angular/router";
import { PspListComponent } from "./psp-list/psp-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: PspListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Settings', operation: 'PSP', category: 'View' }
    },
] as Routes