import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute , NavigationExtras} from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Action, AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentSnapshot } from "@angular/fire/firestore";
import { AngularFireAuth, AngularFireAuthModule } from '@angular/fire/auth';
import { User} from "../models/User";


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  userForm:FormGroup;
  constructor(  private fireStore : AngularFirestore , private fireAuth : AngularFireAuth, private router : Router   ){
  }

    loginData = {
      email :   "",
      password :   "",
    }

    invalidLogin : boolean = true;

    logIn(){
      this.fireAuth.signInWithEmailAndPassword(this.loginData.email , this.loginData.password )
      .then(
        result =>  {
          console.log(result.user.uid);
            this.fireStore.doc<User>(`users/${result.user.uid}`).snapshotChanges().subscribe(
                user => {
                  this.nav(user);
                }
            )

        }).catch( () => {
        }
        );
    }


    errorText(){
      this.invalidLogin = false;
      setTimeout(() => {          
      this.invalidLogin = true;
        },5000);
        
        }

  nav(userSnapshot: Action<DocumentSnapshot<User>>){
    let uid = userSnapshot.payload.id;
    let user: User = userSnapshot.payload.data();
    if(user.admin){
      console.log("admin")
      this.router.navigate(['admin']);
    }
    else if(user.admin == false){
     console.log( uid ,  user.projects[0]  );
     this.router.navigate(['userGallery'], {queryParams: {"uid": uid , "folderName": user.projects[0]  , "page" : 0}});
    }
  }



  ngOnInit(): void {
  }
}
