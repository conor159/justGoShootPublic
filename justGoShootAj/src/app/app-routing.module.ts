import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { ContactComponent } from './contact/contact.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { GalleryComponent } from './gallery/gallery.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { NotFound404Component } from './not-found404/not-found404.component';
import { PaymentPageComponent } from './payment-page/payment-page.component';
import { UserGalleryGuard } from './user-gallery.guard';
import { UserGalleryComponent } from './user-gallery/user-gallery.component';
import { UserGuardGuard } from './user-guard.guard';

const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'home', component: HomeComponent},
  { path: 'gallery', component: GalleryComponent},
  { path: 'contact', component: ContactComponent},
  { path: 'login', component: LoginComponent},
  { path: 'logout', component: LogoutComponent},
  { path: 'payment', component: PaymentPageComponent},
  { path: 'createAccount', component: CreateAccountComponent},
  { 
    path: 'admin', component: AdminComponent,
    canActivate: [UserGuardGuard],
  },
  { 
    path: 'userGallery', component: UserGalleryComponent,
    canActivate: [UserGalleryGuard],
  },
  { path: '**', component: NotFound404Component},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],


  exports: [RouterModule]
})
export class AppRoutingModule { }
