import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { ItemListComponent } from "./item-list.component";

export default [
    {
        path: '',
        component: ItemListComponent,
        canActivate: [AuthGuard],   
        data: {module: 'BO Menu Links', group: 'Masters', operation: 'Items', category: 'View'}
    },
] as Routes