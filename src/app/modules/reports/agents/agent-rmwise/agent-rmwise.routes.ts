import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { AgentRMWiseComponent } from "./agent-rmwise.component";

export default [
    {
        path: '',
        component: AgentRMWiseComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Agents-Reports', operation: 'Partner Summary', category: 'View' }
    },
] as Routes
