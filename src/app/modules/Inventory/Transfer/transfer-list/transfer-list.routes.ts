import { Routes } from "@angular/router";
import { TransferListComponent } from "./transfer-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: TransferListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Inventory', operation: 'Transfers', category: 'View' }
    }
] as Routes