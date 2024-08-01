import { Routes } from "@angular/router";
import { AgentBalanceComponent } from "./agent-balance.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";


export default [
    {
        path: '',
        component: AgentBalanceComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Reports - Accounts', operation: 'Agent-Balance', category: 'View' }
    },
] as Routes