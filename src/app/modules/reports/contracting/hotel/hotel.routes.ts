import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { HotelComponent } from "./hotel.component";

export default [
    {
        path: '',
        component: HotelComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Contracting-Reports', operation: 'Hotel', category: 'View' }
    },
] as Routes
