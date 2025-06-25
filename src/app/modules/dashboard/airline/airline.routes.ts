import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { AirlineComponent } from "./airline.component";

export default [
    {
        path: '',
        component: AirlineComponent,
        canActivate: [AuthGuard],   
        data: {module: 'BO Menu Links', group: 'Dashboard', operation: 'Airline', category: 'View'}
    },
     {
        path: 'flights/detail/:from/:to/:departureDate',
        component: AirlineComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Bookings - Flight', operation: 'Flight', category: 'View' }
    },
    // http://localhost:4800/dashboard/airline/flights/detail/DXB/BOM/2025-06-25
    {
        path: 'flights/detail/:from/:to/:departureDate/:returnDate',
        component: AirlineComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Dashboard', operation: 'Airline', category: 'View' }
    }
] as Routes