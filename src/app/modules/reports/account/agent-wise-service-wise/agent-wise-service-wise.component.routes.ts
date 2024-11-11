import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { AgentWiseServiceWiseComponent } from "./agent-wise-service-wise.component";

export default [
    {
        path: '',
        component: AgentWiseServiceWiseComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Account', operation: 'Agent Wise Service Wise', category: 'View' }
    },
] as Routes