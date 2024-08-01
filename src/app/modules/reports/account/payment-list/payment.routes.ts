import { Routes } from "@angular/router";
import { PaymentListComponent } from "./payment-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: PaymentListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Account', operation: 'Payments', category: 'View' }
    },
] as Routes