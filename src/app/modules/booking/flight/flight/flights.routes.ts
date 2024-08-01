import { Routes } from "@angular/router";
import { BookingDetailsComponent } from "../flight/booking-details/booking-details.component";
import { FlightComponent } from "./flight.component";
import { OfflinePnrComponent } from "./offline-pnr/offline-pnr.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: FlightComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Bookings - Flight', operation: 'Flight', category: 'View' }
    },
    {
        path: 'details',
        component: BookingDetailsComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Bookings - Flight', operation: 'Flight', category: 'View' }
    },
    {
        path: 'details/:id',
        component: BookingDetailsComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Bookings - Flight', operation: 'Flight', category: 'View' }
    },
    {
        path: 'offlinepnr/entry',
        component: OfflinePnrComponent
    }
] as Routes