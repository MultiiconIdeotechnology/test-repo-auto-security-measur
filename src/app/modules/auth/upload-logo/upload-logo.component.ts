import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonUtils } from 'app/utils/commonutils';
import { AuthService } from 'app/core/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-upload-logo',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './upload-logo.component.html',
  styleUrls: ['./upload-logo.component.scss']
})
export class UploadLogoComponent implements OnInit {

  icon: any;

  constructor(
    private authService: AuthService,
    private alertService: ToasterService,
  ) {

  }

  ngOnInit(): void {
    this.authService.getWlLogo().subscribe({
      next: (res) => {
        this.icon = res.url;
      }, error: err => this.alertService.showToast('error', err)
    })
  }

  public onProfileInput(event: any): void {
    const file = (event.target as HTMLInputElement).files[0];

    CommonUtils.getJsonFile(file, (reader, jFile) => {

      this.authService.changeLogo(jFile).subscribe({
        next: () => {
          this.alertService.showToast('success', "Logo Uploaded")
          this.icon = reader.result;
        }, error: err => {
          this.alertService.showToast('error', err)
        }
      })
    });
  }

}
