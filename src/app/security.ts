import { AuthService } from './core/auth/auth.service';
import { ReflectionInjector } from './injector/reflection-injector';

export class Security {
    public static permissions: any[];

    public static hasPermission(permission: { module_name: string, group_name: string, operation_type: string, category_name: string }): boolean {
        return Security.getPermissions()
            .findIndex(
                (x: any) =>
                    x.module_name === permission.module_name &&
                    x.group_name === permission.group_name &&
                    x.operation_type === permission.operation_type &&
                    x.category_name === permission.category_name) > -1;
    }

    public static hasNewEntryPermission(module_name: string): boolean {
        return Security.getPermissions()
            .findIndex(
                (x: any) =>
                    x.module_name === module_name &&
                    x.group_name === group_name.listingPage &&
                    x.operation_type === operation_type.newEntry &&
                    x.category_name === category_name.entry) > -1;
    }

    public static hasEditEntryPermission(module: string): boolean {
        return Security.getPermissions()
            .findIndex(
                (x: any) =>
                    x.module_name === module &&
                    x.group_name === group_name.listingPage &&
                    x.operation_type === operation_type.editEntry &&
                    x.category_name === category_name.entry) > -1;
    }

    public static hasDeleteEntryPermission(module: string): boolean {
        return Security.getPermissions()
            .findIndex(
                (x: any) =>
                    x.module_name === module &&
                    x.group_name === group_name.listingPage &&
                    x.operation_type === operation_type.deleteEntry &&
                    x.category_name === category_name.delete) > -1;
    }

    public static hasViewDetailPermission(module: string): boolean {
        return Security.getPermissions()
            .findIndex(
                (x: any) =>
                    x.module_name === module &&
                    x.group_name === group_name.listingPage &&
                    x.operation_type === operation_type.viewDetail &&
                    x.category_name === category_name.viewDetail) > -1;
    }

    public static hasExportDataPermission(module: string): boolean {
        return Security.getPermissions()
            .findIndex(
                (x: any) =>
                    x.module_name === module &&
                    x.group_name === group_name.listingPage &&
                    x.operation_type === operation_type.exportData &&
                    x.category_name === category_name.export) > -1;
    }

    public static hasImportDataPermission(module: string): boolean {
        return Security.getPermissions()
            .findIndex(
                (x: any) =>
                    x.module_name === module &&
                    x.group_name === group_name.listingPage &&
                    x.operation_type === operation_type.importData &&
                    x.category_name === category_name.import) > -1;
    }

    public static hasDisplayLimitedRecordsPermission(module: string): boolean {
        return Security.getPermissions()
            .findIndex(
                (x: any) =>
                    x.module_name === module &&
                    x.group_name === group_name.listingPage &&
                    x.operation_type === operation_type.displayLimitedRecords &&
                    x.category_name === category_name.view) > -1;
    }

    public static hasDisplayAllRecordsPermission(module: string): boolean {
        return Security.getPermissions()
            .findIndex(
                (x: any) =>
                    x.module_name === module &&
                    x.group_name === group_name.listingPage &&
                    x.operation_type === operation_type.displayAllRecords &&
                    x.category_name === category_name.view) > -1;
    }

    public static getPermissions(): any[] {
        if (!Security.permissions || Security.permissions.length === 0) {
            this.permissions = ReflectionInjector.get(AuthService).getPermissions();
        }

        return Security.permissions;
    }
}

export const messages = {
    permissionDenied: 'Permission Denied'
};

export const group_name = {
    listingPage: 'Listing',
    detailPage: 'Detail',
    entryPage: 'Entry Page',
    attendance: 'Attendance',
    report: 'Report',
    admin: 'Administrator',
    dealing: 'Dealing',
    account: 'Account',
};

export const operation_type = {
    newEntry: 'Add New',
    editEntry: 'Modify',
    deleteEntry: 'Delete',
    displayLimitedRecords: 'Display Limited Records',
    displayAllRecords: 'Display All Records',
    view: 'View',
    viewDetail: 'View Detail',
    exportData: 'Export Data',
    importData: 'Import Data',
    applyPremission: 'Apply Premission',
    WorkingStatus: 'Working Status',
    Convert_to_agent: 'Convert To Agent',
    relationship_manager: 'Relationship Manager',
    view_kyc: 'View Kyc',
    agent_login: 'Agent Login',
    set_markup_profile: 'Set Markup Profile',
    convert_to_wl: 'Convert To WL',
    audit_kyc: 'Audit KYC',
    resetPassword: 'Reset Password',
    enable_disable: 'Disable/Enable',
    audit_unaudit: 'Audit/Unaudit',
    block_unblock: 'Block/Unblock',
    publish_unpublish: 'Published/Unpublished',
    default: 'Default'
};

export const category_name = {
    entry: 'Entry',
    delete: 'Delete',
    view: 'View',
    viewDetail: 'View Detail',
    export: 'Export',
    import: 'Import',
    block_unblock: 'Block/Unblock',
    enable_disable: 'Enable/Disable',
    copy: 'Copy',
    is_most: 'IsMost',
    resetPassword: 'Reset Password',
    document: 'Document',
    applyPremission: 'Apply Premission',
    status: 'Status',
    rejected:'Reject',
    audit_unaudit: 'Audit/Unaudit',
    publish_unpublish: 'Publish/Unpublish',
    online_offline: 'Online/Offline',
    active_deactivate: 'Active/Deactivate',
    secrity: 'Security',
    update: 'Update',
    isdefault: 'Is Default',
    resetpassword: 'Reset Password',
    permissionProfile: 'Permission Profile',
    themesetting: 'Theme Setting',
    WorkingStatus: 'Working Status',
    Convert_to_agent: 'Convert To Agent',
    relationship_manager: 'Relationship Manager',
    view_kyc: 'View Kyc',
    agent_login: 'Agent Login',
    set_markup_profile: 'Set Markup Profile',
    convert_to_wl: 'Convert To WL',
    audit_kyc: 'Audit KYC',
    default: 'Default',
    enableDisable: 'Enable/Disable',
    operation: 'Operation',
    autoLogin: 'Auto Login',
    complete: 'Complete',
    confirm: 'Confirm',
    manu_display: 'Menu Display',
    changeStatus: 'Change Status',
    print: 'Print',
    action: 'Action',
    dail_call: 'Dail Call',
    re_shuffle: 'Reshuffle',
};

