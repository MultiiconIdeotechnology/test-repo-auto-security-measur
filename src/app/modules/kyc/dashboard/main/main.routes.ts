import { Routes } from "@angular/router";
import { MainComponent } from "./main.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: MainComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'KYC', operation: 'Dashboard', category: 'View' }
    }
] as Routes