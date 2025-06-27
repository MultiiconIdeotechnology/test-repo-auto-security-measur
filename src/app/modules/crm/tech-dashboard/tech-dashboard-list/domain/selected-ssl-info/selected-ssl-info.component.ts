import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav } from '@angular/material/sidenav';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CrmService } from 'app/services/crm.service';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
import { ToasterService } from 'app/services/toaster.service';
import { Subject, takeUntil } from 'rxjs';
import cloneDeep from 'lodash/cloneDeep';

@Component({
  standalone: true,
  selector: 'app-selected-ssl-info',
  templateUrl: './selected-ssl-info.component.html',
  // styleUrls: ['./selected-ssl-info.component.css'],
  imports: [
    CommonModule,
    FuseDrawerComponent,
    MatButtonModule,
    MatIconModule,
  ],
})
export class SelectedSslInfoComponent implements OnInit {

  @ViewChild('settingsDrawer') settingsDrawer: MatSidenav;
  private destroy$: Subject<any> = new Subject<any>();
  selectedSslList: any = {};
  isLoading: boolean = false;

  fieldMap = [
    { key: 'Agent ID', field: 'agent_id', type: 'text' },
    { key: 'Domain Name', field: 'domain_name', type: 'text' },
    { key: 'IP Address', field: 'ip_address', type: 'text' },
    { key: 'SSL Expiry Date', field: 'ssl_expire_date_time', type: 'date' },
    { key: 'Is Domain Pointed', field: 'is_domain_pointed', type: 'boolean' }
  ];


  constructor(
    private sidebarDialogService: SidebarCustomModalService,
    private crmService: CrmService,
    private alertService: ToasterService,
    private conformationService: FuseConfirmationService,
  ) { }

  ngOnInit(): void {
    this.sidebarDialogService.onModalChange().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      console.log("res from domain sleected ", res)
      if (res && res.data) {
        if (res['type'] == 'crm-selected-domain') {
            this.selectedSslList = cloneDeep(res.data);
          this.settingsDrawer.open();
        }
      }
    })
  }

  deleteSsl(item: any, index: any) {
    this.conformationService.open({
      title: "Remove Domain",
      message: 'Are you sure you want to remove this domain?',
    }).afterClosed().subscribe((res:any) => {
      if(res === 'confirmed'){
        this.selectedSslList.splice(index, 1)
      }
    })
  }

  submit() {
    this.generateSsl(this.selectedSslList)
  }

  generateSsl(selection: any) {
    this.isLoading = true;
    console.log("this.selection>>>", selection);
    this.crmService.generateSsl(selection).subscribe({
      next: (resp: any) => {
        this.alertService.showToast('success', 'SSL generated successfully');
        this.sidebarDialogService.close({ key: 'crm-domain-generate-success' })
        this.settingsDrawer.close();
        this.isLoading = false;
      },
      error: (err) => {
        this.alertService.showToast('error', err, 'top-right', true);
        this.isLoading = false;
      },
    });
  }
}


