import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
import { Subject, takeUntil } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators, FormControl, FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { DataManagerService } from 'app/services/data-manager.service';
import { RefferralService } from 'app/services/referral.service';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-referral-list-entry',
  standalone: true,
  imports: [
    CommonModule,
    FuseDrawerComponent,
    ReferralListEntryComponent,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    FormsModule,

  ],
  templateUrl: './referral-list-entry.component.html',
  styleUrls: ['./referral-list-entry.component.scss']
})
export class ReferralListEntryComponent {

  @ViewChild('settingsDrawer') settingsDrawer: MatSidenav;
  private destroy$: Subject<any> = new Subject<any>();
  title: string = 'Create Link'
  formGroup: FormGroup;
  rmList: any[] = [];
  filteredRmList: any[] = [];
  rmfilterCtrl = new FormControl('');
  campaignCategoryList: string[] = ['Performance', 'Organic', 'Direct', 'Influencer'];
  referralLinkTypeList: string[] = ['B2B Partner', 'WL', 'Corporate', 'Supplier'];
  buttonLabel: string = 'Create';
  referralData:any = {};

  constructor(
    private sidebarDialogService: SidebarCustomModalService,
    private builder: FormBuilder,
    private _filterService: CommonFilterService,
    private dataManagerService: DataManagerService,
    private referralService: RefferralService,
    private alertService: ToasterService,
  ) {
    this.formGroup = this.builder.group({
      id: [''],
      referral_code: ['', Validators.required],
      campaign_category: ['', Validators.required],
      referral_link_for: ['', Validators.required],
      campaign_name: ['', Validators.required],
      relationship_manager_id: ['', Validators.required],
      referral_link_url: ['', Validators.required],
      remark: ['']
    })
  }

  ngOnInit(): void {
    // assigning the rmList value from service (called only once on refresh)
    this.rmList = this._filterService.originalRmList;
    this.filteredRmList = this._filterService.originalRmList;

    // subscribing to modalchange on create and modify
    this.sidebarDialogService.onModalChange().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        if (res['type'] == 'create') {
          this.resetForm();
          this.settingsDrawer.open();
          this.title = 'Create Link';
          this.buttonLabel = "Create";
        } else if (res['type'] == 'edit') {
          this.settingsDrawer.open();
          this.title = `Campaign : ${res?.data?.referral_code}`;
          this.referralData = res?.data;
          this.buttonLabel = "Save";
          this.formGroup.patchValue(res?.data);
          let obj = this.rmList.find((item: any) => item.id == res?.data?.relationship_manager_id);
          console.log("obj>>", obj)
          this.formGroup.get('relationship_manager_id').patchValue(obj)
        }
      }

      this.rmFilterSearch();
    });

  }

  // internal searching for rm 
  rmFilterSearch() {
    this.rmfilterCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(search => {
        const searchTerm = search?.toLowerCase() || '';
        this.filteredRmList = this.rmList.filter(rm =>
          rm.employee_name.toLowerCase().includes(searchTerm)
        );
      });
  }

  // reseting form to default value
  resetForm() {
    this.formGroup?.reset({
      referral_code: "",
      campaign_category: "",
      referral_link_for: "",
      campaign_name: "",
      relationship_manager_id: "",
      referral_link_url: "",
      remark: ""
    })
  }

  submit() {
    if (!this.formGroup.valid) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }

    let payload = this.formGroup.value;
    let relationManagerObj = this.formGroup.get('relationship_manager_id')?.value;
    payload.relationship_manager_id = relationManagerObj?.id;
    this.referralService.create(payload).subscribe({
      next: (res: any) => {
        payload.relationship_manager_name = relationManagerObj?.employee_name;
        console.log("payload >>>", payload)
        if (!this.formGroup.get('id')?.value) {
          payload.id = res?.record_id;
          this.formGroup.get('id').patchValue(res?.record_id);
          this.dataManagerService.addItem(payload);
          this.settingsDrawer.close();  
          this.alertService.showToast('success', 'Referral link added successfully');
        } else {
          payload.entry_date_time = this.referralData?.entry_date_time;
          payload.start_date = this.referralData?.start_date;
          payload.status = this.referralData?.status;
          this.dataManagerService.updateItem(payload);
          this.settingsDrawer.close();
          this.alertService.showToast('success', 'Refferal link list updated successfully');
        }
      },
      error: (err) => {
        this.alertService.showToast('error', err, 'top-right', true);
      },
    });
  }


  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

}
