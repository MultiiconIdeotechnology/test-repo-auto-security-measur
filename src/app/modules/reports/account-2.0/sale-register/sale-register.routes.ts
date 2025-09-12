import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { SaleRegisterComponent } from "./sale-register.component";

export default [
    {
        path: '',
        component: SaleRegisterComponent,
        canActivate: [AuthGuard],
        data: {module: 'BO Menu Links', group: 'Account 2.0', operation: 'Sale Register', category: 'View'}
    }
] as Routes