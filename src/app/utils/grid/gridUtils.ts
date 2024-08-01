import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { AppConfig } from 'app/config/app-config';
import { FilterRequest } from 'app/_model/grid/filterRequest';

export class GridUtils {
    public static GetFilterReq(paginator: MatPaginator, sortEvent: MatSort, filter: string, defaultSortCol: string = null, defaultSortOrder = 0): FilterRequest {
        const index = paginator?.pageIndex || 0;
        let size = paginator?.pageSize;
        let sort = defaultSortCol;
        let sortOrder = defaultSortOrder || 0;

        if (!size) {
            size = AppConfig.pageSize;
        }

        if (sortEvent && sortEvent.active && sortEvent.direction !== '') {
            sort = sortEvent.active;
            sortOrder = sortEvent.direction === 'asc' ? 0 : 1;
        }

        const filterReq: FilterRequest = {
            Skip: index * size,
            Take: size,
            OrderBy: sort,
            Filter: filter || '',
            OrderDirection: sortOrder,
        };

        return filterReq;
    }

    public static resetPaginator(paginator: MatPaginator): void {
        if (paginator)
            paginator.pageIndex = 0;
    }

    public static getPaginatorData(paginator: MatPaginator): any {
        return { pageIndex: paginator?.pageIndex || 0, dataLength: paginator.length || 0 };
    }

    public static setPaginatorData(paginator: MatPaginator, data: any): void {
        paginator.pageIndex = data.pageIndex;
        paginator.length = data.dataLength;
    }

    public static getSortData(sort: MatSort): any {
        return { activeSort: sort.active, sortDirection: sort.direction };
    }

    public static setSortData(sort: MatSort, data: any): void {
        sort.active = data.activeSort;
        sort.direction = data.sortDirection;
    }
}
