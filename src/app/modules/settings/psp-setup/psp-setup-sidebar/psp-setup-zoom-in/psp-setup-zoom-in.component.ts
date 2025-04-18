import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PspSetupService } from 'app/services/psp-setup.service';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-psp-setup-zoom-in',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatInputModule,
  ],
  templateUrl: './psp-setup-zoom-in.component.html',
  styleUrls: ['./psp-setup-zoom-in.component.scss']
})
export class PspSetupZoomInComponent implements OnInit {
 agentAssignedList:any[] = [];
 searchText:any;
 isLoading:boolean = false;
 private destroy$ = new Subject<void>();
 @Input() agentId:any;

constructor(
      private sidenavService: SidebarCustomModalService,
      private pspSetupService: PspSetupService,
      private toasterService: ToasterService,
){}

 ngOnInit():void {

  //  this.sidenavService.onModalChange().pipe(takeUntil(this.destroy$)).subscribe((res:any) => {
  //      console.log("res id >>>", res)
  //      if(res && res.type == 'Agents'){
  //         if(res.data.id){

  //         }
  //      }
  //  })
  if(this.agentId){
    this.getAgentAssignedList();
  }
 }

 onFilterSearch(){
    if (!this.searchText) return this.agentAssignedList;
  
    const search = this.searchText.toLowerCase();
  
    return this.agentAssignedList.filter(agent =>
      Object.values(agent).some((value:any) =>
        value.toLowerCase().includes(search)
      )
    );
 }

 getAgentAssignedList(): void {
  console.log("this.agentId", this.agentId)
  this.isLoading = true;
  this.pspSetupService
    .getAgentProfileFromId(this.agentId)
    .subscribe({
      next: (data) => {
        this.isLoading = false;
        this.agentAssignedList = data.data;
        console.log("this.agentAssinged", this.agentAssignedList);
      },
      error: (err) => {
        this.toasterService.showToast('error', err)
        this.isLoading = false;
      },
    });
}



 ngOnDestroy(){
  this.destroy$.next();
  this.destroy$.complete();
 }



}
