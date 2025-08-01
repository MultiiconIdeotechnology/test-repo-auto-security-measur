import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ToasterService } from 'app/services/toaster.service';
import { MatTabsModule } from '@angular/material/tabs';
import { ProfileAirlineComponent } from './profile-airline/profile-airline.component';
import { ProfileBusComponent } from './profile-bus/profile-bus.component';
import { ProfileHotelComponent } from './profile-hotel/profile-hotel.component';
import { ProfileInsuranceComponent } from './profile-insurance/profile-insurance.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatDialog } from '@angular/material/dialog';
import { SupplierInventoryProfileService } from 'app/services/supplier-inventory-profile.service';
import { EntityService } from 'app/services/entity.service';

@Component({
  selector: 'app-supplier-inventory-profile-entry',
  templateUrl: './supplier-inventory-profile-entry.component.html',
  styleUrls: ['./supplier-inventory-profile-entry.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FuseDrawerComponent,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    FormsModule,
    MatTabsModule,
    ProfileAirlineComponent,
    ProfileBusComponent,
    ProfileHotelComponent,
    ProfileInsuranceComponent

  ],
})
export class SupplierInventoryProfileEntryComponent {
  @ViewChild('settingsDrawer') settingsDrawer: MatSidenav;

  @ViewChild('profileAirlineComponent') profileAirlineComponent!: ProfileAirlineComponent;
  @ViewChild('profileBusComponent') profileBusComponent: ProfileBusComponent;
  @ViewChild('profileHotelComponent') profileHotelComponent: ProfileHotelComponent;
  @ViewChild('profileInsuranceComponent') profileInsuranceComponent: ProfileInsuranceComponent;

  private destroy$: Subject<any> = new Subject<any>();
  title: string = 'Create Link'
  buttonLabel: string = 'Create';
  selectedTabIndex = 0;
  tabsTitle = 'Settings';
  //tabs = ['Airline', 'Bus', 'Hotel', 'Insurance'];
  profile_name: string = '';
  profile_id: string = '';
  type: string;
  tabName: any

  tabNameStr: any = 'Airline'
  tab: string = 'Airline';
  isSecound: boolean = true
  isThird: boolean = true
  isFourth: boolean = true
  selectedRecord: any = null; // store the edit response
  private _subs: Subscription;
  profileForm: FormGroup;
  isProfileEdit: boolean = false;
  isEditing: boolean = true;
  createdProfile: any = {};
  profileId: string = '';
  isLoading: boolean = false;
  

  groupedInventories: {
    Airline: any[],
    Bus: any[],
    Hotel: any[],
    Insurance: any[]
  } = {
      Airline: [],
      Bus: [],
      Hotel: [],
      Insurance: []
    };


  constructor(
    private sidebarDialogService: SidebarCustomModalService,
    private toasterService: ToasterService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    private supplierInventoryProfileService: SupplierInventoryProfileService,
    private entityService: EntityService,
    private formBuilder: FormBuilder
  ) {
    this._subs = this.entityService.onsupplierInventoryProfile().subscribe(res => {
      this.profile_id = res;
    })
  }

