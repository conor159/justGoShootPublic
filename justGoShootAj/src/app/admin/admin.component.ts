import { Component, OnInit ,NgZone} from '@angular/core';
import { FormGroup, FormControl, Validators, AsyncValidator, AsyncValidatorFn, AbstractControl, ValidationErrors           } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireStorage, AngularFireStorageReference, createUploadTask } from "@angular/fire/storage";
import { User} from "../models/User";
import {HttpClient, HttpHandler, HttpHeaders} from '@angular/common/http'
import { Observable, of, scheduled } from 'rxjs';
import {  debounceTime  , map , take} from 'rxjs/operators';
import { features } from 'process';
import { file, files } from 'jszip';
import { LogoutComponent } from '../logout/logout.component';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})

export class AdminComponent implements OnInit {

  declare  userObj : User
  users : User[];
  emailCopy = new Set();

  email: string;
  images: FileList;
  image: File;
  zip: File;
  uploadProgress = 0;

  projectFee = 0;

  userCreateFormGroup: FormGroup;
  userCreateForm: FormControl;

  uploadFormGroup: FormGroup;
  imageForm: FormControl;
  folderNameForm: FormControl;
  emailForm: FormControl;
  zipForm: FormControl;

  userObserable: Observable<User[]>
  zipProgress: number;
  
  constructor(  private fireStore : AngularFirestore  , private fireAuth : AngularFireAuth, private fireStorage : AngularFireStorage , private http : HttpClient, private ngZone : NgZone){}

  emailPredict($event){

    let partialEmail = $event.target.value;
    this.emailCopy.clear();
    this.users.forEach( user => {
        let splitEmail = user.email.slice(0, partialEmail.length );
        if(splitEmail == partialEmail){
          this.emailCopy.add(user.email);
        }
        else if (partialEmail == "*" ){
          //* wildcard shows all emails
          this.emailCopy.add(user.email);
        }
      
    });
  }

    createUser(){
      let token  = (Math.random() * Math.random()).toString(36).slice(2);
      this.fireStore.collection("firstLoginTokens").add({
        //email sent when doc is created
        email: this.userCreateForm.value,
        token: token,
      })
    }

    createProject(){ 
      //cursed code handle with care
      let persentageDone = 0;
      let   totalBytes = 0;
      let totalUploadedBytes = 0;
      


    this.fireStore.collection<User>("users", ref => ref.where("email" , "==", this.emailForm.value)).snapshotChanges().subscribe( user => {
      let uid = user[0].payload.doc.id;

      if(!this.images){
        let placeholder = fetch("../../assets/images/logo.png").then( res => {
          res.arrayBuffer().then( arrayBuff => {
            let logo = new File([arrayBuff], "logo.svg")
            let storeRef = this.fireStorage.ref("photos/" + uid + "/"  + this.folderNameForm.value  +"/"+  "logo.svg");
            storeRef.put(logo);
        })
      })
    }

    else{
      for(let i=0;  i < this.images.length; i++){
        this.image = this.images[i];
        totalBytes += this.image.size;
      }

        console.log(this.zip.size , "size of the zip");
      if(this.zip.size && this.images){
         let zipRef = this.fireStorage.ref("zip/" + uid + "/"  + this.folderNameForm.value  +"/"+  this.zip.name);
          zipRef.put(this.zip).percentageChanges().subscribe( zipPersentage => {
            console.log("zip progress : " , zipPersentage)
            this.zipProgress = zipPersentage * this.zip.size; 
            this.zipHandler(this.zipProgress);
          })

        //if there are images and a zip proceede otherwise show error later
        for(let i=0;  i < this.images.length; i++){
          this.image = this.images[i];
          let storeRef = this.fireStorage.ref("photos/" + uid + "/"  + this.folderNameForm.value  +"/"+  this.image.name);
            let uploadTask = storeRef.put(this.image  ).percentageChanges().subscribe( persentage => {
              if(persentage == 100){
                totalUploadedBytes += this.images[i].size
                persentageDone = (totalUploadedBytes / totalBytes )*100;
                this.handler(persentageDone );
              }
          })
        }
      }
    }

      //set payment
      if(this.projectFee){
      //this.fireStore.collection('outstandingPayments').doc(uid).set( {[this.folderNameForm.value] : this.projectFee  });
        this.fireStore.collection('outstandingPayments').doc(uid).set({  [this.folderNameForm.value]: this.projectFee}, {merge: true} )
      }

      const headers =  new HttpHeaders().set("Content-Type" ,  "application/json");
      //this.http.post( "https://us-central1-justgoshoot-46fed.cloudfunctions.net/updateProjects/"  , {newProject : this.folderNameForm.value, email: this.emailForm.value }, {headers}).subscribe(result =>  {
      this.http.post( "http://localhost:5000/justgoshoot-46fed/us-central1/updateProject"  , {newProject : this.folderNameForm.value, email: this.emailForm.value }).subscribe(result =>  {
      });
    });
    }

