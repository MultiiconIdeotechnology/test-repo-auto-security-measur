import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { PspSetupComponent } from "./psp-setup.component";
import { PspSetupEntryComponent } from "./psp-setup-entry/psp-setup-entry.component";

export default [
    {
        path: '',
        component: PspSetupComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Settings', operation: 'PSP Setup', category: 'View' }
    },

    {
        path: 'entry',
        component: PspSetupEntryComponent,
        canActivate: [AuthGuard],
        // data: { module: 'Markup Profile', group: 'Listing', operation: 'Add New', category: 'Entry' }
    },
    {
        path: 'entry/:id',
        component: PspSetupEntryComponent,
        canActivate: [AuthGuard],
        // data: { module: 'Markup Profile', group: 'Listing', operation: 'Modify', category: 'Entry' }
    },
    {
        path: 'entry/:id/:readonly',
        component: PspSetupEntryComponent,
        canActivate: [AuthGuard],
        // data: { module: 'Markup Profile', group: 'Listing', operation: 'View Detail', category: 'View Detail' }
    },
] as Routes