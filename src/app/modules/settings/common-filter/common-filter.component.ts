import { Component, OnChanges } from '@angular/core';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatDividerModule } from '@angular/material/divider';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-common-filter',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        AsyncPipe,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        NgxMatSelectSearchModule,
        MatTooltipModule,
        MatDividerModule
    ],
    templateUrl: './common-filter.component.html',
    styleUrls: ['./common-filter.component.scss']
})
export class CommonFilterComponent implements OnChanges {
    disableBtn: boolean = false
    readonly: boolean = false;
    record: any = {};
    fieldList: {};
    btnLabel: any = "Submit";
    formGroup: FormGroup;
    title = "Common Filter"

    constructor(
        private conformationService: FuseConfirmationService
    ) { }

    ngOnInit(): void {
        console.log("Common Filter called");
    }

    ngOnChanges() {
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

        const label: string = 'Create New Filter';
        this.conformationService
            .open({
                title: label,
                inputBox: 'New',
                customShow: true,
                dateCustomShow: false
            })
            .afterClosed()
            .subscribe((res) => {
                if (res?.action === 'confirmed') {
                    let newJson = {
                        id: "",
                        special_status_remark: res?.statusRemark ? res?.statusRemark : ""
                    }
                    console.log("76", newJson);
                    // this.crmService.blocked(newJson).subscribe({
                    //     next: (res) => {
                    //         this.alertService.showToast(
                    //             'success',
                    //             'Blocked Successfully!',
                    //             'top-right',
                    //             true
                    //         );
                    //         if (res) {
                    //             this.dataList.splice(index, 1);
                    //         }
                    //     },
                    //     error: (err) => {
                    //         this.alertService.showToast(
                    //             'error',
                    //             err,
                    //             'top-right',
                    //             true
                    //         );
                    //     },

                    // });
                }
            });
    }
}
