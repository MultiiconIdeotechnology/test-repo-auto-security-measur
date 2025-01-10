import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { ProductMonthlyAnalyticsComponent } from "./product-monthly-analytics.component";


export default [
    {
        path: '',
        component: ProductMonthlyAnalyticsComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Tech Business Report', operation: 'Product Monthly Analytics', category: 'View' }
    },
] as Routes