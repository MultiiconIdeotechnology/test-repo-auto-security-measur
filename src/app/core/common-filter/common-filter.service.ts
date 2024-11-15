import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AgentService } from 'app/services/agent.service';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { RefferralService } from 'app/services/referral.service';
import { environment } from 'environments/environment';
import { Table } from 'primeng/table';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CommonFilterService {

    // Filter Data behavior
    private drawersUpdated = new Subject<void>();
    drawersUpdated$ = this.drawersUpdated.asObservable();
    private showFilterSubject = new Subject<void>();
    showFilter$ = this.showFilterSubject.asObservable();

    private baseUrl = environment.apiUrl;
    filterDrawerVisible: boolean = false;
    filter_grid_data: any = {};
    filter_table_name: any;
    fliterTableConfig: any;
    activeFiltData: any = {};
    selectedColumns: any = [];
    selectionDateDropdown: any;
    selectionDateDropdownContracting: any;

    // agetcombo variable
    originalAgentList: any[] = [];
    agentListByValue: any[] = [];
    agentListById: any[] = [];

    // Rm combo variable
    originalRmList: any[] = [];
    rmListByValue: any[] = []

    // array from dropdown date range filter
    dateRangeList: any[] = [
        { label: 'Today', value: 'today', },
        { label: 'Last 3 Days', value: 'last_3_days' },
        { label: 'This Week', value: 'this_week' },
        { label: 'This Month', value: 'this_month' },
        { label: 'Last 3 Months', value: 'last_3_month' },
        { label: 'Last 6 Months', value: 'last_6_month' },
        { label: 'Custom Date Range', value: 'custom_date_range' }
    ];

    dateRangeContractingList: any[] = [
        { label: 'Today', value: 'today', },
        { label: 'This Week', value: 'This Week' },
        { label: 'This Month', value: 'This Month' },
        { label: 'Previous Month', value: 'Previous Month' },
        { label: 'Last 3 Months', value: 'Last 3 Months' },
        { label: 'Last 6 Months', value: 'Last 6 Months' },
        { label: 'Custom', value: 'Custom' }
    ];

    constructor(
        private http: HttpClient,
        private agentService: AgentService,
        private refferralService: RefferralService,
        private kycDocumentService: KycDocumentService,
    ) {

    }

    // Create new Filter
    createNewFilter(filter: any): Observable<any[]> {
        return this.http.post<any[]>(this.baseUrl + 'GridFilters/create', filter);
    }

    // Delete Filter record
    deleteFiter(id: any): Observable<any> {
        return this.http.post<any[]>(this.baseUrl + 'GridFilters/delete', { id: id });
    }

    // Get Filter Data
    getFilterData() {
        return JSON.parse(localStorage.getItem('filterData') || '[]');
    }

    // Update LocalStorage Data setFilterData
    setLocalFilterData(data: any) {
        localStorage.setItem('filterData', JSON.stringify(data || []));
        if (data && data.length) {
            let filter = data.find((item: any) => item.grid_name == this.filter_table_name);
            this.filter_grid_data = (filter || {});
            this.setActiveData(this.filter_grid_data);
        } else {
            this.activeFiltData = {};
            this.filter_grid_data = {};
        }
    }

    // update Data
    updateDrawers(data: any) {
        this.drawersUpdated.next(data);
    }

    setActiveData(filerData: any) {
        if (filerData && filerData.filters) {
            this.activeFiltData = filerData.filters.find((element: any) => element.is_default);
        } else {
            this.activeFiltData = {};
        }
    }

    // Common Filter Drawer
    openDrawer(table_name: any, primengTable: Table, _selectedColumns?: any) {
        this.filterDrawerVisible = true;
        this.filter_table_name = table_name;
        this.fliterTableConfig = primengTable || {};
        this.selectedColumns = _selectedColumns || [];
        let localFilterData = this.getFilterData();
        this.showFiltSubject();

        if (localFilterData && localFilterData.length) {
            let filter = localFilterData.find((item: any) => item.grid_name == table_name);
            this.filter_grid_data = (filter || {});
            this.setActiveData(this.filter_grid_data);
        }
    }

    // Show
    showFiltSubject() {
        this.showFilterSubject.next();
    }

    // Apply Page Defult Filter
    applyDefaultFilter(table_name: any) {
        this.filter_table_name = table_name;
        // this.fliterTableConfig = primengTable;
        let localFilterData = JSON.parse(localStorage.getItem('filterData') || '[]');
        if (localFilterData && localFilterData.length) {
            let filter = localFilterData.find((item: any) => item.grid_name == table_name);
            this.filter_grid_data = (filter || {});
            this.setActiveData(this.filter_grid_data);
        }
    }

    // Range date convert to string format from array 
    rangeDateConvert(dateArr: any) {
        dateArr.value[0] = new Date(dateArr.value[0]);
        dateArr.value[1] = new Date(dateArr.value[1]);
        dateArr.value.join(",");
    }

    // Close Filter Drawer
    closeDrawer() {
        this.filterDrawerVisible = false;
    }

    // Date Range dropdown onselect 
    onOptionClick(option: any, primengTable: any, field: any, key?: any) {
        this.selectionDateDropdown = option.value;
        // const today = new Date();
        // let startDate = new Date(today);
        // let endDate = new Date(today);

        // switch (option.label) {
        //     case 'Today':
        //         break;
        //     case 'Last 3 Days':
        //         startDate.setDate(today.getDate() - 2);
        //         break;
        //     case 'This Week':
        //         startDate.setDate(today.getDate() - today.getDay());
        //         break;
        //     case 'This Month':
        //         startDate.setDate(1);
        //         break;
        //     case 'Last 3 Months':
        //         startDate.setMonth(today.getMonth() - 3);
        //         startDate.setDate(1);
        //         break;
        //     case 'Last 6 Months':
        //         startDate.setMonth(today.getMonth() - 6);
        //         startDate.setDate(1);
        //         break;
        //     case 'Custom Date Range':

        //     default:
        //         return;
        // }
        // startDate.setHours(0, 0, 0, 0);
        // endDate.setHours(23, 59, 59, 999);
        // let dateArr = [startDate, endDate];
        // const range = [startDate.toISOString(), endDate.toISOString()].join(",");
        if(option.value != 'custom_date_range'){
            primengTable.filter(option.value, field, 'custom');
            primengTable.filters[field]['value'] = option.value;
            primengTable.filters[field]['matchMode'] = 'custom';
        }
    }

    // Date Range dropdown onselect Contracting
    onOptionClickContracting(option: any, primengTable: any, field: any, key?: any) {
        this.selectionDateDropdownContracting = option.value;
        const today = new Date();
        let startDate = new Date(today);
        let endDate = new Date(today);

        switch (option.label) {
            case 'Today':
                break;
            case 'This Week':
                startDate.setDate(today.getDate() - today.getDay());
                break;
            case 'This Month':
                startDate.setDate(1);
                break;
            case 'Previous Month':
                 // Set startDate to the first day of the previous month
            startDate.setMonth(today.getMonth() - 1);
            startDate.setDate(1);

            // Set endDate to the last day of the previous month
            endDate.setDate(0); // 0th day of the current month is the last day of the previous month
            break;
            case 'Last 3 Months':
                startDate.setMonth(today.getMonth() - 3);
                startDate.setDate(1);
                break;
            case 'Last 6 Months':
                startDate.setMonth(today.getMonth() - 6);
                startDate.setDate(1);
                break;
            case 'Custom':

            default:
                return;
        }
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        let dateArr = [startDate, endDate];
        const range = [startDate.toISOString(), endDate.toISOString()].join(",");
        primengTable.filter(range, field, 'custom');
        primengTable.filters[field]['value'] = dateArr;
        primengTable.filters[field]['matchMode'] = 'custom';
    }

    // agent combo api call
    getAgent(value: string) {
        this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
            this.originalAgentList = data;

            // Process list for those who need `id_by_value`
            this.agentListByValue = this.originalAgentList.map((agent) => ({
                ...agent,
                agent_info: `${agent.code}-${agent.agency_name}-${agent.email_address}`,
                id_by_value: agent.agency_name,
            }));

            // Process list for those who don't need `id_by_value`
            this.agentListById = this.originalAgentList.map((agent) => ({
                ...agent,
                agent_info: `${agent.code}-${agent.agency_name}-${agent.email_address}`,
            }));
        })
    }

    getEmployeeList(value: string) {
        this.refferralService.getEmployeeLeadAssignCombo(value).subscribe((data: any) => {
            this.originalRmList = data;

            this.rmListByValue = this.originalRmList.map((rm) => ({
                ...rm,
                id_by_value: rm.employee_name
            }))
        });
    }

}
