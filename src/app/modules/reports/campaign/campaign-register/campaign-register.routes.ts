import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { CampaignRegisterComponent } from "./campaign-register.component";

export default [
    {
        path: '',
        component: CampaignRegisterComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Campaign-Reports', operation: 'Campaign Register', category: 'View' }
    },
] as Routes