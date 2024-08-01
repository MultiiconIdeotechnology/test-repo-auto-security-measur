import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReplaySubject, debounceTime, distinctUntilChanged, filter, startWith, switchMap } from 'rxjs';
import { MarkupprofileService } from 'app/services/markupprofile.service';

@Component({
  selector: 'app-markup-profile-dialoge',
  templateUrl: './markup-profile-dialoge.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    NgClass,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    AsyncPipe,
    NgxMatSelectSearchModule,
    MatSnackBarModule
  ]
})

export class MarkupProfileDialogeComponent {
  record: any = {};
  formGroup: FormGroup;
  profileList: ReplaySubject<any[]> = new ReplaySubject<any[]>()

  constructor(
    public matDialogRef: MatDialogRef<MarkupProfileDialogeComponent>,
    private builder: FormBuilder,
    private markupprofileService:MarkupprofileService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    if(data){
      this.record = data
    }
  }

  note = new FormControl();

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      transactionId: [''],
      profile_name:[''],

      profilefilter: [''],
    });

    if(this.record.markup_profile_name) {
      this.formGroup.get('profilefilter').patchValue(this.record.markup_profile_name);
      this.formGroup.get('transactionId').patchValue(this.record.markup_profile_id);
    }

    this.formGroup.get('profilefilter').valueChanges
      .pipe(
        filter(search => !!search),
        startWith(''),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((value: any) => {
          return this.markupprofileService.getMarkupProfileCombo(value);
        })
      )
      .subscribe(data => this.profileList.next(data));
  }

  submit(): void {
    this.matDialogRef.close(this.formGroup.value);
  }
}
