import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { ReceiptsComponent } from "./receipts.component";

export default [
    {
        path: '',
        component: ReceiptsComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Reports-Products', operation: 'Receipts', category: 'View' }
    },
] as Routes