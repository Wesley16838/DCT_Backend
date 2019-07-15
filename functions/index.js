// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
const uuidv4 = require('uuid/v4');
let DateGenerator = require('random-date-generator');
const cors = require('cors')({origin: true});
var FieldValue = require('firebase-admin').firestore.FieldValue;
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');
var db = admin.firestore();
process.env.TZ = 'Asia/Taipei';
/////////////////Verify Token//////////////////
exports.auth = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{
    
      const tokenId = req.headers['authorization'].split('Bearer ')[1];
      console.log(tokenId)  
      var decoded = await admin.auth().verifyIdToken(tokenId)
      res.status(200).send(decoded)
        
  
  }catch(err){
    res.status(401).send(err)
  }
});

/////////////////Get Method///////////////////
//獲取使用者轉帳紀錄 
exports.getUserRecordtest = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{
    let records = {}; 
    let arr = [];
    let userid = req.query.userid;  
    var customerRef = db.collection('customer').doc(userid)
    var nextCustomerRef = db.collection('customer')
    var recordRef = db.collection('customerTransaction')
    var snapshot = await recordRef.where('payer', '==', customerRef).get()

    if (snapshot.empty) throw "無相關紀錄"
    
    snapshot.forEach(doc => {
      var datamonth = doc.data().time.toDate().getUTCMonth() + 1; //months from 1-12
      var datayear = doc.data().time.toDate().getUTCFullYear(); //months from 1-12
      var datadate = doc.data().time.toDate().getUTCDate();
      var datahour = doc.data().time.toDate().getUTCHours();
      var datamin = doc.data().time.toDate().getUTCMinutes();
      var datasecond = doc.data().time.toDate().getUTCSeconds();
      records = doc.data();
      records['time'] = datayear + '-' + datamonth + '-' + datadate + ' ' + datahour + ':' + datamin + ':' + datasecond   
      arr.push(records)
      records = {};
    });
    for(var i = 0; i < arr.length; i++){
      var snap1= await nextCustomerRef.doc(arr[i]['payee']['_path']['segments'][1]).get()
      
      if(snap1.data()['name']==null){
        arr[i]['payee']= snap1.data()['FBname']
      }else{
        arr[i]['payee']= snap1.data()['name']
      }
      var snap2 = await nextCustomerRef.doc(arr[i]['payer']['_path']['segments'][1]).get()
 
      if(snap2.data()['name']==null){
        arr[i]['payer']= snap2.data()['FBname']
      }else{
        arr[i]['payer']= snap2.data()['name']
      }
      arr[i]['phone'] = snap2.data()['phone'];
      
    }
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  }
});
//獲取ALL使用者轉帳紀錄
exports.getAllUsersUserChargeRecordtest = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{
    var arr=[];
    let records = {}; 
   
    var nextCustomerRef = db.collection('customer')
    var recordRef = db.collection('customerTransaction')
    var snapshot = await recordRef.get()

    if (snapshot.empty) throw "無相關紀錄"
    
    snapshot.forEach(doc => {
      var datamonth = doc.data().time.toDate().getUTCMonth() + 1; //months from 1-12
      var datayear = doc.data().time.toDate().getUTCFullYear(); //months from 1-12
      var datadate = doc.data().time.toDate().getUTCDate();
      var datahour = doc.data().time.toDate().getUTCHours();
      var datamin = doc.data().time.toDate().getUTCMinutes();
      var datasecond = doc.data().time.toDate().getUTCSeconds();
      records = doc.data();
      records['time'] = datayear + '-' + datamonth + '-' + datadate + ' ' + datahour + ':' + datamin + ':' + datasecond   
      arr.push(records)
     
    });
    for(var i = 0; i < arr.length; i++){
      var snap1= await nextCustomerRef.doc(arr[i]['payee']['_path']['segments'][1]).get()
      
      if(snap1.data()['name']==null){
        arr[i]['payee']= snap1.data()['FBname']
      }else{
        arr[i]['payee']= snap1.data()['name']
      }
      var snap2 = await nextCustomerRef.doc(arr[i]['payer']['_path']['segments'][1]).get()
 
      if(snap2.data()['name']==null){
        arr[i]['payer']= snap2.data()['FBname']
      }else{
        arr[i]['payer']= snap2.data()['name']
      }
      arr[i]['phone'] = snap2.data()['phone'];
      
    }
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  }
});
//獲取員工轉帳紀錄
exports.getEmployeeRecordtest = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{
    let records = {}; 
    let arr = [];
    let employeeid = req.query.employeeid;  
    var employeeRef = db.collection('employees').doc(employeeid);
    var recordRef = db.collection('employeeTransaction'); 
    var nextEmployeeRef = db.collection('employees');
    var snapshot = await recordRef.where('payer', '==', employeeRef).get()
    if (snapshot.empty) throw "無相關紀錄"
    snapshot.forEach(doc => {
        var datamonth = doc.data().time.toDate().getUTCMonth() + 1; //months from 1-12
        var datayear = doc.data().time.toDate().getUTCFullYear(); //months from 1-12
        var datadate = doc.data().time.toDate().getUTCDate(); 
        var datahour = doc.data().time.toDate().getUTCHours();
        var datamin = doc.data().time.toDate().getUTCMinutes();
        var datasecond = doc.data().time.toDate().getUTCSeconds();
        records = doc.data();
        records['time'] = datayear + '-' + datamonth + '-' + datadate + ' ' + datahour + ':' + datamin + ':' + datasecond   
        arr.push(records)
        records = {};
    });
    for(var i = 0; i < arr.length; i++){
      var snap1= await nextEmployeeRef.doc(arr[i]['payee']['_path']['segments'][1]).get()
      if(snap1.data()['name']==null){
        arr[i]['payee']= snap1.data()['FBname']
      }else{
        arr[i]['payee']= snap1.data()['name']
      }
      var snap2 = await nextEmployeeRef.doc(arr[i]['payer']['_path']['segments'][1]).get()
      if(snap2.data()['name']==null){
        arr[i]['payer']= snap2.data()['FBname']
      }else{
        arr[i]['payer']= snap2.data()['name']
      }
      arr[i]['phone'] = snap2.data()['phone'];
    }
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  }
});
//獲取All員工轉帳紀錄
exports.getAllEmployeeRecordtest = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{
    let records = {}; 
    let arr = [];
   
   
    var recordRef = db.collection('employeeTransaction')   
    var nextEmployeeRef = db.collection('employees')
    var snapshot = await recordRef.get()
  
    if (snapshot.empty) throw "無相關紀錄"
    snapshot.forEach(doc => {
        var datamonth = doc.data().time.toDate().getUTCMonth() + 1; //months from 1-12
        var datayear = doc.data().time.toDate().getUTCFullYear(); //months from 1-12
        var datadate = doc.data().time.toDate().getUTCDate();
        var datahour = doc.data().time.toDate().getUTCHours();
        var datamin = doc.data().time.toDate().getUTCMinutes();
        var datasecond = doc.data().time.toDate().getUTCSeconds();
        records = doc.data();
        records['time'] = datayear + '-' + datamonth + '-' + datadate + ' ' + datahour + ':' + datamin + ':' + datasecond   
        arr.push(records)
        records = {};
    });
    for(var i = 0; i < arr.length; i++){
      var snap1= await nextEmployeeRef.doc(arr[i]['payee']['_path']['segments'][1]).get()
      if(snap1.data()['name']==null){
        arr[i]['payee']= snap1.data()['FBname']
      }else{
        arr[i]['payee']= snap1.data()['name']
      }
     
      var snap2 = await nextEmployeeRef.doc(arr[i]['payer']['_path']['segments'][1]).get()
      if(snap1.data()['name']==null){
        arr[i]['payer']= snap2.data()['FBname']
      }else{
        arr[i]['payer']= snap2.data()['name']
      }
      arr[i]['phone'] = snap2.data()['phone'];
    }
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  }
});


