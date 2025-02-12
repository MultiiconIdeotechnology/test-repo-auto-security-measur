import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { AgentSummaryComponent } from "./agent-summary.component";

export default [
    {
        path: '',
        component: AgentSummaryComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Sales-Reports', operation: 'Partner Register', category: 'View' }
    },
] as Routes