export const module_name = {
    lead: "Leads",
    crmagent: "Agent Dashboard",
    collections: "Collections",
    techDashboard: "Tech Dashboard",
    dialCall: "Dial Call",
    scheduleCall: "Schedule Call",
    employee: "Employee",
    designation: "Designation",
    destination: "Destination",
    currency: "Currency",
    currencyROE: "Currency ROE",
    activity: "Activity",
    city: "City",
    cachingparameters: "Caching Parameters",
    cashbackparameters: "Cashback Parameters",
    department: "Department",
    document: 'Types of Documents',
    kycprofile: 'KYC Profile',
    kycdocument: 'Documents',
    markupprofile: 'Markup Profile',
    emailsetup: 'Email Setup',
    supplierapi: 'Supplier API',
    transfer: 'Transfers',
    supplier: 'Supplier',
    user: 'User',
    holiday: 'Holiday Products',
    holidayV2: 'Holiday Products 2.0',
    productpricing: 'Product Pricing',
    hotel: 'Hotel',
    forex: 'Forex',
    holiday_lead: 'Holiday',
    cab_lead: 'Cab',
    sent_mail: 'Sent Mail',
    hotelroom: 'Hotel Room',
    hoteltariff: 'Hotel Tariff',
    productfixdeparture: 'Product Fix Departure',
    vehicle: 'Vehicle',
    messageevents: 'Message Events',
    messagetemplates: 'Message Templates',
    agent: 'Agents',
    compny: 'Company',
    bank: 'Bank',
    whitelabel: 'White Lable',
    Installment: 'Installment',
    defaultproductexclusions: 'Default Product Exclusions',
    newSignup: 'New Signup',
    permission: 'Permission Master',
    permissionProfile: 'Permission Profile',
    markupProfile: 'Markup Profile',
    amendmentRequests: 'Amendment Requests',
    groupInquiry: 'Group Inquiry',
    ledger: 'Agent Ledger',
    payment: 'Payments',
    paymentLink: 'Payment Link',
    receipt: 'Receipt',
    flight: 'Flight',
    bus: 'Bus',
    agentkyc: 'Agent KYC Dashboard',
    wallet: 'Wallet Recharge',
    pspsetting: 'PSP',
    visa: 'Visa',
    withdraw: 'Withdraw',
    offlineService: 'Offline Service',
    walletCredit: 'Wallet Credit',
    agentBalance: 'Agent Balance Register',
    supplierWalletBalance: 'Supplier Wallet Balance',
    agentLedgerWalletMissmatch: 'Agent Ledger/Wallet Missmatch',
    walletOutstanding: 'Wallet Outstanding',
    pgRefund: 'PG Refund',
    receipts: 'Receipts',
    receiptRegister: 'Receipt Register',
    firstTransaction: 'First Transaction',
    commissionExpense: 'Commission Expense',
    commissionIncome: 'Commission Income',
    purchaseRegister: 'Purchase Register',
    kycDashboard: 'KYC Dashboard',
    bookingsFlight: 'Bookings - Flight',
    bookingsBus: 'Bookings - BUS',
    bookingsHotel: 'Bookings - Hotel',
    bookingsForex: 'Bookings - Forex',
    bookingsCab: 'Bookings - Cab',
    bookingsHoliday: 'Bookings - Holiday',
    bookingsVisa: 'Bookings - Visa',
    bookingsInsurance: 'Bookings - Visa',
    inventoryHoliday: 'Inventory - Holiday',
    inventoryHotel: 'Inventory - Hotel',
    inventoryVisa: 'Inventory - Visa',
    inventoryCab: 'Inventory - Cab',
    ERPSettings: 'ERP Settings',
    SaleBook: 'Sale Book',
    SalesReturn: 'Sales Return',
    Purchase: 'Purchase',
    OsbPayment: 'OSB Payment',
    OsbReceipt: 'OSB Receipt',
    OsbInvoice: 'OSB Invoice',
    Sales: 'Sales',
    Referrallink: 'Referral Link',
    itemMaster: 'Items',
    product: 'Products',
    leads_register: 'Lead Register',
    // agents_rmwise: 'RM Wise Agents',
    agents_rmwise: 'Partner Summary',
    info_airline: 'Info Airline',
    // leads_rmwise: 'RM Wise Leads',
    leads_rmwise: 'Lead Summary',
    airline: 'Airline',
    report_hotel: 'Hotel',
    report_bus: 'Bus',
    campaign_summary: 'Campaign Summary',
    agent_ledger: 'Agent Ledger',
    products: 'Products',
    // agentSummary: 'Agent Summary',
    agentSummary: 'Partner Register',
    insurance: 'Insurance',
    products_collection: 'Collection',
    products_receipts: 'Receipts',
    supplier_kyc: 'Supplier',
    airline_summary: 'Airline Summary',
    agent_wise_service_wise: 'Agent Wise Service Wise',
    airline_offline: 'Airline Offline TAT Analysis',
    airline_monthly: 'Airline Monthly Analysis',
    airline_rejection: 'Airline Rejection Analysis',
    airline_career: 'Airline Carrier Wise Analysis',
    tech_business_summary:'Tech Business Summary',
    tech_rm_monthly_report: 'RM Monthly Anaytics',
    tech_product_monthly_report:'Product Monthly Analytics',
    cab_inventory: 'Cab',
};