//獲取各使用者向員工付款
exports.getUserChargeRecord = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{
 
    let charges = {}; 
    let arr = [];
    let customerId = req.query.customerid;
    var cusotmerRef = db.collection('customer').doc(customerId)
    var customer = await cusotmerRef.get()
    if (!customer.exists) {
      throw '員工不存在'
    }
    var chargeRef = db.collection('transaction')
    var nextEmployeeRef = db.collection('employees')
    var nextCustomerRef = db.collection('customer')
    var snapshot = await chargeRef.where('payer', '==', cusotmerRef).get()

    if (snapshot.empty) throw "無相關紀錄"
    
    snapshot.forEach(doc => {
     
      var datamonth = doc.data().time.toDate().getUTCMonth() + 1; //months from 1-12
      var datayear = doc.data().time.toDate().getUTCFullYear(); //months from 1-12
      var datadate = doc.data().time.toDate().getUTCDate();
      var datahour = doc.data().time.toDate().getUTCHours();
      var datamin = doc.data().time.toDate().getUTCMinutes();
      var datasecond = doc.data().time.toDate().getUTCSeconds();
      //if(datamonth == new Date(Date.now()).getUTCMonth() + 1 && datayear == new Date(Date.now()).getUTCFullYear()){
      charges = doc.data();
      charges['time'] = datayear + '-' + datamonth + '-' + datadate + ' ' + datahour + ':' + datamin + ':' + datasecond
      charges['day'] = datadate
      arr.push(charges)
      charges = {}
      //}
  
    });

 
    for(var i = 0; i < arr.length; i++){
      var snap1= await nextEmployeeRef.doc(arr[i]['payee']['_path']['segments'][1]).get()
      if(snap1.data()['name']==null){
        arr[i]['payee']= snap1.data()['FBname']
      }else{
        arr[i]['payee']= snap1.data()['name']
      }
      
      var snap2 = await nextCustomerRef.doc(arr[i]['payer']['_path']['segments'][1]).get()
      if(snap1.data()['name']==null){
        arr[i]['payer']= snap2.data()['FBname']   
      }else{
        arr[i]['payer']= snap2.data()['name']   
      }
      arr[i]['phone'] = snap2.data()['phone'];
    }
    arr = arr.sort(function (a, b) {
      return a.day > b.day ? 1 : -1;//
     });
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  } 
});

//獲取all員工向使用者收費紀錄
exports.getAllEmplyeeChargeRecord = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{
 
    let charges = {}; 
    let arr = [];
    var arr1=[];
    var chargeRef = db.collection('transaction')
    var nextEmployeeRef = db.collection('employees')
    var nextCustomerRef = db.collection('customer')
    var snapshot = await chargeRef.get()

    if (snapshot.empty) throw "無相關紀錄"
    
    snapshot.forEach(doc => {
     
      var datamonth = doc.data().time.toDate().getUTCMonth() + 1; //months from 1-12
      var datayear = doc.data().time.toDate().getUTCFullYear(); //months from 1-12
      var datadate = doc.data().time.toDate().getUTCDate();
      var datahour = doc.data().time.toDate().getUTCHours();
      var datamin = doc.data().time.toDate().getUTCMinutes();
      var datasecond = doc.data().time.toDate().getUTCSeconds();
      //if(datamonth == new Date(Date.now()).getUTCMonth() + 1 && datayear == new Date(Date.now()).getUTCFullYear()){
      charges = doc.data();
      charges['time'] = datayear + '-' + datamonth + '-' + datadate + ' ' + datahour + ':' + datamin + ':' + datasecond
      charges['day'] = datadate
      arr.push(charges)
      charges = {}
      //}
  
    });
    for(var i = 0; i < arr.length; i++){
      var snap1= await nextEmployeeRef.doc(arr[i]['payee']['_path']['segments'][1]).get()
      if(snap1.data()['name']==null){
        arr[i]['payee']= snap1.data()['FBname'];
      }else{
        arr[i]['payee']= snap1.data()['name'];
      }
      

      var snap2 = await nextCustomerRef.doc(arr[i]['payer']['_path']['segments'][1]).get()
      if(snap1.data()['name']==null){
        arr[i]['payer']= snap2.data()['FBname'];
      }else{
        arr[i]['payer']= snap2.data()['name'];
      }
      arr[i]['phone'] = snap2.data()['phone'];
    }
    
    arr = arr.sort(function (a, b) {
      return a.day > b.day ? 1 : -1;//
     });
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  } 
});

