import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PspSetupService } from 'app/services/psp-setup.service';
import { ToasterService } from 'app/services/toaster.service';
import { takeUntil, Subject, filter, debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ThinLayoutComponent } from 'app/layout/layouts/vertical/thin/thin.component';

@Component({
  selector: 'app-psp-enty-profile-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    CommonModule,
    MatSelectModule,
    NgxMatSelectSearchModule
  ],
  templateUrl: './psp-enty-profile-form.component.html',
  styleUrls: ['./psp-enty-profile-form.component.scss']
})
export class PspEntyProfileFormComponent {
  disableBtn: boolean = false;
  formGroup: FormGroup;
  readonly: boolean = false;
  btnTitle: string = 'Save'
  isQueryparams: boolean = false;
  isLoading: boolean = false;
  isId: boolean = true;
  private destroy$ = new Subject<void>();
  record: any;
  profileFormData: any;
  companyCtrl: any = new FormControl('');
  agentCtrl: any = new FormControl('');
  companyList: any[] = [];
  agentList: any[] = [];
  profileId:any;
  pspforList: any[] = [
    { label: 'Company', value: 'Company' },
    { label: 'Agent', value: 'Agent' }
  ]

  profileData:any;


  constructor(
    private builder: FormBuilder,
    private pspSetupService: PspSetupService,
    private toasterService: ToasterService,
    private activatedRoute: ActivatedRoute,
    private _filterService: CommonFilterService
  ) {
    this.formGroup = this.builder.group({
      id: [''],
      profile_name: ['', Validators.required],
      profile_for: ['Company', Validators.required],
      profile_for_id: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this._filterService.agentList$.pipe((takeUntil(this.destroy$))).subscribe((res: any) => {
      this.agentList = res;
    })

    this.pspSetupService.editPgProfile$.pipe((takeUntil(this.destroy$))).subscribe((res:any) => {
      if(res){
        this.profileData = res;
        this.formGroup.patchValue(res);
        if(this.formGroup.get('profile_for')?.value == 'Agent'){
          this.agentCtrl.patchValue('sk');
        }
      }
    })
    
    this.agentFilterCtrl();
    this.companyFilterCtrl();
    this.onProfileForValueChange();
  }

  onProfileForValueChange(){
    this.formGroup.get('profile_for').valueChanges.subscribe((item:any) => {
      if(item == 'Company'){
        this.formGroup.get('profile_for_id').patchValue(this.companyList[0]?.company_id)
       } else {
        this.formGroup.get('profile_for_id').patchValue(this.agentList[0]?.id)
       }
    })
  }

  /*************Agent combo**************/
  agentFilterCtrl() {
    this.agentCtrl.valueChanges.pipe(
      filter((search) => !!search),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.pspSetupService.getAgentCombo(value, true);
      })
    ).subscribe({
      next: data => {
        this.agentList = data;
        console.log("this.agentList>>", this.agentList);
        // this.formGroup.get("profile_for_id").patchValue(this.agentList[0].id);
        this.formGroup.get("profile_for_id").patchValue(this.profileData?.profile_for_id || this.agentList[0].id);
      }
    });

  }

  /*************Company combo**************/
  companyFilterCtrl() {
    this.companyCtrl.valueChanges.pipe(
      filter((search) => !!search),
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.pspSetupService.getCompanyComboCashed(value);
      })
    ).subscribe({
      next: data => {
        this.companyList = data
        this.formGroup.get("profile_for_id").patchValue(this.profileData?.profile_for_id);
      }
    });
  }

  // public compareWith(v1: any, v2: any) {
  //   return v1 && v2 && v1.id === v2.id;
  // }

  submit() {
    if (this.formGroup.invalid) {
      this.toasterService.showToast('error', 'Fill up all required fields');
      return;
    }

    this.isLoading = true;
    this.pspSetupService.managePgProfile(this.formGroup.value).subscribe({
        next: (resp: any) => {
          this.isLoading = false;
          if (resp) {
            this.profileFormData = JSON.parse(localStorage.getItem('pspSetupProfile'));
            if (!(this.profileFormData && this.profileFormData?.id)) {
              this.setLocalStorage(resp.id);
              this.formGroup.get('id').patchValue(resp.id);
              this.pspSetupService.managePgProfileSubject.next(this.formGroup.value);
            } else {
              this.setLocalStorage(this.profileFormData.id);
              this.pspSetupService.managePgProfileSubject.next(this.formGroup.value);
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

  setLocalStorage(id: any) {
    let data = {};
    this.formGroup.get('id').patchValue(id);
    data = this.formGroup.value;
    localStorage.setItem('pspSetupProfile', JSON.stringify(data))
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
