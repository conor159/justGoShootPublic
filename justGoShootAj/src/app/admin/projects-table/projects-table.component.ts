import { Component, OnInit } from '@angular/core';

import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireStorage } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { User } from '../../models/User';
@Component({
  selector: 'projects-table',
  templateUrl: './projects-table.component.html',
  styleUrls: ['./projects-table.component.css']
})
export class ProjectsTableComponent implements OnInit {
  users$: User[] = [];
  userProjectRecords$:  Record<string , [string, User, string]> = {} //url , User  uid
  outstandingFees; 


  gallery(folderName: string, user: User,  uid :string ){
    this.router.navigate(['userGallery'], {queryParams: {"uid": uid , "folderName": folderName  , "page" : 0}});
  }



constructor(private fireStore : AngularFirestore, private fireStorage : AngularFireStorage, private router : Router )  { }

ngOnInit(): void {
  this.fireStore.collection('outstandingPayments' ).valueChanges().subscribe( outstandingFees  => {
    this.outstandingFees = outstandingFees;
    outstandingFees.forEach(outstandingFees => {
      this.outstandingFees  = outstandingFees;
    });
  });


  let photosRef = this.fireStorage.storage.ref("photos");

  this.fireStore.collection<User>(`users`).snapshotChanges().subscribe(users => {
    users.forEach(userSnapshot => {
        let uid = userSnapshot.payload.doc.id;
        let user = userSnapshot.payload.doc.data()
        user.projects.forEach( project =>{
          photosRef.child(uid + "/"  + project).list().then( photoRefResult =>{
            let photoRefItems = photoRefResult.items;
            if(photoRefItems.length){
              photoRefItems[0].getDownloadURL().then( url =>  {
                //fix I dont like this
                this.userProjectRecords$[project] = [url, user, uid]
              })
            }
          })
        });
    });
  });


}
}
