import { Component, Inject, inject } from '@angular/core';
import { NgIf, NgClass, DatePipe, AsyncPipe, NgFor } from '@angular/common';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToasterService } from 'app/services/toaster.service';
import { DestinationService } from './../../../../services/destination.service';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
    MatDialogRef,
    MAT_DIALOG_DATA,
    MatDialog,
} from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { DestinationCitiesComponent } from '../destination-cities/destination-cities.component';
import { Linq } from 'app/utils/linq';

@Component({
    selector: 'app-destination-entry',
    templateUrl: './destination-entry.component.html',
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
        MatSlideToggleModule,
        MatChipsModule,
        NgxMatSelectSearchModule,
    ],
})
export class DestinationEntryComponent {
    disableBtn: boolean = false;
    record: any = {};

    constructor(
        public matDialogRef: MatDialogRef<DestinationEntryComponent>,
        private builder: FormBuilder,
        private destinationService: DestinationService,
        protected alertService: ToasterService,
        private matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any[] = []
    ) {
        this.record = data || {};
    }

    formGroup: FormGroup;
    title = 'Create Destination';
    btnLabel = 'Create';
    announcer = inject(LiveAnnouncer);

    ngOnInit(): void {
        this.formGroup = this.builder.group({
            id: [''],
            destination_name: [''],
        });

        // this.formGroup.get('destination_name').valueChanges.subscribe(text => {
        //     this.formGroup.get('destination_name').patchValue(Linq.convertToTitleCase(text), { emitEvent: false });
        // })

        if (this.record.id) {
            this.title = 'Modify Destination';
            this.btnLabel = 'Save';
            this.formGroup.patchValue(this.record);
        }
    }

    submit(): void {
        if(!this.formGroup.valid){
            this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.formGroup.markAllAsTouched();
            return;
        }
        
        this.disableBtn = true;
        const json = this.formGroup.getRawValue();
        this.destinationService.create(json).subscribe({
            next: ( data:any) => {
                this.matDialogRef.close(true);
                this.disableBtn = false;
                this.destinationCities(data.id);
            },
            error: (err) => {
                this.disableBtn = false;
                this.alertService.showToast('error', err);
            },
        });
    }

    destinationCities(id : string): void {
        this.matDialog
            .open(DestinationCitiesComponent, {
                data: {id :id , data :this.record},
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                // if (res) record.cities_length = res;
            });
    } 
}
