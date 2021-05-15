import { Component, OnInit, Input, Output } from '@angular/core';


@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  eventArray = ["Wedding", "First Communion", "Birthday", "Other" ]

   contact = {
    name: "",
    email:  "",
    phoneNumber: "",
    selectedEvent:   "Other",
    textArea:   ""
  };


  selectEvent(event: any){
    this.contact.selectedEvent = event.target.value;
  }

  submit(){
    
  }
  


  constructor() { }

  ngOnInit(): void {
  }

}
