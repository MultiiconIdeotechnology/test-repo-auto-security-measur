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
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
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
  @ViewChild(ProfileAirlineComponent) profileComponentRef: ProfileAirlineComponent;
  private destroy$: Subject<any> = new Subject<any>();
  title: string = 'Create Link'
  buttonLabel: string = 'Create';

  tabsTitle = 'Settings';
  tabs = ['Airline', 'Bus', 'Hotel', 'Insurance'];
  activeTab = 'Airline';
  profile_name: string = '';
  type: string;
  selectedRecord: any = null; // store the edit response

  constructor(
    private sidebarDialogService: SidebarCustomModalService,
    private _filterService: CommonFilterService,
    private dataManagerService: DataManagerService,
    private alertService: ToasterService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    private supplierInventoryProfileService: SupplierInventoryProfileService,

  ) {

  }

  ngOnInit(): void {

    // subscribing to modalchange on create and modify
    this.sidebarDialogService.onModalChange().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        if (res['type'] == 'create') {
          // this.resetForm();
          this.type = 'create'
          this.settingsDrawer.open();
          this.title = 'Create';
          this.buttonLabel = "Create";
        } else if (res['type'] == 'edit') {
          this.type = 'edit'
          this.selectedRecord = res?.data;
          console.log("main-modify", res);
          this.settingsDrawer.open();
          this.title = 'Modify';
          this.buttonLabel = "Save";

          //call get all data apin 


        }
      }

    });

  }

  Close(): void {
    this.settingsDrawer.close()
    console.log(this.selectedRecord)
    if (this.selectedRecord)
      this.selectedRecord.profile_name = this.profile_name;
    else
      this.selectedRecord = {
        profile_name: this.profile_name,
        entry_date_time : new Date()
      }
    this.sidebarDialogService.CloseSubject(this.selectedRecord)
  }

}
