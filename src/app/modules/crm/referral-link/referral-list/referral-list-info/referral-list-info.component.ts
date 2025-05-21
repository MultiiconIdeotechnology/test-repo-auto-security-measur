import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
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
    { key: 'Code', field: 'referral_code', type:'text' },
    { key: 'Category', field: 'campaign_category', type:'text' },
    { key: 'Type', field: 'referral_link_for', type:'text' },
    { key: 'Status', field: 'status', type:'text' },
    { key: 'RM', field: 'relationship_manager_name', type:'text' },
    { key: 'Title', field: 'campaign_name', type:'text' },
    { key: 'Start Date', field: 'start_date', type:'date' },
    { key: 'Entry Time', field: 'entry_date_time', type:'date' },
    { key: 'Entry By', field: 'entry_by_name', type:'text' },
    { key: 'Link', field: 'referral_link', type:'text' },
    { key: 'Description', field: 'remark', type:'text'}
  ];

  constructor(
    private sidebarDialogService: SidebarCustomModalService
  ) { }

  ngOnInit(): void {
    this.sidebarDialogService.onModalChange().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && res.data) {
        if(res['type'] == 'info'){
          this.infoData = res.data;
          this.showInfoPopup(this.infoData)
          this.settingsDrawer.open();
        }
      }
    })
  }

  showInfoPopup(referral_link: any) {
    this.infoDisplayData = this.fieldMap.map(({ key, field, type }) => {
        let value = referral_link?.[field];

        if(type == 'date'){
          if(value){
            value = formatDate(value, 'dd-MM-yyyy', 'en-US');
          } else {
            value = "-"
          }
        } 

        if(key == 'RM'){
          if(!value){
            value = 'Any'
          }
        }

        return {key, value:value || '-'}
    });
  }

  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
