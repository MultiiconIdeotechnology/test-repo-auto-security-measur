import { Routes } from "@angular/router";
import { MarkupProfileListComponent } from "./markup-profile-list.component";
import { MarkupProfileEntryComponent } from "../markup-profile-entry/markup-profile-entry.component";

export default [
    {
        path: '',
        component: MarkupProfileListComponent
    },
    {
        path: 'entry',
        component: MarkupProfileEntryComponent
    }
] as Routes