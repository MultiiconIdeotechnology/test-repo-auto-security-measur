import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { OnlyFloatDirective } from '@fuse/directives/floatvalue.directive';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { VisaService } from 'app/services/visa.service';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-visa-price-change-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    OnlyFloatDirective,
  ],
  templateUrl: './visa-price-change-dialog.component.html',
  styleUrls: ['./visa-price-change-dialog.component.scss']
})
export class VisaPriceChangeDialogComponent {
  formGroup!: FormGroup;
  title:string = "Price Update"

  constructor(
    @Inject(MAT_DIALOG_DATA) public data:any,
    public matDialogRef: MatDialogRef<VisaPriceChangeDialogComponent>,
    private builder: FormBuilder,
    private conformationService: FuseConfirmationService,
    private visaService:VisaService,
    private toastr: ToasterService,
  ) {
    console.log("data", data)
  }

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      base_fare: [0, Validators.required],
      markup: [0, Validators.required]
    })

    if(this.data){
      if(this.data?.basePrice){
        this.formGroup.get('base_fare').patchValue(this.data.basePrice);
      }

      if(this.data?.markup){
        this.formGroup.get('markup').patchValue(this.data.markup);
      }
    }
  }

  submit(){
    this.conformationService.open({
      title: 'Price and Markup Change',
      message: `Are you sure you want to change Purchase price and Markup?`
  }).afterClosed().subscribe((res) => {
      if (res === 'confirmed') {
           let payload = this.formGroup.value;
           payload.base_fare = parseFloat(payload.base_fare);
           payload.markup = parseFloat(payload.markup);
           payload.id = this.data?.id;
           console.log("payload", payload)
          this.visaService.manageVisaRate(payload).subscribe({
              next: res => {
                  if (res && res['status']) {
                      this.toastr.showToast('success', 'Purchase Price changed successfully!');
                      this.matDialogRef.close();
                  }
              }, error: err => {
                  this.toastr.showToast('error', err)
              }
          })
      }
  });
  }
}
