import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from "nodemailer"
import { firestore } from 'firebase-admin';

//admin.initializeApp();
import serviceAccount = require('./serviceAccountKey.json' )

const typedServiceAcc = {
  type: serviceAccount.type,
  projectId: serviceAccount.project_id,
  privateKeyId: serviceAccount.private_key_id,
  privateKey: serviceAccount.private_key,
  clientEmail: serviceAccount.client_email,
  clientId: serviceAccount.client_id,
  authUri: serviceAccount.auth_uri,
  tokenUri: serviceAccount.token_uri,
  authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
  clientC509CertUrl: serviceAccount.client_x509_cert_url
}

admin.initializeApp({
  credential: admin.credential.cert(typedServiceAcc)
});

const senderEmail = functions.config().email.address
const url ="http://127.0.0.1:4200/";
const stripe = require("stripe")( functions.config().stripe.sk )

const transponder  = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth:{
    user: senderEmail,
    pass: functions.config().email.password
  }
});



module.exports.add_user = functions.https.onRequest(async( request ,response ) => {
  const cors = require('cors')({origin: true});

  cors(request , response , () => {
    response.set({ 'Access-Control-Allow-Origin': 'http://localhost:4200' });
    response.set({ 'Access-Control-Allow-Origin': '*' });
    response.set({ 'preflightContinue': 'false' });
    response.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
    //need to do delete tokens later
    let user =   new ServUser("");
    user = request.body;


    admin.firestore().collection("users").where("email" , "==", user.email).onSnapshot( returnedDoc => {
      if( returnedDoc.empty ){
        admin.firestore().collection("firstLoginTokens")
        .where("email" , "==" , user.email  )
        .where("token" , "==" , user.token)
        .get().then( tokenDoc => {
          if(!tokenDoc.empty ){
            admin.auth().createUser(  {
                email: user.email,
                password: user.password,
            }).then( () => {
              delete user.password;
              delete user.token;
              user.admin = false;

              admin.auth().getUserByEmail(user.email).then( authInfo => {
                const uid = authInfo.uid;
                admin.firestore().collection("users").doc(uid).create(user);
                response.send( "true");
              })

            })
          }
          else{
            response.send("false");
          }
        })
      }
    })
    });
  });

module.exports.updateProject = functions.https.onRequest(( request ,response ) => {
  //bother user with an email with a firestore listner
  const cors = require('cors')({origin: true});
  cors(request , response , () => {
    response.set({ 'Access-Control-Allow-Origin': 'http://localhost:4200' });
    response.set({ 'Access-Control-Allow-Origin': '*' });
    response.set({ 'preflightContinue': 'false' });
    response.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');

    let projectExits = false;
    let userToBeUpdated: string;
    //use get ranther than snapshot becase it will run again for no good reason and cause double headder nonsene
    admin.firestore().collection("users").get().then( users => {
      users.forEach( user => {
        if (user.get("projects").includes(request.body.newProject)){
          projectExits = true;
        }
        if( user.get("email") == request.body.email){
          userToBeUpdated = user.id;
        }
      })

      if(projectExits == true){
         return response.send( {updated: false} );
      }

      else{
         admin.firestore().collection("users").doc(userToBeUpdated).update({
          projects: firestore.FieldValue.arrayUnion(request.body.newProject),
        })
        return response.send({updated: true });
      }
    });
  });
});

exports.emailNewUser = functions.firestore.document('firstLoginTokens/{tokenID}').onCreate( (snap , context)  => {
  const doc = snap.data();
  console.log( doc.email)
  console.log( doc.token)

  const mailOptions = {
    from: senderEmail,
    to:  doc.email,
    subject: "JustGoShoot",
    html: `<p>Link to setup justGoShootAccount so you can view and download your photos</p>
          <br>
          <a href ="${url}createAccount/?/token=${doc.token}&email=${doc.email}">click here</a>`
  }

  return transponder.sendMail(mailOptions , (error , data ) => {
    if(error){
      console.log(error);
      return 
    }
    console.log("sent email to " + doc.email )
    });
});



module.exports.create_payment_intent = functions.https.onRequest(async( req ,res ) => {
  const cors = require('cors')({origin: true});
    cors(req , res , () => {
      res.set({ 'Access-Control-Allow-Origin': 'http://localhost:4200' });
      res.set({ 'Access-Control-Allow-Origin': '*' });
      res.set({ 'preflightContinue': 'false' });
      res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');

    //cors shenanigans mean that body wasent sent so corse parse done server side
    let purchase  = req.body;
    purchase = JSON.parse(purchase);

    admin.firestore().collection("outstandingPayments").doc(purchase.uid).get().then( outstandingFeeDoc => {
      return   outstandingFeeDoc.get(purchase.folderName);
      })
      .then( async fee => {
      // Create a PaymentIntent with the order amount and currency 
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Number(fee),
          currency: "eur"
        });

        //console.log(paymentIntent.client_secret);
        res.send({
          clientSecret: paymentIntent.client_secret,
          fee: fee,
          folderName: purchase.folderName
        });
      });
    });
  });

