import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DestinationService } from 'app/services/destination.service';
import { ToasterService } from 'app/services/toaster.service';
import { CityService } from 'app/services/city.service';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-default-exclusions',
  templateUrl: './default-exclusions.component.html',
  styles: [
    `
        .panel mat-icon.only-show-on-hover {
            visibility: hidden;
            float: right;
        }
        .panel:hover mat-icon.only-show-on-hover {
            visibility: visible;
        }
        .panel2 .only-show-on-hover {
            visibility: hidden;
            float: right;
        }
        .panel2:hover .only-show-on-hover {
            visibility: visible;
        }
        .panel3 mat-icon.only-show-on-hover {
            visibility: hidden;
            float: right;
        }
        .panel3:hover mat-icon.only-show-on-hover {
            visibility: visible;
        }
        .width-content{
            width: max-content;
        }
    `,
],
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
  ]
})
export class DefaultExclusionsComponent {

  record: any = {};
  formGroup: FormGroup;
  productExclusionFormGroup: FormGroup;
  chipControl = new FormControl();
    readonly separatorKeysCodes = [ENTER, COMMA] as const;
    productExclusions: any[] = [];


    constructor(
      public matDialogRef: MatDialogRef<DefaultExclusionsComponent>,
      private builder: FormBuilder,
      private destinationService: DestinationService,
      protected toasterService: ToasterService,
      public route: ActivatedRoute,
      public cityService: CityService,
      private changeDetector: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any = {}

  ) {
    this.record = data || {}
    this.productExclusions = this.record.exclusion

  }


  ngOnInit(): void{
    this.productExclusionFormGroup = this.builder.group({
      id: [''],
      destination_id: [''],
      exclusion: [''],
  });
  }

  SaveProductExclusions(): void {
    if(!this.productExclusionFormGroup.valid){
        this.toasterService.showToast('error', 'Please fill all required fields.', 'top-right', true);
        this.productExclusionFormGroup.markAllAsTouched();
        return;
}

    const json = this.productExclusionFormGroup.getRawValue();
    json.destination_id = this.record.id;

    this.destinationService.createProductExclusion(json).subscribe({
        next: (res) => {
            if (json.id) {
                const excl = this.productExclusions.find(
                    (x) => x.id === json.id
                );
                Object.assign(excl, json);
            } else {
                json.id = res.id;
                this.productExclusions.push(json);
            }
            this.productExclusionFormGroup.reset();
            this.toasterService.showToast(
                'success',
                'Default Exclusion Saved!'
            );
        },
        error: (err) => {
            this.toasterService.showToast('error', err);
        },
    });

   
}

removeProductExclusion(exclusion): void {
  if (!exclusion.id) {
      const index = this.productExclusions.indexOf(
          this.productExclusions.find(
              (x) => x.exclusion === exclusion.exclusion
          )
      );
      this.productExclusions.splice(index, 1);
      this.toasterService.showToast(
          'success',
          'Default Exclusion Removed!'
      );
  } else
      this.destinationService
          .deleteProductExclusion(exclusion.id)
          .subscribe({
              next: () => {
                  const index = this.productExclusions.indexOf(
                      this.productExclusions.find(
                          (x) => x.id === exclusion.id
                      )
                  );
                  this.productExclusions.splice(index, 1);
                  this.toasterService.showToast(
                      'success',
                      'Default Exclusion Removed!'
                  );
              },
              error: (err) => {this.toasterService.showToast('error',err,'top-right',true);
                
            },
          });
}

saveDefault(ex): void {
  if (ex.id) return;
  this.productExclusionFormGroup.patchValue(ex);
  this.SaveProductExclusions();
  const index = this.productExclusions.indexOf(
      this.productExclusions.find((x) => x.exclusion === ex.exclusion)
  );
  this.productExclusions.splice(index, 1);
}

modifyDestintionExclusion(exclusion): void {
  this.productExclusionFormGroup.patchValue(exclusion);
}

ngAfterContentChecked(): void {
  this.changeDetector.detectChanges();
}

}
