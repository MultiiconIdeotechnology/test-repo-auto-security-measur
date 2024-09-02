import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { AppConfig } from 'app/config/app-config';
import { FilterRequest } from 'app/_model/grid/filterRequest';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';

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

    // PrimeNG Table function

    public static GetPrimeNGFilterReq(
        event: LazyLoadEvent = { first: 0, rows: AppConfig.pageSize, sortField: null, sortOrder: null },
        primengTable: Table,
        activeFiltData: any = {},
        filter: string = '',
        defaultSortCol: string = null,
        defaultSortOrder: number = 0,
    ): FilterRequest {
        const index = event.first || 0;
        const size = (primengTable ? primengTable?._rows : (event.rows || AppConfig.pageSize));
        let sort = defaultSortCol;
        let sortOrder = defaultSortOrder;
        let filtersColumn = (primengTable ? primengTable?.filters : (event.filters || {}));
        const validatedFilter = this.validateFilter(filtersColumn, activeFiltData);

        if (event.sortField && event.sortOrder !== undefined) {
            sort = event.sortField;
            sortOrder = event.sortOrder === 1 ? 0 : 1; // PrimeNG uses 1 for asc and -1 for desc
        }

        if (primengTable && primengTable._sortField) {
            sort = primengTable._sortField || event.sortField;
            sortOrder = primengTable._sortOrder === 1 ? 0 : 1;
        }

        const filterReq: FilterRequest = {
            Skip: index,
            Take: size,
            OrderBy: sort,
            Filter: filter || '',
            OrderDirection: sortOrder,
            columeFilters: validatedFilter,
        };

        return filterReq;
    }



    // Column Filter Data
    private static validateFilter(filter: any, activeFiltData: any): any {
        const validFilter: any = {};

        if (filter) {
            if (Object.keys(filter).length === 0) {
                // Default save filter applied first time
                if (activeFiltData && activeFiltData.grid_config) {
                    let filterData = JSON.parse(activeFiltData.grid_config);
                    filter = filterData['table_config'];
                }
            }

            Object.keys(filter).forEach(key => {
                if (filter[key].value !== null && filter[key].value !== undefined && filter[key].value !== '') {
                    if (filter[key].value && filter[key].value.length && Array.isArray(filter[key].value)) {
                        validFilter[key] = {
                            value: this.convertArrayToString(filter[key].value),
                            matchMode: filter[key].matchMode
                        };
                    } else {
                        if (!Array.isArray(filter[key].value)) {
                            if (filter[key] && filter[key].value && typeof filter[key].value === 'object') {
                                if (filter[key].value?.id || filter[key].value?.id_by_value) {
                                    let id_by_value = filter[key].value?.id_by_value ? filter[key].value?.id_by_value : filter[key].value?.id;
                                    validFilter[key] = {
                                        value: id_by_value,
                                        matchMode: filter[key].matchMode
                                    };
                                } else {
                                    validFilter[key] = {
                                        value: this.convertArrayToString(filter[key].value),
                                        matchMode: filter[key].matchMode
                                    };
                                }
                            } else {
                                validFilter[key] = filter[key];
                            }
                        }
                    }
                }
            });
        }

        return Object.keys(validFilter).length > 0 ? validFilter : {};
    }

    // Date Range convert in String
    static convertArrayToString(dates: any): any {
        if (dates && dates.length) {
            if (dates[0] instanceof Date) {
                return dates.map((dateStr: any) => {
                    const date = new Date(dateStr);
                    return date.toISOString().slice(0, -1);
                }).join(',');
            } else {
                let result = dates.map((item: any) => item.id_by_value || item.id || item.label).join(',');
                return result;
            }
        } else {
            return dates
        }
    }

}