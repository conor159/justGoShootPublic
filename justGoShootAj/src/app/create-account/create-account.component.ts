import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from "@angular/fire/firestore";
import { AngularFireAuth,  } from '@angular/fire/auth';
import {User} from '../models/User';
import {ServUser} from '../services/serv-user.service';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { resourceUsage } from 'process';
//import { Observable } from  "rxjs";

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent implements OnInit {
  email: string;
  password: string;
  password1: string;
  token :  string;
  constructor( private route : ActivatedRoute , private auth : AngularFireAuth , private fireStore :  AngularFirestore  , public  user : ServUser , private http : HttpClient , private router : Router) { 
  }

  createAccount(){
    if(this.password === this.password1){
      if(this.password.length > 8){
        const headers =  new HttpHeaders().set("Content-Type" ,  "application/json");
        this.user.password = this.password;
        this.http.put( "https://us-central1-justgoshoot-46fed.cloudfunctions.net/add_user" , JSON.stringify(this.user) ,    {headers}   , ).subscribe(result =>  {
          if(result){
            this.router.navigate(["login"]);
          }
        })
      }
    }
  }



  
  ngOnInit(): void {
    this.user = new ServUser;
    this.user.email = this.route.snapshot.queryParamMap.get("email");
    this.user.token = this.route.snapshot.queryParamMap.get("token");
    
  }

}