export const filter_module_name = {
    // crm
    leads_inbox: "leads_inbox",
    leads_archive: "leads_archive",
    agents_inbox: "agents_inbox",
    agents_partners: "agents_partners",
    agents_potential_lead: "agents_potential_lead",
    collections_tech: "collections_tech",
    collections_travel: "collections_travel",
    tech_dashboard_pending: "tech_dashboard_pending",
    tech_dashboard_completed: "tech_dashboard_completed",
    tech_dashboard_blocked: "tech_dashboard_blocked",
    tech_dashboard_expired: "tech_dashboard_expired",
    referral_link: "referral_link",

    // masters
    city_master: "city_master",
    company_master: "company_master",
    currency_master: "currency_master",
    currency_roe_master: "currency_roe_master",
    destination_master: "destination_master",
    supplier_master: "supplier_master",
    items_master: "items_master",
    products_master: "products_master",
    caching_parameters_master: "caching_parameters_master",

    //customers
    newsignup_customer: "newsignup_customer",
    agent_customer: "agent_customer",
    whitelabel_customer: "whitelabel_customer",
    distributor_customer: "distributor_customer",

    //Account
    wallet_recharge_pending: "wallet_recharge_pending",
    wallet_recharge_audited: "wallet_recharge_audited",
    wallet_recharge_rejected: "wallet_recharge_rejected",
    wallet_credited: "wallet_credited",
    withdraw_pending: "withdraw_pending",
    withdraw_audited: "withdraw_audited",
    withdraw_rejected: "withdraw_rejected",
    account_payments: "account_payments",
    account_receipts: "account_receipts",
    payment_link: "payment_link",
    agent_wise_service_wise: "agent_wise_service_wise",

    //KYC
    kyc_agent: "kyc_agent",
    type_of_documents: "type_of_documents",
    kyc_profile: "kyc_profile",
    kyc_documents: "kyc_documents",

    //Bookings
    flight_booking: "flight_booking",
    amendment_requests_booking: "amendment_requests_booking",
    group_inquiry_booking: "group_inquiry_booking",
    bus_booking: "bus_booking",
    hotel_booking: "hotel_booking",
    forex_booking: "forex_booking",
    visa_booking: "visa_booking",
    insurance_booking: "insurance_booking",
    offline_service_booking: "offline_service_booking",
    holiday_lead_service_booking: "holiday_lead",
    cab_lead_service_booking: "cab_lead",


    //Report
    agent_balance_register: "agent_balance_register",
    agent_ledger_wallet_missmatch: "agent_ledger_wallet_missmatch",
    commission_income: "commission_income",
    commission_expense: "commission_expense",
    first_transaction: "first_transaction",
    account_ledger: "account_ledger",
    purchase_register: "purchase_register",
    receipt_register: "receipt_register",
    sale_book: "sale_book",
    sales_return: "sales_return",
    wallet_outstanding: "wallet_outstanding",
    pg_refund: "pg_refund",
    leads_register: "leads_register",
    leads_rm_wise_leads: "leads_rm_wise_leads",
    report_sales_products: "report_sales_products",
    report_rm_wise_agents: "report_rm_wise_agents",
    report_potential_lead: "report_potential_lead",
    airline_report: "airline_report",
    campaign_summary: "campaign_summary",
    report_sales_agent_summary: "report_sales_agent_summary",
    products_collection: 'products_collection',
    products_receipts: 'products_receipts',
    airline_summary: 'airline_summary',
    airline_offline: 'airline_offline_tat_Analysis',
    airline_monthly: 'Airline Monthly Analysis',
    airline_rejection: 'Airline Rejection Analysis',
    airline_career: 'Airline Carrier Wise Analysis',
    tech_business_summary: 'tech_business_summary',
    tech_rm_monthly_report:'tech_rm_monthly_report',
    tech_product_monthly_report:'tech_product_monthly_report',
    supplier_wallet_balance:'supplier_wallet_balance',
    sent_mail: "sent_mail",


    //Inventory
    activity: "activity",
    transfers: "transfers",
    holiday_products: "holiday_products",
    vehicle: "vehicle",
    hotel: "hotel",
    visa: "visa",
    cab: "cab",

    //Hr
    permission_profile: "permission_profile",
    permission_master: "permission_master",
    employee: "employee",
    designation: "designation",
    department: "department",

    //Settings
    psp: "psp",
    supplier_api: "supplier_api",
    message_templates: "message_templates",
    message_events: "message_events",
    email_setup: "email_setup",
    markup_profile: "markup_profile",
    erp_settings: "erp_settings",
    cashback_parameters_master: "cashback_parameters_master",

}

export const cityPermissions = {
    addImagePermissions: { module_name: module_name.city, group_name: group_name.listingPage, operation_type: 'Add Image', category_name: category_name.entry },
    enablePreferedHotelPermissions: { module_name: module_name.city, group_name: group_name.listingPage, operation_type: 'Enable Prefered Hotel', category_name: category_name.enableDisable },
}

export const bankPermissions = {
    auditUnauditPermissions: { module_name: module_name.bank, group_name: group_name.listingPage, operation_type: 'Audit Unaudit', category_name: category_name.audit_unaudit },
}

export const receiptPermissions = {
    auditUnauditPermissions: { module_name: module_name.receipt, group_name: group_name.listingPage, operation_type: 'Audit Unaudit', category_name: category_name.audit_unaudit },
    rejectPermissions: { module_name: module_name.receipt, group_name: group_name.listingPage, operation_type: 'Reject', category_name: category_name.audit_unaudit },
    generatePaymentLink: { module_name: module_name.receipt, group_name: group_name.listingPage, operation_type: 'Generate Payment Link', category_name: category_name.action }
}

export const companyPermissions = {
    ctcMarkupPermissions: { module_name: module_name.compny, group_name: group_name.listingPage, operation_type: 'CTC Markup', category_name: category_name.view },
}

export const currencyROEPermissions = {
    ROEBulkUpdatePermissions: { module_name: module_name.currencyROE, group_name: group_name.listingPage, operation_type: 'Bulk Update', category_name: category_name.entry },
    ROESyncPermissions: { module_name: module_name.currencyROE, group_name: group_name.listingPage, operation_type: 'Sync', category_name: category_name.entry },
}

export const destinationPermissions = {
    addImagePermissions: { module_name: module_name.destination, group_name: group_name.listingPage, operation_type: 'Add Image', category_name: category_name.entry },
    destinationCitiesPermissions: { module_name: module_name.destination, group_name: group_name.listingPage, operation_type: 'Destination Cities', category_name: category_name.entry },
    defaultExclusionsPermissions: { module_name: module_name.destination, group_name: group_name.listingPage, operation_type: 'Default Exclusions', category_name: category_name.entry },
    enableDisablePermissions: { module_name: module_name.destination, group_name: group_name.listingPage, operation_type: 'Enable Disable', category_name: category_name.enableDisable },
}

