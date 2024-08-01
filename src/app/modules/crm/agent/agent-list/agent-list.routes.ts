import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { CRMAgentListComponent } from "./agent-list.component";
import { AnalyticsService } from "app/services/analytics.service";
import { inject } from "@angular/core";

export default [
    {
        path: '',
        component: CRMAgentListComponent,
        canActivate: [AuthGuard],
        data: {module: 'BO Menu Links', group: 'CRM', operation: 'Agent', category: 'View'},
        resolve  : {
            data: () => inject(AnalyticsService).getData(),
        },
    },
] as Routes
