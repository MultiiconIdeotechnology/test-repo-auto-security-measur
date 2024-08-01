import { Routes } from "@angular/router";
import { EmployeeListComponent } from "./employee-list.component";
import { EmployeeEntryComponent } from "../employee-entry/employee-entry.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";

export default [
    {
        path: '',
        component: EmployeeListComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'HR', operation: 'Employee', category: 'View' }
    },
    {
        path: 'entry',
        component: EmployeeEntryComponent,
        canActivate: [AuthGuard],
        data: { module: 'Employee', group: 'Listing', operation: 'Add New', category: 'Entry' }
    },
    {
        path: 'entry/:id',
        component: EmployeeEntryComponent,
        canActivate: [AuthGuard],
        data: { module: 'Employee', group: 'Listing', operation: 'Modify', category: 'Entry' }
    },
    {
        path: 'entry/:id/:readonly',
        component: EmployeeEntryComponent,
        canActivate: [AuthGuard],
        data: { module: 'Employee', group: 'Listing', operation: 'View Detail', category: 'View Detail' }
    }
] as Routes