export const supplierPermissions = {
    viewKYCPermissions: { module_name: module_name.supplier, group_name: group_name.listingPage, operation_type: 'View KYC', category_name: category_name.view },
    blockUnblockPermissions: { module_name: module_name.supplier, group_name: group_name.listingPage, operation_type: 'Block Unblock', category_name: category_name.block_unblock },
    auditUnauditKYCPermissions: { module_name: module_name.supplier, group_name: group_name.listingPage, operation_type: 'Audit Unaudit KYC', category_name: category_name.audit_unaudit },
    assignKYCProfile: { module_name: module_name.supplier, group_name: group_name.listingPage, operation_type: 'Assign KYC Profile', category_name: category_name.entry },
}

export const leadPermissions = {
    dailCallPermissions: { module_name: module_name.lead, group_name: group_name.listingPage, operation_type: 'Dail Call', category_name: category_name.operation },
    callHistoryPermissions: { module_name: module_name.lead, group_name: group_name.listingPage, operation_type: 'Call History', category_name: category_name.operation },
    scheduleCallPermissions: { module_name: module_name.lead, group_name: group_name.listingPage, operation_type: 'Schedule Call', category_name: category_name.operation },
    startKYCProcessPermissions: { module_name: module_name.lead, group_name: group_name.listingPage, operation_type: 'Start KYC Process', category_name: category_name.operation },
    deadLeadPermissions: { module_name: module_name.lead, group_name: group_name.listingPage, operation_type: 'Dead Lead', category_name: category_name.operation },
    marketingMaterialPermissions: { module_name: module_name.lead, group_name: group_name.listingPage, operation_type: 'Marketing Materials', category_name: category_name.operation }
}

export const techDashPermissions = {
    pendingTabPermissions: { module_name: module_name.techDashboard, group_name: group_name.listingPage, operation_type: 'Pending Tab', category_name: category_name.view },
    completedTabPermissions: { module_name: module_name.techDashboard, group_name: group_name.listingPage, operation_type: 'Completed Tab', category_name: category_name.view },
    expiredTabPermissions: { module_name: module_name.techDashboard, group_name: group_name.listingPage, operation_type: 'Expired Tab', category_name: category_name.view },
    blockedTabPermissions: { module_name: module_name.techDashboard, group_name: group_name.listingPage, operation_type: 'Blocked Tab', category_name: category_name.view },
    updateStatusPermissions: { module_name: module_name.techDashboard, group_name: group_name.listingPage, operation_type: 'Update Status', category_name: category_name.operation },
    statusChangedLogPermissions: { module_name: module_name.techDashboard, group_name: group_name.listingPage, operation_type: 'Status Changed Log', category_name: category_name.operation },
    wlSettingPermissions: { module_name: module_name.techDashboard, group_name: group_name.listingPage, operation_type: 'WL Setting', category_name: category_name.operation },
    linkPermissions: { module_name: module_name.techDashboard, group_name: group_name.listingPage, operation_type: 'Link', category_name: category_name.operation },
    updateExpiryDatePermissions: { module_name: module_name.techDashboard, group_name: group_name.listingPage, operation_type: 'Update Expiry Date', category_name: category_name.operation },
}

export const agentPermissions = {
    dailCallPermissions: { module_name: module_name.crmagent, group_name: group_name.listingPage, operation_type: 'Dail Call', category_name: category_name.operation },
    callHistoryPermissions: { module_name: module_name.crmagent, group_name: group_name.listingPage, operation_type: 'Call History', category_name: category_name.operation },
    marketingMaterialPermissions: { module_name: module_name.crmagent, group_name: group_name.listingPage, operation_type: 'Marketing Materials', category_name: category_name.operation },
    dormantsPermissions: { module_name: module_name.crmagent, group_name: group_name.listingPage, operation_type: 'Inbox Dormant', category_name: category_name.operation },
    timelinePermissions: { module_name: module_name.crmagent, group_name: group_name.listingPage, operation_type: 'Timeline', category_name: category_name.operation },
    // agentProfilePermissions: { module_name: module_name.crmagent, group_name: group_name.listingPage, operation_type: 'Agent Profile', category_name: category_name.operation },
    businessanalyticsPermissions: { module_name: module_name.crmagent, group_name: group_name.listingPage, operation_type: 'Business Analytics', category_name: category_name.operation },
    cancelProductPermissions: { module_name: module_name.crmagent, group_name: group_name.listingPage, operation_type: 'Cancel', category_name: category_name.operation },
    expiryProductPermissions: { module_name: module_name.crmagent, group_name: group_name.listingPage, operation_type: 'Expiry Product', category_name: category_name.operation },
    salesReturnProductPermissions: { module_name: module_name.crmagent, group_name: group_name.listingPage, operation_type: 'Sales Return', category_name: category_name.operation },
    deleteProductPermissions: { module_name: module_name.crmagent, group_name: group_name.listingPage, operation_type: 'Delete', category_name: category_name.operation },
    // techServicePermissions: { module_name: module_name.crmagent, group_name: group_name.listingPage, operation_type: 'Tech Service', category_name: category_name.operation },
    // techCallHistoryPermissions: { module_name: module_name.crmagent, group_name: group_name.listingPage, operation_type: 'Timeline Call History', category_name: category_name.operation }
    viewOnlyAssignedPermissions: { module_name: module_name.crmagent, group_name: group_name.listingPage, operation_type: 'View Only Assigned', category_name: category_name.view }
}

export const partnerRegisterPermissions = {
    callHistoryFollowupPermissions: { module_name: module_name.agentSummary, group_name: group_name.listingPage, operation_type: 'Call History', category_name: category_name.operation },
}

export const techCollectionPermissions = {
    dailCallPermissions: { module_name: module_name.collections, group_name: group_name.listingPage, operation_type: 'Dail Call', category_name: category_name.operation },
    callHistoryPermissions: { module_name: module_name.collections, group_name: group_name.listingPage, operation_type: 'Call History', category_name: category_name.operation }
}

export const travelCollectionPermissions = {
    dailCallPermissions: { module_name: module_name.collections, group_name: group_name.listingPage, operation_type: 'Travel Dail Call', category_name: category_name.operation },
    callHistoryPermissions: { module_name: module_name.collections, group_name: group_name.listingPage, operation_type: 'Travel Call History', category_name: category_name.operation }
}

