import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { CampaignSummaryComponent } from "./campaign-summary.component";

export default [
    {
        path: '',
        component: CampaignSummaryComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Campaign-Reports', operation: 'Campaign Summary', category: 'View' }
    },
] as Routes