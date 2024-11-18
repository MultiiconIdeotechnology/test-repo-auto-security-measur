import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { ForexListComponent } from "./forex-list.component";
import { ForexBookingDetailsComponent } from "../forex-booking-details/forex-booking-details.component";

export default [
    {
        path: '',
        component: ForexListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Bookings', operation: 'Forex', category: 'View' }
    },
    {
        path: 'details',
        component: ForexBookingDetailsComponent,
        canActivate: [AuthGuard],
        data: { module: 'Bookings - Forex', group: 'Detail', operation: 'Modify', category: 'Entry' }
    },
    {
        path: 'details/:id',
        component: ForexBookingDetailsComponent,
        canActivate: [AuthGuard],
        data: { module: 'Bookings - Forex', group: 'Listing', operation: 'View Detail', category: 'View Detail' }
    }
] as Routes

