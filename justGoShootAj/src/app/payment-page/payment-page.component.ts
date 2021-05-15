import { Component, OnInit } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { randomInt } from 'crypto';
@Component({
  selector: 'app-payment-page',
  templateUrl: './payment-page.component.html',
  styleUrls: ['./payment-page.component.css']
})
export class PaymentPageComponent implements OnInit {

  constructor(private firestore: AngularFirestore,  private fireAuth : AngularFireAuth,  private activatedRoute : ActivatedRoute    ) { }

  folderName = this.activatedRoute.snapshot.queryParamMap.get('folderName');
  uid = this.activatedRoute.snapshot.queryParamMap.get('uid');


  ngOnInit(): void {
    let stripe = Stripe("pk_test_51IDB0gBAYmVIjY07gtDcOaxhKnZEQbnchMuRJLOxNHZs8xk2b1b3ReZOrmD9gwmzFQWnUYHx2Wqt7mMAOKEuumTO000EQS0cnl");
    let purchase = {
      folderName : this.folderName,
      uid : this.uid
    }



   document.querySelector("button").disabled = true;
   fetch("http://localhost:5000/justgoshoot-46fed/us-central1/create_payment_intent", {
       method: "POST",
        headers: { "Content-Type": "text/plain"},
     //body: JSON.stringify(purchase)
     mode: "cors",
     body: JSON.stringify(purchase)
    })
    .then(function(result) {
       return result.text();
     })
     .then( result =>  JSON.parse(result))
     .then(function(data) {
      var elements = stripe.elements();
      document.querySelector("#button-text").textContent = "€ " +  (data.fee/ 100) + " for "  +  data.folderName ;
      var style = {
        base: {
          color: "#32325d",
          fontFamily: 'Arial, sans-serif',
          fontSmoothing: "antialiased",
          fontSize: "16px",
          "::placeholder": {
            color: "#32325d"
          }
        },
        invalid: {
          fontFamily: 'Arial, sans-serif',
          color: "#fa755a",
          iconColor: "#fa755a"
        }
      };
  
      var card = elements.create("card", { style: style });
      // Stripe injects an iframe into the DOM
      card.mount("#card-element");
  
      card.on("change", function (event) {
        // Disable the Pay button if there are no card details in the Element
        document.querySelector("button").disabled = event.empty;
        document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
      });
  
      var form = document.getElementById("payment-form");
      form.addEventListener("submit", function(event) {
        event.preventDefault();
        // Complete payment when the submit button is clicked
        payWithCard(stripe, card, data.clientSecret);
      });
    });
  
  // Calls stripe.confirmCardPayment
  // If the card requires authentication Stripe shows a pop-up modal to
  // prompt the user to enter authentication details without leaving your page.
  let piDoc = this.firestore.collection("paymentIntents/userIntents/"  + this.uid);
  let uid = this.uid;
  let folderName = this.folderName;
  var payWithCard = function(stripe, card, clientSecret) {
    loading(true);
    stripe
      .confirmCardPayment(clientSecret, {
        payment_method: {
          card: card
        }
      })
      .then(result => {
        if (result.error) {
          // Show error to your customer
          showError(result.error.message);
        } else {
          // The payment succeeded!
          let pi = result.paymentIntent;
          let obj = { pi  ,  uid, folderName };
          piDoc.add( {"piObj" : obj  });
          orderComplete(result.paymentIntent.id);
         

          //send off a request to cloud functions to see if the payment is complete if so then change the outstaning pagements 
          //thing
          
        }
      });
  };
  
  /* ------- UI helpers ------- */
  
  // Shows a success message when the payment is complete
  var orderComplete = function(paymentIntentId) {
    loading(false);
    document
      .querySelector(".result-message a")
      .setAttribute(
        "href",
        "https://dashboard.stripe.com/test/payments/" + paymentIntentId
      );
    document.querySelector(".result-message").classList.remove("hidden");
    document.querySelector("button").disabled = true;
  };
  
  // Show the customer the error from Stripe if their card fails to charge
  var showError = function(errorMsgText) {
    loading(false);
    var errorMsg = document.querySelector("#card-error");
    errorMsg.textContent = errorMsgText;
    setTimeout(function() {
      errorMsg.textContent = "";
    }, 4000);
  };
  
  // Show a spinner on payment submission
  var loading = function(isLoading) {
    if (isLoading) {
      // Disable the button and show a spinner
      document.querySelector("button").disabled = true;
      document.querySelector("#spinner").classList.remove("hidden");
      document.querySelector("#button-text").classList.add("hidden");
    } else {
      document.querySelector("button").disabled = false;
      document.querySelector("#spinner").classList.add("hidden");
      document.querySelector("#button-text").classList.remove("hidden");
    } 


  }
  }

};

