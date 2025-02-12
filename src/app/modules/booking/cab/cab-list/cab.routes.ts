import { CabBookingDetailsComponent } from './../cab-booking-details/cab-booking-details.component';
import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { CabListComponent } from "./cab-list.component";

export default [
    {
        path: '',
        component: CabListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Bookings', operation: 'Cab', category: 'View' }
    },
    {
        path: 'details',
        component: CabBookingDetailsComponent,
        canActivate: [AuthGuard],
        data: { module: 'Bookings - Cab', group: 'Detail', operation: 'Modify', category: 'Entry' }
    },
    {
        path: 'details/:id',
        component: CabBookingDetailsComponent,
        canActivate: [AuthGuard],
        data: { module: 'Bookings - Cab', group: 'Listing', operation: 'View Detail', category: 'View Detail' }
    }
] as Routes

