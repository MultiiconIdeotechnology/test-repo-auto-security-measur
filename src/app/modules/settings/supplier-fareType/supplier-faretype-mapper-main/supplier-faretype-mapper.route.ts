import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { CommonFaretypeComponent } from "./common-faretype/common-faretype.component";
import { SupplierFaretypeMapperMainComponent } from "./supplier-faretype-mapper-main.component";

export default [
    {
        path: '',
        component: SupplierFaretypeMapperMainComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Settings', operation: 'Fare Type Mapper', category: 'View' }
    },
] as Routes