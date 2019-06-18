// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
const uuidv4 = require('uuid/v4');
let DateGenerator = require('random-date-generator');
const cors = require('cors')({origin: true});

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
var db = admin.firestore();

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
exports.getUserRecord = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
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
      
      arr[i]['payee']= snap1.data()['firstName']
      var snap2 = await nextCustomerRef.doc(arr[i]['payer']['_path']['segments'][1]).get()
 
      arr[i]['payer']= snap2.data()['firstName']
      
    }
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.status(400).send(err);
  }
});

//獲取員工轉帳紀錄
exports.getEmployeeRecord = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{
    let records = {}; 
    let arr = [];
    let employeeid = req.query.employeeid;  
    console.log(employeeid)
    var employeeRef = db.collection('employees').doc(employeeid)
    var recordRef = db.collection('employeeTransaction')   
    var nextEmployeeRef = db.collection('employees')
    var snapshot = await recordRef.where('payer', '==', employeeRef).get()
    console.log(snapshot.size)
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
      arr[i]['payee']= snap1.data()['firstName']
      var snap2 = await nextEmployeeRef.doc(arr[i]['payer']['_path']['segments'][1]).get()
      arr[i]['payer']= snap2.data()['firstName']   
    }
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.status(400).send(err);
  }
});

//獲取使用者儲值紀錄
exports.getUserRechargeRecord = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{
    let recharges = {}; 
    let arr = []
    let userid = req.query.userid;/////////
    
    var rechargeRef = db.collection('Recharge')
   
    var snapshot = await rechargeRef.where('CustomerID', '==', userid).get()///本月

    if (snapshot.empty) throw "無相關紀錄"
   
    snapshot.forEach(doc => {
     
    
      
        var datamonth = doc.data().PaymentDate.toDate().getUTCMonth() + 1; //months from 1-12
        var datayear = doc.data().PaymentDate.toDate().getUTCFullYear(); //months from 1-12
        var datadate = doc.data().PaymentDate.toDate().getUTCDate();
        var datahour = doc.data().PaymentDate.toDate().getUTCHours();
        var datamin = doc.data().PaymentDate.toDate().getUTCMinutes();
        var datasecond = doc.data().PaymentDate.toDate().getUTCSeconds();
        if(datamonth == new Date(Date.now()).getUTCMonth() + 1 && datayear == new Date(Date.now()).getUTCFullYear()){
          recharges= doc.data();
          recharges['PaymentDate'] = datayear + '-' + datamonth + '-' + datadate + ' ' + datahour + ':' + datamin + ':' + datasecond
          recharges['day'] = datadate
          arr.push(recharges)
          recharges = {}
        }
        
    });
    arr = arr.sort(function (a, b) {
      return a.day > b.day ? 1 : -1;////
     });
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.status(400).send(err);
  } 
});

//獲取all儲值紀錄
exports.getAllRechargeRecord = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  
  try{
    let recharges = {}; 
    let arr = [];
  
    var rechargeRef = db.collection('Recharge')
 
    var snapshot = await rechargeRef.get()///本月
   
    if (snapshot.empty) throw "無相關紀錄"
    
    snapshot.forEach(doc => {
  
        var datamonth = doc.data().PaymentDate.toDate().getUTCMonth() + 1; //months from 1-12
        var datayear = doc.data().PaymentDate.toDate().getUTCFullYear(); //months from 1-12
        var datadate = doc.data().PaymentDate.toDate().getUTCDate();
        var datahour = doc.data().PaymentDate.toDate().getUTCHours();
        var datamin = doc.data().PaymentDate.toDate().getUTCMinutes();
        var datasecond = doc.data().PaymentDate.toDate().getUTCSeconds();
        if(datamonth == new Date(Date.now()).getUTCMonth() + 1 && datayear == new Date(Date.now()).getUTCFullYear()){
          
          recharges = doc.data();
          recharges['PaymentDate'] = datayear + '-' + datamonth + '-' + datadate + ' ' + datahour + ':' + datamin + ':' + datasecond
          recharges['day'] = datadate
          arr.push(recharges);
          console.log(recharges)
          recharges = {};
        }
      
    });

    arr = arr.sort(function (a, b) {
      return a.day > b.day ? 1 : -1;//
     });
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.status(400).send(err);
  } 
});

