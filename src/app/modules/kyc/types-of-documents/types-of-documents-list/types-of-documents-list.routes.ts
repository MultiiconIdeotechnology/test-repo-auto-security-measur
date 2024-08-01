import { Routes } from "@angular/router";
import { TypesOfDocumentsListComponent } from "./types-of-documents-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: TypesOfDocumentsListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'KYC', operation: 'Types of Documents', category: 'View' }
    }
] as Routes