//////////發送序號//////////
exports.generateCode = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  
  try{
    if(req.method !== "POST") throw 'Please send a POST request'
    var arr=[];
    var point = req.body.point;//鑽石數量
    var quantity = req.body.quantity;//生成數量
    var vipPoint = req.body.vipPoint;//vip點數
  
    for(var i = 0; i<quantity; i++){
      var code = uuidv4();
      var codeRef = db.collection('codes')
      var addDoc = await codeRef.add({
        code : code,
        point : point,
        vipPoint:vipPoint,
        usedStatus : false,//未用過
        sendStatus: false,//發送狀態
        time: new Date(Date.now())
      })
      arr.push(code)
    }
    
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  } 
});
//////////employee發送序號狀態//////////
exports.changeCodeRule = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{
    if(req.method !== "POST") throw 'Please send a POST request'
    var maincode = req.body.code
    var status = req.body.sendStatus
    var codeRef = db.collection('codes')
    var snapshot = await codeRef.where('code', '==', maincode).get();
    var id;
    snapshot.forEach(doc => {
      id = doc.id
      
    })
    var codeRef = db.collection('codes').doc(id);
    let updateSingle = await codeRef.update({sendStatus: status});

    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send('更新成功');
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  } 
});

//////////get all 序號//////////
exports.getCode = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{
    
    var arr=[]
    var codes = {}
    var codeRef = db.collection('codes')
    var snapshot = await codeRef.get();
    
    snapshot.forEach(doc => {
     
      var datamonth = doc.data().time.toDate().getUTCMonth() + 1; //months from 1-12
     
      var datayear = doc.data().time.toDate().getUTCFullYear(); //months from 1-12
      var datadate = doc.data().time.toDate().getUTCDate();
      var datahour = doc.data().time.toDate().getUTCHours();
      var datamin = doc.data().time.toDate().getUTCMinutes();
      var datasecond = doc.data().time.toDate().getUTCSeconds();
      // if(datamonth == new Date(Date.now()).getUTCMonth() + 1 && datayear == new Date(Date.now()).getUTCFullYear()){
     
        codes = doc.data();
       
        codes['date'] = datayear + '-' + datamonth + '-' + datadate + ' ' + datahour + ':' + datamin + ':' + datasecond
        arr.push(codes)
        codes = {}
      // }
     
    })
 
    arr.sort(function(a,b){
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(b.time) - new Date(a.time);
    });
    console.log(arr)
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  } 
});

//////////user輸入序號//////////
exports.inputCode = functions.region('asia-northeast1').https.onRequest(async (req, res) => {

  try{
    
    if(req.method !== "POST") throw 'Please send a POST request'
  
    var userid = req.body.userid;
    var maincode = req.body.code;
    var arr = []
    var obj = {}
    var id1;
    var codeRef = db.collection('codes');
  
    var snapshot = await codeRef.where('code', '==', maincode).get();
    
    var month = new Date(Date.now()).getUTCMonth() + 1; //months from 1-12
    var year = new Date(Date.now()).getUTCFullYear(); //months from 1-12
    var date = new Date(Date.now()).getUTCDate();
    var hour = new Date(Date.now()).getUTCHours();
    var min = new Date(Date.now()).getUTCMinutes();
    var sec = new Date(Date.now()).getUTCSeconds();
    if(snapshot.empty) throw '無此序號!'
  
    snapshot.forEach(doc => {
      obj = doc.data()
      id1=doc.id
      if(obj['usedStatus'] == true){
        throw '此序號已用過'
      }
      arr.push(obj)
      // var datayear = obj['deadline'].toDate().getUTCFullYear(); 
      
      // var datamonth = obj['deadline'].toDate().getUTCMonth() + 1; //months from 1-12
     
      // var datadate = obj['deadline'].toDate().getUTCDate();
     
      // var datahour = obj['deadline'].toDate().getUTCHours();
  
      // var datamin = obj['deadline'].toDate().getUTCMinutes();
      
      // var datasecond= obj['deadline'].toDate().getUTCSeconds();

      // if(datayear<year){//compare year
      //   throw 'It has expired'
      // }else if(datayear>year){
        
      //   arr.push(obj)
      // }else if(datayear = year){
      //   if(datamonth<month){//compare month
      //     throw 'It has expired'
      //   }else if(datamonth>month){
         
      //     arr.push(obj)
      //   }else if(datamonth = month){
      //     if(datadate<date){//compare date
      //       throw 'It has expired'
      //     }else if(datadate>date){
          
      //       arr.push(obj)
      //     }else if(datadate = date){
      //       if(datahour<hour){//compare hour
      //         throw 'It has expired'
      //       }else if(datahour>hour){
            
      //         arr.push(obj)
      //       }else if(datahour = hour){
      //         if(datamin<min){//compare min
      //           throw 'It has expired'
      //         }else if(datamin>min){
            
      //           arr.push(obj)
      //         }else if(datamin = min){
      //           if(datasec<=sec){
      //             throw 'It has expired'
      //           }else if(datasec>sec){
           
      //             arr.push(obj)
      //           }
      //         }
      //       }
      //     }
      //   }
      // }
     
      
    })
    
    var codeRef = db.collection('codes').doc(id1);
    let updateSingle = await codeRef.update({usedStatus: true});

    var id = "";
    var arr1 = [];
    var userRef = db.collection('customer');
  
    var snapshot1 = await userRef.where('userID', '==', userid).get();
    
    if(snapshot1.empty) throw 'No such a user!'
    snapshot1.forEach(doc1 => {
      id = doc1.id
  
      if(typeof doc1.data()['code'] !== 'undefined'){
        
        if(doc1.data()['code'].length>0){
       
          for(var i = 0; i<doc1.data()['code'].length; i++){
            
            if(doc1.data()['code'][i]['code'] == maincode) throw '此序號已被使用過！'//////
          }
        }
      }
      arr1.push(doc1.data())
    })
   
    var arrUnion = await userRef.doc(id).update({
      code: admin.firestore.FieldValue.arrayUnion(arr[0]),
      diamond: arr[0]['point']+arr1[0]['point']
    });
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send('加值成功！');

  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);

  } 

});

