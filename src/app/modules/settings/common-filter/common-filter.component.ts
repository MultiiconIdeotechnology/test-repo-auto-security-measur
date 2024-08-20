import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import Swal from 'sweetalert2';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { ToasterService } from 'app/services/toaster.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-common-filter',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule,
        MatTooltipModule,
        NgClass
    ],
    templateUrl: './common-filter.component.html',
    styleUrls: ['./common-filter.component.scss']
})
export class CommonFilterComponent implements OnInit {

    isLoading: boolean = false;
    isEditable: boolean = false;
    constructor(public _filterService: CommonFilterService,
        private alertService: ToasterService,
        private conformationService: FuseConfirmationService) { }

    ngOnInit(): void {
        this._filterService.showFilter$.subscribe(() => {
            this.isEditable = this.checkIsEditable();
        });
    }

    // Apply Filter
    applyFilter(item: any) {
        this.setActiveFilter(item);
        let gridData = JSON.parse(item.grid_config);
        this._filterService.updateDrawers(gridData);
        this._filterService.closeDrawer();
    }

    // Create New Filter
    createNewFilter(): void {
        let isFilter = this.checkFilterApplied(this._filterService.fliterTableConfig['filters']);
        if (!isFilter) {
            this.alertService.showToast('error', "No filter has been applied.", 'top-right', true);
            return;
        }

        this._filterService.closeDrawer();
        Swal.fire({
            text: "Create New Filter",
            input: "text",
            inputPlaceholder: 'Enter Filter name',
            inputAttributes: {
                autocapitalize: "off"
            },
            showCancelButton: true,
            showCloseButton: true,
            // closeButtonHtml:'<mat-icon class="text-current  text-white" svgIcon="heroicons_outline:x-mark"></mat-icon>',
            confirmButtonText: "Save",
            cancelButtonText: "Close",
            showLoaderOnConfirm: true,
            preConfirm: async (value) => {
                if (!value) {
                    return false;
                }
            },
            allowOutsideClick: () => Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                this.isLoading = true;
                let body = {
                    filter_name: result.value,
                    grid_name: this._filterService.filter_table_name,
                    panel_name: "BO",
                    grid_configuration: JSON.stringify({
                        sortColumn: this._filterService.fliterTableConfig['_sortField'],
                        table_config: this._filterService.fliterTableConfig['filters']
                    })
                }

                this._filterService.createNewFilter(body).subscribe({
                    next: (data: any) => {
                        if (data && data.status && data?.data.length) {
                            this._filterService.setLocalFilterData(data.data);
                            this.alertService.showToast('success', `New Filter created successfully.`, "top-right", true);
                        }
                        this.isLoading = false;
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);
                        this.isLoading = false;
                    },
                });
                this._filterService.filterDrawerVisible = true;
                this._filterService.showFiltSubject();
            } else if (result.isDismissed) {
                this._filterService.filterDrawerVisible = true;
                this._filterService.showFiltSubject();
            }
        });
    }

    // Update Filter
    updateFilterName(item: any) {
        this._filterService.closeDrawer();
        Swal.fire({
            text: "Update Filter Name",
            input: "text",
            inputValue: item.filter_name,
            inputPlaceholder: 'Enter Filter name',
            inputAttributes: {
                autocapitalize: "off"
            },
            showCancelButton: true,
            confirmButtonText: "Update",
            cancelButtonText: "Close",
            showLoaderOnConfirm: true,
            preConfirm: async (value) => {
                if (!value) {
                    return false;
                }
            },
            allowOutsideClick: () => Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                this.isLoading = true;
                let body = {
                    id: item.id,
                    filter_name: result.value,
                }

                this._filterService.createNewFilter(body).subscribe({
                    next: (data: any) => {
                        if (data && data.status && data?.data.length) {
                            this._filterService.setLocalFilterData(data.data);
                        }
                        this.isLoading = false;
                    }, error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);
                        this.isLoading = false;
                    },
                });
                this._filterService.filterDrawerVisible = true;
                this._filterService.showFiltSubject();
            } else if (result.isDismissed) {
                this._filterService.filterDrawerVisible = true;
                this._filterService.showFiltSubject();
            }
        });
    }

    // Save Changes
    saveChanges() {
        this._filterService.closeDrawer();
        this.conformationService.open({
            title: "Update",
            message: `Are you sure you want to update changes?`
        }).afterClosed().subscribe({
            next: (res) => {
                if (res === 'confirmed') {
                    this.isLoading = true;
                    let body = {
                        id: this._filterService.activeFiltData["id"],
                        panel_name: "BO",
                        grid_name: this._filterService.filter_table_name,
                        grid_configuration: JSON.stringify({
                            sortColumn: this._filterService.fliterTableConfig['_sortField'],
                            table_config: this._filterService.fliterTableConfig['filters']
                        })
                    }

                    this._filterService.createNewFilter(body).subscribe({
                        next: (data: any) => {
                            if (data && data.status && data?.data.length) {
                                this._filterService.setLocalFilterData(data.data);
                                this.isEditable = this.checkIsEditable();
                                this.alertService.showToast('success', `Filter updated successfully.`, "top-right", true);
                            }
                            this.isLoading = false;
                        },
                        error: (err) => {
                            this.alertService.showToast('error', err, 'top-right', true);
                            this.isLoading = false;
                        },
                    });
                    this._filterService.filterDrawerVisible = true;
                    this._filterService.showFiltSubject();
                } else {
                    this._filterService.filterDrawerVisible = true;
                    this._filterService.showFiltSubject();
                }
            }
        })
    }

    // Clone Filter
    cloneFilter(item: any) {
        this._filterService.closeDrawer();
        Swal.fire({
            text: "Clone Filter",
            input: "text",
            inputPlaceholder: 'Enter Filter name',
            inputAttributes: {
                autocapitalize: "off"
            },
            showCancelButton: true,
            confirmButtonText: "Save",
            cancelButtonText: "Close",
            showLoaderOnConfirm: true,
            preConfirm: async (value) => {
                if (!value) {
                    return false;
                }
            },
            allowOutsideClick: () => Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                this.isLoading = true;
                let body = {
                    filter_name: result.value,
                    grid_name: this._filterService.filter_table_name,
                    panel_name: "BO",
                    grid_configuration: item.grid_config
                }

                this._filterService.createNewFilter(body).subscribe({
                    next: (data: any) => {
                        if (data && data.status && data?.data.length) {
                            this._filterService.setLocalFilterData(data.data);
                            this.alertService.showToast('success', `Filter Clone successfully.`, "top-right", true);
                        }
                        this.isLoading = false;
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);
                        this.isLoading = false;
                    },
                });
                this._filterService.filterDrawerVisible = true;
                this._filterService.showFiltSubject();
            } else if (result.isDismissed) {
                this._filterService.filterDrawerVisible = true;
                this._filterService.showFiltSubject();
            }
        });
    }

    // Delete Filter
    deleteFilter(item: any) {
        this._filterService.closeDrawer();
        this.conformationService.open({
            title: "Delete Filter",
            message: `Are you sure you want to delete ${item.filter_name}`
        }).afterClosed().subscribe({
            next: (res) => {
                if (res === 'confirmed') {
                    this._filterService.deleteFiter(item.id).subscribe({
                        next: (data) => {
                            if (data && data.status && data?.data.length) {
                                this._filterService.setLocalFilterData(data.data);
                                this.alertService.showToast('success', `${item.filter_name} has been deleted successfully.`, "top-right", true);
                                this.isEditable = this.checkIsEditable();
                            }
                        }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
                    });
                    this._filterService.filterDrawerVisible = true;
                    this._filterService.showFiltSubject();
                } else {
                    this._filterService.filterDrawerVisible = true;
                    this._filterService.showFiltSubject();
                }
            }
        })
    }

    // Check Edit Changes
    checkIsEditable() {
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            const activeData = JSON.parse(this._filterService.activeFiltData?.grid_config || '{}')
            const activeKeys = Object.keys(activeData?.table_config);
            let currentFiltData: any = this._filterService.fliterTableConfig['filters'];

            for (const key of activeKeys) {
                const activeValue = activeData.table_config[key]?.value || '';
                const currentValue = currentFiltData[key]?.value || '';
                const activeMatchMode = activeData.table_config[key]?.matchMode;
                const currentMatchMode = currentFiltData[key]?.matchMode;

                // If any value or matchMode is different
                if (activeValue !== currentValue || activeMatchMode !== currentMatchMode) {
                    return true;
                }
            }
        }

        return false;
    }

    // is_default Update
    async setActiveFilter(item: any) {
        this._filterService.filter_grid_data?.filters.forEach((filter: any) => {
            filter.is_default = false;
        });

        const matchedItem = this._filterService.filter_grid_data?.filters.find((filter: any) => filter.id === item.id);
        if (matchedItem) {
            matchedItem.is_default = true;
        }

        // Update Local data is_default set
        let localData = await this._filterService.getFilterData();
        const filterData = localData.find((filter: any) => filter.grid_name === this._filterService.filter_table_name);
        if (filterData) {
            filterData.filters = this._filterService.filter_grid_data?.filters;
            this._filterService.setLocalFilterData(localData);
        }
    }

    // Check any filter applied
    checkFilterApplied(filters: any) {
        const validFilter: any = {};

        if (filters) {
            Object.keys(filters).forEach(key => {
                if (filters[key].value !== null && filters[key].value !== undefined && filters[key].value !== '') {
                    if (filters[key].value && filters[key].value.length && Array.isArray(filters[key].value)) {
                        validFilter[key] = {
                            value: filters[key].value,
                            matchMode: filters[key].matchMode
                        };
                    } else {
                        validFilter[key] = filters[key];
                    }
                }
            });
        }

        return Object.keys(validFilter).length > 0 ? validFilter : false;
    }

}