export const leadsPermissions = {
    viewKYCPermissions: { module_name: module_name.newSignup, group_name: group_name.listingPage, operation_type: 'View KYC', category_name: category_name.view },
    verifyEmailPermissions: { module_name: module_name.newSignup, group_name: group_name.listingPage, operation_type: 'Verify Email', category_name: category_name.operation },
    verifyMobilePermissions: { module_name: module_name.newSignup, group_name: group_name.listingPage, operation_type: 'Verify Mobile', category_name: category_name.operation },
    viewOnlyAssignedPermissions: { module_name: module_name.newSignup, group_name: group_name.listingPage, operation_type: 'View Only Assigned', category_name: category_name.view },
    setMarkupProfilePermissions: { module_name: module_name.newSignup, group_name: group_name.listingPage, operation_type: 'Set Markup Profile', category_name: category_name.entry },
    setKYCProfilePermissions: { module_name: module_name.newSignup, group_name: group_name.listingPage, operation_type: 'Set KYC Profile', category_name: category_name.entry },
}

export const poductCollectionPermissions = {
    viewOnlyAssignedPermissions: { module_name: module_name.products_collection, group_name: group_name.listingPage, operation_type: 'View Only Assigned', category_name: category_name.view }
}

export const agentsPermissions = {
    relationshipManagerPermissions: { module_name: module_name.agent, group_name: group_name.listingPage, operation_type: 'Relationship Manager', category_name: category_name.entry },
    relationshipManagerLogsPermissions: { module_name: module_name.agent, group_name: group_name.listingPage, operation_type: 'Relationship Manager Logs', category_name: category_name.view },
    statusChangedLogsPermissions: { module_name: module_name.agent, group_name: group_name.listingPage, operation_type: 'Status Changed Logs', category_name: category_name.view },
    viewKYCPermissions: { module_name: module_name.agent, group_name: group_name.listingPage, operation_type: 'View KYC', category_name: category_name.view },
    setMarkupProfilePermissions: { module_name: module_name.agent, group_name: group_name.listingPage, operation_type: 'Set Markup Profile', category_name: category_name.entry },
    autoLoginPermissions: { module_name: module_name.agent, group_name: group_name.listingPage, operation_type: 'Auto Login', category_name: category_name.autoLogin },
    reshufflePermissions: { module_name: module_name.agent, group_name: group_name.listingPage, operation_type: 'Reshuffle', category_name: category_name.re_shuffle },
    walletTransferPermissions: { module_name: module_name.agent, group_name: group_name.listingPage, operation_type: 'Wallet Transfer', category_name: category_name.operation },
    blockUnblockPermissions: { module_name: module_name.agent, group_name: group_name.listingPage, operation_type: 'Block Unblock', category_name: category_name.block_unblock },
    enableDisablePermissions: { module_name: module_name.agent, group_name: group_name.listingPage, operation_type: 'Enable Disable', category_name: category_name.enable_disable },
    verifyEmailPermissions: { module_name: module_name.agent, group_name: group_name.listingPage, operation_type: 'Verify Email', category_name: category_name.operation },
    verifyMobilePermissions: { module_name: module_name.agent, group_name: group_name.listingPage, operation_type: 'Verify Mobile', category_name: category_name.operation },
    setCurrencyPermissions: { module_name: module_name.agent, group_name: group_name.listingPage, operation_type: 'Set Currency', category_name: category_name.entry },
    setDisplayCurrencyPermissions: { module_name: module_name.agent, group_name: group_name.listingPage, operation_type: 'Display Currency', category_name: category_name.entry },
    convertToWLPermissions: { module_name: module_name.agent, group_name: group_name.listingPage, operation_type: 'Convert To WL', category_name: category_name.operation },
    viewOnlyAssignedPermissions: { module_name: module_name.agent, group_name: group_name.listingPage, operation_type: 'View Only Assigned', category_name: category_name.view },
    removeAllSubagentPermissions: { module_name: module_name.agent, group_name: group_name.listingPage, operation_type: 'Remove All Subagent', category_name: category_name.delete },

    changeEmailPermissions: { module_name: module_name.agent, group_name: group_name.listingPage, operation_type: 'Change Email', category_name: category_name.operation },
    changeNumberPermissions: { module_name: module_name.agent, group_name: group_name.listingPage, operation_type: 'Change Number', category_name: category_name.operation },

}

export const saleProductPermissions = {
    viewOnlyAssignedPermissions: { module_name: module_name.products, group_name: group_name.listingPage, operation_type: 'View Only Assigned', category_name: category_name.view },
}

export const leadRegisterPermissions = {
    relationshipManagerPermissions: { module_name: module_name.leads_register, group_name: group_name.listingPage, operation_type: 'Relationship Manager', category_name: category_name.entry },
    callHistoryPermissions: { module_name: module_name.leads_register, group_name: group_name.listingPage, operation_type: 'Call History', category_name: category_name.operation },
    reshufflePermissions: { module_name: module_name.leads_register, group_name: group_name.listingPage, operation_type: 'Reshuffle', category_name: category_name.re_shuffle },
    importPermissions: { module_name: module_name.leads_register, group_name: group_name.listingPage, operation_type: 'Import Leads', category_name: category_name.entry },
    relationshipManagerLogsPermissions: { module_name: module_name.leads_register, group_name: group_name.listingPage, operation_type: 'Relationship Manager Logs', category_name: category_name.view },
    deadLeadToLiveLeadPermissions: { module_name: module_name.leads_register, group_name: group_name.listingPage, operation_type: 'Dead Lead To Live Lead', category_name: category_name.operation },
    leadsSyncPermissions: { module_name: module_name.leads_register, group_name: group_name.listingPage, operation_type: 'Sync', category_name: category_name.entry },
}


export const whiteLablePermissions = {
    enableDisablePermissions: { module_name: module_name.whitelabel, group_name: group_name.listingPage, operation_type: 'Enable Disable', category_name: category_name.enableDisable },
    installmentsPermissions: { module_name: module_name.whitelabel, group_name: group_name.listingPage, operation_type: 'Installments', category_name: category_name.entry },
    viewOnlyAssignedPermissions: { module_name: module_name.whitelabel, group_name: group_name.listingPage, operation_type: 'View Only Assigned', category_name: category_name.view },
}

