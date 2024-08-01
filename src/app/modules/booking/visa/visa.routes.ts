import { Routes } from "@angular/router";
import { VisaComponent } from "./visa.component";
import { VisaBookingDetailsComponent } from "./visa-booking-details/visa-booking-details.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: VisaComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Bookings', operation: 'Visa', category: 'View' }
    },
    {
        path: 'details',
        component: VisaBookingDetailsComponent,
        canActivate: [AuthGuard],
        data: { module: 'Bookings - Visa', group: 'Listing', operation: 'View All Data', category: 'View' }
    },
    {
        path: 'details/:id',
        component: VisaBookingDetailsComponent,
        canActivate: [AuthGuard],
        data: { module: 'Bookings - Visa', group: 'Listing', operation: 'View All Data', category: 'View' }
    }
] as Routes

