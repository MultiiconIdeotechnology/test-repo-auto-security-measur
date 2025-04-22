import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { ReportPotentialLeadComponent } from "./report-potential-lead.component";

export default [
    {
        path: '',
        component: ReportPotentialLeadComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Sales-Reports', operation: 'Report Potential Lead', category: 'View' }
    },
] as Routes