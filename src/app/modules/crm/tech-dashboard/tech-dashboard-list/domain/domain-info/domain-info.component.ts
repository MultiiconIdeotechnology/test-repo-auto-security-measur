import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
import { Subject, takeUntil } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-domain-info',
  standalone:true,
  templateUrl: './domain-info.component.html',
   imports: [
    CommonModule,
    FuseDrawerComponent,
    MatButtonModule,
    MatIconModule,
  ],
  // styleUrls: ['./domain-info.component.css']
})
export class DomainInfoComponent implements OnInit {

 @ViewChild('settingsDrawer') settingsDrawer: MatSidenav;
  private destroy$: Subject<any> = new Subject<any>();
  infoData: any = {};
  infoDisplayData: any;

  fieldMap = [
  { key: 'Agent ID', field: 'agent_id', type: 'text' },
  { key: 'Domain Name', field: 'domain_name', type: 'text' },
  { key: 'IP Address', field: 'ip_address', type: 'text' },
  { key: 'SSL Expiry Date', field: 'ssl_expire_date_time', type: 'date' },
  { key: 'Is Domain Pointed', field: 'is_domain_pointed', type: 'boolean' }
];


  constructor(
    private sidebarDialogService: SidebarCustomModalService
  ) { }

  ngOnInit(): void {
    this.sidebarDialogService.onModalChange().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && res.data) {
        if(res['type'] == 'crm-domain-info'){
          this.infoData = res.data;
          this.showInfoPopup(this.infoData)
          this.settingsDrawer.open();
        }
      }
    })
  }

  showInfoPopup(domain: any) {
    this.infoDisplayData = this.fieldMap.map(({ key, field, type }) => {
        let value = domain?.[field];

        if(type == 'date'){
          if(value){
            value = formatDate(value, 'dd-MM-yyyy', 'en-US');
          } else {
            value = "-"
          }
        } 

        if(type == 'boolean'){
          value = value ? 'Yes': 'No'
        }


        return {key, value:value || '-'}
    });
  }

  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

}
