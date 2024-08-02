import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { ReceiptRegisterComponent } from "./receipt-register.component";

export default [
    {
        path: '',
        component: ReceiptRegisterComponent,
        canActivate: [AuthGuard],
        data: {module: 'BO Menu Links', group: 'Account', operation: 'Receipt Register', category: 'View'}
    }
] as Routes
