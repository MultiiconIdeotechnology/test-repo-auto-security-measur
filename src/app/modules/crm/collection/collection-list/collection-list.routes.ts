import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { CRMCollectionListComponent } from "./collection-list.component";

export default [
    {
        path: '',
        component: CRMCollectionListComponent,
        canActivate: [AuthGuard],
        data: {module: 'BO Menu Links', group: 'CRM', operation: 'Collection', category: 'View'}
    },
] as Routes
