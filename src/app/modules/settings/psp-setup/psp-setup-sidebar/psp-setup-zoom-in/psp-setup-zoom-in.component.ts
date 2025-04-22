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
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-psp-setup-zoom-in',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatInputModule,
    MatDividerModule
  ],
  templateUrl: './psp-setup-zoom-in.component.html',
  styleUrls: ['./psp-setup-zoom-in.component.scss']
})
export class PspSetupZoomInComponent implements OnInit {
 agentAssignedList:any[] = [];
 originalAgentList:any[] = [];
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

 onFilterSearch(val:any){
    this.agentAssignedList = this.originalAgentList.filter((item: any) =>
      item?.agent_code?.toString()?.toLowerCase().includes(val.toLowerCase()) ||
      item?.agency_name?.toLowerCase().includes(val.toLowerCase()) ||
      item?.email_address?.toLowerCase().includes(val.toLowerCase())
    );
 }

 getAgentAssignedList(): void {
  console.log("this.agentId", this.agentId)
  this.isLoading = true;
  this.pspSetupService.getAgentProfileFromId(this.agentId).subscribe({
      next: (resp:any) => {
          if(resp && resp.agents_list && resp.agents_list?.length){
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



 ngOnDestroy(){
  this.destroy$.next();
  this.destroy$.complete();
 }



}
