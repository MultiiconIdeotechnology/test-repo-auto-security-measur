import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { HolidayLeadComponent } from "./holiday-lead.component";
import { HolidayLeadBookingDetailsComponent } from "../holiday-booking-details/holiday-lead-booking-details.component";

export default [
    {
        path: '',
        component: HolidayLeadComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Bookings', operation: 'Holiday Lead', category: 'View' }
    },
    {
        path: 'details',
        component: HolidayLeadBookingDetailsComponent,
        canActivate: [AuthGuard],
        data: { module: 'Holiday Lead', group: 'Bookings', operation: 'View Detail', category: 'View Detail' }
    },
    {
        path: 'details/:id',
        component: HolidayLeadBookingDetailsComponent,
        canActivate: [AuthGuard],
        data: { module: 'Holiday Lead', group: 'Listing', operation: 'View Detail', category: 'View Detail' }
    }
] as Routes

