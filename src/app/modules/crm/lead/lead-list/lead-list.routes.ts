import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { CRMLeadListComponent } from "./lead-list.component";

export default [
    {
        path: '',
        component: CRMLeadListComponent,
        canActivate: [AuthGuard],
        data: {module: 'BO Menu Links', group: 'CRM', operation: 'Lead', category: 'View'}
    },
] as Routes
