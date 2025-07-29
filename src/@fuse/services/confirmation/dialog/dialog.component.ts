import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, MAT_DATE_FORMATS, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { FuseConfirmationConfig } from '@fuse/services/confirmation/confirmation.types';
import { UserService } from 'app/core/user/user.service';
import { LuxonDateAdapterService } from 'app/services/LuxonDateAdapter.service';
import { MY_DATE_FORMATS } from 'app/utils/commonutils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'fuse-confirmation-dialog',
    templateUrl: './dialog.component.html',
    styles: [
        `
            .fuse-confirmation-dialog-panel {

                @screen md {
                    @apply w-128;
                }

                .mat-mdc-dialog-container {

                    .mat-mdc-dialog-surface {
                        padding: 0 !important;
                    }
                }
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [NgIf,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        NgClass,
        MatInputModule,
        NgFor,
        DatePipe,
        AsyncPipe,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatSnackBarModule,
        MatSlideToggleModule,
        NgxMatSelectSearchModule,
        MatTooltipModule,
        MatAutocompleteModule,
        RouterOutlet,
        MatOptionModule,
        MatDatepickerModule
    ],
    providers: [
        { provide: DateAdapter, useClass: LuxonDateAdapterService },
        { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    ]
})
export class FuseConfirmationDialogComponent {
    formGroup: FormGroup;
    formGroupDate: FormGroup;
    user: any = {};
    userFlag: boolean = true;
    public _unsubscribeAll: Subject<any> = new Subject<any>();
    minDate = this.data.datepickerParameter;
    confirmData: any;
    disableBtn: boolean = false;

    /**
     * Constructor
     */
    constructor(
        public formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<FuseConfirmationDialogComponent>,
        private userService: UserService,
        @Inject(MAT_DIALOG_DATA) public data: FuseConfirmationConfig) {
            
        this.userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: any) => {
                this.user = user;
                this.userFlag = true;
                if (this.user?.user_name == 'tech2.multiicon@gmail.com') {
                    //As par discussion with paresh sir minDate removed
                    // this.userFlag = true;
                }
            });

    }

    ngOnInit() {
        this.formGroup = this.formBuilder.group({
            remark: ['', Validators.required],
        })

        this.formGroupDate = this.formBuilder.group({
            date: ['', Validators.required]
        })
        if (this.data && this.data?.datepickerParameter)
            this.formGroupDate.get('date').patchValue(this.data?.datepickerParameter)
    }

    updateConfirmData() {
        this.disableBtn = true;

        const confirmData = {
            action: 'confirmed',
            statusRemark: this.formGroup.get('remark')?.value,
        };
        this.dialogRef.close(this.data.customShow ? confirmData : 'confirmed');
    }

    updateConfirmDataDate() {
        this.disableBtn = true;

        const confirmData = {
            action: 'confirmed',
            date: this.formGroupDate.get('date')?.value,
        };

        this.dialogRef.close(this.data.dateCustomShow ? confirmData : 'confirmed');
    }
}
