import { Routes } from "@angular/router";
import { MarkupProfileComponent } from "./markup-profile/markup-profile.component";
import { MarkupProfileEntryComponent } from "./markup-profile-entry/markup-profile-entry.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: MarkupProfileComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Settings', operation: 'Markup Profile', category: 'View' }
    },
    {
        path: 'entry',
        component: MarkupProfileEntryComponent,
        canActivate: [AuthGuard],
        data: { module: 'Markup Profile', group: 'Listing', operation: 'Add New', category: 'Entry' }
    },
    {
        path: 'entry/:id/:readonly',
        component: MarkupProfileEntryComponent,
        canActivate: [AuthGuard],
        data: { module: 'Markup Profile', group: 'Listing', operation: 'View Detail', category: 'View Detail' }
    },
    {
        path: 'entry/:id',
        component: MarkupProfileEntryComponent,
        canActivate: [AuthGuard],
        data: { module: 'Markup Profile', group: 'Listing', operation: 'Modify', category: 'Entry' }
    }
] as Routes