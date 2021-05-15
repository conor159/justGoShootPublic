import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http'

import { CdkTableModule } from "@angular/cdk/table";
import { NgxStripeModule } from 'ngx-stripe';

import { AdminComponent } from './admin/admin.component';
import { UserGalleryComponent } from './user-gallery/user-gallery.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { AppComponent } from './app.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { HomeComponent } from './home/home.component';
import { GalleryComponent } from './gallery/gallery.component';
import { ContactComponent } from './contact/contact.component';
import { LoginComponent } from './login/login.component';

import { AngularFireModule  } from '@angular/fire';
import {  AngularFirestoreModule  } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';

import { ServUser } from './services/serv-user.service';
import { ProjectsTableComponent } from './admin/projects-table/projects-table.component';
import { GalleryOverlayComponent } from './user-gallery/gallery-overlay/gallery-overlay.component';
import { LogoutComponent } from './logout/logout.component';
import { NotFound404Component } from './not-found404/not-found404.component';
import { PaymentPageComponent } from './payment-page/payment-page.component';

const firebaseConfig = {
  
};

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    HomeComponent,
    GalleryComponent,
    ContactComponent,
    LoginComponent,
    AdminComponent,
    UserGalleryComponent,
    CreateAccountComponent,
    ProjectsTableComponent,
    UserGalleryComponent,
    GalleryOverlayComponent,
    LogoutComponent,
    NotFound404Component,
    PaymentPageComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    HttpClientModule,
    RouterModule,
    CdkTableModule,
    
  ],
  providers: [ServUser],
  bootstrap: [AppComponent]
})
export class AppModule { }
