import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterOutlet } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { LeadsService } from 'app/services/leads.service';
import { SettingsService } from 'app/services/settings.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject, Subject, takeUntil, filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-create-lead',
  templateUrl: './create-lead.component.html',
  styleUrls: ['./create-lead.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    RouterOutlet,
    NgFor,
    NgClass,
    MatSelectModule,
    MatOptionModule,
    AsyncPipe,
    NgxMatSelectSearchModule
  ],
})
export class CreateLeadComponent {

  leadForm: FormGroup;
  cityList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  allCity: any[] = [];
  AllCitys: any[];
  mobileCodeList: any[] = [];
  AllMobileCodeList: any[] = [];
  _unsubscribeAll: Subject<any> = new Subject<any>();
  userId: any;

  constructor(
    public matDialogRef: MatDialogRef<CreateLeadComponent>,
    private formBuilder: FormBuilder,
    private alertService: ToasterService,
    private leadsService: LeadsService,
    private _authService: AuthService,
    private settingService: SettingsService,
    private _userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this._userService.user$
      .pipe((takeUntil(this._unsubscribeAll)))
      .subscribe((user: any) => {
        this.userId = user.id;
      });
  }

  ngOnInit(): void {
    this.leadForm = this.formBuilder.group({
      agency_name: ['', Validators.required],
      city_id: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile_code: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.minLength(7)]],
      agreements: [false],
      from: ['WEB'],
      mobile_code_filter: [''],
      cityfilter: [''],
    });

    this.leadForm.get('cityfilter').valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.leadsService.getAuthCityCombo(value);
      })
    ).subscribe(data => {
      this.cityList.next(data);
      this.AllCitys = data;
    });

    this.leadsService.getAuthMobileCodeCombo('').subscribe({
      next: value => {
        this.mobileCodeList = value;
        this.AllMobileCodeList = value;
        this.leadForm.get('mobile_code').patchValue(this.AllMobileCodeList.find(x => x.mobile_code == '91').mobile_code);
      }, error: (err) => {
        this.alertService.showToast('error', err)
      }
    })
    this.leadForm.get('mobile_code_filter').valueChanges.subscribe(value => {
      if (value?.trim() == '') {
        this.mobileCodeList = this.AllMobileCodeList
        return;
      }
      this.mobileCodeList = this.AllMobileCodeList.filter(x => x.country_code.toLowerCase().includes(value?.toLowerCase()) || x.mobile_code.toString().includes(value?.toString()))
    });
  }

  create(): void {
    if (this.leadForm.invalid) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.leadForm.markAllAsTouched();
      return;
    }

    this.leadForm.disable();

    const json = this.leadForm.getRawValue();
    json.city_id = json.city_id.id;
    json.domain = '';
    json.WlId = '';
    json.is_agent = false;

    // this.leadsService.signUp(json)
    //   .subscribe({
    //     next: (data) => {
    //       this.alertService.showToast('success', 'New record added');
    //       this.matDialogRef.close(true)
    //     },
    //     error: (err) => {
    //       this.alertService.showToast('error', err);
    //       this.leadForm.enable();
    //     }
    //   });
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

}
