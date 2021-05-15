import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { AngularFireAuth  } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from "@angular/fire/firestore"
import { Observable } from 'rxjs';
import { User} from "./models/User";

@Injectable({
  providedIn: 'root'
})
export class NgGaurdGuard implements CanActivate {

  constructor(private afs : AngularFirestore ,  private fireAuth: AngularFireAuth, private router : Router  ){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        return new Promise((resolve , reject) => {
        this.fireAuth.onAuthStateChanged( user => {
          if(!user){
            this.router.navigate(['login']);
            return resolve(false);
          }
          this.afs.doc<User>(`users/${user.uid}`).valueChanges().subscribe( userDoc => {
            if(userDoc.admin){
              console.log("logged in user true");
              return resolve(true);
              }
            this.router.navigate(['login']);
            return resolve(false);
            });
          });
        });

    }
  }