//////////佈告欄//////////
exports.addPost = functions.region('asia-northeast1').https.onRequest((req, res) => {
  cors(req, res, () => {
    if(req.method !== "POST") throw "Please send a POST request";
        if(!req.body.description) throw '請提供佈告欄內容！'
        console.log(req.body.description)
        if(!req.body.title) throw '請提供標題！'
        const bulletinRef = db.collection('bulletin');
        var set1 = bulletinRef.add({
          description: req.body.description, time: new Date(Date.now()), title: req.body.title
        }).then(ref => {
          res.status(200).send('成功增加文章');
        })
         .catch(err => {
          res.status(400).send(err);
    });
  })
});

///////////登入紀錄////////////
exports.getUserLoginRecord = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{
 
    let records = {}; 
    let arr = [];
    let userId = req.query.userId;
    
    var loginRef = db.collection('login_record').doc('customer'+userId).collection('record')
   
    var snapshot = await loginRef.get()

    if (snapshot.empty) throw "無相關紀錄"
    
    snapshot.forEach(doc => {
      var datamonth = doc.data().time.toDate().getUTCMonth() + 1; //months from 1-12
      var datayear = doc.data().time.toDate().getUTCFullYear(); //months from 1-12
      var datadate = doc.data().time.toDate().getUTCDate();
      var datahour = doc.data().time.toDate().getUTCHours();
      var datamin = doc.data().time.toDate().getUTCMinutes();
      var datasecond = doc.data().time.toDate().getUTCSeconds();
     
      records = doc.data();
      records['time'] = datayear + '-' + datamonth + '-' + datadate + ' ' + datahour + ':' + datamin + ':' + datasecond
      records['month'] = datadate
      arr.push(records)
      records = {}
      
     
    });
    arr = arr.sort(function (a, b) {
      return a.month > b.month ? 1 : -1;//
     });
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  } 
});

//////交易規則//////
exports.getTransactionRule = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{
 
    let rules = {}; 
    let arr = []; 
    var chargeRuleRef = db.collection('trade_rule').doc('charge_rule')
    var doc = await chargeRuleRef.get()
    if (!doc.exists) {
      throw "無相關規則"
    } else {
      rules = doc.data();
      arr.push(rules)
      rules = {}  
    }
    
    var diamondPointRatioRef = db.collection('trade_rule').doc('diamond_point_ratio')
    var doc = await diamondPointRatioRef.get()
    if (!doc.exists) {
      throw "無相關規則"
    } else {
      rules = doc.data();
      arr.push(rules)
      rules = {}  
    }
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  } 
});

/////用戶組清單//////
exports.getAllUsers = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{
 
    
    let arr = []; 
    var userRef = db.collection('customer')
    var snapshot = await userRef.get()
    if (snapshot.empty) throw "無使用者"
    snapshot.forEach(doc => {
      arr.push(doc.data()) 
    })

    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  } 
});

/////員工組清單//////
exports.getAllEmployees = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{

    let arr = []; 
    var userRef = db.collection('employees')
    var snapshot = await userRef.get()
    if (snapshot.empty) throw "無使用者"
    snapshot.forEach(doc => {
      arr.push(doc.data()) 
    })

    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  } 
});

//////////修改規則//////////
exports.addrule = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{
    
    if(req.method !== "POST") throw "Please send a POST request";
    if(!req.body.contents) throw '請提供內容！'
    if(!req.body.page) throw '請提供修改內容！'
    const specification_rule = db.collection('specification_rule').doc(req.body.page);
    var set1 =  await specification_rule.update({
      contents: req.body.contents
    });
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send('成功修改規則');
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  }
  
});

//////取得規則//////
exports.getworkrule = functions.region('asia-northeast1').https.onRequest((req, res) => {
  try{

    let arr = []; 
    let cityRef = db.collection('specification_rule').doc(req.query.page);
    let getDoc = cityRef.get()
      .then(doc => {
        if (!doc.exists) {
          console.log('No such document!');
        } else {
          res.set('Access-Control-Allow-Origin', '*');
          res.status(200).send(doc.data());
        }
      })
      .catch(err => {
        console.log('Error getting document', err);
      });
    
    
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  } 
  
});

