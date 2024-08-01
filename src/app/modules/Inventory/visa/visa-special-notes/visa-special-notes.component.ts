import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToasterService } from 'app/services/toaster.service';
import { VisaService } from 'app/services/visa.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';

@Component({
    selector: 'app-visa-special-notes',
    templateUrl: './visa-special-notes.component.html',
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
        MatDatepickerModule,
        MatSlideToggleModule,
        MatTooltipModule,
        NgxMatTimepickerModule,
        NgxMatSelectSearchModule,
    ],
})
export class VisaSpecialNotesComponent {
    record: any = {};
    specialNotesList: any[] = [];
    recordList: any;

    isEditing: boolean = false;
    editedIndex: number = -1;

    constructor(
        public matDialogRef: MatDialogRef<VisaSpecialNotesComponent>,
        private builder: FormBuilder,
        private visaService: VisaService,
        public alertService: ToasterService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        this.record = data;
    }

    editFlag = false;
    formGroup: FormGroup;
    ngOnInit(): void {
        this.formGroup = this.builder.group({
            id: [this.data.id],
            special_notes: ['']
        });
        if(this.data.special_notes){
            this.specialNotesList = this.data.special_notes?.split('*|*')
        }
    }

    edit(data): void {
        this.formGroup.get('special_notes').patchValue(data);
        this.isEditing = true;
        this.editedIndex = this.specialNotesList.indexOf(data);
    }

    delete(ex): void {
        const index = this.specialNotesList.indexOf(ex);
        if (index !== -1) {
            this.specialNotesList.splice(index, 1);
        }
    }

    saveAction(): void {
        let json = this.formGroup.getRawValue();
        json.special_notes = this.specialNotesList.join('*|*');
        this.visaService.addSpecialNotes(json).subscribe({
            next: () => {
                this.alertService.showToast(
                    'success',
                    'Special Notes added successfully!',
                    'top-right',
                    true
                );
                this.matDialogRef.close(true)
            },
            error: (err) => {
                this.alertService.showToast('error', err)
            }
        });
    }

    add1(): void {
        // const specialNotesValue = this.formGroup.get('special_notes').value.trim();
        // this.specialNotesList.push(specialNotesValue);
        // this.formGroup.get('special_notes').setValue('');
    }

    add(): void {
        const specialNotesValue = this.formGroup.get('special_notes').value.trim();
        if(this.formGroup.get('special_notes').value.trim()){
        if (this.isEditing && this.editedIndex !== -1) {
            this.specialNotesList[this.editedIndex] = specialNotesValue;
            this.isEditing = false;
            this.editedIndex = -1;
        } else {
            this.specialNotesList.push(specialNotesValue);
        }}
        this.formGroup.get('special_notes').setValue('');
    }
}
