import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MasterService {

    private sessionData: { key: any, data: any }[] = [];

    getData(key: any, cmpData: any): any {

        const dd2 = this.sessionData.find(ob => ob.key === key);
        if (!dd2) {
            return;
        }
        cmpData._paginator.pageIndex = dd2.data['pageIndex'];
        cmpData._paginator.pageSize = dd2.data['pageSize'];


        const activeSortHeader = cmpData._sort.sortables.get(dd2.data['sortActive']);
        activeSortHeader['_setAnimationTransitionState']({
            fromState: cmpData._sort.direction,
            toState: 'active',
        });

        if (dd2.data['search']) {
            cmpData.searchInputControl.setValue(dd2.data['search']);
        }

        if (dd2.data['filter']) {
            cmpData.Filter = dd2.data['filter'];
        }

        cmpData._sort.sort({
            id: dd2.data['sortActive'],
            start: dd2.data['sortDirection'],
            disableClear: true,
        });


        return dd2.data;
    }

    setData(key: any, cmpData: any): void {
        const dt = {
            pageIndex: cmpData._paginator.pageIndex,
            pageSize: cmpData._paginator.pageSize,
            sortActive: cmpData._sort.active,
            sortDirection: cmpData._sort.direction,
            search: cmpData.searchInputControl.value,
            filter: cmpData.Filter,
        };

        const dd1 = this.sessionData.find(ob => ob.key === key);
        if (dd1 === null || dd1 === undefined) {
            this.sessionData.push({
                key,
                data: dt
            });
        }
        else {
            dd1.data = dt;
        }
    }

    removeData(key: any): void {
        this.sessionData.forEach((item, index) => {
            if (item.key === key) this.sessionData.splice(index, 1);
        });
    }

}
