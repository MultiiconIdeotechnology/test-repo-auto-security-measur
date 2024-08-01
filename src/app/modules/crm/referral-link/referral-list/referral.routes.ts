import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { ReferralListComponent } from "./referral-list.component";

export default [
   
    {
        path: '',
        component: ReferralListComponent,
        canActivate: [AuthGuard],
        data: {module: 'BO Menu Links', group: 'CRM', operation: 'Referral Link', category: 'View'}
    }
] as Routes
