// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
var db = admin.firestore();

    //增加使用者 -- Password must be hashed!!!
    exports.addUser = functions.https.onRequest(async (req, res) => {
      try{
        if(req.method !== "POST") throw "Please send a POST request";
        const usersRef = db.collection('users');
        var set1 = await usersRef.doc('user1').set({
          name: 'Wesley', email: 'wesley16838@gmail.com', phone: '0978377538', password: 'ecafeflnne3423ewicnew',amountDiamond: 100, VIP: 'Golden'
        });
        var set2 = await usersRef.doc('user2').set({
          name: 'Sharon', email: 'sharon16838@gmail.com', phone: '0978377538', password: 'ecafeflnne3423ewicnew', amountDiamond: 80, VIP: 'Silver'
        });
       
        res.status(200).send('成功增加使用者');
      }catch(err){
        res.status(400).send(err);
      }
      
      
    });

    //新增員工
    exports.addWorker = functions.https.onRequest(async (req, res) => {
      try{
        if(req.method !== "POST") throw "Please send a POST request";
        const workersRef = db.collection('workers');
       
        var set1 = await workersRef.doc('worker1').set({
          name: 'Hank', email: 'hank16838@gmail.com', phone: '0978377538', password: 'ecafeflnne3423ewicnew', amountP: 200
        });
        var set2 = await workersRef.doc('worker2').set({
          name: 'Petter', email: 'petter16838@gmail.com', phone: '0978377538', password: 'ecafeflnne3423ewicnew', amountP: 120
        });
        res.status(200).send('成功增加員工');
      }catch(err){
        res.status(400).send(err);
      }
      
      
    });

    //增加消費者轉賬記錄(依照身份不同, 單位不同) 
      //使用者互傳(Diamond)
      //架構=> 日期, 付款人, 收款人, 理由
    exports.addUserRecord = functions.https.onRequest(async (req, res) => {
      try{
        if(req.method !== "POST") throw "Please send a POST request";
        
        const recordsRef = db.collection('userRecords');
        //Samples
        var set1 = await recordsRef.doc('record1').set({//使用者互傳(Diamond)
          date: new Date(Date.now()), pay : 'Wesley', gain: 'Sharon', amount: 50, reason: 'User transaction'
        });
        var set2 = await recordsRef.doc('record2').set({//使用者＆員工互傳(Diamond to P)
          date: new Date(Date.now()), pay : 'Sharon', gain: 'Wesley', amount: 10, reason: 'Fixing computer'
        });
        
        res.status(200).send('增加紀錄成功'); 
      }catch(err){
        res.status(400).send(err);
      }
    });
    //員工互傳(P)
    //架構=> 日期, 付款人, 收款人, 理由
    exports.addWorkerRecord = functions.https.onRequest(async (req, res) => {
      try{
        if(req.method !== "POST") throw "Please send a POST request";
        
        const recordsRef = db.collection('workRecords');
        //Samples
        var set1 = await recordsRef.doc('record1').set({//使用者互傳(Diamond)
          date: new Date(Date.now()), pay : 'Hank', gain: 'Petter', amount: 50, reason: 'User transaction'
        });
        var set2 = await recordsRef.doc('record2').set({//使用者＆員工互傳(Diamond to P)
          date: new Date(Date.now()), pay : 'Petter', gain: 'Hank', amount: 10, reason: 'Fixing computer'
        });
        
        res.status(200).send('增加紀錄成功'); 
      }catch(err){
        res.status(400).send(err);
      }
    });

//增加儲值紀錄(單位為台幣)
//架構=> 儲值方式(Credit card or QR code), 儲值金額, 日期, 贈點紀錄 
exports.addRefillRecord = functions.https.onRequest(async (req, res) => {
  try{
    if(req.method !== "POST") throw 'Please send a POST request'
    var refillsRef = db.collection('refills');
      //if way == CreditCard then cardNum exist
      //else cardNum doesn't exist
    var set1 = await refillsRef.doc('refill1').set({
      date: new Date(Date.now()), way:'CreditCard',cardNum: 54523,  amount: 100, userId: 'user1', bonus: 0
    });
  
    var set2 = await refillsRef.doc('refill2').set({
      date: new Date(Date.now()), way:'QRCode', cardNum: null, amount: 2000, userId: 'user2', bonus: 3
    });
    
    res.status(200).send('增加儲值紀錄成功');
  }catch(err){
     
      res.status(400).send(err);
  }    
});

//獲取使用者轉帳紀錄
exports.getUserRecord = functions.https.onRequest(async (req, res) => {
  try{
    let records = {}; 
    let username = req.query.name;  
    var recordRef = db.collection('userRecords')
    // var query = recordRef.where('pay', '==', username).where('amount','>=',100).get()
    var snapshot = await recordRef.where('pay', '==', username, '||','gain', '==', username).get()
    if (snapshot.empty) throw "無相關紀錄"
    snapshot.forEach(doc => {
      
      for(var i = 0; i < snapshot.size; i++){
        records[doc.id] = doc.data();
        records[doc.id]['date'] = doc.data().date.toDate()
      }
    });
    res.status(200).send(records);
  }catch(err){
    res.status(400).send(err);
  }
});

//獲取員工轉帳紀錄
exports.getWorkerRecord = functions.https.onRequest(async (req, res) => {
  try{
    let records = {}; 
    let username = req.query.name;  
    var recordRef = db.collection('workRecords')
    // var query = recordRef.where('pay', '==', username).where('amount','>=',100).get()
    var snapshot = await recordRef.where('pay', '==', username, '||','gain', '==', username).get()
    if (snapshot.empty) throw "無相關紀錄"
    snapshot.forEach(doc => {
      
      for(var i = 0; i < snapshot.size; i++){
        records[doc.id] = doc.data();
        records[doc.id]['date'] = doc.data().date.toDate()
      }
    });
    res.status(200).send(records);
  }catch(err){
    res.status(400).send(err);
  }
});

  //獲取使用者儲值紀錄
  exports.getUserRefillRecord = functions.https.onRequest(async (req, res) => {
  try{
    // let userId = req.query.userId;
  
    let refills = {}; 

    let userId = req.query.id;
  
    var refillRef = db.collection('refills')
   
    var snapshot = await refillRef.where('userId', '==', userId).get()

    if (snapshot.empty) throw "無相關紀錄"
   
    snapshot.forEach(doc => {
      for(var i = 0; i < snapshot.size; i++){
        refills[doc.id] = doc.data();
        refills[doc.id]['date'] = doc.data().date.toDate()
      }
    });
 
    res.status(200).send(refills);
  }catch(err){
    res.status(400).send(err);
  } 
});
