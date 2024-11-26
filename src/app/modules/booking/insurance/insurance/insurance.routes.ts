import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { InsuranceComponent } from "./insurance.component";
import { InsuranceBookingDetailsComponent } from "../insurance-booking-details/insurance-booking-details.component";

export default [
    {
        path: '',
        component: InsuranceComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Bookings', operation: 'Insurance', category: 'View' }
    },
    {
        path: 'details',
        component: InsuranceBookingDetailsComponent,
        canActivate: [AuthGuard],
        data: { module: 'Insurance', group: 'Listing', operation: 'View Detail', category: 'View' }
    },
    {
        path: 'details/:id',
        component: InsuranceBookingDetailsComponent,
        canActivate: [AuthGuard],
        data: { module: 'Insurance', group: 'Listing', operation: 'View Detail', category: 'View' }
    }
] as Routes

