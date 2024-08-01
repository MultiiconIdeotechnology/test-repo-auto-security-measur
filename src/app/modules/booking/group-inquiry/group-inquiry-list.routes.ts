import { Routes } from "@angular/router";
import { GroupInquiryListComponent } from "./group-inquiry-list.component";
import { GroupInquiryComponent } from "./group-inquiry-detail/group-inquiry-detail.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: GroupInquiryListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Bookings - Flight', operation: 'Group Inquiry', category: 'View' }
    },
    {
        path: 'details/:id',
        component: GroupInquiryComponent,
        canActivate: [AuthGuard],
        data: { module: 'Group Inquiry', group: 'Listing', operation: 'View Detail', category: 'View Detail' }
    },
] as Routes