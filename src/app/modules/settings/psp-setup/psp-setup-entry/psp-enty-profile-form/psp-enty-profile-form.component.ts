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
  record:any;
  profileFormData:any;

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
    // this.activatedRoute.queryParams.subscribe((params:any) => {
    //     if(params && params['id']){
    //       this.isQueryparams = true;

    //       // this.formGroup.patchValue(params);
    //     }
    //   })
      
      let profileFormData = JSON.parse(localStorage.getItem('pspSetupProfile'));

      if(profileFormData){
        this.formGroup.patchValue(profileFormData)
      }
    
    // this.pspSetupService.managePgProfile$.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
    //     this.record = res;
    //     console.log("this.formGroup", this.formGroup)
    // })

   
  }

  submit() {
    this.isLoading = true;
    this.pspSetupService
      .managePgProfile(this.formGroup.value)
      .subscribe({
        next: (resp: any) => {
          this.isLoading = false;
          if (resp) {
            // if(!this.isQueryparams && this.isId){
            //   this.pspSetupService.profileFormData.next({ status: 'success', id: resp.id, isProfileFormSuccess:true });
            //   this.isId = false;
            //   localStorage.setItem('pspSetupProfile', JSON.stringify(resp))
            // }

            this.profileFormData = JSON.parse(localStorage.getItem('pspSetupProfile'));
            if(!(this.profileFormData && this.profileFormData?.id)){
              localStorage.setItem('pspSetupProfile', JSON.stringify({id:resp.id, profile_name:this.formGroup.get('profile_name')?.value}));
              this.formGroup.get('id').patchValue(resp.id);
              this.pspSetupService.managePgProfileSubject.next(true);
            } else {
              localStorage.setItem('pspSetupProfile', JSON.stringify({id:this.profileFormData.id, profile_name:this.formGroup.get('profile_name')?.value}))
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
