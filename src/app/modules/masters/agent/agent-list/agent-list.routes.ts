import { Routes } from "@angular/router";
import { AgentListComponent } from "./agent-list.component";
import { AgentEntryComponent } from "../agent-entry/agent-entry.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { AgentInfoComponent } from "../agent-info/agent-info.component";

export default [
    {
        path: '',
        component: AgentListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Customers', operation: 'Agents', category: 'View' }
    },
    // {
    //     path: 'entry',
    //     component: AgentEntryComponent,
    //     canActivate: [AuthGuard],
    //     data: { module: 'BO Menu Links', group: 'Customers', operation: 'Agents', category: 'View' }
    // },
    // {
    //     path: 'entry/:id',
    //     component: AgentEntryComponent,
    //     canActivate: [AuthGuard],
    //     data: { module: 'BO Menu Links', group: 'Customers', operation: 'Agents', category: 'View' }
    // },
    {
        path: 'entry/:id/:readonly',
        // component: AgentEntryComponent,
        component: AgentInfoComponent,
        canActivate: [AuthGuard],
        data: { module: 'Agents', group: 'Listing', operation: 'View Detail', category: 'View Detail' }
    },
    // {
    //     path: 'info/:id/:readonly',
    //     component: AgentInfoComponent,
    //     canActivate: [AuthGuard],
    //     data: { module: 'Agents', group: 'Listing', operation: 'View Detail', category: 'View Detail' }
    // },
    // {
    //     path: 'entry/:id/:readonly/:lead',
    //     component: AgentEntryComponent,
    //     canActivate: [AuthGuard],
    //     data: { module: 'BO Menu Links', group: 'Customers', operation: 'Agents', category: 'View' }
    // },
] as Routes