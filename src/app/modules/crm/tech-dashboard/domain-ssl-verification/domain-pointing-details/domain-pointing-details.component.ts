import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { E } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-domain-pointing-details',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    PrimeNgImportsModule
  ],
  templateUrl: './domain-pointing-details.component.html',
  styleUrls: ['./domain-pointing-details.component.scss']
})
export class DomainPointingDetailsComponent {
  domainData: any;
  wlSettingData: any;
  constructor(
    public matDialogRef: MatDialogRef<DomainPointingDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {},
  ) {
    this.domainData = data.domainPointingData;
    this.wlSettingData = data.wlSettingData;

    if (this.domainData && this.domainData?.length) {
      for (let el of this.domainData) {
        if (this.wlSettingData?.b2c_portal_url && this.wlSettingData?.b2c_portal_url?.split('.')?.length == 2) {
            if (this.wlSettingData?.b2c_portal_url == el.domain) {
              el['recordType'] = 'A';
              el['name'] = '@';
              el['value'] = this.wlSettingData?.currentIPAddress;
              el['ttl'] = '1 Hour';
            } else {
              el['recordType'] = 'Cname';
              el['name'] = el.domain && el.domain.includes(this.wlSettingData?.b2c_portal_url) ? el.domain.split(this.wlSettingData?.b2c_portal_url)[0] : '-';
              el['value'] = '@';
              el['ttl'] = '1 Hour'
            }
        } else {
          el['recordType'] = 'A';
          el['name'] = el.domain;
          el['value'] = this.wlSettingData?.currentIPAddress;
          el['ttl'] = '1 Hour'
        }
      }
    }
  }

}
