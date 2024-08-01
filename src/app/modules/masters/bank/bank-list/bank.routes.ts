import { Routes } from "@angular/router";
import { BankListComponent } from "./bank-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
   
    {
        path: '',
        component: BankListComponent,
        canActivate: [AuthGuard],   
        data: {module: 'BO Menu Links', group: 'Masters', operation: 'Bank', category: 'View'}
    }
] as Routes
