import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { PspSetupComponent } from "./psp-setup.component";

export default [
    {
        path: '',
        component: PspSetupComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Settings', operation: 'PSP', category: 'View' }
    },
] as Routes