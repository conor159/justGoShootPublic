import { Component, OnInit } from '@angular/core';
import { AngularFireAuth, AngularFireAuthModule } from '@angular/fire/auth';
import { SelectMultipleControlValueAccessor } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(private fireAuth : AngularFireAuth, private router : Router) { }

  ngOnInit(): void {
    this.fireAuth.signOut().then( () => {
      this.router.navigate(["home"]);
    })
  }

}
