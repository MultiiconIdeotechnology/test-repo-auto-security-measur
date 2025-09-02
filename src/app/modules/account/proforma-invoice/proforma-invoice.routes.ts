import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { ProformaInvoiceComponent } from "./proforma-invoice.component";

export default [
    {
        path: '',
        component: ProformaInvoiceComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Account', operation: 'Proforma Invoice', category: 'View' }
    },
] as Routes
