import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CommonFilterService {

    sidebarVisible: boolean = false;
    filter_grid_array: any = [];

    // Filter Data behavior
    private drawersUpdated = new Subject<void>();
    drawersUpdated$ = this.drawersUpdated.asObservable();

    constructor() { }

    // Get Filter Data
    getFilterData() {
        return JSON.parse(localStorage.getItem('filterData'));
    }

    // update Data
    updateDrawers(data: any) {
        this.drawersUpdated.next(data);
    }

    // Common Filter Sidebar
    openDrawer(table_name: any) {
        this.sidebarVisible = true;
        let localFilterData = this.getFilterData();
        if (localFilterData && localFilterData.length) {
            let filter = localFilterData.find((item: any) => item.grid_name == table_name);
            this.filter_grid_array = (filter || []);
            // console.log("filter_grid_array", this.filter_grid_array);
        }

        // console.log("grid_name", table_name);
    }

    closeDrawer() {
        this.sidebarVisible = false;
    }
}