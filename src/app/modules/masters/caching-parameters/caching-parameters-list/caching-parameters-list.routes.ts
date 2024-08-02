import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { CachingParametersListComponent } from "./caching-parameters-list.component";

export default [
    {
        path: '',
        component: CachingParametersListComponent,
        canActivate: [AuthGuard],
        data: {module: 'BO Menu Links', group: 'Masters', operation: 'Caching Parameters', category: 'View'}
    }
] as Routes