//////////get員工QRC/////////
exports.getstaffQRRecord = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{
    
    var arr=[]
    var transer = {}
    var qr_staff_transfer_record = db.collection('qr_staff_transfer_record')
    var snapshot = await qr_staff_transfer_record.get();
    snapshot.forEach(doc => {
      var datamonth = doc.data().time.toDate().getUTCMonth() + 1; //months from 1-12
      var datayear = doc.data().time.toDate().getUTCFullYear(); //months from 1-12
      var datadate = doc.data().time.toDate().getUTCDate();
      var datahour = doc.data().time.toDate().getUTCHours();
      var datamin = doc.data().time.toDate().getUTCMinutes();
      var datasecond = doc.data().time.toDate().getUTCSeconds();
      //if(datamonth == new Date(Date.now()).getUTCMonth() + 1 && datayear == new Date(Date.now()).getUTCFullYear()){
      transer = doc.data();
      transer['date'] = datayear + '-' + datamonth + '-' + datadate + ' ' + datahour + ':' + datamin + ':' + datasecond
      arr.push(transer);
      transer = {};
      //}
     
    })
    arr.sort(function(a,b){
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(b.time) - new Date(a.time);
    });
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  } 
});

//////////get消費者QRC/////////
exports.getcustomerQRRecord = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{
    
    var arr=[]
    var transer = {}
    var qr_customer_transfer_record = db.collection('qr_customer_transfer_record')
    var snapshot = await qr_customer_transfer_record.get();
    var transer_ = {}
    var qr_charge_record = db.collection('qr_charge_record')
    var snapshot1 = await qr_charge_record.get();
    snapshot.forEach(doc => {
      var datamonth = doc.data().time.toDate().getUTCMonth() + 1; //months from 1-12
      var datayear = doc.data().time.toDate().getUTCFullYear(); //months from 1-12
      var datadate = doc.data().time.toDate().getUTCDate();
      var datahour = doc.data().time.toDate().getUTCHours();
      var datamin = doc.data().time.toDate().getUTCMinutes();
      var datasecond = doc.data().time.toDate().getUTCSeconds();
      //if(datamonth == new Date(Date.now()).getUTCMonth() + 1 && datayear == new Date(Date.now()).getUTCFullYear()){
      transer = doc.data();
      transer['date'] = datayear + '-' + datamonth + '-' + datadate + ' ' + datahour + ':' + datamin + ':' + datasecond
      arr.push(transer)
      transer = {}
      //}
     
    })
    snapshot1.forEach(doc => {
      var datamonth = doc.data().time.toDate().getUTCMonth() + 1; //months from 1-12
      var datayear = doc.data().time.toDate().getUTCFullYear(); //months from 1-12
      var datadate = doc.data().time.toDate().getUTCDate();
      var datahour = doc.data().time.toDate().getUTCHours();
      var datamin = doc.data().time.toDate().getUTCMinutes();
      var datasecond = doc.data().time.toDate().getUTCSeconds();
      //if(datamonth == new Date(Date.now()).getUTCMonth() + 1 && datayear == new Date(Date.now()).getUTCFullYear()){
      transer_ = doc.data();
      transer_['date'] = datayear + '-' + datamonth + '-' + datadate + ' ' + datahour + ':' + datamin + ':' + datasecond
      arr.push(transer_)
      transer_ = {}
      //}
     
    })
    arr.sort(function(a,b){
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(b.time) - new Date(a.time);
    });
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  } 
});

//////////更新設備//////////
exports.modifyComputer = functions.region('asia-northeast1').https.onRequest(async(req, res) => {

  try{
    
    if(req.method !== "POST") throw "Please send a POST request";
    if(!req.body.userid) throw '錯誤ID！'
    if(!req.body.computer) throw '請提供修改內容！'
    const modify_user_computer =  db.collection('customer').doc(req.body.userid);
    var set1 = await modify_user_computer.update({
      computer: req.body.computer
    });
    res.status(200).send('成功修改規則');
  }catch(err){
    res.status(400).send(err);
  }
  });

/////薪轉紀錄//////
exports.getsalaryRecord = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{
    
    var arr=[]
    var salary = {}
    var salary_record = db.collection('salary_record')
    var snapshot = await salary_record.get();
    snapshot.forEach(doc => {
      var datamonth = doc.data().time.toDate().getUTCMonth() + 1; //months from 1-12
      var datayear = doc.data().time.toDate().getUTCFullYear(); //months from 1-12
      var datadate = doc.data().time.toDate().getUTCDate();
      var datahour = doc.data().time.toDate().getUTCHours();
      var datamin = doc.data().time.toDate().getUTCMinutes();
      var datasecond = doc.data().time.toDate().getUTCSeconds();
      //if(datamonth == new Date(Date.now()).getUTCMonth() + 1 && datayear == new Date(Date.now()).getUTCFullYear()){
      salary = doc.data();
      salary['date'] = datayear + '-' + datamonth + '-' + datadate + ' ' + datahour + ':' + datamin + ':' + datasecond
      arr.push(salary);
      salary = {};
      //}
     
    })
    arr.sort(function(a,b){
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(b.time) - new Date(a.time);
    });
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  } 
});


//////////銷帳//////////
exports.writeOff = functions.region('asia-northeast1').https.onRequest(async(req, res) => {    

  try{  
    if(req.method !== "POST") throw "Please send a POST request";
    if(!req.body.phone) throw '錯誤電話！'
    if(!req.body.point) throw '請輸入金額'
    let arr = []; 
    var userRef = db.collection('employees')
    var queryRef = await userRef.where('phone', '==', req.body.phone).get();
     queryRef.forEach(function(doc) {
      var dic = doc.data();
      var amount = dic.point;
      var balance = parseInt(amount-parseInt(req.body.point));
      var id = dic.userID;
      var changePoint = db.collection('employees').doc(id);
      var set1 = changePoint.update({
        point: balance
      });
      const addwriteOff = db.collection('salary_record');
      var set2 =  addwriteOff.add({
            point: balance,
            phone: req.body.phone,
            name: dic.name,
            FBname: dic.FBname,
            writeoffPoint: req.body.point,
            time:FieldValue.serverTimestamp(),
            remark:req.body.remark,
      });
   });
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send('成功銷帳');
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  }
  
});

