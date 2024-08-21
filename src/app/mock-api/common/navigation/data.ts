/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';
import { Routes } from 'app/common/const';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'crm',
        title: 'CRM',
        type: 'group',
        pid: 'MAINMENU_CRM_VIEW',
        icon: 'heroicons_outline:squares-2x2',
        children: [
            {
                id: 'crm.lead',
                title: 'Leads',
                type: 'basic',
                pid: 'CRM_LEAD_VIEW',
                icon: 'heroicons_outline:plus',
                link: Routes.crm.lead_route
            },
            {
                id: 'crm.crmagent',
                title: 'Agents',
                type: 'basic',
                pid: 'CRM_AGENT_VIEW',
                icon: 'mat_outline:contact_page',
                link: Routes.crm.agents_route
            },
            {
                id: 'crm.collection',
                title: 'Collection',
                type: 'basic',
                pid: 'CRM_COLLECTION_VIEW',
                icon: 'heroicons_outline:queue-list',
                link: Routes.crm.collections_route
            },
            {
                id: 'crm.techdashboard',
                title: 'Tech Dashboard',
                type: 'basic',
                pid: 'CRM_TECHDASHBOARD_VIEW',
                icon: 'heroicons_outline:squares-plus',
                link: Routes.crm.tech_route
            },
            {
                id: 'crm.referral_link',
                title: 'Referral Link',
                type: 'basic',
                pid: 'CRM_REFERRALLINK_VIEW',
                icon: 'heroicons_outline:link',
                link: Routes.crm.referral_link_route
            }
        ]
    },
    {
        id: 'masters',
        title: 'Masters',
        type: 'group',
        pid: 'MAINMENU_MASTERS_VIEW',
        icon: 'heroicons_outline:squares-2x2',
        children: [
            {
                id: 'master.city',
                title: 'City',
                type: 'basic',
                pid: 'MASTERS_CITY_VIEW',
                icon: 'heroicons_outline:building-office-2',
                link: Routes.masters.city_route
            },
            {
                id: 'master.Company',
                title: 'Company',
                type: 'basic',
                pid: 'MASTERS_COMPANY_VIEW',
                icon: 'heroicons_outline:building-storefront',
                link: Routes.masters.compny_route
            },
            // {
            //     id: 'master.Bank',
            //     title: 'Bank',
            //     type: 'basic',
            //     pid: 'MASTERS_BANK_VIEW',
            //     icon: 'heroicons_outline:building-office',
            //     link: Routes.masters.bank_route
            // },
            {
                id: 'master.currency',
                title: 'Currency',
                type: 'basic',
                pid: 'MASTERS_CURRENCY_VIEW',
                icon: 'heroicons_outline:currency-rupee',
                link: Routes.masters.currency_route
            },
            {
                id: 'master.currency',
                title: 'Currency ROE',
                type: 'basic',
                pid: 'MASTERS_CURRENCYROE_VIEW',
                icon: 'heroicons_outline:currency-rupee',
                link: Routes.masters.currency_roe_route
            },
            {
                id: 'master.destination',
                title: 'Destination',
                type: 'basic',
                pid: 'MASTERS_DESTINATION_VIEW',
                icon: 'heroicons_outline:globe-asia-australia',
                link: Routes.masters.destination_route
            },
            {
                id: 'master.supplier',
                title: 'Supplier',
                type: 'basic',
                pid: 'MASTERS_SUPPLIER_VIEW',
                icon: 'mat_outline:perm_contact_calendar',
                link: Routes.masters.supplier_route
            },
            {
                id: 'master.item',
                title: 'Items',
                type: 'basic',
                pid: 'MASTERS_ITEMS_VIEW',
                icon: 'heroicons_outline:square-2-stack',
                link: Routes.masters.item_route
            },
            {
                id: 'master.product',
                title: 'Products',
                type: 'basic',
                pid: 'MASTERS_PRODUCTS_VIEW',
                icon: 'heroicons_outline:sparkles',
                link: Routes.masters.product_route
            }
        ]
    },
    {
        id: 'customers',
        title: 'Customers',
        type: 'group',
        pid: 'MAINMENU_CUSTOMERS_VIEW',
        icon: 'mat_outline:fingerprint',
        children: [
            {
                id: 'master.new-signup',
                title: 'New Signup',
                type: 'basic',
                pid: 'CUSTOMERS_NEWSIGNUP_VIEW',
                icon: 'mat_outline:supervisor_account',
                link: Routes.customers.lead_route
            },
            {
                id: 'master.agent',
                title: 'Agents',
                type: 'basic',
                pid: 'CUSTOMERS_AGENTS_VIEW',
                icon: 'mat_outline:contact_page',
                link: Routes.customers.agent_route
            },
            {
                id: 'master.whitelabel',
                title: 'Whitelable',
                type: 'basic',
                pid: 'CUSTOMERS_WHITELABLE_VIEW',
                icon: 'mat_outline:branding_watermark',
                link: Routes.customers.whitelabel_route
            },
            {
                id: 'master.distributor',
                title: 'Distributor',
                type: 'basic',
                pid: 'CUSTOMERS_DISTRIBUTOR_VIEW',
                icon: 'mat_outline:hail',
                link: Routes.customers.distributor_route
            },
        ]
    },
    {
        id: 'account',
        title: 'Account',
        type: 'group',
        pid: 'MAINMENU_ACCOUNT_VIEW',
        icon: 'heroicons_outline:building-library',
        children: [
            {
                id: 'account.wallet',
                title: 'Wallet',
                type: 'basic',
                pid: 'ACCOUNT_WALLETRECHARGE_VIEW',
                icon: 'heroicons_outline:wallet',
                link: Routes.account.wallet_route
            },
            {
                id: 'account.WalletCredit',
                title: 'Credit',
                type: 'basic',
                pid: 'ACCOUNT_WALLETCREDIT_VIEW',
                icon: 'heroicons_outline:credit-card',
                link: Routes.account.wallet_credit_route
            },
            {
                id: 'account.withdraw',
                title: 'Withdraw',
                type: 'basic',
                pid: 'ACCOUNT_WITHDRAW_VIEW',
                icon: 'heroicons_outline:arrow-down-on-square-stack',
                link: Routes.account.withdraw_route
            },
            {
                id: 'reports.payments',
                title: 'Payment',
                type: 'basic',
                pid: 'ACCOUNT_PAYMENTS_VIEW',
                icon: 'heroicons_outline:currency-dollar',
                link: Routes.account.payment_path
            },
            {
                id: 'reports.receipts',
                title: 'Receipt',
                type: 'basic',
                pid: 'ACCOUNT_RECEIPTS_VIEW',
                icon: 'heroicons_outline:document',
                link: Routes.account.receipt_path
            },
            // Hide Payment link functionality
            // {
            //     id: 'reports.payment_link',
            //     title: 'Payment Link',
            //     type: 'basic',
            //     pid: 'ACCOUNT_PAYMENTLINK_VIEW',
            //     icon: 'heroicons_outline:link',
            //     link: Routes.account.payment_link_path
            // }
        ]
    },
    {
        id: 'kyc',
        title: 'KYC',
        type: 'group',
        pid: 'MAINMENU_KYC_VIEW',
        icon: 'mat_outline:fingerprint',
        children: [
            {
                id: 'kyc.dashboard',
                title: 'Dashboard',
                type: 'basic',
                pid: 'KYC_DASHBOARD_VIEW',
                icon: 'heroicons_outline:rectangle-group',
                link: Routes.kyc.dashboard_route
            },
            {
                id: 'kyc.types_of_documents',
                title: 'Types of Documents',
                type: 'basic',
                pid: 'KYC_TYPESOFDOCUMENTS_VIEW',
                icon: 'heroicons_outline:clipboard-document',
                link: Routes.kyc.typesofducuments_route
            },
            {
                id: 'kyc.kyc_profile',
                title: 'KYC Profile',
                type: 'basic',
                pid: 'KYC_KYCPROFILE_VIEW',
                icon: 'heroicons_outline:identification',
                link: Routes.kyc.kycprofile_route
            },
            {
                id: 'master.documents',
                title: 'Documents',
                type: 'basic',
                pid: 'KYC_DOCUMENTS_VIEW',
                icon: 'heroicons_outline:document-text',
                link: Routes.kyc.documents_route
            },
        ]
    },
    {
        id: 'bookings',
        title: 'Bookings',
        type: 'group',
        pid: 'MAINMENU_BOOKINGS_VIEW',
        icon: 'heroicons_outline:document-text',
        children: [
            {
                id: 'bookings.flight',
                title: 'Flights',
                type: 'collapsable',
                icon: 'flight_takeoff',
                pid: 'BOOKINGS_FLIGHTBOOKINGS_VIEW',
                children: [
                    {
                        id: 'bookings.bookings',
                        title: 'Bookings',
                        type: 'basic',
                        pid: 'BOOKINGS-FLIGHT_FLIGHT_VIEW',
                        link: Routes.booking.flight_route
                    },
                    {
                        id: 'booking.amendment_requests',
                        title: 'Amendment Requests',
                        type: 'basic',
                        pid: 'BOOKINGS-FLIGHT_AMENDMENTS_VIEW',
                        link: Routes.booking.amendment_requests_route
                    },
                    {
                        id: 'booking.group-inquiry',
                        title: 'Group Inquiry',
                        type: 'basic',
                        pid: 'BOOKINGS-FLIGHT_GROUPINQUIRY_VIEW',
                        link: Routes.booking.group_inquiry_path
                    }
                ]
            },
            {
                id: 'booking.bus',
                title: 'Bus',
                type: 'basic',
                pid: 'BOOKINGS_BUSES_VIEW',
                icon: 'directions_bus',
                link: Routes.booking.bus_route
            },
            {
                id: 'booking.hotel',
                title: 'Hotel',
                type: 'basic',
                pid: 'BOOKINGS_HOTELS_VIEW',
                icon: 'heroicons_outline:building-office-2',
                link: Routes.booking.hotel_route
            },
            {
                id: 'booking.visa',
                title: 'Visa',
                type: 'basic',
                pid: 'BOOKINGS_VISA_VIEW',
                icon: 'badge',
                link: Routes.booking.visa_route
            },
            {
                id: 'booking.offline_serivce',
                title: 'Offline Service',
                type: 'basic',
                pid: 'BOOKINGS_OFFLINESERVICE_VIEW',
                icon: 'heroicons_outline:newspaper',
                link: Routes.booking.offline_service_route
            }
        ]
    },
    {
        id: 'reports',
        title: 'Reports',
        type: 'group',
        pid: 'MAINMENU_REPORTS_VIEW',
        icon: 'heroicons_outline:document-text',
        children: [
            {
                id: 'reports.account',
                title: 'Accounts',
                type: 'collapsable',
                pid:'REPORTS_ACCOUNTS-REPORT_VIEW',
                icon: 'heroicons_outline:building-library',
                // link: Routes.reports.account_route
                children: [
                    {
                        id: 'reports.balance_register',
                        title: 'Agent Balance Register',
                        type: 'basic',
                        pid:'REPORTS-ACCOUNTS_AGENT-BALANCE_VIEW',
                        icon: '',
                        link: Routes.account.agent_balance_path_route
                    },
                    {
                        id: 'reports.commission_expense',
                        title: 'Commission Expense',
                        type: 'basic',
                        pid:'REPORTS-ACCOUNTS_COMMISSIONEXPENSE_VIEW',
                        icon: '',
                        link: Routes.account.commission_expense_route
                    },
                    {
                        id: 'reports.commission_income',
                        title: 'Commission Income',
                        type: 'basic',
                        pid:'REPORTS-ACCOUNTS_COMMISSIONINCOME_VIEW',
                        icon: '',
                        link: Routes.account.commission_income_route
                    },
                    {
                        id: 'reports.first_transaction',
                        title: 'First Transaction',
                        type: 'basic',
                        pid:'REPORTS-ACCOUNTS_FIRSTTRANSACTION_VIEW',
                        icon: '',
                        link: Routes.account.first_transaction_route
                    },
                    {
                        id: 'reports.ledger',
                        title: 'Ledger',
                        type: 'basic',
                        pid:'REPORTS-ACCOUNTS_LEDGER_VIEW',
                        icon: '',
                        link: Routes.reports.ledger_route
                    },
                    {
                        id: 'reports.purchase_register',
                        title: 'Purchase Register',
                        type: 'basic',
                        pid:'REPORTS-ACCOUNTS_PURCHASEREGISTER_VIEW',
                        icon: '',
                        link: Routes.account.purchase_register_route
                    },
                    {
                        id: 'reports.receipt_register',
                        title: 'Receipt Register',
                        type: 'basic',
                        pid:'REPORTS-ACCOUNTS_RECEIPTREGISTER_VIEW',
                        icon: '',
                        link: Routes.account.receipt_register_route
                    },
                    {
                        id: 'reports.sale_book',
                        title: 'Sale Book',
                        type: 'basic',
                        pid:'REPORTS-ACCOUNTS_SALEBOOK_VIEW',
                        icon: '',
                        link: Routes.account.sale_route
                    },
                    {
                        id: 'reports.sales_return',
                        title: 'Sales Return',
                        type: 'basic',
                        pid:'REPORTS-ACCOUNTS_SALESRETURN_VIEW',
                        icon: '',
                        link: Routes.account.sales_return_route
                    },
                    {
                        id: 'reports.wallet_outstanding',
                        title: 'Wallet Outstanding',
                        type: 'basic',
                        pid:'REPORTS-ACCOUNTS_WALLET-OUTSTANDING_VIEW',
                        icon: '',
                        link: Routes.account.wallet_outstanding_route
                    }
                    // {
                    //     id: 'reports.transaction',
                    //     title: 'Transactions',
                    //     type: 'basic',
                    //     pid:'REPORTS-ACCOUNTS_TRANSACTIONS_VIEW',
                    //     icon: '',
                    //     link: ""
                    // },
                    // {
                    //     id: 'reports.balance_register',
                    //     title: 'Balance Register',
                    //     type: 'basic',
                    //     pid:'REPORTS-ACCOUNTS_BALANCE-REGISTER_VIEW',
                    //     icon: '',
                    //     link: ""
                    // },
                ]
            },
            {
                id: 'reports.leads',
                title: 'Leads',
                type: 'collapsable',
                pid:'REPORTS_LEADS-REPORTS_VIEW',
                icon: 'heroicons_outline:adjustments-vertical',
                children: [
                    {
                        id: 'reports.ledger',
                        title: 'Register',
                        type: 'basic',
                        pid:'LEADS-REPORTS_REGISTER_VIEW',
                        icon: '',
                        link: Routes.leads.leads_register_route
                    },
                    {
                        id: 'reports.leadsrep',
                        title: 'RM Wise Leads',
                        type: 'basic',
                        pid:'LEADS-REPORTS_RMWISELEADS_VIEW',
                        icon: '',
                        link: Routes.reports.leads_rmwise_route
                    },
                ]
            },
            {
                id: 'reports.sales',
                title: 'Sales',
                type: 'collapsable',
                pid:'REPORTS_SALES-REPORTS_VIEW',
                icon: 'heroicons_outline:cube',
                children: [
                    {
                        id: 'reports.products',
                        title: 'Products',
                        type: 'basic',
                        pid:'SALES-REPORTS_PRODUCTS_VIEW',
                        icon: '',
                        link: Routes.reports.products_route
                    }
                ]
            },
            {
                id: 'reports.agentsrep',
                title: 'Agents',
                type: 'collapsable',
                pid:'REPORTS_AGENTS-REPORTS_VIEW',
                icon: 'heroicons_outline:square-3-stack-3d',
                children: [
                    {
                        id: 'reports.agentrmwise',
                        title: 'RM Wise Agents',
                        type: 'basic',
                        pid:'AGENTS-REPORTS_RMWISEAGENTS_VIEW',
                        icon: '',
                        link: Routes.reports.agents_rmwise_agents_route
                    }
                ]
            },
            {
                id: 'reports.contracting',
                title: 'Contracting',
                type: 'collapsable',
                pid:'REPORTS_CONTRACTING-REPORTS_VIEW',
                icon: 'heroicons_outline:chart-bar-square',
                children: [
                    {
                        id: 'reports.airline',
                        title: 'Airline',
                        type: 'basic',
                        pid:'CONTRACTING-REPORTS_AIRLINE_VIEW',
                        icon: '',
                        link: Routes.reports.airline_route
                    },
                    // {
                    //     id: 'reports.hotel',
                    //     title: 'Hotel',
                    //     type: 'basic',
                    //     pid:'CONTRACTING-REPORTS_HOTEL_VIEW',
                    //     icon: '',
                    //     link: Routes.reports.hotel_route
                    // },
                    // {
                    //     id: 'reports.bus',
                    //     title: 'Bus',
                    //     type: 'basic',
                    //     pid:'CONTRACTING-REPORTS_BUS_VIEW',
                    //     icon: '',
                    //     link: Routes.reports.bus_route
                    // },
                ]
            },
            {
                id: 'reports.campaign',
                title: 'Campaign',
                type: 'collapsable',
                pid:'REPORTS_CAMPAIGN-REPORTS_VIEW',
                icon: 'mat_outline:campaign',
                children: [
                    {
                        id: 'reports.campaignsummary',
                        title: 'Campaign Summary',
                        type: 'basic',
                        pid:'CAMPAIGN-REPORTS_CAMPAIGNSUMMARY_VIEW',
                        icon: '',
                        link: Routes.reports.campaign_summary_path_route
                    },
                ]
            }
        ],

    },
    {
        id: 'inventory',
        title: 'Inventory',
        pid: 'MAINMENU_INVENTORY_VIEW',
        type: 'group',
        icon: 'mat_outline:inventory',
        children: [
            {
                id: 'inventory.activity',
                title: 'Activity',
                type: 'basic',
                pid:'INVENTORY_ACTIVITY_VIEW',
                icon: 'mat_outline:rowing',
                link: Routes.inventory.activity_route
            },
            {
                id: 'inventory.transfer',
                title: 'Transfers',
                type: 'basic',
                pid:'INVENTORY_TRANSFERS_VIEW',
                icon: 'mat_outline:transfer_within_a_station',
                link: Routes.inventory.transfer_route
            },
            {
                id: 'inventory.holiday',
                title: 'Holiday Products',
                type: 'basic',
                pid:'INVENTORY_HOLIDAYPRODUCTS_VIEW',
                icon: 'mat_outline:holiday_village',
                link: Routes.inventory.holiday_route
            },
            {
                id: 'inventory.vehicle',
                title: 'Vehicle',
                type: 'basic',
                pid:'INVENTORY_VEHICLE_VIEW',
                icon: 'mat_outline:local_taxi',
                link: Routes.inventory.vehicle_route
            },
            {
                id: 'inventory.hotel',
                title: 'Hotel',
                type: 'basic',
                pid:'INVENTORY_HOTEL_VIEW',
                icon: 'heroicons_outline:building-office-2',
                link: Routes.inventory.hotel_route
            },
            {
                id: 'inventory.visa',
                title: 'Visa',
                type: 'basic',
                pid:'INVENTORY_VISA_VIEW',
                icon: 'heroicons_outline:newspaper',
                link: Routes.inventory.visa_route
            },
            // {
            //     id: 'inventory.markupProfile',
            //     title: 'Markup Profile',
            //     type: 'basic',
            //     icon: 'heroicons_outline:queue-list',
            //     link: Routes.inventory.markup_profile_route
            // },
            // {
            //     id: 'inventory.productfixdeparture',
            //     title: 'Product Fix Departure',
            //     type: 'basic',
            //     icon: 'heroicons_outline:building-office-2',
            //     link: Routes.inventory.product_fix_departure_route
            // },
            // {
            //     id: 'inventory.productflight',
            //     title: 'Product Flight',
            //     type: 'basic',
            //     icon: 'heroicons_outline:building-office-2',
            //     link: Routes.inventory.product_flight_route
            // },
        ]
    },
    {
        id: 'hr',
        title: 'HR',
        type: 'group',
        pid: 'MAINMENU_HR_VIEW',
        icon: 'mat_outline:fingerprint',
        children: [
            {
                id: 'hr.department',
                title: 'Department',
                type: 'basic',
                pid: 'HR_DEPARTMENT_VIEW',
                icon: 'mat_outline:group_work',
                link: Routes.hr.department_route
            },
            {
                id: 'hr.designation',
                title: 'Designation',
                type: 'basic',
                pid: 'HR_DESIGNATION_VIEW',
                icon: 'mat_outline:supervised_user_circle',
                link: Routes.hr.designation_route
            },
            {
                id: 'hr.employee',
                title: 'Employee',
                type: 'basic',
                pid: 'HR_EMPLOYEE_VIEW',
                icon: 'heroicons_outline:user',
                link: Routes.hr.employee_route
            },
            {
                id: 'hr.permission',
                title: 'Permission Master',
                type: 'basic',
                pid: 'HR_PERMISSIONMASTER_VIEW',
                icon: 'mat_outline:bookmark',
                link: Routes.hr.permission_route
            },
            {
                id: 'hr.permission-profile',
                title: 'Permission Profile',
                type: 'basic',
                pid: 'HR_PERMISSIONPROFILE_VIEW',
                icon: 'mat_outline:verified_user',
                link: Routes.hr.permissionProfile_route
            },
        ]
    },
    {
        id: 'settings',
        title: 'Settings',
        type: 'group',
        pid: 'MAINMENU_SETTINGS_VIEW',
        icon: 'mat_outline:settings',
        children: [
            {
                id: 'settings.erp',
                title: 'ERP Settings',
                type: 'basic',
                pid:'SETTINGS_ERPSETTINGS_VIEW',
                icon: 'mat_outline:settings',
                link: Routes.settings.erpsettings_route
            },
            {
                id: 'settings.markupprofile',
                title: 'Markup Profile',
                type: 'basic',
                pid:'SETTINGS_MARKUPPROFILE_VIEW',
                icon: 'mat_outline:payments',
                link: Routes.settings.markupprofile_route
            },
            {
                id: 'settings.emailsetup',
                title: 'Email Setup',
                type: 'basic',
                pid:'SETTINGS_EMAILSETUP_VIEW',
                icon: 'mat_outline:mail',
                link: Routes.settings.emailsetup_route
            },
            {
                id: 'settings.messageevents',
                title: 'Message Events',
                type: 'basic',
                pid:'SETTINGS_MESSAGEEVENTS_VIEW',
                icon: 'mat_outline:speaker_notes',
                link: Routes.settings.messageevents_route
            },
            {
                id: 'settings.messagetemplates',
                title: 'Message Templates',
                type: 'basic',
                pid:'SETTINGS_MESSAGETEMPLATES_VIEW',
                icon: 'mat_outline:drafts',
                link: Routes.settings.messagetemplates_route
            },
            {
                id: 'settings.supplierapi',
                title: 'Supplier API',
                type: 'basic',
                pid:'SETTINGS_SUPPLIERAPI_VIEW',
                icon: 'mat_outline:perm_contact_calendar',
                link: Routes.settings.supplierapi_route
            },
            {
                id: 'settings.erp',
                title: 'PSP',
                type: 'basic',
                pid:'SETTINGS_PSP_VIEW',
                icon: 'mat_outline:settings',
                link: Routes.settings.pspsetting_route
            },
            {
                id: 'settings.cachingparameters',
                title: 'Caching Parameters',
                type: 'basic',
                pid: 'MASTERS_CACHINGPARAMETERS_VIEW',
                icon: 'heroicons_outline:square-3-stack-3d',
                link: Routes.settings.caching_parameters_route
            }
        ]
    }
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id: 'crm',
        title: 'CRM',
        type: 'aside',
        pid: 'MAINMENU_CRM_VIEW',
        icon: 'heroicons_outline:rectangle-group',
        children: []
    },
    {
        id: 'masters',
        title: 'Masters',
        type: 'aside',
        pid: 'MAINMENU_MASTERS_VIEW',
        icon: 'heroicons_outline:squares-2x2',
        children: []
    },
    {
        id: 'customers',
        title: 'Customers',
        type: 'aside',
        pid: 'MAINMENU_CUSTOMERS_VIEW',
        icon: 'heroicons_outline:users',
        children: []
    },
    {
        id: 'account',
        title: 'Account',
        type: 'aside',
        pid: 'MAINMENU_ACCOUNT_VIEW',
        icon: 'heroicons_outline:document-duplicate',
        children: []
    },
    {
        id: 'kyc',
        title: 'KYC',
        type: 'aside',
        pid: 'MAINMENU_KYC_VIEW',
        icon: 'heroicons_outline:shield-check',
        children: []
    },
    {
        id: 'bookings',
        title: 'Bookings',
        type: 'aside',
        pid: 'MAINMENU_BOOKINGS_VIEW',
        icon: 'heroicons_outline:square-3-stack-3d',
        children: []
    },
    {
        id: 'reports',
        title: 'Reports',
        type: 'aside',
        pid: 'MAINMENU_REPORTS_VIEW',
        icon: 'heroicons_outline:square-2-stack',
        children: []
    },
    {
        id: 'inventory',
        title: 'Inventory',
        type: 'aside',
        pid: 'MAINMENU_INVENTORY_VIEW',
        icon: 'heroicons_outline:chart-bar-square',
        children: []
    },
    {
        id: 'hr',
        title: 'HR',
        type: 'aside',
        pid: 'MAINMENU_HR_VIEW',
        icon: 'heroicons_outline:user',
        children: []
    },
    {
        id: 'settings',
        title: 'Settings',
        type: 'aside',
        pid: 'MAINMENU_SETTINGS_VIEW',
        icon: 'heroicons_outline:cog-8-tooth',
        children: []
    }
]
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example'
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example'
    }
];
