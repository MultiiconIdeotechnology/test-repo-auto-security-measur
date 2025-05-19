import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
import { Subject, takeUntil } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-referral-list-info',
  standalone: true,
  imports: [
    CommonModule,
    FuseDrawerComponent,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './referral-list-info.component.html',
  styleUrls: ['./referral-list-info.component.scss']
})
export class ReferralListInfoComponent implements OnInit {
  @ViewChild('settingsDrawer') settingsDrawer: MatSidenav;
  private destroy$: Subject<any> = new Subject<any>();
  infoData: any = {};
  infoDisplayData: any;

  fieldMap = [
    { key: 'Code', field: 'referral_code' },
    { key: 'Category', field: 'campaign_category' },
    { key: 'Type', field: 'referral_link_for' },
    { key: 'Status', field: 'status' },
    { key: 'RM', field: 'relationship_manager_id' },
    { key: 'Title', field: 'campaign_name' },
    { key: 'Start Date', field: 'start_date' },
    { key: 'Entry Time', field: 'entry_date_time' },
    { key: 'Entry By', field: 'entry_by' },
    { key: 'Link', field: 'referral_link_url' }
  ];

  constructor(
    private sidebarDialogService: SidebarCustomModalService
  ) { }

  ngOnInit(): void {
    this.sidebarDialogService.onModalChange().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && res.data) {
        this.infoData = res.data;
        this.showInfoPopup(this.infoData)
        this.settingsDrawer.open();
      }
    })
  }

  showInfoPopup(referral_link: any) {
    this.infoDisplayData = this.fieldMap.map(({ key, field }) => ({
      key,
      value: referral_link[field]
    }));
  }

  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