//////////員工註冊//////////
exports.addemployee = functions.region('asia-northeast1').https.onRequest(async(req, res) => {
  try{
    if(req.method !== "POST") throw "Please send a POST request";
    if(!req.body.phone) throw '請提供電話!'
    const bulletinRef = db.collection('employees');  
    var snapshot1 = await bulletinRef.where('phone', '==', req.body.phone).get();
    if(!snapshot1.empty) throw 'Already have a employee user!'
    const customerRef = db.collection('customer');  
    var snapshot2 = await customerRef.where('phone', '==', req.body.phone).get();
    if(!snapshot2.empty) throw 'Already have a customer user!'
    const bulletinRefSet = await db.collection('employees').doc(); 
    var set1 =  await bulletinRefSet.set({
            userID: bulletinRefSet.id,
            point: 0,
            vip: 0,
            phone: req.body.phone,
            name: null,
            FBname: null,
            photo: null,
            device: null,
            computer: null,
    })
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send('成功新增帳號');
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  }
  
});

//////////員工註銷//////////
exports.deletemployee = functions.region('asia-northeast1').https.onRequest(async(req, res) => {
  try{
    if(req.method !== "POST") throw "Please send a POST request";
    if(!req.body.phone) throw '請提供電話!'
    const employeeAcc = db.collection('employees');  
    var snapshot1 = await employeeAcc.where('phone', '==', req.body.phone).get();
    if(snapshot1.empty) throw '沒有此員工!'
    snapshot1.forEach(doc => {
      doc.ref.delete();
  })

    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send('成功刪除帳號');
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  }
  
});


//////////使用者註銷//////////
exports.deleteUser = functions.region('asia-northeast1').https.onRequest(async(req, res) => {
  try{
    if(req.method !== "POST") throw "Please send a POST request";
    if(!req.body.phone) throw '請提供電話!'
    const employeeAcc = db.collection('customer');  
    var snapshot1 = await employeeAcc.where('phone', '==', req.body.phone).get();
    if(snapshot1.empty) throw '沒有此使用者!'
    snapshot1.forEach(doc => {
      doc.ref.delete();
  })

    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send('成功刪除帳號');
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  }
  
});

//////////轉薪時間範圍//////////
exports.salaryDateTime = functions.region('asia-northeast1').https.onRequest(async(req, res) => {
  try{
    let arr = []; 
    if(!req.query.starTime) throw '請提供起始日期!'
    if(!req.query.endTime) throw '請提供結束日期!'
    const employeeAcc = db.collection('salary_record');  
    let start = new Date(req.query.starTime);
    let end = new Date(req.query.endTime);
    var snapshot1 = await employeeAcc.where("time", ">=", start).where("time", "<=", end).get();
    if(snapshot1.empty) throw '沒有此時間範圍!'
    snapshot1.forEach(doc => {
      arr.push(doc.data());
      console.log(doc.data());
  })
   

    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  }
  
});

//////////查訊帳號//////////
exports.queryAcc = functions.region('asia-northeast1').https.onRequest(async(req, res) => {
  try{
    let arr = []; 
    const queryRef = db.collection(req.query.page);  
    var snapshot1 = await queryRef.where('phone', '==', req.query.phone).get();
    if(snapshot1.empty) throw '沒有此用戶!'
    snapshot1.forEach(doc => {
      arr.push(doc.data());
  })


    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  }
  
});


//////////查訊帳號//////////
exports.queryqrAcc = functions.region('asia-northeast1').https.onRequest(async(req, res) => {
  try{
    let arr = []; 
    const queryRef = db.collection(req.query.page);  
    var snapshot1 = await queryRef.where('userphone', '==', req.query.userphone).get();
    if(snapshot1.empty) throw '沒有此用戶!'
    snapshot1.forEach(doc => {
      arr.push(doc.data());
  })


    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  }
  
});

//////取得規則//////
exports.getbulletin = functions.region('asia-northeast1').https.onRequest(async(req, res) => {
  try{

    let arr = []; 
    var transer = {}
    let bulletinRef = db.collection('bulletin');
    var snapshot = await bulletinRef.get()
    if(snapshot.empty) throw '沒有佈告欄!'
    snapshot.forEach(doc => {
      var datamonth = doc.data().time.toDate().getUTCMonth() + 1; //months from 1-12
      var datayear = doc.data().time.toDate().getUTCFullYear(); //months from 1-12
      var datadate = doc.data().time.toDate().getUTCDate();
      var datahour = doc.data().time.toDate().getUTCHours();
      var datamin = doc.data().time.toDate().getUTCMinutes();
      var datasecond = doc.data().time.toDate().getUTCSeconds();
      //if(datamonth == new Date(Date.now()).getUTCMonth() + 1 && datayear == new Date(Date.now()).getUTCFullYear()){
      transer = doc.data();
      transer['time'] = datayear + '-' + datamonth + '-' + datadate + ' ' + datahour + ':' + datamin + ':' + datasecond
      arr.push(transer)
      transer = {}
      //}
     
    })

    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  } 
  
});

