import { Routes } from "@angular/router";
import { OfflineListComponent } from "./offline-list.component";
import { OfflineInfoComponent } from "../offline-info/offline-info.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: OfflineListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Bookings', operation: 'Offline Service', category: 'View' }
    },
    // {
    //     path: 'details',
    //     component: HotelBookingDetailsComponent
    // },
    // {
    //     path: 'details/:id',
    //     component: HotelBookingDetailsComponent
    // },
    {
        path: 'entry/:id/:readonly',
        component: OfflineInfoComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Bookings', operation: 'Visa', category: 'View' }
    }
] as Routes

