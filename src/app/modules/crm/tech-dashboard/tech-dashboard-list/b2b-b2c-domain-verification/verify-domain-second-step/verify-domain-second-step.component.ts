import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DomainPointingDetailsComponent } from '../domain-pointing-details/domain-pointing-details.component';

@Component({
  selector: 'app-verify-domain-second-step',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './verify-domain-second-step.component.html',
  styleUrls: ['./verify-domain-second-step.component.scss']
})
export class VerifyDomainSecondStepComponent {

  constructor(
    private matDialog: MatDialog,
  ) {

  }

  getHelp() {
    this.matDialog.open(DomainPointingDetailsComponent, {
      disableClose: true,
      data: null,
      panelClass: 'zero-angular-dialog',
      autoFocus: false,
      width:'860px',
      minWidth:'800px',
      maxHeight: '900px'
    })
  }

}