//獲取all儲值紀錄
exports.getAllDepositRecord = functions.region('asia-northeast1').https.onRequest((req, res) => {
   try{
    let arr = [];
    let users = {} ;
    let loadedPosts = {};
    db.collection('customer').get().then((results) => {
      results.forEach((doc) => {
        users[doc.id] = doc.data();
      });
      posts = db.collection('Recharge');
      posts.get().then((docSnaps) => {
        docSnaps.forEach((doc) => {
        var datamonth = doc.data().PaymentDate.toDate().getUTCMonth() + 1; //months from 1-12
        var datayear = doc.data().PaymentDate.toDate().getUTCFullYear(); //months from 1-12
        var datadate = doc.data().PaymentDate.toDate().getUTCDate();
        var datahour = doc.data().PaymentDate.toDate().getUTCHours();
        var datamin = doc.data().PaymentDate.toDate().getUTCMinutes();
        var datasecond = doc.data().PaymentDate.toDate().getUTCSeconds();
        loadedPosts = doc.data();
        loadedPosts['PaymentDate'] = datayear + '-' + datamonth + '-' + datadate + ' ' + datahour + ':' + datamin + ':' + datasecond
        loadedPosts['day'] = datadate
        loadedPosts['phone'] = users[doc.data().CustomerID].phone;
        loadedPosts['FBname'] = users[doc.data().CustomerID].FBname;
        arr.push(loadedPosts);
        loadedPosts = {};
      });
      res.set('Access-Control-Allow-Origin', '*');
      res.status(200).send(arr);
    }); 
});
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  } 
});

//獲取使用者儲值紀錄
exports.QueryDepositRecord = functions.region('asia-northeast1').https.onRequest((req, res) => {
   try{
    let arr = [];
    let users = {} ;
    let loadedPosts = {};
    if(!req.query.phone) throw '請提供電話!'
    db.collection('customer').get().then((results) => {
      results.forEach((doc) => {
        users[doc.id] = doc.data();
      });
      posts = db.collection('Recharge');
      posts.get().then((docSnaps) => {
        docSnaps.forEach((doc) => {
        if(users[doc.data().CustomerID].phone == req.query.phone)
        {
          var datamonth = doc.data().PaymentDate.toDate().getUTCMonth() + 1; //months from 1-12
          var datayear = doc.data().PaymentDate.toDate().getUTCFullYear(); //months from 1-12
          var datadate = doc.data().PaymentDate.toDate().getUTCDate();
          var datahour = doc.data().PaymentDate.toDate().getUTCHours();
          var datamin = doc.data().PaymentDate.toDate().getUTCMinutes();
          var datasecond = doc.data().PaymentDate.toDate().getUTCSeconds();
          loadedPosts = doc.data();
          loadedPosts['PaymentDate'] = datayear + '-' + datamonth + '-' + datadate + ' ' + datahour + ':' + datamin + ':' + datasecond
          loadedPosts['day'] = datadate
          loadedPosts['phone'] = users[doc.data().CustomerID].phone;
          loadedPosts['FBname'] = users[doc.data().CustomerID].FBname;
          arr.push(loadedPosts);
          loadedPosts = {};
        }
        
      });
      res.set('Access-Control-Allow-Origin', '*');
      res.status(200).send(arr);
    }); 
});
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  } 
});


//////////取得總儲值//////////
exports.getRechargeTotal = functions.region('asia-northeast1').https.onRequest(async(req, res) => {
  try{
    let arr = [];
    var recharge = {};
    var total=0;
    var monthTotal=0;
    let dateyear = new Date(Date.now()).getUTCFullYear();
    let datemonth = new Date(Date.now()).getUTCMonth()+1;
    let dateday = new Date(Date.now()).getUTCDate();
    let start = new Date(dateyear+'-'+datemonth+'-'+'01');
    let end = new Date(dateyear+'-'+datemonth+'-'+'31');
    let today = new Date(dateyear+'-'+datemonth+'-'+dateday);
    let todayend = new Date(dateyear+'-'+datemonth+'-'+(dateday+1));
    const employeeAcc = db.collection('Recharge');

    var snapshot1 = await employeeAcc.where("PaymentDate", ">=", today).where("PaymentDate", "<", todayend).get();
    if(snapshot1.empty)
    {
      recharge['RechargeDayTotal'] = 0;
    }
    snapshot1.forEach(doc => {
      if((doc.data().TradeAmount)===+(doc.data().TradeAmount))
      {
        total += doc.data().TradeAmount;
      }      
    })
   recharge['RechargeDayTotal'] = total;
   var snapshot2 = await employeeAcc.where("PaymentDate", ">=", start).where("PaymentDate", "<=", end).get();

   if(snapshot2.empty)
    {
      recharge['RechargeMonthTotal'] = 0;
    }
    snapshot2.forEach(doc => {
      if((doc.data().TradeAmount)===+(doc.data().TradeAmount))
      {
        monthTotal += doc.data().TradeAmount;
        
      }
    })
    recharge['RechargeMonthTotal'] = monthTotal;

    arr.push(recharge);
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  }
  
  
});

//////////取得顧客總轉帳//////////
exports.getCustomerTansferTotal = functions.region('asia-northeast1').https.onRequest(async(req, res) => {
  try{
    let arr = [];
    var total=0;
    var monthTotal=0;
    var transfer = {};
    let dateyear = new Date(Date.now()).getUTCFullYear();
    let datemonth = new Date(Date.now()).getUTCMonth()+1;
    let dateday = new Date(Date.now()).getUTCDate();
    let start = new Date(dateyear+'-'+datemonth+'-'+'01');
    let end = new Date(dateyear+'-'+datemonth+'-'+'31');
    let today = new Date(dateyear+'-'+datemonth+'-'+dateday);
    let todayend = new Date(dateyear+'-'+datemonth+'-'+(dateday+1));
    const employeeAcc = db.collection('customerTransaction');  
    var snapshot1 = await employeeAcc.where("time", ">=", today).where("time", "<", todayend).get();
    if(snapshot1.empty)
    {
      transfer['CustomerTransferDayTotal'] = 0;
    }
    snapshot1.forEach(doc => {
      if((doc.data().transaction_point)===+(doc.data().transaction_point))
      {
        total += doc.data().transaction_point;
      }      
    })
    transfer['CustomerTransferDayTotal'] = total;
   var snapshot2 = await employeeAcc.where("time", ">=", start).where("time", "<=", end).get();

   if(snapshot2.empty)
    {
      transfer['CustomerTransferMonthTotal'] = 0;
    }
    snapshot2.forEach(doc => {
      if((doc.data().transaction_point)===+(doc.data().transaction_point))
      {
        monthTotal += doc.data().transaction_point;
      }      
    })
  transfer['CustomerTransferMonthTotal'] = monthTotal;
    arr.push(transfer);
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  }
  
  
});