export const walletRechargePermissions = {
    auditUnauditPermissions: { module_name: module_name.wallet, group_name: group_name.listingPage, operation_type: 'Audit Unaudit', category_name: category_name.audit_unaudit },
    rejectPermissions: { module_name: module_name.wallet, group_name: group_name.listingPage, operation_type: 'Reject', category_name: category_name.audit_unaudit },
    pendingTabPermissions: { module_name: module_name.wallet, group_name: group_name.listingPage, operation_type: 'Pending Tab', category_name: category_name.view },
    auditedTabPermissions: { module_name: module_name.wallet, group_name: group_name.listingPage, operation_type: 'Audited Tab', category_name: category_name.view },
    rejectedTabPermissions: { module_name: module_name.wallet, group_name: group_name.listingPage, operation_type: 'Rejected Tab', category_name: category_name.view },
    generatePaymentLink: { module_name: module_name.wallet, group_name: group_name.listingPage, operation_type: 'Generate Payment Link', category_name: category_name.action },
}

export const partnerPurchaseProductPermissions = {
    purchaseProductPermissions: { module_name: module_name.crmagent, group_name: group_name.listingPage, operation_type: 'Purchase Product', category_name: category_name.operation },
    dormantsPermissions: { module_name: module_name.crmagent, group_name: group_name.listingPage, operation_type: 'Partner Dormant', category_name: category_name.operation },
    itemsTabPermissions: { module_name: module_name.crmagent, group_name: group_name.listingPage, operation_type: 'Items Tab', category_name: category_name.view },
    installmentsTabPermissions: { module_name: module_name.crmagent, group_name: group_name.listingPage, operation_type: 'Installments Tab', category_name: category_name.view },
    receiptsTabPermissions: { module_name: module_name.crmagent, group_name: group_name.listingPage, operation_type: 'Receipts Tab', category_name: category_name.view }
}

export const crmLeadPermissions = {
    detailTabPermissions: { module_name: module_name.lead, group_name: group_name.listingPage, operation_type: 'Detail Tab', category_name: category_name.view },
    feedbackTabPermissions: { module_name: module_name.lead, group_name: group_name.listingPage, operation_type: 'Feedback Tab', category_name: category_name.view },
    inboxTabPermissions: { module_name: module_name.lead, group_name: group_name.listingPage, operation_type: 'Inbox Tab', category_name: category_name.view },
    archiveTabPermissions: { module_name: module_name.lead, group_name: group_name.listingPage, operation_type: 'Archive Tab', category_name: category_name.view },
    agentInboxTabPermissions: { module_name: module_name.crmagent, group_name: group_name.listingPage, operation_type: 'Inbox Tab', category_name: category_name.view },
    partnersTabPermissions: { module_name: module_name.crmagent, group_name: group_name.listingPage, operation_type: 'Partners Tab', category_name: category_name.view },
    potentailTabPermissions: { module_name: module_name.crmagent, group_name: group_name.listingPage, operation_type: 'Potential Tab', category_name: category_name.view },
    techCollectionTabPermissions: { module_name: module_name.collections, group_name: group_name.listingPage, operation_type: 'Tech Collection', category_name: category_name.view },
    travelCollectionPermissions: { module_name: module_name.collections, group_name: group_name.listingPage, operation_type: 'Travel Collection', category_name: category_name.view }
}

export const walletCreditPermissions = {
    changeExpiryPermissions: { module_name: module_name.walletCredit, group_name: group_name.listingPage, operation_type: 'Change Expiry', category_name: category_name.entry },
    enableDisablePermissions: { module_name: module_name.walletCredit, group_name: group_name.listingPage, operation_type: 'Enable Disable', category_name: category_name.enableDisable },
}

export const withdrawPermissions = {
    auditUnauditPermissions: { module_name: module_name.withdraw, group_name: group_name.listingPage, operation_type: 'Audit Unaudit', category_name: category_name.audit_unaudit },
    rejectPermissions: { module_name: module_name.withdraw, group_name: group_name.listingPage, operation_type: 'Reject', category_name: category_name.audit_unaudit },
    pendingTabPermissions: { module_name: module_name.withdraw, group_name: group_name.listingPage, operation_type: 'Pending Tab', category_name: category_name.view },
    auditedTabPermissions: { module_name: module_name.withdraw, group_name: group_name.listingPage, operation_type: 'Audited Tab', category_name: category_name.view },
    rejectedTabPermissions: { module_name: module_name.withdraw, group_name: group_name.listingPage, operation_type: 'Rejected Tab', category_name: category_name.view },
}

export const kycDashboardPermissions = {
    agentKYCTabPermissions: { module_name: module_name.kycDashboard, group_name: group_name.listingPage, operation_type: 'Agent KYC Tab', category_name: category_name.view },
    supplierKYCTabPermissions: { module_name: module_name.kycDashboard, group_name: group_name.listingPage, operation_type: 'Supplier KYC Tab', category_name: category_name.view },
    employeeKYCTabPermissions: { module_name: module_name.kycDashboard, group_name: group_name.listingPage, operation_type: 'Employee KYC Tab', category_name: category_name.view },
    agentViewKYCPermissions: { module_name: module_name.agentkyc, group_name: group_name.listingPage, operation_type: 'View KYC', category_name: category_name.view },
    agentConvertToTAPermissions: { module_name: module_name.agentkyc, group_name: group_name.listingPage, operation_type: 'Convert To TA', category_name: category_name.operation },
}

export const kycprofilePermissions = {
    copyPermissions: { module_name: module_name.kycprofile, group_name: group_name.listingPage, operation_type: 'Copy', category_name: category_name.copy },
}

export const documentPermissions = {
    auditUnauditPermissions: { module_name: module_name.kycdocument, group_name: group_name.listingPage, operation_type: 'Audit Unaudit', category_name: category_name.audit_unaudit },
    rejectPermissions: { module_name: module_name.kycdocument, group_name: group_name.listingPage, operation_type: 'Reject', category_name: category_name.audit_unaudit },
}

export const forexPermissions = {
    rejectedPermissions: { module_name: module_name.forex, group_name: group_name.listingPage, operation_type: 'Reject', category_name: category_name.rejected },
    statusPermissions: { module_name: module_name.forex, group_name: group_name.listingPage, operation_type: 'Status', category_name: category_name.status },
}

