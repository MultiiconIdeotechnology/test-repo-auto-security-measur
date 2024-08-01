import { Routes } from "@angular/router";
import { KycProfileListComponent } from "./kyc-profile-list.component";
import { KycEntryComponent } from "../kyc-entry/kyc-entry.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: KycProfileListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'KYC', operation: 'KYC Profile', category: 'View' }
    },
    {
        path: 'entry',
        component: KycEntryComponent,
        canActivate: [AuthGuard],
        data: { module: 'KYC Profile', group: 'Listing', operation: 'Add New', category: 'Entry' }
    },
    {
        path: 'entry/:id',
        component: KycEntryComponent,
        canActivate: [AuthGuard],
        data: { module: 'KYC Profile', group: 'Listing', operation: 'Modify', category: 'Entry' }
    },
    {
        path: 'entry/:id/:readonly',
        component: KycEntryComponent,
        canActivate: [AuthGuard],
        data: { module: 'KYC Profile', group: 'Listing', operation: 'View Detail', category: 'View Detail' }
    }
] as Routes