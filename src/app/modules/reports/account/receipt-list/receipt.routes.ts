import { Routes } from "@angular/router";
import { ReceiptListComponent } from "./receipt-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: ReceiptListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Account', operation: 'Payments', category: 'View' }
    },
] as Routes