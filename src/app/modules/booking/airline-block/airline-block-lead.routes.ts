import { Routes } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { AirlineBlockLeadComponent } from './airline-block-lead/airline-block-lead.component';
import { AirlineBlockLeadDetailsComponent } from './airline-block-lead-details/airline-block-lead-details.component';

export default [
    {
        path: '',
        component: AirlineBlockLeadComponent,
        canActivate: [AuthGuard], 
        data: {module: 'BO Menu Links', group: 'Bookings - Flight', operation: 'Airline Block', category: 'View'}
    },
    {
        path: 'details/:id',
        component: AirlineBlockLeadDetailsComponent,
        canActivate: [AuthGuard], 
        data: {module: 'BO Menu Links', group: 'Bookings - Flight', operation: 'Airline Block', category: 'View'}
    },
] as Routes
