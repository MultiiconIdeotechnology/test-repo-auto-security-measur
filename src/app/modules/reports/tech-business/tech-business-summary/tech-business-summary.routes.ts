import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { TechBusinessSummaryComponent } from "./tech-business-summary.component";


export default [
    {
        path: '',
        component: TechBusinessSummaryComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Reports', operation: 'Tech Business', category: 'View' }
    },
] as Routes