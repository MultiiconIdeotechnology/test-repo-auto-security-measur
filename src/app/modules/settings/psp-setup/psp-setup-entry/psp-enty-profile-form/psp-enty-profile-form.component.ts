import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PspSetupService } from 'app/services/psp-setup.service';
import { ToasterService } from 'app/services/toaster.service';
import { takeUntil, Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-psp-enty-profile-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './psp-enty-profile-form.component.html',
  styleUrls: ['./psp-enty-profile-form.component.scss']
})
export class PspEntyProfileFormComponent {
  disableBtn: boolean = false;
  formGroup: FormGroup;
  readonly: boolean = false;
  btnTitle: string = 'Save'
  isQueryparams:boolean = false;
  isLoading: boolean = false;
  isId:boolean = true;
  private destroy$ = new Subject<void>();
  record:any

  constructor(
    private builder: FormBuilder,
    private pspSetupService: PspSetupService,
    private toasterService: ToasterService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.formGroup = this.builder.group({
      id: [''],
      profile_name: ['', Validators.required],
    });
   }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params:any) => {
        if(params && params['id']){
          this.isQueryparams = true;
          this.formGroup.patchValue(params);
        }
    })
    // this.pspSetupService.managePgProfile$.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
    //     this.record = res;
    //     console.log("this.formGroup", this.formGroup)
    // })

   
  }

  ngAfterViewInit(){
    console.log(this.record)
    if(this.record)
    this.formGroup.patchValue(this.record)
  }

  submit() {
    this.isLoading = true;
    this.pspSetupService
      .managePgProfile(this.formGroup.value)
      .subscribe({
        next: (resp: any) => {
          this.isLoading = false;
          if (resp) {
            if(!this.isQueryparams && this.isId){
              this.pspSetupService.managePgProfileSubject.next({ status: 'success', id: resp.id, isProfileFormSuccess:true });
              this.isId = false;
            }
            this.toasterService.showToast('success', 'Profile name saved successfully');
          }
        },
        error: (err) => {
          this.toasterService.showToast('error', err)
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
