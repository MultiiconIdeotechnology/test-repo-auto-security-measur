import { Routes } from "@angular/router";
import { EmailSetupListComponent } from "./email-setup-list/email-setup-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: EmailSetupListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Settings', operation: 'Email Setup', category: 'View' }
    },
] as Routes