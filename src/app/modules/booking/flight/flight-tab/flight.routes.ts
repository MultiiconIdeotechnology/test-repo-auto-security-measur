import { Routes } from "@angular/router";
import { BookingDetailsComponent } from "../flight/booking-details/booking-details.component";
import { FlightTabComponent } from "./flight-tab.component";

export default [
    {
        path: '',
        component: FlightTabComponent
    },
    {
        path: 'details',
        component: BookingDetailsComponent
    },
    {
        path: 'details/:id/:readonly',
        component: BookingDetailsComponent
    }
] as Routes