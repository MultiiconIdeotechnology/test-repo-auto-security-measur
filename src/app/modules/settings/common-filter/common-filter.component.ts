import { Component, OnChanges } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import Swal from 'sweetalert2';
import { UserService } from 'app/core/user/user.service';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { SidebarModule } from 'primeng/sidebar';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';

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
export class CommonFilterComponent implements OnChanges {
    disableBtn: boolean = false
    readonly: boolean = false;
    record: any = {};
    fieldList: {};
    btnLabel: any = "Create New Filter";
    formGroup: FormGroup;
    title = "Filters"

    constructor(
        private conformationService: FuseConfirmationService,
        private _userService: UserService,
        public _filterService: CommonFilterService
    ) { }

    ngOnInit(): void {
        console.log("Common Filter called");
    }

    ngOnChanges() {
    }

    saveSettings() {
        this._filterService.updateDrawers(this._filterService.filter_grid_array);
        this._filterService.closeDrawer();
    }

    submit(): void {
        Swal.fire({
            text: "Create New Filter",
            input: "text",
            inputAttributes: {
              autocapitalize: "off"
            },
            showCancelButton: true,
            confirmButtonText: "Save",
            showLoaderOnConfirm: true,
            preConfirm: async (login) => {
                console.log("result login", login);
            },
            allowOutsideClick: () => !Swal.isLoading()
          }).then((result) => {
            if (result.isConfirmed) {
                console.log("result", result);

            }
          });
        return
    }
}
