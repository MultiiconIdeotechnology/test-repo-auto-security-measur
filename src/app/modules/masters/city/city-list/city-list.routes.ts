import { Routes } from "@angular/router";
import { CityListComponent } from "./city-list.component";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
// import { CityEntryComponent } from "../city-entry/city-entry.component";

export default [
    {
        path: '',
        component: CityListComponent,
        canActivate: [AuthGuard],   
        data: {module: 'BO Menu Links', group: 'Masters', operation: 'City', category: 'View'}
    },
    // {
    //     path: 'entry',
    //     component: CityEntryComponent
    // },
    // {
    //     path: 'entry/:id',
    //     component: CityEntryComponent
    // },
    // {
    //     path: 'entry/:id/:readonly',
    //     component: CityEntryComponent
    // }
] as Routes