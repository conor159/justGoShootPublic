import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { emit } from 'process';

@Component({
  selector: 'gallery-overlay',
  templateUrl: './gallery-overlay.component.html',
  styleUrls: ['./gallery-overlay.component.css']
})
export class GalleryOverlayComponent implements OnInit {
  @Input() flattenedImageArray;
  @Input() currentImageIndex : number;
  @Output() exitOverlay: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }
  url:string;



  imageChange(i){
    if (((i + this.currentImageIndex) < this.flattenedImageArray.length) && (i + this.currentImageIndex >= 0)) {
      this.url = this.flattenedImageArray[this.currentImageIndex + i];
      this.currentImageIndex += i;
    }
  }

  exit(){
    this.exitOverlay.emit(this.currentImageIndex);
    console.log("exiting");
  }

  // arrows would be nice
  ngOnInit(): void {
    this.url = this.flattenedImageArray[this.currentImageIndex];
  }

}
