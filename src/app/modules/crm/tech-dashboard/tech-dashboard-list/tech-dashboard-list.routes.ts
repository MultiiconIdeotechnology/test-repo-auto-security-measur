import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { CRMTechDashboardListComponent } from "./tech-dashboard-list.component";

export default [
    {
        path: '',
        component: CRMTechDashboardListComponent,
        canActivate: [AuthGuard],
        data: {module: 'BO Menu Links', group: 'CRM', operation: 'Tech Dashboard', category: 'View'}
    },
] as Routes
