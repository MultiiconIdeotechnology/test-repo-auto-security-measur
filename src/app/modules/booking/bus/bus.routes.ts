import { Routes } from "@angular/router";
import { BusBookingDetailsComponent } from "./bus-booking-details/bus-booking-details.component";
import { BusComponent } from "./bus.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: BusComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Bookings', operation: 'Buses', category: 'View' }
    },
    {
        path: 'details',
        component: BusBookingDetailsComponent,
        canActivate: [AuthGuard],
        data: { module: 'Bus', group: 'Bookings', operation: 'View Detail', category: 'View Detail' }
    },
    {
        path: 'details/:id',
        component: BusBookingDetailsComponent,
        canActivate: [AuthGuard],
        data: { module: 'Bus', group: 'Listing', operation: 'View Detail', category: 'View Detail' }
    }
] as Routes

