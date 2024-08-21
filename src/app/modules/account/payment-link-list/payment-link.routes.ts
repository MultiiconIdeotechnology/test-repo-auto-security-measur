import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { PaymentLinkListComponent } from "./payment-link-list.component";

export default [
    {
        path: '',
        component: PaymentLinkListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Account', operation: 'Payment Link', category: 'View' }
    },
] as Routes
