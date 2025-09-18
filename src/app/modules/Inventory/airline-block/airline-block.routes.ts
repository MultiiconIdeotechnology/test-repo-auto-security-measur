import { Routes } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { AirlineBlockListComponent } from './airline-block-list/airline-block-list.component';
import { AirlineBlockViewDetailsComponent } from './airline-block-view-details/airline-block-view-details.component';

export default [
    {
        path: '',
        component: AirlineBlockListComponent,
        canActivate: [AuthGuard], 
        data: {module: 'BO Menu Links', group: 'Inventory', operation: 'Airline Block', category: 'View' }
    },
    {
        path     : 'view-details',
        component: AirlineBlockViewDetailsComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Inventory', operation: 'Airline Block', category: 'View' }
    },
] as Routes
