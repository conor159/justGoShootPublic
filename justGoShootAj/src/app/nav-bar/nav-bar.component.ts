import { Component, OnInit } from '@angular/core';
import { AngularFireAuth, AngularFireAuthModule } from '@angular/fire/auth';


@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {

  constructor(private fireAuth: AngularFireAuth) { }
  userId$;

  ngOnInit(): void {

     this.fireAuth.onAuthStateChanged( user => this.fireAuth.user.subscribe(user => {if(user){  this.userId$ = user.uid}}) )
  }

}
