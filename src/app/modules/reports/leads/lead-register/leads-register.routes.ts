import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { LeadRegisterComponent } from "./lead-register.component";

export default [
    {
        path: '',
        component: LeadRegisterComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Leads-Reports', operation: 'Register', category: 'View' }
    },
] as Routes
