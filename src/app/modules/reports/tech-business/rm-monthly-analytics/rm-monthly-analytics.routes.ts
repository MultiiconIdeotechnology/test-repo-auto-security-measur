import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { RmMonthlyAnalyticsComponent } from "./rm-monthly-analytics.component";


export default [
    {
        path: '',
        component: RmMonthlyAnalyticsComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Tech Business Report', operation: 'RM Monthly Analytics', category: 'View' }
    },
] as Routes