//獲取各員工向使用者收費紀錄
exports.getUserChargeRecord = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{
 
    let charges = {}; 
    let arr = [];
    let employeeid = req.query.employeeid;
    var employeeRef = db.collection('employees').doc(employeeid)
    var chargeRef = db.collection('transaction')
    var nextEmployeeRef = db.collection('employees')
    var nextCustomerRef = db.collection('customer')
    var snapshot = await chargeRef.where('payee', '==', employeeRef).get()

    if (snapshot.empty) throw "無相關紀錄"
    
    snapshot.forEach(doc => {
     
      var datamonth = doc.data().time.toDate().getUTCMonth() + 1; //months from 1-12
      var datayear = doc.data().time.toDate().getUTCFullYear(); //months from 1-12
      var datadate = doc.data().time.toDate().getUTCDate();
      var datahour = doc.data().time.toDate().getUTCHours();
      var datamin = doc.data().time.toDate().getUTCMinutes();
      var datasecond = doc.data().time.toDate().getUTCSeconds();
      if(datamonth == new Date(Date.now()).getUTCMonth() + 1 && datayear == new Date(Date.now()).getUTCFullYear()){
        charges = doc.data();
        charges['time'] = datayear + '-' + datamonth + '-' + datadate + ' ' + datahour + ':' + datamin + ':' + datasecond
        charges['day'] = datadate
        arr.push(charges)
        charges = {}
      }
  
    });

 
    for(var i = 0; i < arr.length; i++){
      var snap1= await nextEmployeeRef.doc(arr[i]['payee']['_path']['segments'][1]).get()
      arr[i]['payee']= snap1.data()['firstName']
      var snap2 = await nextCustomerRef.doc(arr[i]['payer']['_path']['segments'][1]).get()
      arr[i]['payer']= snap2.data()['firstName']   
    }
    arr = arr.sort(function (a, b) {
      return a.day > b.day ? 1 : -1;//
     });
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
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
    var deadline = req.body.deadline;//2017-06-01
    console.log(point)
    console.log(deadline)
    for(var i = 0; i<quantity; i++){
    var code = uuidv4();
    var codeRef = db.collection('codes')
    var addDoc = await codeRef.add({
      code : code,
      point : point,
      vipPoint:vipPoint,
      deadline : deadline,//時效
      usedStatus : false,//未用過
      sendStatus: false,//發送狀態
      time: new Date(Date.now())
    })
    arr.push(code)
    }
    
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
    res.status(400).send(err);
  } 
});
//////////employee發送序號狀態//////////
exports.generateCode = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{
    if(req.method !== "POST") throw 'Please send a POST request'
    var code = req.body.code
    var status = req.body.sendStatus
    var codeRef = db.collection('codes')
    var snapshot = await codeRef.where('code', '==', maincode).get();
    var id;
    snapshot.forEach(doc => {
      id = doc.id
      
    })
    var codeRef = db.collection('codes').doc(doc.id);
    let updateSingle = await codeRef.update({senddStatus: true});

    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send('更新成功');
  }catch(err){
    res.status(400).send(err);
  } 
});

//////////get all 序號//////////
exports.generateCode = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{
    if(req.method !== "POST") throw 'Please send a POST request'
    var arr=[]
    var code = req.body.code
    var status = req.body.sendStatus
    var codeRef = db.collection('codes')
    var snapshot = await codeRef.get();
    snapshot.forEach(doc => {
      arr.push(doc.data())
    })
    
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(arr);
  }catch(err){
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

      var datayear = obj['deadline'].toDate().getUTCFullYear(); 
      
      var datamonth = obj['deadline'].toDate().getUTCMonth() + 1; //months from 1-12
     
      var datadate = obj['deadline'].toDate().getUTCDate();
     
      var datahour = obj['deadline'].toDate().getUTCHours();
  
      var datamin = obj['deadline'].toDate().getUTCMinutes();
      
      var datasecond= obj['deadline'].toDate().getUTCSeconds();

      if(datayear<year){//compare year
        throw 'It has expired'
      }else if(datayear>year){
        
        arr.push(obj)
      }else if(datayear = year){
        if(datamonth<month){//compare month
          throw 'It has expired'
        }else if(datamonth>month){
         
          arr.push(obj)
        }else if(datamonth = month){
          if(datadate<date){//compare date
            throw 'It has expired'
          }else if(datadate>date){
          
            arr.push(obj)
          }else if(datadate = date){
            if(datahour<hour){//compare hour
              throw 'It has expired'
            }else if(datahour>hour){
            
              arr.push(obj)
            }else if(datahour = hour){
              if(datamin<min){//compare min
                throw 'It has expired'
              }else if(datamin>min){
            
                arr.push(obj)
              }else if(datamin = min){
                if(datasec<=sec){
                  throw 'It has expired'
                }else if(datasec>sec){
           
                  arr.push(obj)
                }
              }
            }
          }
        }
      }
     
      
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

    res.status(400).send(err);

  } 

});

//////////佈告欄//////////
exports.addPost = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  try{
    
    if(req.method !== "POST") throw "Please send a POST request";
    if(!req.body.description) throw '請提供佈告欄內容！'
    if(!req.body.time) throw '請提供日期！'
    if(!req.body.title) throw '請提供標題！'
    const bulletinRef = db.collection('bulletin');
    var set1 = await bulletinRef.add({
      description: req.body.description, time: req.body.time, title: req.body.title
    });
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send('成功增加文章');
  }catch(err){
    res.status(400).send(err);
  }
  
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
    res.status(400).send(err);
  } 
});

//////交易紀錄//////
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
    res.status(400).send(err);
  } 
});