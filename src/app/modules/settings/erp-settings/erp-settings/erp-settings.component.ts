import { AsyncPipe, NgFor, NgIf, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormsModule } from '@angular/forms';
import { ToasterService } from 'app/services/toaster.service';
import { ToastrService } from 'ngx-toastr';
import { SettingsService } from 'app/services/settings.service';
import { DesignationService } from 'app/services/designation.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Linq } from 'app/utils/linq';
import { ReplaySubject, filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ERPSettingsPermissions, Security, messages } from 'app/security';

@Component({
  selector: 'app-erp-settings',
  templateUrl: './erp-settings.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    FormsModule,
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatMenuModule,
    NgxMatTimepickerModule,
    NgxMatSelectSearchModule,
  ]
})
export class ErpSettingsComponent {

  title: string = 'ERP Settings';
  btnTitle: string = 'Save';
  comboData: any = {};

  disableBtn: boolean = false;
  companyName: any

  companyList: ReplaySubject<any[]> = new ReplaySubject<any[]>();


  fix_list: any[] = [
    { value: 'Tax On Commission', viewValue: 'Tax On Commission' },
    { value: 'Tax On Sale Amount', viewValue: 'Tax On Sale Amount' },
  ];

  fix_list_tax: any[] = [
    { value: 'Tax On Commission', viewValue: 'Tax On Commission' },
  ];

  constructor(
    public formBuilder: FormBuilder,
    public settingservice: SettingsService,
    public router: Router,
    public route: ActivatedRoute,
    public designationService: DesignationService,
    public toasterService: ToasterService,
  ) { }

  formGroup: FormGroup;
  protected alertService: ToastrService;

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      id: [""],
      company_name: [""],
      // company_gst_number: [""],
      // gst_company_email: [""],
      // gst_contact_number: [""],
      // gst_company_address: [""],
      air_tax_type: [""],
      air_tax_value: [""],
      bus_tax_type: [""],
      bus_tax_value: [""],
      hotel_tax_type: [""],
      hotel_tax_value: [""],
      holiday_tax_type: [""],
      holiday_tax_value: [""],
      visa_tax_type: [""],
      visa_tax_value: [""],
      insurance_tax_type: [""],
      insurance_tax_value: [""],
      activity_tax_type: [""],
      activity_tax_value: [""],
      air_amt_tax_val: [""],
      air_amt_tax_type: [""],

      company_id: [""],
      companyFilter: [""]
    });

    // this.formGroup.get('company_name').valueChanges.subscribe(text => {
    //   this.formGroup.get('company_name').patchValue(Linq.convertToTitleCase(text), { emitEvent: false });
    // }) 

    // this.formGroup.get('gst_company_email').valueChanges.subscribe(text => {
    //   this.formGroup.get('gst_company_email').patchValue(text.toLowerCase(), { emitEvent: false });
    // })

    this.refreshData()

  }

  refreshData() {
    this.formGroup.get('companyFilter').valueChanges.pipe(
      filter(search => !!search),
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: any) => {
        return this.settingservice.getCompanyCombo({ filter: value });
      })
    ).subscribe((data: any) => {
      this.companyList.next(data)
      this.formGroup.get("company_id").patchValue(data[0].company_id);
      this.comboData = data
      this.formGroup.patchValue(data[0]);
    })
  }


  onCompanySelectionChange(event: any): void {
    const selectedCompanyId = event;
    // this.selcectRecord(selectedCompanyId);

    const selectData = this.comboData.find(x => x.company_id == selectedCompanyId)
    this.formGroup.patchValue(selectData)
  }

  // selcectRecord(record){
  //   const selectData = this.comboData.find(x => x.id == record)
  //   this.formGroup.patchValue(selectData)
  // }

  submit(): void {
    if (!Security.hasPermission(ERPSettingsPermissions.savePermissions)) {
      return this.toasterService.showToast('error', messages.permissionDenied);
    }

    const json = this.formGroup.getRawValue();
    this.disableBtn = true
    this.settingservice.create(json).subscribe({
      next: () => {
        this.disableBtn = false;
        this.toasterService.showToast('success', 'New record Saved');
        this.refreshData()
      }, error: err => {
        this.disableBtn = false;
        this.toasterService.showToast('error', err);
      }
    })
  }
}

