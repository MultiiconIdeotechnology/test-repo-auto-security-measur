import { Component, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import Swal from 'sweetalert2';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { SidebarModule } from 'primeng/sidebar';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
    selector: 'app-common-filter',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatDividerModule,
        FormsModule,
        MatTooltipModule,
        AsyncPipe,
        NgClass,
        ClipboardModule,
        SidebarModule
    ],
    templateUrl: './common-filter.component.html',
    styleUrls: ['./common-filter.component.scss']
})
export class CommonFilterComponent implements OnInit {

    disableBtn: boolean = false
    constructor(public _filterService: CommonFilterService) { }

    ngOnInit(): void {
    }

    saveSettings() {
        this._filterService.updateDrawers(this._filterService.filter_grid_array);
        this._filterService.closeDrawer();
    }

    // Create New Filter
    createNewFilter(): void {
        this._filterService.closeDrawer();
        Swal.fire({
            text: "Create New Filter",
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
                this._filterService.sidebarVisible = true;
            } else if (result.isDismissed) {
                this._filterService.sidebarVisible = true;
            }
        }); 
    }
}
