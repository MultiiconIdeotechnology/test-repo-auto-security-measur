import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { CampaignSummaryReportComponent } from "./campaign-summary-report.component";

export default [
    {
        path: '',
        component: CampaignSummaryReportComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Campaign-Reports', operation: 'Campaign Summary Report', category: 'View' }
    },
] as Routes