  ngOnInit(): void {

    this.profileForm = this.formBuilder.group({
      profile_name: ['', Validators.required],
      is_default: [false], // or true if needed
      id: ['']
    });

    // subscribing to modalchange on create and modify
    this.sidebarDialogService.onModalChange().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        if (res['type'] == 'create') {
          // this.resetForm();
          // this.type = 'create'
          // 
          // this.title = 'Create';
          // this.profile_name = '';
          // this.buttonLabel = "Create";
          this.profileForm.reset();
          this.type = 'create'
          this.settingsDrawer.open();
         this.profileForm.get('profile_name')?.enable();
          this.isEditing = true;
          this.profileId = '';
          this.createdProfile = {};
        } else if (res['type'] == 'edit') {
          this.type = 'edit';
          this.selectedRecord = res?.data;
          this.createdProfile = res?.data;
          this.profileId = res?.data?.id || '';
          this.title = 'Modify';
          this.buttonLabel = 'Save';
          this.loadRecord();
          this.profileForm.get('profile_name')?.disable();
          this.isEditing = false;
          this.settingsDrawer.open();

          // Patch form with profile data
          this.profileForm.patchValue({
            profile_name: this.createdProfile.profile_name || '',
            id: this.profileId,
            is_default: this.createdProfile.is_default || false
          });

          //  Disable profile name field initially (until "Edit" is clicked)
          //  this.profileForm.get('profile_name')?.disable();
          //this.isEditing = false;
        }
        // else if (res['type'] == 'edit') {
        //   this.type = 'edit'
        //   this.selectedRecord = res?.data;
        //   console.log("main-modify", res);
        //   this.settingsDrawer.open();
        //   this.title = 'Modify';
        //   this.profile_name = this.createdProfile.profile_name
        //   console.log("res?.data?",res?.data);

        //   this.buttonLabel = "Save";
        //   //call get all data apin 
        // }
      }

    });

  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.toasterService.showToast('error', 'Please fill all required fields.', 'top-right');
      return;
    }
    this.isLoading = true;
    const payload = {
      ...this.profileForm.value,
      id: this.profileId || '',
      is_default: false,
    };


    this.supplierInventoryProfileService.createProfile(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.profileId = res.id;
        this.createdProfile = res;
        this.isEditing = false;
        this.profileForm.get('profile_name')?.disable();
      },
      error: (err) => {
        console.error('Save failed:', err);
        this.isLoading = false;
      }
    });
  }

  enableEditing() {
    this.isEditing = true;
    this.profileForm.get('profile_name')?.enable();
  }

  ngAfterViewInit(): void {
    // Disable child form if profile is created
    if (this.createdProfile?.id) {
      this.profileAirlineComponent.enableForm();
    }
  }

  loadRecord(): void {
    this.supplierInventoryProfileService.getSupplierInventoryProfileRecord(this.profileId).subscribe(res => {
      this.createdProfile = res;

      this.profileForm.patchValue({
        profile_name: res.profile_name
      });

      const settingsStr = res.settings || '[]';
      const settings = JSON.parse(settingsStr);

      // Group inventories by service
      this.groupedInventories = {
        Airline: settings.filter(x => x.service === 'Airline'),
        Bus: settings.filter(x => x.service === 'Bus'),
        Hotel: settings.filter(x => x.service === 'Hotel'),
        Insurance: settings.filter(x => x.service === 'Insurance')
      };
    });
  }




  public tabChanged(event: any): void {
    const tabName = event?.tab?.ariaLabel;
    this.tabNameStr = tabName
    this.tabName = tabName

    switch (tabName) {
      case 'Airline':
        this.tab = 'Airline';
        break;

      case 'Bus':
        this.tab = 'Bus';
        this.isSecound = false
        break;

      case 'Hotel':
        this.tab = 'Hotel';
        this.isThird = false
        break;

      case 'Insurance':
        this.tab = 'Insurance';
        this.isFourth = false
        break;
    }
  }

  Close(): void {
    this.settingsDrawer.close()
     this.isEditing = false;
     this.selectedTabIndex = 0;
    // this.profileForm.reset();
    // console.log(this.selectedRecord)
    // if (this.selectedRecord)
    //   this.selectedRecord.profile_name = this.profile_name;
    // else
    //   this.selectedRecord = {
    //     profile_name: this.profile_name,
    //     entry_date_time : new Date()
    //   }
    this.sidebarDialogService.CloseSubject({ id: this.createdProfile.id, profile_name: this.createdProfile.profile_name, entry_date_time: new Date() })
  }

  ngOnDestroy(): void {
    if (this._subs) {
      this._subs.unsubscribe();
    }
  }

}
