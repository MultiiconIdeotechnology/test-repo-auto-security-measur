export const blockUIInstance = {
    main: 'block-ui-main'
};

export const dateTimeFormats = {
    shortDate: 'dd-MM-yyyy',
    shortTime: 'hh:MM:ss',
    shortDateTime: 'dd-MM-yyyy HH:mm',
    shortDateTimess: 'dd-MM-yyyy HH:mm:ss',
    shortDateM: 'dd MMM yyyy',
    shortDateTimeM: 'dd MMM yyyy HH:mm',
    longDateTime: 'dd MMMM yyyy HH:mm',
    longDateTimess: 'dd MMMM yyyy HH:mm:ss',
    statusLogFormat: 'dd-MMM-yyyy HH:mm tt',
};

export const dateRange = {
    today: 'Today',
    last3Days: 'Last 3 Days',
    lastWeek: 'This Week',
    lastMonth: 'This Month',
    last3Month: 'Last 3 Month',
    last6Month: 'Last 6 Month',
    setCustomDate: 'Set Custom Date',
};

export const dateRangeLeadRegister = {
    all: 'All',
    today: 'Today',
    last3Days: 'Last 3 Days',
    lastWeek: 'This Week',
    lastMonth: 'This Month',
    last3Month: 'Last 3 Month',
    last6Month: 'Last 6 Month',
    setCustomDate: 'Set Custom Date',
};

export const themes = {
    FamilyTour: 'Family Tour',
    VacationSpecial: 'Vacation Special',
    WaterSports: 'Water Sports',
    WinterSpecial: 'Winter Special',
    SummerSpecial: 'Summer Special',
    HillStation: 'Hill Station',
    LakeView: 'Lake View',
    Adventure: 'Adventure',
    HoneymoonSpecial: 'Honeymoon Special',
};

export const imageRecSize ={
    holiday: '(225px &#10005; 225px)',
    destination: '(225px &#10005; 225px)',
}

export const imageType = {
    cover: 'Cover Photo',
    gallery: 'Gallery'
}

export const inventoryType = {
    Hotel: 'Hotel',
    Activity: 'Activity',
    Transfer: 'Transfer',
    Other: 'Other',
};

export const tripType = {
    Departure: 'Departure',
    Return: 'Return',
};

export const acceptFiles = {
    files: '.gif, .jpg, .png, .zip, .pdf'
};

export const imgExtantions = {
    jpg: 'jpg',
    jpeg: 'jpeg',
    png: 'png',
    gif: 'gif',
    svg: 'svg'
}

export const mealPlan = {
    BreakfastOnly: 'Breakfast Only [CP]',
    BreaskfastLunchDinner: 'Breakfast + Lunch/Dinner [MAP]',
    BreaskfastDinner: 'Breakfast + Dinner [MAP]',
    BreakfastLunchDinner: 'Breakfast + Lunch + Dinner [AP]',
    RoomOnly: 'Room Only [EPAI]'
}

export const visaStatus = {
    Pending: "Pending",
    PaymentFailed: "Payment Failed",
    PaymentConfirmed: "Payment Confirmed",
    Inprocess: "Inprocess",
    DocumentsRejected: "Documents Rejected",
    DocumentsRevised: "Documents Revised",
    Applied: "Applied",
    Success: "Success",
    Rejected: "Rejected",
}

export const yesNo = {
    yes: 'Yes',
    no: 'No'
};

export const keys = {
    permission: '3zx6QLspd25',
    permissionHash: '6964D472E7741EC05A2DF8833E39DA88',
};

