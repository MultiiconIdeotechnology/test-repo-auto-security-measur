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
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { DataManagerService } from 'app/services/data-manager.service';
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

  @ViewChild('profileAirlineComponent') profileAirlineComponent: ProfileAirlineComponent;
  @ViewChild('profileBusComponent') profileBusComponent: ProfileBusComponent;
  @ViewChild('profileHotelComponent') profileHotelComponent: ProfileHotelComponent;
  @ViewChild('profileInsuranceComponent') profileInsuranceComponent: ProfileInsuranceComponent;

  private destroy$: Subject<any> = new Subject<any>();
  title: string = 'Create Link'
  buttonLabel: string = 'Create';

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
  isEditing: boolean = false

  constructor(
    private sidebarDialogService: SidebarCustomModalService,
    private _filterService: CommonFilterService,
    private dataManagerService: DataManagerService,
    private alertService: ToasterService,
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
      profile_name: ['', Validators.required]
    });

    // subscribing to modalchange on create and modify
    this.sidebarDialogService.onModalChange().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        if (res['type'] == 'create') {
          // this.resetForm();
          this.type = 'create'
          this.settingsDrawer.open();
          this.title = 'Create';
          this.profile_name = '';
          this.buttonLabel = "Create";
        } else if (res['type'] == 'edit') {
          this.type = 'edit'
          this.selectedRecord = res?.data;
          console.log("main-modify", res);
          this.settingsDrawer.open();
          this.title = 'Modify';
          this.profile_name = res?.data?.profile_name
          this.buttonLabel = "Save";
          //call get all data apin 
        }
      }

    });

  }

  enableEdit(): void {
    this.isEditing = true;
    this.profileForm.get('profile_name')?.enable(); // allow editing
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    const name = this.profileForm.value.profile_name;
    if (!this.isProfileEdit) {
      // Add profile
      this.isProfileEdit = true;
      console.log('Profile added:', name);
      this.profileForm.get('profile_name')?.disable();
    } else if (this.isEditing) {
      // Save edited profile
      console.log('Profile saved:', name);
      this.isEditing = false;
      this.profileForm.get('profile_name')?.disable();
    }
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
    // console.log(this.selectedRecord)
    // if (this.selectedRecord)
    //   this.selectedRecord.profile_name = this.profile_name;
    // else
    //   this.selectedRecord = {
    //     profile_name: this.profile_name,
    //     entry_date_time : new Date()
    //   }
    this.sidebarDialogService.CloseSubject({ id: this.profile_id, profile_name: this.profile_name, entry_date_time: new Date() })
  }

  ngOnDestroy(): void {
    if (this._subs) {
      this._subs.unsubscribe();
    }
  }

}
