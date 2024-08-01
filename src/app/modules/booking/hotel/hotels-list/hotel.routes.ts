import { Routes } from "@angular/router";
import { HotelBookingDetailsComponent } from "../hotel-booking-details/hotel-booking-details.component";
import { HotelsListComponent } from "./hotels-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: HotelsListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Bookings', operation: 'Hotels', category: 'View' }
    },
    {
        path: 'details',
        component: HotelBookingDetailsComponent,
        canActivate: [AuthGuard],
        data: { module: 'Bookings - Hotel', group: 'Detail', operation: 'Modify', category: 'Entry' }
    },
    {
        path: 'details/:id',
        component: HotelBookingDetailsComponent,
        canActivate: [AuthGuard],
        data: { module: 'Bookings - Hotel', group: 'Detail', operation: 'Modify', category: 'Entry' }
    }
] as Routes

