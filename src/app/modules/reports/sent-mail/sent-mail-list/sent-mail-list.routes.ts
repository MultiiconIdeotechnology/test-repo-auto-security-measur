import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { SentMailListComponent } from "./sent-mail-list.component";

export default [
    {
        path: '',
        component: SentMailListComponent,
        canActivate: [AuthGuard],   
        data: {module: 'BO Menu Links', group: 'Reports', operation: 'Sent Mail', category: 'View'}
    },
] as Routes