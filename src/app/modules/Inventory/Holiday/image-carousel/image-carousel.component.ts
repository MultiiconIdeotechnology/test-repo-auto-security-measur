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
  templateUrl: './image-carousel.component.html',
  styleUrls: ['./image-carousel.component.scss'],
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
  ]
})
export class ImageCarouselComponent {

  SecondImageList: any[] = [];
  slideConfig = {
    slidesToShow: 1, slidesToScroll: 1, dots: false, infinite: true, autoplay: false,
    autoplaySpeed: 3000,
  };

  constructor(
    public matDialogRef: MatDialogRef<ImageCarouselComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.SecondImageList = data;
  }

}
