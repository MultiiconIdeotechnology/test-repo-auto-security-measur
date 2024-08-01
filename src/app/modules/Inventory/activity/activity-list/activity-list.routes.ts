import { Routes } from "@angular/router";
import { ActivityListComponent } from "./activity-list.component";
import { ActivityFormEntryComponent } from "../activity-form-entry/activity-form-entry.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: ActivityListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Inventory', operation: 'Activity', category: 'View' }
    },
    {
        path: 'entry',
        component: ActivityFormEntryComponent,
        canActivate: [AuthGuard],
        data: { module: 'Activity', group: 'Listing', operation: 'Add New', category: 'Entry' }
    },
    {
        path: 'entry/:id',
        component: ActivityFormEntryComponent,
        canActivate: [AuthGuard],
        data: { module: 'Activity', group: 'Listing', operation: 'Modify', category: 'Entry' }
    },
    {
        path: 'entry/:id/:readonly',
        component: ActivityFormEntryComponent,
        canActivate: [AuthGuard],
        data: { module: 'Activity', group: 'Listing', operation: 'View Detail', category: 'View Detail' }
    }
] as Routes