module.exports.receive_payment_intent = functions.https.onRequest(async( req ,res ) => {
    //run when receve successfull payment intnet from stripe webhook 
    //adds that intent and then looks in user intents if there is a match it deletes the outstanding payment and the intnents
      admin.firestore().collection("paymentIntents/nonUserIntents/"  + req.body.data.object.id ).add( req.body).then( nonUser => {
        admin.firestore().doc("paymentIntents/userIntents/").listCollections().then( userIntentsList =>{
            userIntentsList.forEach( col => {
              col.get().then( querySnapshot => querySnapshot.forEach( doc => {
                let docData = doc.data();
                if(docData.piObj.pi.id == req.body.data.object.id){
                  admin.firestore().doc( "outstandingPayments/" + docData.piObj.uid).get().then( op => {
                    let opObj = op.data();
                    if(opObj ){
                      console.log(opObj[docData.piObj.folderName] ,  req.body.data.object.amount_received ); 

                      if(opObj[docData.piObj.folderName] == req.body.data.object.amount_received){
                        op.ref.update({
                          //payment matches so remove outstanding payment
                          //would be a good idea to send an email off on suc/fail
                          
                         [docData.piObj.folderName] : admin.firestore.FieldValue.delete()
                        })
                          .then( () => {
                            sendEmail( docData, true  );
                            doc.ref.delete();
                            nonUser.delete();
                          })
                      }
                    }
                    })
                }
              }))
            })
        });
    res.end();
  });
})

function sendEmail( userIntent:any, paymentOutcome:boolean){
  console.log(userIntent);
  console.log("trying to send an email");
    paymentOutcome? "succeeded" : "failed";
    admin.firestore().collection("users").doc(userIntent.piObj.uid).get().then( user =>{
      let userData = user.data();
      const mailOptions = {
        from: senderEmail,
        to:  userData?.email,
        subject: "JustGoShoot payment for " + userIntent.piObj.folderName ,
        html: `<p>Payment of €${userIntent.piObj.pi.amount} for  ${userIntent.piObj.folderName} has ${paymentOutcome? "succeeded" : "failed"}</p>
              <br>
              <a href ="${url}userGallery?uid=${userIntent.piObj.uid}&folderName=${userIntent.piObj.folderName}">click here</a>`
      }
      
      return transponder.sendMail(mailOptions , (error , data ) => {
        if(error){
          console.log(error);
          return 
        }
        else{
          console.log("sent email to ", userData?.email);
        }
      });
  })
}

/*
exports.paymentIntentsMatcher = functions.firestore.document('/paymentIntents/userIntents/{uid}/{doc}').onWrite( (snap , context)  => {
//module.exports.paymentIntentsMatcher = functions.https.onRequest(async( req ,res ) => {
  //in the event that firebase is slow and strip has written its payment intnet before the userintent then this function should
  //match any non user intents with its userintents
    let userIntent :any;
    userIntent = snap.after.data()
    if(userIntent){
        admin.firestore().collection("paymentIntents/userIntents/"  + userIntent.piObj.uid ).add( userIntent).then( userIntentDoc => {
          admin.firestore().collection("paymentIntents").doc("nonUserIntents").listCollections().then( nonUserList => {
            nonUserList.forEach( col => {
              col.get().then( querySnapshot => querySnapshot.forEach( doc => {
                let nonUser = doc.data();
                if(nonUser){
                  if(nonUser.data.object.id == userIntent.piObj.pi.id){
                    admin.firestore().doc( "outstandingPayments/" + userIntent.piObj.uid).get().then( op => {
                        let opObj = op.data();
                        if(opObj ){
                          console.log(opObj[userIntent.piObj.folderName] ,  nonUser.data.object.amount_received );
                          if( opObj[userIntent.piObj.folderName]  == nonUser.data.object.amount_received ){
                            console.log("update delete stuff here");
                            op.ref.update({
                              //payment matches so remove outstanding payment
                              //would be a good idea to send an email off on suc/fail
                              [userIntent.piObj.folderName] : admin.firestore.FieldValue.delete()
                            })
                              .then( () => {
                                userIntent.ref.delete();
                                nonUser.delete();
                              })
                          }

                        }
                      
                    })
                  }
                }

              }))
            })
        })
      })
  }
})
*/

module.exports.getSignedUrls = functions.https.onRequest(( req ,res ) => {
  const cors = require('cors')({origin: true});
  cors(req , res , async () => {
    res.set({ 'Access-Control-Allow-Origin': 'http://localhost:4200' });
    res.set({ 'Access-Control-Allow-Origin': '*' });
    res.set({ 'preflightContinue': 'false' });
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');

    let uid = req.body.uid;
    let folderName = req.body.folderName;
    let action = req.body.action;
    let options = {
      prefix : `${action}/${uid}/${folderName}/`,
      delimiter : "/"
    }

    admin.firestore().collection("outstandingPayments").doc(uid).get().then( outstandingFeeDoc => {
      admin.firestore().collection("users").doc(uid).get().then( user => {
        let userData = user.data();

        if(userData?.admin || (userData?.projects.includes(folderName) &&  (!outstandingFeeDoc.get(folderName))) ){
          
          admin.storage().bucket("justgoshoot-46fed.appspot.com").getFiles(options).then(  fileArr=> {
            let fileObj = fileArr[0];
            const urls = fileObj.map( url => url.getSignedUrl({action: 'read', expires: "03-09-2491"}).then( signedUrlArr => signedUrlArr[0]) )
            Promise.all(urls).then(urlArrFin  => res.send(JSON.stringify(urlArrFin)))
          })
        }
        })
    });
  });
});



export class ServUser {
  name?: string;
  email: string;
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
  projects:  []
  constructor(email:string) { 
    this.email = "";
    this.projects = [];
  }
}
