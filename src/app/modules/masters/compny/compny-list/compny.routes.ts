import { Routes } from "@angular/router";
import { CompnyListComponent } from "./compny-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default[
    {
        path: '',
        component: CompnyListComponent,
        canActivate: [AuthGuard],   
        data: {module: 'BO Menu Links', group: 'Masters', operation: 'Company', category: 'View'}
    }
] as Routes