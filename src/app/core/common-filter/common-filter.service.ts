import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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

    constructor(private http: HttpClient) { }

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
        return JSON.parse(localStorage.getItem('filterData'));
    }

    // Update LocalStorage Data setFilterData
    setLocalFilterData(data: any) {
        localStorage.setItem('filterData', JSON.stringify(data || '[]'));
        if (data && data.length) {
            let filter = data.find((item: any) => item.grid_name == this.filter_table_name);
            this.filter_grid_data = (filter || {});
            this.setActiveData(this.filter_grid_data);
        }
    }

    // update Data
    updateDrawers(data: any) {
        this.drawersUpdated.next(data);
    }

    setActiveData(filerData: any){
        if(filerData && filerData.filters) {
            this.activeFiltData = filerData.filters.find((element: any) => element.is_default);
        } else {
            this.activeFiltData = {};
        }
        // console.log("activeFiltData", this.activeFiltData);
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
        let localFilterData = JSON.parse(localStorage.getItem('filterData'));

        if (localFilterData && localFilterData.length) {
            let filter = localFilterData.find((item: any) => item.grid_name == table_name);
            this.filter_grid_data = (filter || {});
            this.setActiveData(this.filter_grid_data);
        }
    }

    // Range date convert to string format from array 
    rangeDateConvert(dateArr:any){
        dateArr.value[0] = new Date(dateArr.value[0]);
        dateArr.value[1] = new Date(dateArr.value[1]);
        dateArr.value.join(",");
    }

    // Close Filter Drawer
    closeDrawer() {
        this.filterDrawerVisible = false;
    }
}