export const Routes = {
    crm: {
        lead_path: 'crm/lead',
        lead_route: '/crm/lead',
        lead_entry_route: '/crm/lead/entry',

        agents_path: 'crm/agent',
        agents_route: '/crm/agent',
        agents_entry_route: '/crm/agent/entry',

        collections_path: 'crm/collection',
        collections_route: '/crm/collection',
        collections_entry_route: '/crm/collection/entry',

        tech_path: 'crm/techdashboard',
        tech_route: '/crm/techdashboard',
        tech_entry_route: '/crm/techdashboard/entry',

        referral_link_path: 'crm/referral-link',
        referral_link_route: '/crm/referral-link',
    },

    masters: {
        city_path: 'masters/city',
        city_route: '/masters/city',
        city_entry_route: '/masters/city/entry',

        compny_path: 'masters/compny',
        compny_route: 'masters/compny',

        bank_path: 'masters/bank',
        bank_route: 'masters/bank',

        currency_path: 'masters/currency',
        currency_route: '/masters/currency',

        currency_roe_path: 'masters/currency-roe',
        currency_roe_route: '/masters/currency-roe',

        destination_path: 'masters/destination',
        destination_route: '/masters/destination',
        destination_form_entry_path: 'masters/destination/entry',
        destination_form_entry_route: '/masters/destination/entry',

        supplier_path: 'masters/supplier',
        supplier_route: '/masters/supplier',

        item_path: 'masters/items',
        item_route: '/masters/items',

        product_path: 'masters/products',
        product_route: '/masters/products',
    },

    hr:{
        department_path: 'hr/department',
        department_route: '/hr/department',

        designation_path: 'hr/designation',
        designation_route: '/hr/designation',

        employee_path: 'hr/employee',
        employee_route: '/hr/employee',
        employee_entry_route: '/hr/employee/entry',

        permission_path: 'hr/permission',
        permission_route: '/hr/permission',

        permissionProfile_path: 'hr/permission-profile',
        permissionProfile_route: '/hr/permission-profile',
    },
    customers:{
        lead_path: 'customers/lead',
        lead_route: '/customers/lead',

        agent_path: 'customers/agent',
        agent_route: '/customers/agent',
        agent_entry_route: '/customers/agent/entry',
        agent_info_route: '/customers/agent/info',

        whitelabel_path: 'customers/whitelable',
        whitelabel_route: '/customers/whitelable',

        distributor_path: 'customers/distributor',
        distributor_route: '/customers/distributor',
    },

    kyc: {
        dashboard_path: 'kyc/dashboard',
        dashboard_route: '/kyc/dashboard',

        typesofducuments_path: 'kyc/types-of-documents',
        typesofducuments_route: '/kyc/types-of-documents',

        kycprofile_path: 'kyc/kyc-profile',
        kycprofile_route: '/kyc/kyc-profile',
        kycprofile_entry_route: '/kyc/kyc-profile/entry',

        documents_path: 'kyc/documents',
        documents_route: '/kyc/documents',
        documents_entry_route: '/kyc/documents/entry',
    },

    account: {
        wallet_path: 'account/wallet',
        wallet_route: '/account/wallet',

        wallet_credit_path: 'account/WalletCredit',
        wallet_credit_route: '/account/WalletCredit',

        withdraw_path: 'account/withdraw',
        withdraw_route: '/account/withdraw',

        payment_path: 'account/payment',
        payment_route: 'account/payment',

        payment_link_path: 'account/payment_link',
        payment_link_route: 'account/payment_link',

        receipt_path: 'account/receipt',
        receipt_route: 'account/receipt',

        agent_balance_path: 'account/agent-balance',
        agent_balance_path_route: 'account/agent-balance',

        sale_path: 'account/sale-book',
        sale_route: 'account/sale-book',

        sales_return_path: 'account/sales-return',
        sales_return_route: 'account/sales-return',

        wallet_outstanding_path: 'account/wallet-outstanding',
        wallet_outstanding_route: 'account/wallet-outstanding',

        receipt_register_path: 'account/receipt_register',
        receipt_register_route: 'account/receipt_register',

        first_transaction_path: 'account/first_transaction',
        first_transaction_route: 'account/first_transaction',

        commission_expense_path: 'account/commission_expense',
        commission_expense_route: 'account/commission_expense',

        commission_income_path: 'account/commission_income',
        commission_income_route: 'account/commission_income',

        purchase_register_path: 'account/purchase_register',
        purchase_register_route: 'account/purchase_register',
    },

    leads:{
        leads_register_path: 'account/leads-register',
        leads_register_route: 'account/leads-register',
    },

    booking: {
        amendment_requests_path: 'booking/amendment-requests',
        amendment_requests_route: 'booking/amendment-requests',

        group_inquiry_path: 'booking/group-inquiry',
        group_inquiry_route: '/booking/group-inquiry',

        bus_path: 'booking/bus',
        bus_route: '/booking/bus',
        bus_details_route: '/booking/bus/details',
        
        insurance_path: 'booking/insurance',
        insurance_route: '/booking/insurance',
        insurance_details_route: '/booking/insurance/details',

        hotel_path: 'booking/hotel',
        hotel_route: '/booking/hotel',
        hotel_details_route: '/booking/hotel/details',

        flight_path: 'booking/flight',
        flight_route: '/booking/flight',
        booking_details_route: '/booking/flight/details',
        booking_details_offline_route: '/booking/flight/offlinepnr/entry',

        visa_path: 'booking/visa',
        visa_route: '/booking/visa',
        visa_details_route: '/booking/visa/details',

        offline_service_path: 'booking/offline-service',
        offline_service_route: '/booking/offline-service',
        offline_service_details_route: '/booking/offline-service/details',

        offline_service_entry_route: '/booking/offline-service/entry',
    },

    inventory: {
        activity_path: 'inventory/activity',
        activity_route: '/inventory/activity',
        activity_form_entry_path: 'inventory/activity/entry',
        activity_form_entry_route: '/inventory/activity/entry',

        transfer_path: 'inventory/transfer',
        transfer_route: '/inventory/transfer',

        holiday_path: 'inventory/holiday-products',
        holiday_route: '/inventory/holiday-products',
        holiday_entry_path: 'inventory/holiday-products/entry',
        holiday_entry_route: '/inventory/holiday-products/entry',

        vehicle_path: 'inventory/vehicle',
        vehicle_route: '/inventory/vehicle',

        hotel_path: 'inventory/hotel',
        hotel_route: '/inventory/hotel',
        hotel_entry_route: '/inventory/hotel/entry',

        product_fix_departure_path: 'inventory/product-fix-departure',
        product_fix_departure_route: '/inventory/product-fix-departure',

        product_flight_path: 'inventory/product-flight',
        product_flight_route: '/inventory/product-flight',

        visa_path: 'inventory/visa',
        visa_route: '/inventory/visa',

        // markup_profile_path: 'inventory/markup-profile',
        // markup_profile_route: '/inventory/markup-profile',
        // markup_profile_entry_path: 'inventory/markup-profile/entry',
        // markup_profile_entry_route: '/inventory/markup-profile/entry',

    },

    reports: {
        // amendment_requests_path: 'reports/amendment-requests',
        // amendment_requests_route: 'reports/amendment-requests',

        ledger_path: 'reports/ledger',
        ledger_route: 'reports/ledger',

        airline_path: 'reports/airline',
        airline_route: 'reports/airline',

        campaign_summary_path: 'reports/campaign-summary',
        campaign_summary_path_route: 'reports/campaign-summary',

        hotel_path: 'reports/hotel',
        hotel_route: 'reports/hotel',

        bus_path: 'reports/bus',
        bus_route: 'reports/bus',

        agents_rmwise_agents_path: 'reports/rmwise-agents',
        agents_rmwise_agents_route: 'reports/rmwise-agents',

        leads_rmwise_path: 'reports/rmwise-leads',
        leads_rmwise_route: 'reports/rmwise-leads',

        products_path: 'reports/products',
        products_route: 'reports/products',

        agent_summary_path: 'reports/agent_summary',
        agent_summary_route: 'reports/agent_summary',
        
        products_collection_path: 'reports/collection',
        products_collection_route: 'reports/collection',

        products_receipts_path: 'reports/receipts',
        products_receipts_route: 'reports/receipts'
    },

    settings: {
        erpsettings_path: 'settings/erp',
        erpsettings_route: '/settings/erp',

        markupprofile_path: 'settings/markupprofile',
        markupprofile_route: '/settings/markupprofile',
        markupprofile_entry_path: 'settings/markupprofile/entry',
        markupprofile_entry_route: '/settings/markupprofile/entry',

        messageevents_path: 'settings/messageevents',
        messageevents_route: '/settings/messageevents',

        emailsetup_path: 'settings/emailsetup',
        emailsetup_route: '/settings/emailsetup',

        messagetemplates_path: 'settings/messagetemplates',
        messagetemplates_route: '/settings/messagetemplates',
        messagetemplates_entry_route: '/settings/messagetemplates/entry',

        defaultproductexclusions_path: 'settings/defaultproductexclusions',
        defaultproductexclusions_route: '/settings/defaultproductexclusions',

        supplierapi_path: 'settings/supplierapi',
        supplierapi_route: '/settings/supplierapi',

        pspsetting_path: 'settings/psp',
        pspsetting_route: '/settings/psp',

        caching_parameters_path: 'settings/caching_parameters',
        caching_parameters_route: '/settings/caching_parameters',
    }
}
