import { Routes } from "@angular/router";
import { DocumentsListComponent } from "./documents-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: DocumentsListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'KYC', operation: 'Documents', category: 'View' }
    }
] as Routes