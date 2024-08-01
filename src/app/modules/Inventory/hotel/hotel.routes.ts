import { Routes } from "@angular/router";
import { HotelListComponent } from "./hotel-list/hotel-list.component";
import { HotelEntryNewComponent } from "./hotel-entry-new/hotel-entry-new.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: HotelListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Inventory', operation: 'Hotel', category: 'View' }
    },
    {
        path: 'entry',
        component: HotelEntryNewComponent,
        canActivate: [AuthGuard],
        data: { module: 'Inventory - Hotel', group: 'Listing', operation: 'Add New', category: 'Entry' }
    },
    {
        path: 'entry/:id',
        component: HotelEntryNewComponent,
        canActivate: [AuthGuard],
        data: { module: 'Inventory - Hotel', group: 'Listing', operation: 'Modify', category: 'Entry' }
    },
    {
        path: 'entry/:id/:readonly',
        component: HotelEntryNewComponent,
        canActivate: [AuthGuard],
        data: { module: 'Inventory - Hotel', group: 'Listing', operation: 'View Detail', category: 'View Detail' }
    },
] as Routes