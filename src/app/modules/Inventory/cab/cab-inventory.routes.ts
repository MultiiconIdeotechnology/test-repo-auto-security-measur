import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { CabListComponent } from "./cab-list/cab-list.component";
// import { HolidayEntryComponent } from "../holiday-entry/holiday-entry.component";

export default [
    {
        path: '',
        component: CabListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Inventory', operation: 'Cab', category: 'View' }
    },
    // {
    //     path     : 'view-details',
    //     component: ViewDetailsComponent,
    //     canActivate: [AuthGuard],
    //     data: { module: 'BO Menu Links', group: 'Inventory', operation: 'Holiday Products', category: 'View' }
    // }
] as Routes