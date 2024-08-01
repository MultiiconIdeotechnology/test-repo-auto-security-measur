import { FormBuilder, FormGroup, ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { NgIf, NgClass, DatePipe, AsyncPipe, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { Routes } from 'app/common/const';
import { MarkupprofileService } from 'app/services/markupprofile.service';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-markup-profile-entry',
  templateUrl: './markup-profile-entry.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatInputModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    RouterModule,
    NgClass,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    AsyncPipe,
    NgxMatSelectSearchModule,
    MatDatepickerModule,
    NgxMatTimepickerModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
    FormsModule,
    MatCheckboxModule,
    MatMenuModule
  ],
})
export class MarkupProfileEntryComponent {
  
  record: any = {};
  disableBtn: boolean = false
  readonly: boolean = false;
  formGroup: FormGroup;
  MarkupProfileListRoute = Routes.settings.markupprofile_route;
  title = "Create Markup Profile";

  btnTitle: string = 'Create';


  constructor(
    private builder: FormBuilder,
    public route: ActivatedRoute,
    public toasterService: ToasterService,
    private markupprofileService : MarkupprofileService
  ) {
  }

  ngOnInit(): void {

    this.formGroup = this.builder.group({
      id: [''],
      markup_profile_by: ['Company'],
      particular_id: [''],
      particular_name: [''],
      profile_name: [''],
      is_default_profile: [false],
      empfilter: [''],
      agentfilter: [''],

      
    });

    this.route.queryParamMap.subscribe(params => {
      const id = params.get('id');
      const readonly = params.get('readonly');

      if (id) {
        this.readonly = readonly ? true : false;
        this.title = 'Holiday Product Detail';
        this.btnTitle = readonly ? 'Close' : 'Save';
        this.markupprofileService.getMarkupProfileRecord(id).subscribe({
          next: data => {
            this.record = data;
            this.formGroup.patchValue(this.record);
            this.formGroup.get('wlfilter').patchValue(this.record.wl_name);
            this.formGroup.get('destinationfilter').patchValue(this.record.destination_name);
          },
          error: (err) => {
            this.toasterService.showToast('error', err)
                
            },
        })
      }
    })
  }
}