//////////取得員工總轉帳//////////
exports.getEmpolyeeTansferTotal = functions.region('asia-northeast1').https.onRequest(async(req, res) => {
  try{
    let arr = [];
    var total=0;
    var monthTotal=0;
    var transfer = {};
    let dateyear = new Date(Date.now()).getUTCFullYear();
    let datemonth = new Date(Date.now()).getUTCMonth()+1;
    let dateday = new Date(Date.now()).getUTCDate();
    let start = new Date(dateyear+'-'+datemonth+'-'+'01');
    let end = new Date(dateyear+'-'+datemonth+'-'+'31');
    let today = new Date(dateyear+'-'+datemonth+'-'+dateday);
    let todayend = new Date(dateyear+'-'+datemonth+'-'+(dateday+1));
    const employeeAcc = db.collection('employeeTransaction');  
    var snapshot1 = await employeeAcc.where("time", ">=", today).where("time", "<", todayend).get();
    if(snapshot1.empty)
    {
      transfer['EmployeeTransferDayTotal'] = 0;
    }
    snapshot1.forEach(doc => {
      if((doc.data().transaction_point)===+(doc.data().transaction_point))
      {
        total += doc.data().transaction_point;
      }      
    })
    transfer['EmployeeTransferDayTotal'] = total;
   var snapshot2 = await employeeAcc.where("time", ">=", start).where("time", "<=", end).get();

   if(snapshot2.empty)
    {
      transfer['EmployeeTransferMonthTotal'] = 0;
    }
    snapshot2.forEach(doc => {
      if((doc.data().transaction_point)===+(doc.data().transaction_point))
      {
        monthTotal += doc.data().transaction_point;
      }      
    })
   transfer['EmployeeTransferMonthTotal'] = monthTotal;
    arr.push(transfer);
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  }
  
  
});

//////////取得總交易//////////
exports.getTansactionTotal = functions.region('asia-northeast1').https.onRequest(async(req, res) => {
  try{
    let arr = [];
    var total=0;
    var monthTotal=0;
    var transction = {};
    let dateyear = new Date(Date.now()).getUTCFullYear();
    let datemonth = new Date(Date.now()).getUTCMonth()+1;
    let dateday = new Date(Date.now()).getUTCDate();
    let start = new Date(dateyear+'-'+datemonth+'-'+'01');
    let end = new Date(dateyear+'-'+datemonth+'-'+'31');
    let today = new Date(dateyear+'-'+datemonth+'-'+dateday);
    let todayend = new Date(dateyear+'-'+datemonth+'-'+(dateday+1));
    const employeeAcc = db.collection('transaction');  
    var snapshot1 = await employeeAcc.where("time", ">=", today).where("time", "<", todayend).get();
    if(snapshot1.empty)
    {
      transction['TranscationDayTotal'] = 0;
    }
    snapshot1.forEach(doc => {
      if((doc.data().transaction_point)===+(doc.data().transaction_point))
      {
        total += doc.data().transaction_point;
      }      
    })
    transction['TranscationDayTotal'] = total;
   var snapshot2 = await employeeAcc.where("time", ">=", start).where("time", "<=", end).get();

   if(snapshot2.empty)
    {
      transction['TranscationMonthTotal'] = 0;
    }
    snapshot2.forEach(doc => {
      if((doc.data().transaction_point)===+(doc.data().transaction_point))
      {
        monthTotal += doc.data().transaction_point;
      }      
    })
    transction['TranscationMonthTotal'] = monthTotal;
    arr.push(transction);
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  }
  
  
});
//////////取得總轉薪//////////
exports.getSalaryTotal = functions.region('asia-northeast1').https.onRequest(async(req, res) => {
  try{
    let arr = [];
    var total=0;
    var monthTotal=0;
    var salary = {};
    let dateyear = new Date(Date.now()).getUTCFullYear();
    let datemonth = new Date(Date.now()).getUTCMonth()+1;
    let dateday = new Date(Date.now()).getUTCDate();
    let start = new Date(dateyear+'-'+datemonth+'-'+'01');
    let end = new Date(dateyear+'-'+datemonth+'-'+'31');
    let today = new Date(dateyear+'-'+datemonth+'-'+dateday);
    let todayend = new Date(dateyear+'-'+datemonth+'-'+(dateday+1));
    const employeeAcc = db.collection('salary_record');  
    var snapshot1 = await employeeAcc.where("time", ">=", today).where("time", "<", todayend).get();
    if(snapshot1.empty)
    {
      salary['SalaryDayTotal'] = 0;
    }
    snapshot1.forEach(doc => {
      if((doc.data().writeoffPoint)===+(doc.data().writeoffPoint))
      {
        total += doc.data().writeoffPoint;
      }      
    })
    salary['SalaryDayTotal'] = total;
   var snapshot2 = await employeeAcc.where("time", ">=", start).where("time", "<=", end).get();

   if(snapshot2.empty)
    {
      salary['SalaryMonthTotal'] = 0;
    }
    snapshot2.forEach(doc => {
      if((doc.data().writeoffPoint)===+(doc.data().writeoffPoint))
      {
        monthTotal += doc.data().writeoffPoint;
      }      
    })
    salary['SalaryMonthTotal'] = monthTotal;
    arr.push(salary);
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).send(err);
  }
  
  
});