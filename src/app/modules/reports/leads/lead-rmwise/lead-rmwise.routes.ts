import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { LeadRMWiseComponent } from "./lead-rmwise.component";

export default [
    {
        path: '',
        component: LeadRMWiseComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Leads-Reports', operation: 'RM Wise Leads', category: 'View' }
    },
] as Routes
