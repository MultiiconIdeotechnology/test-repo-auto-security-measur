import { Routes } from "@angular/router";
import { MessageEventsListComponent } from "./message-events-list/message-events-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: MessageEventsListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Settings', operation: 'Message Events', category: 'View' }
    },
] as Routes