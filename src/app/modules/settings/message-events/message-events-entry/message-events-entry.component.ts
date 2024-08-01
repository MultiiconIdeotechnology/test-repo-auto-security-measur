import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Component, Inject } from '@angular/core';
import { NgIf, NgClass, DatePipe, AsyncPipe, NgFor } from '@angular/common';
import { MessageEventsService } from 'app/services/message-events.service';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Linq } from 'app/utils/linq';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-message-events-entry',
  templateUrl: './message-events-entry.component.html',
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
    MatRadioModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    NgxMatSelectSearchModule,
  ],
})
export class MessageEventsEntryComponent {

  disableBtn: boolean = false
  readonly: boolean = false;
  record: any = {};
  fieldList: {};

  constructor(
    public matDialogRef: MatDialogRef<MessageEventsEntryComponent>,
    private builder: FormBuilder,
    private messageeventService: MessageEventsService,
    private toasterService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
  }

  formGroup: FormGroup;
  title = "Create Message Event"
  btnLabel = "Create"

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      event_name: [''],
      event_description: [''],
    });

  //   this.formGroup.get('event_name').valueChanges.subscribe(text => {
  //     this.formGroup.get('event_name').patchValue(Linq.convertToTitleCase(text), { emitEvent: false });
  //  }) 

    if (this.record.id) {
      this.formGroup.patchValue(this.record)
      this.readonly = this.data.readonly;
      if(this.readonly){
        this.fieldList = [
          {name:"Event Name", value:this.record.event_name},
          {name:"Event Description", value:this.record.event_description},
        ]
      }

      this.title = this.readonly ? ("Message Event - " + this.record.event_name) : 'Modify Message Event';
      this.btnLabel = this.readonly ? "Close" : 'Save';
    }
  }

  submit(): void {
    if(!this.formGroup.valid){
      this.toasterService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
}

    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    this.messageeventService.create(json).subscribe({
      next: () => {
        this.matDialogRef.close(true);
        this.disableBtn = false;
      }, error: (err) => {
        this.toasterService.showToast('error', err)
        this.disableBtn = false;
      }
    })
  }

}



