import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PspSetupInfoComponent } from './psp-setup-info/psp-setup-info.component';
import { PspSetupService } from 'app/services/psp-setup.service';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-psp-setup-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FuseDrawerComponent,
    MatIconModule,
    MatButtonModule,
    PspSetupInfoComponent,
  ],
  templateUrl: './psp-setup-sidebar.component.html',
  styleUrls: ['./psp-setup-sidebar.component.scss']
})
export class PspSetupSidebarComponent {
  private destroy$ = new Subject<void>();
  @ViewChild('settingsDrawer') public settingsDrawer: MatSidenav;
  title: string = ""
  agentId: any;

  agentAssignedList:any[] = [];
  originalAgentList:any[] = [];
  searchText:any;
  isLoading:boolean = false;
  private modalSub: Subscription;

  constructor(
    private sidenavService: SidebarCustomModalService,
    private pspSetupService: PspSetupService,
    private toasterService: ToasterService,
  ) { }

  ngOnInit(): void {

    this.sidenavService.onModalChange().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && res.type) {
        this.title = res.type;
      }

      if (res && res.data) {
        this.agentId = res.data;
        if(this.agentId){
          this.getAgentAssignedList();
        }
      } {
        this.agentId = "";
      }

      this.settingsDrawer?.toggle();
    })
  }

  // Method to close the sidenav programmatically
  closeSettingsDrawer(): void {
    if (this.settingsDrawer) {
      this.settingsDrawer.close();
      this.resetDrawerState(); // Optional: Reset state
    }
  }

  // Optional: Reset drawer state
  private resetDrawerState(): void {
    this.title = '';
    this.agentId = '';
    // Add any other state reset logic (e.g., clear form, reset API data)
  }
  

  onFilterSearch(val: any) {
    this.agentAssignedList = this.originalAgentList.filter((item: any) =>
      item?.agent_code?.toString()?.toLowerCase().includes(val.toLowerCase()) ||
      item?.agency_name?.toLowerCase().includes(val.toLowerCase()) ||
      item?.email_address?.toLowerCase().includes(val.toLowerCase())
    );
  }

  getAgentAssignedList(): void {
    this.isLoading = true;
    this.pspSetupService.getAgentProfileFromId(this.agentId).subscribe({
      next: (resp: any) => {
        if (resp && resp.agents_list && resp.agents_list?.length) {
          this.agentAssignedList = resp?.agents_list;
          this.originalAgentList = resp?.agents_list;
        }
        this.isLoading = false;
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
