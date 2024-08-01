import { Routes } from "@angular/router";
import { ErpSettingsComponent } from "./erp-settings/erp-settings.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: ErpSettingsComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Settings', operation: 'ERP Settings', category: 'View' }
    },
] as Routes