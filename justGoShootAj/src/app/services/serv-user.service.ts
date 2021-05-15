import { Injectable, NgModule } from '@angular/core';
import { NgModel } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})

export class ServUser  {
  name?: string;
  email?: string;
  phone?: string;
  admin?:  boolean;
  addr1?: string;
  addr2?: string;
  addr3?: string;
  eircode?: string;
  town?: string;
  county?: string;
  country?: string;
  token?: string;
  password?: string;
  projects?:  []


  constructor() { 
  }
}