    handler (persentageDone) {
      //bootstap progress bar wont play ball 
      this.ngZone.run(() => {
        this.zipProgress = persentageDone;
      });
    }

    zipHandler (persentageDone) {
      //bootstap progress bar wont play ball 
      this.ngZone.run(() => {
        this.uploadProgress = persentageDone;
        if(this.uploadProgress == 100){
          this.uploadReset();
        }
      });
    }
    
    uploadReset(){
      setTimeout(() => {
        this.uploadFormGroup.reset();
        this.uploadProgress = 0;
      }, 10000);
    }
    uploadValidator(){
      if(this.uploadFormGroup.valid){
        this.createProject();
        
      }
      else{
        this.imageForm.reset();
      }
    }

    createUserValidator(){
      if(this.userCreateFormGroup.valid){
        this.createUser();
      }
      else{
        this.userCreateForm.reset();
      }

    }

    imageStageing(e){
      this.images  = e.target.files;
    }

    zipFile(e){
      this.zip  = e.target.files[0];
    }



    createFormControls() {
      this.userCreateForm = new FormControl("", Validators.email, asyncValidator.emailNotExists(this.fireStore));

      this.imageForm = new FormControl(""  ); // must have atleast 1 image
      this.zipForm = new FormControl(""  ); // must have atleast 1 image
      this.folderNameForm = new FormControl("", Validators.required , asyncValidator.folderName(this.fireStore) ); //folder maybe be unique
      this.emailForm = new FormControl("", Validators.email, asyncValidator.emailExists(this.fireStore));
    }

    createForm() {

      this.userCreateFormGroup = new FormGroup({
          userCreateForm: this.userCreateForm,
      })

      this.uploadFormGroup = new FormGroup({
          folderNameForm: this.folderNameForm,
          emailForm: this.emailForm,
          imageForm: this.imageForm,
          zipForm: this.zipForm,
      })
  }




  ngOnInit(): void {




    //form validation
    this.createFormControls();
    this.createForm();



    this.fireStore.collection<User>(`users`).valueChanges().subscribe(
      //for email predict
      userCol => { 
        this.users = userCol;
  })
}
}


export class asyncValidator{
  static emailExists(fireStore: AngularFirestore   ){
    //look over in a bit
    return (control: AbstractControl) => {
      const email = control.value;
      return fireStore.collection("users", ref => ref.where("email", "==" , email) )
      .valueChanges().pipe( debounceTime(500),  take(1) ,  map( arr => arr.length == 1 ? null:  {emailNotExist: true} )  )
    }
  }

  static emailNotExists(fireStore: AngularFirestore   ){
    //look over in a bit
    return (control: AbstractControl) => {
      const email = control.value;
      return fireStore.collection("users", ref => ref.where("email", "==" , email) )
      .valueChanges().pipe( debounceTime(500),  take(1) ,  map( arr => arr.length == 0 ? null:  {emailExists: true} )  )

    }
  }
  static folderName(fireStore: AngularFirestore  ){
    return (control: AbstractControl) => {
      const folderName = control.value;
      return fireStore.collection("users", ref => ref.where("projects", "array-contains" , folderName) )
      .valueChanges().pipe( debounceTime(500),  take(1) ,  map( arr =>   arr.length == 0  ? null:  {folderExists: true} )  )

    }
  }
}