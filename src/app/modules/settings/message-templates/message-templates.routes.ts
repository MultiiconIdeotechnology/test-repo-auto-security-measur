import { Routes } from "@angular/router";
import { MessageTemplatesListComponent } from "./message-templates-list/message-templates-list.component";
import { MessageTemplatesEntryComponent } from "./message-templates-entry/message-templates-entry.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: MessageTemplatesListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Settings', operation: 'Message Templates', category: 'View' }
    },
    {
        path: 'entry',
        component: MessageTemplatesEntryComponent,
        canActivate: [AuthGuard],
        data: { module: 'Message Templates', group: 'Listing', operation: 'Add New', category: 'Entry' }
    },
    {
        path: 'entry/:id',
        component: MessageTemplatesEntryComponent,
        canActivate: [AuthGuard],
        data: { module: 'Message Templates', group: 'Listing', operation: 'Modify', category: 'Entry' }
    },
    {
        path: 'entry/:id/:readonly',
        component: MessageTemplatesEntryComponent,
        canActivate: [AuthGuard],
        data: { module: 'Message Templates', group: 'Listing', operation: 'View Detail', category: 'View Detail' }
    },
] as Routes