import { Routes } from "@angular/router";
import { AmendmentRequestsListComponent } from "./amendment-requests-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: AmendmentRequestsListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Bookings - Flight', operation: 'Amendments', category: 'View' }
    }
] as Routes