import { Routes } from "@angular/router";
import { VisaListComponent } from "./visa-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: VisaListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Inventory', operation: 'Visa', category: 'View' }
    }
] as Routes