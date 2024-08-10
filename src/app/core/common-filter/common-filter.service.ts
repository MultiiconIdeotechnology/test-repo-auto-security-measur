import { HttpClient } from '@angular/common/http';
import { Injectable, ViewChild } from '@angular/core';
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

    private baseUrl = environment.apiUrl;
    filterDrawerVisible: boolean = false;
    filter_grid_data: any = {};
    filter_table_name: any;
    fliterTableConfig: Table;
    activeFiltData: any = {};

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
        }
    }

    // Common Filter Drawer
    async openDrawer(table_name: any, primengTable: Table) {
        this.filterDrawerVisible = true;
        this.filter_table_name = table_name;
        this.fliterTableConfig = primengTable;
        let localFilterData = await this.getFilterData();

        if (localFilterData && localFilterData.length) {
            let filter = localFilterData.find((item: any) => item.grid_name == table_name);
            this.filter_grid_data = (filter || {});
            this.setActiveData(this.filter_grid_data);
        }
    }

    // Apply Page Defult Filter
    async applyDefaultFilter(table_name: any) {
        this.filter_table_name = table_name;
        // this.fliterTableConfig = primengTable;
        let localFilterData = await this.getFilterData();

        if (localFilterData && localFilterData.length) {
            let filter = localFilterData.find((item: any) => item.grid_name == table_name);
            this.filter_grid_data = (filter || {});
            this.setActiveData(this.filter_grid_data);
        }
    }

    // Close Filter Drawer
    closeDrawer() {
        this.filterDrawerVisible = false;
    }
}