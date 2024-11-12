import { Routes } from "@angular/router";
import { MainComponent } from "./main.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { AgentKycComponent } from "../agent-kyc/agent-kyc.component";
import { SupplierKycComponent } from "../supplier-kyc/supplier-kyc.component";

export default [
    {
        path: '',
        component: AgentKycComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'KYC', operation: 'Dashboard', category: 'View' }
    },
    {
        path: 'supplier',
        component: SupplierKycComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'KYC', operation: 'Dashboard', category: 'View' }
    }, 
    // {
    //     path: 'Empoye',
    //     component: ProductReceiptsComponent,
    //     canActivate: [AuthGuard],
    //     data: { module: 'BO Menu Links', group: 'Sales-Reports', operation: 'Products', category: 'View' }
    // },
] as Routes