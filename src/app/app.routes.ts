import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { Routes } from './common/const';
import { AuthGuard } from './core/auth/guards/auth.guard';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    { path: '', pathMatch: 'full', redirectTo: 'masters/city' },

    // Redirect signed-in user to the '/example'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'masters/city' },

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes') },
            { path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes') },
            { path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes') },
            { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes') },
            { path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes') },
            { path: 'upload-logo', loadChildren: () => import('app/modules/auth/upload-logo/upload-logo.routes') },
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes') },
            { path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes') }
        ]
    },

    // Landing routes
    // {
    //     path: '',
    //     component: LayoutComponent,
    //     data: {
    //         layout: 'empty'
    //     },
    //     children: [
    //         {path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes')},
    //     ]
    // },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            // CRM
            { path: Routes.crm.lead_path, loadChildren: () => import('app/modules/crm/lead/lead-list/lead-list.routes') },
            { path: Routes.crm.agents_path, loadChildren: () => import('app/modules/crm/agent/agent-list/agent-list.routes') },
            { path: Routes.crm.collections_path, loadChildren: () => import('app/modules/crm/collection/collection-list/collection-list.routes') },
            { path: Routes.crm.tech_path, loadChildren: () => import('app/modules/crm/tech-dashboard/tech-dashboard-list/tech-dashboard-list.routes') },
            { path: Routes.crm.referral_link_path, loadChildren: () => import('app/modules/crm/referral-link/referral-list/referral.routes') },

            // MASTERS
            { path: Routes.masters.city_path, loadChildren: () => import('app/modules/masters/city/city-list/city-list.routes') },
            { path: Routes.masters.compny_path, loadChildren: () => import('app/modules/masters/compny/compny-list/compny.routes') },
            { path: Routes.masters.bank_path, loadChildren: () => import('app/modules/masters/bank/bank-list/bank.routes') },
            { path: Routes.masters.currency_path, loadChildren: () => import('app/modules/masters/currency/currency-list/currency-list.routes') },
            { path: Routes.masters.currency_roe_path, loadChildren: () => import('app/modules/masters/currency-roe/currency-roe-list/currency-roe.routes') },
            { path: Routes.masters.destination_path, loadChildren: () => import('app/modules/masters/destination/destination-list/destination-list.routes') },
            { path: Routes.masters.supplier_path, loadChildren: () => import('app/modules/masters/supplier/supplier-list/supplier-list.routes') },
            { path: Routes.masters.item_path, loadChildren: () => import('app/modules/masters/item-master/item-list/item-list.routes') },
            { path: Routes.masters.product_path, loadChildren: () => import('app/modules/masters/product-master/product-list/product-list.routes') },

            // Customers
            { path: Routes.customers.lead_path, loadChildren: () => import('app/modules/masters/lead/main-list/lead.routes') },
            { path: Routes.customers.agent_path, loadChildren: () => import('app/modules/masters/agent/agent-list/agent-list.routes') },
            { path: Routes.customers.whitelabel_path, loadChildren: () => import('app/modules/masters/whitelabel/whitelabel-list/whitelabel-list.routes') },
            { path: Routes.customers.distributor_path, loadChildren: () => import('app/modules/masters/distributor/distributor-list/distributor-list.routes') },

            // KYC
            { path: Routes.kyc.dashboard_path, loadChildren: () => import('app/modules/kyc/dashboard/main/main.routes') },
            { path: Routes.kyc.typesofducuments_path, loadChildren: () => import('app/modules/kyc/types-of-documents/types-of-documents-list/types-of-documents-list.routes') },
            { path: Routes.kyc.kycprofile_path, loadChildren: () => import('app/modules/kyc/kyc-profile/kyc-profile-list/kyc-profile-list.routes') },
            { path: Routes.kyc.documents_path, loadChildren: () => import('app/modules/kyc/documents/documents-list/documents.routes') },

            // HR
            { path: Routes.hr.department_path, loadChildren: () => import('app/modules/masters/department/department-list/department.routes') },
            { path: Routes.hr.designation_path, loadChildren: () => import('app/modules/masters/designation/designation-list/designation-list.routes') },
            { path: Routes.hr.employee_path, loadChildren: () => import('app/modules/masters/employee/employee-list/employee-list.routes') },
            { path: Routes.hr.permission_path, loadChildren: () => import('app/modules/masters/permission/permission-list/permission-list.routes') },
            { path: Routes.hr.permissionProfile_path, loadChildren: () => import('app/modules/masters/permission-profile/permission-profile-list/permission-profile.list.routes') },

            // Account
            { path: Routes.account.wallet_path, loadChildren: () => import('app/modules/account/wallet/wallet.routes') },
            { path: Routes.account.wallet_credit_path, loadChildren: () => import('app/modules/account/wallet-credit/walletcredit-list/wallet-credit.routes') },
            { path: Routes.account.withdraw_path, loadChildren: () => import('app/modules/account/withdraw/withdraw.routes') },
            { path: Routes.account.payment_path, loadChildren: () => import('app/modules/reports/account/payment-list/payment.routes') },
            { path: Routes.account.payment_link_path, loadChildren: () => import('app/modules/account/payment-link-list/payment-link.routes') },
            { path: Routes.account.receipt_path, loadChildren: () => import('app/modules/reports/account/receipt-list/receipt.routes') },
            { path: Routes.account.agent_balance_path, loadChildren: () => import('app/modules/reports/agent-balance/agent-balance.routes') },
            { path: Routes.account.sale_path, loadChildren: () => import('app/modules/reports/sale-book/sale-book/sale.routes') },
            { path: Routes.account.sales_return_path, loadChildren: () => import('app/modules/reports/sales-return/sales-return.routes') },
            { path: Routes.account.wallet_outstanding_path, loadChildren: () => import('app/modules/reports/wallet-outstanding/wallet-outstanding-list/wallet-outstanding.routes') },
            { path: Routes.leads.leads_register_path, loadChildren: () => import('app/modules/reports/leads/lead-register/leads-register.routes') },
            { path: Routes.account.receipt_register_path, loadChildren: () => import('app/modules/reports/account/receipt-register/receipt-register.routes') },
            { path: Routes.account.first_transaction_path, loadChildren: () => import('app/modules/reports/account/first-transaction/first-transaction.routes') },
            { path: Routes.account.commission_expense_path, loadChildren: () => import('app/modules/reports/account/commission-expense/commission-expense.routes') },
            { path: Routes.account.commission_income_path, loadChildren: () => import('app/modules/reports/account/commission-income/commission-income.routes') },
            { path: Routes.account.purchase_register_path, loadChildren: () => import('app/modules/reports/account/purchase-register/purchase-register.routes') },
            { path: Routes.account.agent_wise_service_wise_path, loadChildren: () => import('app/modules/reports/account/agent-wise-service-wise/agent-wise-service-wise.component.routes') },


            //Inventory
            { path: Routes.inventory.activity_path, loadChildren: () => import('app/modules/Inventory/activity/activity-list/activity-list.routes') },
            { path: Routes.inventory.transfer_path, loadChildren: () => import('app/modules/Inventory/Transfer/transfer-list/transfer-list.routes') },
            { path: Routes.inventory.holiday_path, loadChildren: () => import('app/modules/Inventory/Holiday/holiday-list/holiday-list.routes') },
            { path: Routes.inventory.vehicle_path, loadChildren: () => import('app/modules/Inventory/Vehicle/vehicle-list/vehicle-list.routes') },
            { path: Routes.inventory.hotel_path, loadChildren: () => import('app/modules/Inventory/hotel/hotel.routes') },
            { path: Routes.inventory.product_fix_departure_path, loadChildren: () => import('app/modules/Inventory/Product-Fix-Departure/product-fix-departure.routes') },
            { path: Routes.inventory.product_flight_path, loadChildren: () => import('app/modules/Inventory/Product-Flight/product-flight.routes') },
            { path: Routes.inventory.visa_path, loadChildren: () => import('app/modules/Inventory/visa/visa-list/visa.routes') },
            // {path: Routes.inventory.markup_profile_path, loadChildren: () => import('app/modules/Inventory/markup-profile/markup-profile-list/markup-profile-list.routes')},

            // REPORTS
            { path: Routes.reports.ledger_path, loadChildren: () => import('app/modules/reports/ledger/ledger-list/ledger-list.routes') },
            { path: Routes.reports.airline_path, loadChildren: () => import('app/modules/reports/contracting/airline/airline.routes') },
            { path: Routes.reports.airline_summary_path, loadChildren: () => import('app/modules/reports/contracting/airline-summary/airline-summary.component.routes') },
            { path: Routes.reports.airline_career_path, loadChildren: () => import('app/modules/reports/contracting/airline-career-wise/airline-career-wise.component.routes') },
            { path: Routes.reports.airline_monthly_path, loadChildren: () => import('app/modules/reports/contracting/airline-monthly/airline-monthly.component.routes') },
            { path: Routes.reports.airline_offline_path, loadChildren: () => import('app/modules/reports/contracting/airline-offline-tat/airline-offline-tat.component.routes') },
            { path: Routes.reports.airline_rejection_path, loadChildren: () => import('app/modules/reports/contracting/airline-rejection/airline-rejection.component.routes') },
            { path: Routes.reports.hotel_path, loadChildren: () => import('app/modules/reports/contracting/hotel/hotel.routes') },
            { path: Routes.reports.bus_path, loadChildren: () => import('app/modules/reports/contracting/bus/bus.routes') },
            { path: Routes.reports.agents_rmwise_agents_path, loadChildren: () => import('app/modules/reports/agents/agent-rmwise/agent-rmwise.routes') },
            { path: Routes.reports.campaign_summary_path, loadChildren: () => import('app/modules/reports/campaign/campaign-summary/campaign-summary/campaign-summary.routes') },
            { path: Routes.reports.leads_rmwise_path, loadChildren: () => import('app/modules/reports/leads/lead-rmwise/lead-rmwise.routes') },
            { path: Routes.reports.products_path, loadChildren: () => import('app/modules/reports/sales/product/sales-product/sales-product.routes') },
            { path: Routes.reports.pg_refund_path, loadChildren: () => import('app/modules/reports/PG Refund/pg-refund-list/pg-refund.routes') },
            { path: Routes.reports.agent_summary_path, loadChildren: () => import('app/modules/reports/sales/agent-summaries/agent-summary/agent-summary.routes') },

            // MY BOOKINGS
            { path: Routes.booking.flight_path, loadChildren: () => import('app/modules/booking/flight/flight/flights.routes') },
            { path: Routes.booking.amendment_requests_path, loadChildren: () => import('app/modules/booking/amendment-requests-list/amendment-requests-list.routes') },
            { path: Routes.booking.group_inquiry_path, loadChildren: () => import('app/modules/booking/group-inquiry/group-inquiry-list.routes') },
            { path: Routes.booking.bus_path, loadChildren: () => import('app/modules/booking/bus/bus.routes') },
            { path: Routes.booking.insurance_path, loadChildren: () => import('app/modules/booking/insurance/insurance/insurance.routes') },
            { path: Routes.booking.hotel_path, loadChildren: () => import('app/modules/booking/hotel/hotels-list/hotel.routes') },
            { path: Routes.booking.forex_path, loadChildren: () => import('app/modules/booking/forex/forex-list/forex.routes') },
            { path: Routes.booking.visa_path, loadChildren: () => import('app/modules/booking/visa/visa.routes') },
            { path: Routes.booking.offline_service_path, loadChildren: () => import('app/modules/booking/offline-service/offline-list/offline.routes') },

            // SETTINGS
            { path: Routes.settings.erpsettings_path, loadChildren: () => import('app/modules/settings/erp-settings/erp-settings.routes') },
            { path: Routes.settings.markupprofile_path, loadChildren: () => import('app/modules/settings/markup-profile/markup-profile.routes') },
            { path: Routes.settings.emailsetup_path, loadChildren: () => import('app/modules/settings/email-setup/email-setup.routes') },
            { path: Routes.settings.messageevents_path, loadChildren: () => import('app/modules/settings/message-events/message-events.routes') },
            { path: Routes.settings.messagetemplates_path, loadChildren: () => import('app/modules/settings/message-templates/message-templates.routes') },
            { path: Routes.settings.supplierapi_path, loadChildren: () => import('app/modules/settings/supplier-api/supplier-api.routes') },
            { path: Routes.settings.pspsetting_path, loadChildren: () => import('app/modules/settings/psp-setting/psp.routes') },
            { path: Routes.settings.caching_parameters_path, loadChildren: () => import('app/modules/masters/caching-parameters/caching-parameters-list/caching-parameters-list.routes') },
        ]
    },
];
