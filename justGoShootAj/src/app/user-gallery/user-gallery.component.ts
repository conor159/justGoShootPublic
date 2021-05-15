import { Component, OnInit ,NgZone } from '@angular/core'
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import {  ActivatedRoute, Params, Router,  } from '@angular/router';
import {HttpClient, HttpHandler, HttpHeaders} from '@angular/common/http'
import { take } from 'rxjs/operators';
import { User } from '../models/User';
import * as jszip from "jszip";
import * as FileSaver from 'file-saver';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-user-gallery',
  templateUrl: './user-gallery.component.html',
  styleUrls: ['./user-gallery.component.css']
})
export class UserGalleryComponent implements OnInit {

  constructor(  
    private fireAuth : AngularFireAuth,
    private router : Router,
    private activatedRoute : ActivatedRoute,
    private fireStorage : AngularFireStorage,
    private fireStore : AngularFirestore,
    private ngZone : NgZone,
     private http : HttpClient
     ){}

  overlay : boolean = false
  uploadProgress: 0;
  images: FileList;

  uid = this.activatedRoute.snapshot.queryParamMap.get('uid');

  folderName = this.activatedRoute.snapshot.queryParamMap.get('folderName');
  page : number = parseInt(this.activatedRoute.snapshot.queryParamMap.get('page'));

  photosRef = this.fireStorage.storage.ref("photos");
  zipRef = this.fireStorage.storage.ref("zip");
  projectRecords$:  Record<string , string[][]> = {}
  maxPerPage = 12;
  currentImageIndex: number;
  flattenedImageArray: string[];

  url = "justgoshoot-46fed.appspot.com";
  user: User;


  imageBlobArr =  [];

   download(){

    //right so I need to make auth private in rules
    // then ask the server nicely for the download url
    this.http.post("http://localhost:5000/justgoshoot-46fed/us-central1/getSignedUrls", { uid: this.uid, folderName: this.folderName , "action": "zip"}).subscribe((zipUrl:[string]) => {
      //get the longest url
      const url = zipUrl.reduce( ( longestUrl, url) => (url.length > longestUrl.length ? url: longestUrl ) )
      fetch(url)
        .then( res => res.blob())
          .then( blob => FileSaver.saveAs(blob, this.folderName))
    })
  }


  del(urlObj, imageIndex  ){
    //it dose worktestFolder2 
    let url = urlObj.__zone_symbol__value
    let path = url.split("/");
    path = path[7];
    path = url.split("photos");
    path = path[1];
    path = path.replaceAll("%2F" , "/" );
    path = path.replaceAll("%20" , " " );
    path = path.split("?");
    path = path[0];
    this.photosRef.child(path).delete().then( () => {document.getElementById(imageIndex).remove() ; document.getElementById("xButton_" + imageIndex).remove() });
  }

  addImages(e){
      this.images  = e.target.files;
  }

  imageUpload(){
    let persentageDone = 0;
    let   totalBytes = 0;
    let totalUploadedBytes = 0;

    for(let i=0;  i < this.images.length; i++){
      let image:File = this.images[i];
      totalBytes += image.size;
    }

      for(let i=0;  i < this.images.length; i++){
        let image:File = this.images[i];
        let storeRef = this.fireStorage.ref("photos/" + this.uid + "/"  + this.folderName  +"/"+  image.name);
        storeRef.put(image).percentageChanges().subscribe( persentage => {
          if(persentage == 100){
            totalUploadedBytes += this.images[i].size
            persentageDone = (totalUploadedBytes / totalBytes )*100;
            this.handler(persentageDone);
            }
        })
    }
  }


  handler (persentageDone) {
    //bootstap progress bar wont play ball 
    this.ngZone.run(() => {
      this.uploadProgress = persentageDone;
      if(this.uploadProgress >= 100){
        this.uploadReset();
      }
    });
  }

  uploadReset(){
    setTimeout(() => {
      this.uploadProgress = 0;
    }, 10000);
  }


  enterGallery(imageIndex ){
    this.overlay = true;
    let imageArray = this.projectRecords$[this.folderName];
    this.flattenedImageArray =imageArray.reduce( (a, b) => { return a.concat(b)})
    this.currentImageIndex = (this.page * this.maxPerPage ) + imageIndex;
  }

  overlayExitEvent($event){
    this.overlay = false;
  }




  selectedFolder( selectedFolderName  ){
    this.folderName = selectedFolderName;
    this.page = 0;
    this.pageNumberUpdate(0);
  }

  recordBuilder(projectName){
    this.http.post("http://localhost:5000/justgoshoot-46fed/us-central1/getSignedUrls", { uid: this.uid, folderName:  projectName, "action": "photos"}).subscribe((photos:[string]) => {
      let imageRefArrays = [];
      for( let i=0;  i < photos.length ; i+=this.maxPerPage){
        imageRefArrays.push(photos.slice(i, i+this.maxPerPage));
      }
      this.projectRecords$[projectName] = imageRefArrays;
    })

  }

  pageChange(change){
    change = parseInt(change);
    if((this.page + change) >= 0){ 
      let imageRefArrays = this.projectRecords$[this.folderName];
      if( (this.page + change ) < imageRefArrays.length ){
        this.page = this.page + change;
        this.pageNumberUpdate(this.page);
      }
    }
  }



pageNumberUpdate(pageNumber){
  let pageString = pageNumber.toString();
  const queryParams: Params = { "page": pageString };
  this.router.navigate([],  { relativeTo: this.activatedRoute, queryParams: queryParams, queryParamsHandling: 'merge', });
}

  ngOnInit(): void {
    this.fireStore.doc<User>(`users/${this.uid}`).valueChanges().pipe(take(1) ).subscribe(user=> {
      this.user = user;
      user.projects.forEach(projectName => {
        this.recordBuilder(projectName);
      });
    })
  }
}