export const bookingsFlightPermissions = {
    importPNRPermissions: { module_name: module_name.bookingsFlight, group_name: group_name.listingPage, operation_type: 'Import PNR', category_name: category_name.entry },
    offlinePNRPermissions: { module_name: module_name.bookingsFlight, group_name: group_name.listingPage, operation_type: 'Offline PNR', category_name: category_name.entry },
    statusUpdatePermissions: { module_name: module_name.bookingsFlight, group_name: group_name.listingPage, operation_type: 'Status Update', category_name: category_name.action },
}

export const amendmentRequestsPermissions = {
    updateChargePermissions: { module_name: module_name.amendmentRequests, group_name: group_name.listingPage, operation_type: 'Update Charge', category_name: category_name.entry },
    statusLogsPermissions: { module_name: module_name.amendmentRequests, group_name: group_name.listingPage, operation_type: 'Status Logs', category_name: category_name.view },
    cancelAmendmentPermissions: { module_name: module_name.amendmentRequests, group_name: group_name.detailPage, operation_type: 'Cancel Amendment', category_name: category_name.action },
    confirmationSenttoSupplierPermissions: { module_name: module_name.amendmentRequests, group_name: group_name.detailPage, operation_type: 'Confirmation Sent to Supplier', category_name: category_name.action },
    refundInitiate_ConfirmedBySupplierPermissions: { module_name: module_name.amendmentRequests, group_name: group_name.detailPage, operation_type: 'Refund Initiate/Confirmed By Supplier', category_name: category_name.action },
    rejectPermissions: { module_name: module_name.amendmentRequests, group_name: group_name.detailPage, operation_type: 'Reject', category_name: category_name.action },
    accountRejectPermissions: { module_name: module_name.amendmentRequests, group_name: group_name.detailPage, operation_type: 'Account Reject', category_name: category_name.action },
    accountCompletePermissions: { module_name: module_name.amendmentRequests, group_name: group_name.detailPage, operation_type: 'Account Complete', category_name: category_name.action },
    confirmByTAPermissions: { module_name: module_name.amendmentRequests, group_name: group_name.detailPage, operation_type: 'Confirm By TA', category_name: category_name.action },
    sendMailToSupplierPermissions: { module_name: module_name.amendmentRequests, group_name: group_name.detailPage, operation_type: 'Send Mail To Supplier', category_name: category_name.action },
}

export const groupInquiryPermissions = {
    updateChargePermissions: { module_name: module_name.groupInquiry, group_name: group_name.listingPage, operation_type: 'Update Charge', category_name: category_name.entry },
    groupInquirySubPermissions: { module_name: module_name.groupInquiry, group_name: group_name.listingPage, operation_type: 'Group Inquiry', category_name: category_name.entry },
}

export const busBookingPermissions = {
    voucherPermissions: { module_name: module_name.bookingsBus, group_name: group_name.detailPage, operation_type: 'Voucher', category_name: category_name.print },
    amendmentPermissions: { module_name: module_name.bookingsBus, group_name: group_name.detailPage, operation_type: 'Amendment', category_name: category_name.entry },
    invoicePermissions: { module_name: module_name.bookingsBus, group_name: group_name.detailPage, operation_type: 'Invoice', category_name: category_name.print },
    refundPermission: { module_name: module_name.bookingsBus, group_name: group_name.detailPage, operation_type: 'Refund Bus Ticket', category_name: category_name.action },
}

export const bookingsHotelPermissions = {
    modifyPermissions: { module_name: module_name.bookingsHotel, group_name: group_name.detailPage, operation_type: 'Modify', category_name: category_name.entry },
    voucherPermissions: { module_name: module_name.bookingsHotel, group_name: group_name.detailPage, operation_type: 'Voucher', category_name: category_name.print },
    amendmentPermissions: { module_name: module_name.bookingsHotel, group_name: group_name.detailPage, operation_type: 'Amendment', category_name: category_name.entry },
    invoicePermissions: { module_name: module_name.bookingsHotel, group_name: group_name.detailPage, operation_type: 'Invoice', category_name: category_name.print },
}

export const bookingsVisaPermissions = {
    modifyPermissions: { module_name: module_name.bookingsVisa, group_name: group_name.listingPage, operation_type: 'View All Data', category_name: category_name.view },
    startProcessPermissions: { module_name: module_name.bookingsVisa, group_name: group_name.detailPage, operation_type: 'Start Process', category_name: category_name.action },
    applyForVisaPermissions: { module_name: module_name.bookingsVisa, group_name: group_name.detailPage, operation_type: 'Apply For Visa', category_name: category_name.action },
    successVisaPermissions: { module_name: module_name.bookingsVisa, group_name: group_name.detailPage, operation_type: 'Success Visa', category_name: category_name.action },
    rejectVisaPermissions: { module_name: module_name.bookingsVisa, group_name: group_name.detailPage, operation_type: 'Reject Visa', category_name: category_name.action },
    viewDocumentsPermissions: { module_name: module_name.bookingsVisa, group_name: group_name.detailPage, operation_type: 'View Documents', category_name: category_name.view },
    viewOnlyAssignedPermissions: { module_name: module_name.bookingsVisa, group_name: group_name.listingPage, operation_type: 'View Only Assigned', category_name: category_name.view },
    refundPermission: { module_name: module_name.bookingsVisa, group_name: group_name.detailPage, operation_type: 'Refund Visa', category_name: category_name.action },
}

export const bookingsInsurancePermissions = {
    modifyPermissions: { module_name: module_name.bookingsInsurance, group_name: group_name.listingPage, operation_type: 'View All Data', category_name: category_name.view },
}

export const offlineServicePermissions = {
    viewOnlyAssignedPermissions: { module_name: module_name.offlineService, group_name: group_name.listingPage, operation_type: 'View Only Assigned', category_name: category_name.view },
}

export const activityPermissions = {
    auditUnauditPermissions: { module_name: module_name.activity, group_name: group_name.listingPage, operation_type: 'Audit Unaudit', category_name: category_name.audit_unaudit },
    enableDisablePermissions: { module_name: module_name.activity, group_name: group_name.listingPage, operation_type: 'Enable Disable', category_name: category_name.enableDisable },
}

export const takeransfersPermissions = {
    auditUnauditPermissions: { module_name: module_name.transfer, group_name: group_name.listingPage, operation_type: 'Audit Unaudit', category_name: category_name.audit_unaudit },
    enableDisablePermissions: { module_name: module_name.transfer, group_name: group_name.listingPage, operation_type: 'Enable Disable', category_name: category_name.enableDisable },
}

