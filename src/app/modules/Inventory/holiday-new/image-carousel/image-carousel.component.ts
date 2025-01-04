import { NgFor, NgClass, CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { SlickCarouselModule } from 'ngx-slick-carousel';

@Component({
  selector: 'app-image-carousel',
  standalone: true,
  imports: [
    NgFor,
    NgClass,
    // EnumeratePipe,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
    MatSelectModule,
    SlickCarouselModule
  ],
  templateUrl: './image-carousel.component.html',
  styleUrls: ['./image-carousel.component.scss']
})
export class ImageCarouselComponent {
  SecondImageList: any[] = [];
  img: any;
  startIndex: number;
  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: false,
    infinite: false,
    autoplay: false,
    autoplaySpeed: 3000,
    initialSlide: 0
  };
  
  constructor(
    public matDialogRef: MatDialogRef<ImageCarouselComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.SecondImageList = data.list;
    this.img = data.img;
  }
  
  ngOnInit() {
    const index = this.SecondImageList.findIndex(x => x === this.img);
    this.startIndex = index !== -1 ? index : 0;
    this.slideConfig.initialSlide = this.startIndex;
  }
}
