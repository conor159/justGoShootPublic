import { Injectable  } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth  } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from "@angular/fire/firestore"
import { User} from "./models/User";
import { PaymentPageComponent } from './payment-page/payment-page.component';
import { stringify } from '@angular/compiler/src/util';

@Injectable({
  providedIn: 'root'
})
export class UserGalleryGuard implements CanActivate {
  constructor(private afs : AngularFirestore ,  private fireAuth: AngularFireAuth,  private router : Router , ){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      let uid: string = route.queryParamMap.get("uid");

      return new Promise((resolve , reject) => {
        //will lose auth on reload without this so dont remove
        this.fireAuth.onAuthStateChanged( user => {
          if(!user){
            this.router.navigate(['login']);
            console.log("not a user");
            return resolve(false);
          }

          this.afs.doc<User>(`users/${user.uid}`).valueChanges().subscribe( userDoc => {
            if(!userDoc){
              return resolve(false);
            }
            if(userDoc.admin){
              console.log("admin user");
              return resolve(true);
            }
            //user cant log in unless there isa  payment need to change 
            this.afs.doc(`outstandingPayments/${user.uid}`).valueChanges().subscribe( (payments:JSON) => {
              if((Object.keys(payments).length) ){
                for(let payment in payments){
                  this.router.navigate(["payment"],{queryParams: {"uid": uid , "folderName":  payment}});
                }
              }
              else{
                console.log("res true ")
                return resolve(true);
              }
          });
        })
      });
    })
  }
}
