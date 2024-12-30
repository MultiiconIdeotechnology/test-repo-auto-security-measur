import { Routes } from "@angular/router";
// import { ViewDetailsComponent } from "../view-details/view-details.component";
import { HolidayListComponent } from "./holiday-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { ViewHolidayDetailsComponent } from "../view-holiday-details/view-holiday-details.component";
// import { HolidayEntryComponent } from "../holiday-entry/holiday-entry.component";

export default [
    {
        path: '',
        component: HolidayListComponent,
        canActivate: [AuthGuard],
        // data: { module: 'BO Menu Links', group: 'Inventory', operation: 'Holiday Products', category: 'View' }
    },
    {
        path     : 'view-details',
        component: ViewHolidayDetailsComponent,
        canActivate: [AuthGuard],
        // data: { module: 'BO Menu Links', group: 'Inventory', operation: 'Holiday Products', category: 'View' }
    }
    // {
    //     path: 'entry',
    //     component: HolidayEntryComponent
    // },
    // {
    //     path: 'entry/:id',
    //     component: HolidayEntryComponent
    // },
    // {
    //     path: 'entry/:id/:readonly',
    //     component: HolidayEntryComponent
    // }
] as Routes