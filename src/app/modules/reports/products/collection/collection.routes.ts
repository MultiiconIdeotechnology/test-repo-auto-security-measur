import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { CollectionComponent } from "./collection.component";

export default [
    {
        path: '',
        component: CollectionComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Reports-Products', operation: 'Collection', category: 'View' }
    },
] as Routes