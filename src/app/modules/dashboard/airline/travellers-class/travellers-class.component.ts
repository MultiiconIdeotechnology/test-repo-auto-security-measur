import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass, NgFor } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { ToasterService } from 'app/services/toaster.service';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { flightClass, flightFareType } from 'app/common/const';
import { EnumeratePipe } from 'app/enurable.pipe';

@Component({
  selector: 'app-travellers-class',
  templateUrl: './travellers-class.component.html',
  standalone: true,
  imports: [
    EnumeratePipe,
    FormsModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
    CommonModule
  ]
})
export class TravellersClassComponent {

  flightClass = flightClass;
  flightFareType = flightFareType;

  subUserPermission: any;
  userData: any;
  allowedClasses: string[] = [];

  constructor(
    public matDialogRef: MatDialogRef<TravellersClassComponent>,
    private alertService: ToasterService,
    private authService: AuthService,
    private _userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {

  }

  toggleSelection(i?, name?: string): void {
    if (name === 'adult') {
      this.data.adult = i
    } else if (name === 'child') {
      this.data.child = i
    } else if (name === 'infant') {
      this.data.infant = i
    }
    const total_pax: number = this.data.adult + this.data.child + this.data.infant;

    if (total_pax > 9) {
      if (name === 'adult') {
        this.data.adult = 1;
      } else if (name === 'child') {
        this.data.child = 0;
      } else if (name === 'infant') {
        this.data.infant = 0;
      }
      this.alertService.showToast('error', 'Maximum 9 Traveller are allowed.');
      return
    }
  }

}