export const inventoryHolidayPermissions = {
    publishUnpublishPermissions: { module_name: module_name.inventoryHoliday, group_name: group_name.listingPage, operation_type: 'Publish Unpublish', category_name: category_name.publish_unpublish },
    setasPopularPermissions: { module_name: module_name.inventoryHoliday, group_name: group_name.listingPage, operation_type: 'Set as Popular', category_name: category_name.operation },
    copyProductPermissions: { module_name: module_name.inventoryHoliday, group_name: group_name.listingPage, operation_type: 'Copy Product', category_name: category_name.copy },
    viewHolidayPermissions: { module_name: module_name.inventoryHoliday, group_name: group_name.listingPage, operation_type: 'View Holiday', category_name: category_name.view },
    auditUnauditPermissions: { module_name: module_name.inventoryHoliday, group_name: group_name.listingPage, operation_type: 'Audit Unaudit', category_name: category_name.audit_unaudit },
}

export const inventoryCabPermissions = {
    publishUnpublishPermissions: { module_name: module_name.inventoryCab, group_name: group_name.listingPage, operation_type: 'Publish Unpublish', category_name: category_name.publish_unpublish },
    setasPopularPermissions: { module_name: module_name.inventoryCab, group_name: group_name.listingPage, operation_type: 'Set as Popular', category_name: category_name.operation },
    copyProductPermissions: { module_name: module_name.inventoryCab, group_name: group_name.listingPage, operation_type: 'Copy Product', category_name: category_name.copy },
    viewCabPermissions: { module_name: module_name.inventoryCab, group_name: group_name.listingPage, operation_type: 'View Cab', category_name: category_name.view },
}

export const supplierWalletBalancePermissions = {
    supplierBalanceSyncPermissions: { module_name: module_name.supplierWalletBalance, group_name: group_name.listingPage, operation_type: 'Sync', category_name: category_name.entry },
}

export const vehiclePermissions = {
    auditUnauditPermissions: { module_name: module_name.vehicle, group_name: group_name.listingPage, operation_type: 'Audit Unaudit', category_name: category_name.audit_unaudit },
    enableDisablePermissions: { module_name: module_name.vehicle, group_name: group_name.listingPage, operation_type: 'Enable Disable', category_name: category_name.enableDisable },
    addImagePermissions: { module_name: module_name.vehicle, group_name: group_name.listingPage, operation_type: 'Add Image', category_name: category_name.entry },
}

export const inventoryVisaPermissions = {
    enableDisablePermissions: { module_name: module_name.inventoryVisa, group_name: group_name.listingPage, operation_type: 'Enable Disable', category_name: category_name.enableDisable },
    visaDocumentsPermissions: { module_name: module_name.inventoryVisa, group_name: group_name.listingPage, operation_type: 'Visa Documents', category_name: category_name.view },
    visaChargesPermissions: { module_name: module_name.inventoryVisa, group_name: group_name.listingPage, operation_type: 'Visa Charges', category_name: category_name.view },
    specialNotesPermissions: { module_name: module_name.inventoryVisa, group_name: group_name.listingPage, operation_type: 'Special Notes', category_name: category_name.entry },
}

export const employeePermissions = {
    blockUnblockPermissions: { module_name: module_name.employee, group_name: group_name.listingPage, operation_type: 'Block Unblock', category_name: category_name.block_unblock },
    viewKYCPermissions: { module_name: module_name.employee, group_name: group_name.listingPage, operation_type: 'View KYC', category_name: category_name.view },
    auditUnauditKYCPermissions: { module_name: module_name.employee, group_name: group_name.listingPage, operation_type: 'Audit Unaudit KYC', category_name: category_name.audit_unaudit },
    workingStatusPermissions: { module_name: module_name.employee, group_name: group_name.listingPage, operation_type: 'Working Status', category_name: category_name.entry },
    setPermissionProfilePermissions: { module_name: module_name.employee, group_name: group_name.listingPage, operation_type: 'Set Permission Profile', category_name: category_name.entry },
    setKYCProfilePermissions: { module_name: module_name.employee, group_name: group_name.listingPage, operation_type: 'Set KYC Profile', category_name: category_name.entry },
}

export const permissionMasterPermissions = {
    isDefaultPermissions: { module_name: module_name.permission, group_name: group_name.listingPage, operation_type: 'Is Default', category_name: category_name.operation },
}

export const permissionProfilePermissions = {
    isDefaultPermissions: { module_name: module_name.permissionProfile, group_name: group_name.listingPage, operation_type: 'Is Default', category_name: category_name.operation },
    applyPermissionPermissions: { module_name: module_name.permissionProfile, group_name: group_name.listingPage, operation_type: 'Apply Permission', category_name: category_name.entry },
}

export const ERPSettingsPermissions = {
    savePermissions: { module_name: module_name.ERPSettings, group_name: group_name.detailPage, operation_type: 'Save', category_name: category_name.entry },
}

export const markupProfilePermissions = {
    setasDefaultPermissions: { module_name: module_name.markupProfile, group_name: group_name.listingPage, operation_type: 'Set as Default', category_name: category_name.action },
}

export const emailSetupPermissions = {
    sendTestMailPermissions: { module_name: module_name.emailsetup, group_name: group_name.listingPage, operation_type: 'Send Test Mail', category_name: category_name.action },
    setasDefaultPermissions: { module_name: module_name.emailsetup, group_name: group_name.listingPage, operation_type: 'Set as Default', category_name: category_name.action },
}

export const messageTemplatesPermissions = {
    enableDisablePermissions: { module_name: module_name.messagetemplates, group_name: group_name.listingPage, operation_type: 'Enable Disable', category_name: category_name.enableDisable },
}

export const supplierAPIPermissions = {
    enableDisablePermissions: { module_name: module_name.supplierapi, group_name: group_name.listingPage, operation_type: 'Enable Disable', category_name: category_name.enableDisable },
}

export const PSPPermissions = {
    setDefaultPermissions: { module_name: module_name.pspsetting, group_name: group_name.listingPage, operation_type: 'Set Default', category_name: category_name.action },
    enableDisablePermissions: { module_name: module_name.pspsetting, group_name: group_name.listingPage, operation_type: 'Enable Disable', category_name: category_name.enableDisable },
}
