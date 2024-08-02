import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { PurchaseRegisterComponent } from "./purchase-register.component";

export default [
    {
        path: '',
        component: PurchaseRegisterComponent,
        canActivate: [AuthGuard],
        data: {module: 'BO Menu Links', group: 'Account', operation: 'Purchase Register', category: 'View'}
    }
] as Routes
