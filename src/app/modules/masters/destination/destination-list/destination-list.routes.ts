import { Routes } from "@angular/router";
import { DestinationListComponent } from "./destination-list.component";
import { DestinationFormEntryComponent } from "../destination-form-entry/destination-form-entry.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: DestinationListComponent,
        canActivate: [AuthGuard],   
        data: {module: 'BO Menu Links', group: 'Masters', operation: 'Destination', category: 'View'}
    },
    {
        path: 'entry',
        component: DestinationFormEntryComponent,
        canActivate: [AuthGuard],   
        data: {module: 'Destination', group: 'Listing', operation: 'Add New', category: 'Entry'}
    },
    {
        path: 'entry/:id',
        component: DestinationFormEntryComponent,
        canActivate: [AuthGuard],   
        data: {module: 'Destination', group: 'Listing', operation: 'Modify', category: 'Entry'}
    },
    {
        path: 'entry/:id/:readonly',
        component: DestinationFormEntryComponent,
        canActivate: [AuthGuard],   
        data: {module: 'Destination', group: 'Listing', operation: 'Modify', category: 'Entry'}
    }
] as Routes