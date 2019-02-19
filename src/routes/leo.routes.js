const express = require('express')
  , router = express.Router();

const timingFS = require('fs');

//This class handles all requests to and from the NOMAD Server for JT
/*
  var soap = require('soap');
  var url = "./nomad_web_service.xml";
  var args = {name: 'value'};
  var fs = require('fs');
*/

//var merchanthelpers = require('./merchanthelpers.js');

const Merchantlocks = require('../models/merchantlocks');
const Tracking = require('../models/tracking');
const MerchantActivities = require('../models/merchantactivities');
const Merchants = require('../models/merchant');
const Locks = require('../models/locks');
const Activitys = require('../models/activitys');
const TrackingStatus = require('../util/constants').TrackingStatus;
const TrackingMode = require('../util/constants').TrackingMode;
const nodeEnv = process.env.NODE_ENV;

console.log("env: " + nodeEnv);
var net = require('net');

var HOST = '127.0.0.1';
var PORT = 6969;

var option = {
    host:'35.161.51.217',
    port: 6969
}

var timingFile = 'perf.csv';
if(nodeEnv === 'perf') {
  timingFS.writeFile(timingFile, "token,timestamp,iterations,elapsedtime,averagetime\n");
}


  // Create a server instance, and chain the listen function to it
  // The function passed to net.createServer() becomes the event handler for the 'connection' event
  // The sock object the callback function receives UNIQUE for each connection
  var tcpServer = net.createServer({allowHalfOpen: true}, function(sock) {

      //Upon a new thread initialize the timers and counters
      var iterCounter = 1;
      var startTime = new Date();
      var timeCounter = [];

      // We have a connection - a socket object is assigned to the connection automatically
      console.log('CreateServer – CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
      var startTime = new Date();
      /*
        All messages from the lock will end with '!'
        Data is received in multiple chunks, so we need to know when the message ends, by looking for the !
      */
      var receivedData = ""; //Buffer for handling received data.
      // Add a 'data' event handler to this instance of socket
      sock.on('data', function(data) {    //Bind environment required to access collections https://stackoverflow.com/questions/21097178/making-tcp-connections-from-meteor-server
          //save time per iteration for logging when socket ends
          //only accessable at perf enviroment
          data = data + '';
          console.log("RECEIVED DATA LENGTH: " + data.length + " - " + data)
          const payloads = data.split("!");
          console.log("Processing payloads: " + (payloads.length - 1));

          payloads.forEach(payload => {
             if(payload.length > 0) {
               var now = new Date();
               HandleIncommingBase64Info(payload);
               if(nodeEnv==="perf") {
                  console.log("------------------ITERATION #: " +  iterCounter + "--------------------------")

                  if(iterCounter++ == 1){
                  //we are on the first iteration
                    console.log("iteration Time: " +(now - startTime)); 
                    timeCounter.push({timeStamp:now,difference:now - startTime});
                  }else{
                    var thisIterationTimeDiff =now - timeCounter[timeCounter.length-1].timeStamp;
                    console.log("iteration Time: " + thisIterationTimeDiff); 
                    timeCounter.push({timeStamp:now,difference:thisIterationTimeDiff});
                  }
               }
             }
          });
      });

      // Add a 'close' event handler to this instance of socket
      sock.on('close', function(data) {
        //log out the timers and counters the socket closes
          console.log('ON CLOSE: ' + sock.remoteAddress +' '+ sock.remotePort);
      });

      // Add a 'close' event handler to this instance of socket
      sock.on('end', function(data) {
          console.log('ON END: ' + sock.remoteAddress +' '+ sock.remotePort);
          if(nodeEnv==="perf"){
            var endTime = new Date();
            var responseTime = endTime-startTime;
            var totalTime = 0 ; //time in milli seconds
            timeCounter.forEach((iter)=>{
              totalTime += iter.difference 
              console.log("ITERTIMES: " + iter.difference)
              console.log("-----------------------------")
            });
            console.log("total number of iterations: " + timeCounter.length);
            var accurateTimingPerIter = totalTime/timeCounter.length;
            timingFS.appendFile(timingFile, "LEOTIMING," + 
                                            endTime + "," + 
                                            timeCounter.length + "," +
                                            (endTime-startTime) + "," +
                                            accurateTimingPerIter + "\n");
            console.log("LEOTIMING: " + endTime + " , "  + (endTime-startTime) + " ms," + "averageTimePerIter: " + accurateTimingPerIter+ "ms." );
        
          }

      });

      sock.on('error', function(err) {
          console.log('ERROR: ' + err);
      });


    });


  tcpServer.listen(PORT, () => {
    console.log('server bound');
  });

  console.log('Server listening on ' + HOST +':'+ PORT);
  //console.log('Server listening on ' + server.address().address +':'+ server.address().port);

  console.log(tcpServer);
  //console.log('Server listening on ' + server.address().address +':'+ server.address().port);
  tcpServer.on('connection', function(sock) {

      console.log('New Connection: ' + sock.remoteAddress +':'+ sock.remotePort + " : " + sock.bufferSize);
      // other stuff is the same from here

      sock.on('close', function(data) {
        console.log("CLOSED!!!")
      });
  });


  ENDPOINT_TEST_TCP_SOCKET = function () {
    return {
      /////////////////////
      // Set Pay As You Go
      /////////////////////
      post: function () {
        console.log("TCP Socket: ")
        var text = this.bodyParams.message;
        var host = this.bodyParams.host || HOST;
        var port = this.bodyParams.port || PORT;


        console.log('Client connecting to: ' + host + ':' + port);

        var tcpClient = new net.Socket();
        tcpClient.connect(port, host, function() {

            console.log('Client CONNECTED TO: ' + host + ':' + port);
            // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
            tcpClient.write(text);

        });

        // Add a 'data' event handler for the client socket
        // data is what the server sent to this socket
        tcpClient.on('data', function(data) {

            console.log('Client DATA: ' + data);
            // Close the client socket completely
            tcpClient.destroy();

        });

        tcpClient.on('error', (e) => {
          console.log("TCP Connection exception ");
          console.error(e);
        });


        // Add a 'close' event handler for the client socket
        tcpClient.on('close', function() {
            console.log('Connection closed');
        });


        return { statusCode: 200, body: {status: 'success', message: 'success'}};

      }
    }
  }


  ENDPOINT_TEST_LOCK_INFO = function () {
    return {
      post: function () {
        console.log("Test Lock Info")
        var base64data = this.bodyParams.data;

        console.log("Incoming data", base64data, " of type ", typeof base64data);
        base64data = base64data + '';

        if(base64data.indexOf("!") != -1){ //Find the exclaimation mark
          base64data = base64data.replace('!',''); //Remove the exclaimation mark!!
        }
        HandleIncommingBase64Info(base64data);

        return { statusCode: 200, body: {status: 'success', message: 'success'}};

      }
    }
  }

  HandleIncommingBase64Info = function(base64data){

      console.log("TEST - Received data from lock: " + base64data);

      //Decoding from base 64
      //https://stackoverflow.com/questions/14573001/nodejs-how-to-decode-base64-encoded-string-back-to-binary
      buf = new Buffer(base64data, 'base64');
      //console.log("Decoded buffer ");
      //console.log(buf);

      var pkt_type = buf.readUInt8(0);
      //console.log("Packet type");
      //console.log(pkt_type) ;

      if(pkt_type == PKT_TYPE.TYPE_GNSS){
          parseGNSSPacket(buf);
      }

      if(pkt_type == PKT_TYPE.TYPE_NETWORK){
          parseNetworkPacket(buf);
      }

      if(pkt_type == PKT_TYPE.TYPE_INFO){
          //parseGNSSPacket(buf);
      }


      if(pkt_type == PKT_TYPE.TYPE_CLOSE_CONN_STOP_TRACKING){
          closeConnectionPacket(buf);
      }


  }

  var PKT_TYPE = {
    TYPE_GNSS: 0,
    TYPE_NETWORK: 1,
    TYPE_INFO: 2,
    TYPE_CLOSE_CONN_STOP_TRACKING : 3,		//Informs the server that the device will disconnect, and tracking has ended
    TYPE_CLOSE_CONN_KEEP_TRACKING : 4,		//Informs the server that the device will disconnect, but will reconnect later to continue tracking

  }

  var LOCK_STATE = {
    LOCK_STARTUP : 0,
    LOCK_LOCKING : 1,
    LOCK_UNLOCKING : 2,
    LOCK_LOCKED : 3,
    LOCK_UNLOCKED : 4,
    LOCK_ERROR : 5,
    LOCK_STALLED : 6,
  }

  var LOCK_STATE = {
    LOCK_STARTUP : 0,
    LOCK_LOCKING : 1,
    LOCK_UNLOCKING : 2,
    LOCK_LOCKED : 3,
    LOCK_UNLOCKED : 4,
    LOCK_ERROR : 5,
    LOCK_STALLED : 6,
  }

  var getLockStateDesc = function(state){
    var state_desc = "";
    switch(state){
      case LOCK_STATE.LOCK_LOCKING:
        state_desc = "Locking";
        break;
      case LOCK_STATE.LOCK_UNLOCKED:
        state_desc = "Unlocked";
        break;
      case LOCK_STATE.LOCK_UNLOCKING:
        state_desc = "Unlocking";
        break;
      case LOCK_STATE.LOCK_LOCKED:
        state_desc = "Locked";
        break;
      case LOCK_STATE.LOCK_ERROR:
        state_desc = "Error";
        break;
    }
    return state_desc;
  }

  var IOT_REASON = {
    MODE_OFF : 0,			// Modem is Off
   	MODE_THEFT : 1,			// Mode when lock is being stolen
   	MODE_PERIOD_A : 2,			// Period A mode
   	MODE_PERIOD_B : 3,			// Period B mode
   	MODE_MANUAL : 4,			// Manual mode. Send commands to the modem through BLE
   	MODE_THEFT_PENDING : 5, 	//When theft mode is requested, but we have not yet successfully connected to the server and entered theft mode
   	MODE_SETUP_LTE : 6,			// Mode when lock is being setup and LTE is being written
   	MODE_STATE_PING : 7,			// Mode when lock is being setup and LTE is being written
   	MODE_THEFT_WAITING_GPS : 8, 		//When theft mode is active, but we have not yet got a valid GPS fix
   	MODE_TRACK_UNLOCK : 9, 		// Tracking every x seconds when unlocked
   	MODE_TRACK_LOCK : 10, 		// Tracking every x seconds when locked
   	MODE_TURNING_OFF : 11,		// Modem is Turning Off
   	MODE_DONE : 12,		// Previous task is done, need to decide which mode to transition to
   	MODE_STATE_PING_WAITING_GPS : 13,	// State Ping is active and we're waiting for gps
   	MODE_SEND_FINAL_GPS : 14,			// Send a final GPS ping
  }

    var getIotReasonDesc = function(reason){
      var reason_desc = "";
      switch(reason){
        case IOT_REASON.MODE_MANUAL:
        reason_desc = "REASON_BLUETOOTH";
          break;

        case IOT_REASON.MODE_THEFT:
        case IOT_REASON.MODE_THEFT_PENDING:
        case IOT_REASON.MODE_THEFT_WAITING_GPS:
        reason_desc = "REASON_THEFT";
          break;
        case IOT_REASON.MODE_PERIOD_A:
        case IOT_REASON.MODE_PERIOD_B:
        reason_desc = "REASON_PERIOD_TRACKING";
          break;
        case IOT_REASON.MODE_STATE_PING:
        case IOT_REASON.MODE_STATE_PING_WAITING_GPS:
        reason_desc = "REASON_STATE_PING";
          break;
        case IOT_REASON.MODE_TRACK_UNLOCK:
        reason_desc = "REASON_UNLOCKED";
          break;
        case IOT_REASON.MODE_TRACK_LOCK:
        reason_desc = "REASON_LOCKED";
          break;

      }
      return reason_desc;
    }


  var parseGNSSPacket = function(buf){
      console.log("Parsing Mac addr");
      var MAC_ADDR_LEN = 6;
      var mac_address = "";

      //Make mac address from bytes. Reverse order of bytes.
      // 66:55:44:33:22:11
      for(var i = 0; i < MAC_ADDR_LEN; i++){
          var byte = i+1;
          var n = buf.readUInt8(byte);

          var hex = n.toString(16);

          //If hex is only 1 character long (eg 5) then we need to add a zero so it becomes 05
          if(hex.length == 1){
            hex = "0" + hex;
          }
          mac_address = hex + mac_address;

          //Don't add ":" on last iteration
          if(i != MAC_ADDR_LEN -1){
              mac_address = ":" + mac_address;
          }
      }
      mac_address = mac_address.toUpperCase();
      console.log(mac_address);


      var reason = buf.readUInt8(7);
      console.log("Packet reason");
      console.log(reason) ;
      var reason_desc = getIotReasonDesc(reason);
      
      var state = buf.readUInt8(8);
      console.log("state");
      console.log(state) ;
      var state_desc = getLockStateDesc(state);

      var bat = buf.readUInt8(9);
      console.log("Battery");
      console.log(bat) ;

      var longitude = buf.readFloatLE(10);
      console.log("longitude");
      console.log(longitude) ;

      var latitude = buf.readFloatLE(14);
      console.log("latitude");
      console.log(latitude) ;


      var uncertainty = buf.readUInt16LE(18);
      console.log("uncertainty");
      console.log(uncertainty);

      var speed = buf.readUInt8(20);
      console.log("speed");
      console.log(speed) ;

      var dir = buf.readUInt8(21);
      console.log("dir");
      console.log(dir) ;


      var num_sat = buf.readUInt8(22);
      console.log("num_sat");
      console.log(num_sat) ;

      var ttff = buf.readUInt8(23);
      console.log("ttff");
      console.log(ttff) ;

                      //mac_address, state_desc, reason_desc, latitude, longitude, battery, carrier, rssi, rat,  speed, direction, num_satellites, uncertainty
      insertLEOActivity(mac_address, state_desc, reason_desc, latitude, longitude, bat,     '',       '',  '',   speed,   dir,      num_sat,        uncertainty  );


  }


  var parseNetworkPacket = function(buf){
      console.log("Parsing Mac addr");
      var MAC_ADDR_LEN = 6;
      var CARRIER_CHAR_LEN = 8;
      var mac_address = "";

      //Make mac address from bytes. Reverse order of bytes.
      // 66:55:44:33:22:11
      for(var i = 0; i < MAC_ADDR_LEN; i++){
          var byte = i+1;
          var n = buf.readUInt8(byte);

          var hex = n.toString(16);

          //If hex is only 1 character long (eg 5) then we need to add a zero so it becomes 05
          if(hex.length == 1){
            hex = "0" + hex;
          }
          mac_address = hex + mac_address;

          //Don't add ":" on last iteration
          if(i != MAC_ADDR_LEN -1){
              mac_address = ":" + mac_address;
          }
      }
      mac_address = mac_address.toUpperCase();
      console.log(mac_address);

      var reason = buf.readUInt8(7);
      console.log("Packet reason");
      console.log(reason) ;
      reason_desc = getIotReasonDesc(reason);

      var state = buf.readUInt8(8);
      console.log("state");
      console.log(state) ;
      state_desc = getLockStateDesc(state);

      var bat = buf.readUInt8(9);
      console.log("Battery");
      console.log(bat) ;

      console.log("Carrier");

      var carrier = "";

      for(var i = 0; i < CARRIER_CHAR_LEN; i++){
          var byte = i+10; //Start at byte 10
          var n = buf.readUInt8(byte);
          carrier = carrier + String.fromCharCode(n);
      }
      console.log(carrier);

      var rssi = buf.readUInt8(18);
      console.log("RSSI");
      console.log(rssi) ;

      var rat = buf.readUInt8(19);
      console.log("RAT");
      console.log(rat) ;

      var ttff = buf.readUInt8(20);
      console.log("ttff");
      console.log(ttff) ;

                        //mac_address, state_desc, reason_desc, latitude, longitude, battery, carrier, rssi, rat, speed, direction, num_satellites, uncertainty
      insertLEOActivity(mac_address, state_desc, reason_desc,    '',     '',          bat,    carrier, rssi, rat);
  }


  var insertLEOActivity = function(mac_address, state_desc, reason_desc, latitude, longitude, battery, carrier, rssi, rat, speed, direction, num_satellites, uncertainty){
    //By default, insert into the merchant activities table (if there is a merchant lock)
    //Or else, insert into the consumer table
    console.log("Insert LEO Activity")
    var merchantlock = Merchantlocks.findOne({lock_serial_no: mac_address}).exec();
    merchantlock.then((lock)=>{
      if(lock){

        console.log("Found merchant lock, inserting merchant activity")

        //Is tracking active?
        var tracking = Tracking.findOne({lock_serial_no : mac_address, tracking_status: TrackingStatus.STATUS_ON}).exec();
        tracking.then((track)=>{
          var tracking_id = "";
          if(track){  //Tracking is already active, so let's increment the number of gps fixes
              console.log("Tracking is already active, so let's increment the number of gps fixes")
              tracking_id = tracking._id;
              if(longitude && latitude){
                Tracking.update(tracking, {
                  $set: {
                    gps_fixes: (tracking.gps_fixes + 1)
                  }})
              }
          }else{ //If no tracking entry, then we create one.
            console.log("no tracking entry, then we create one")
  
              tracking_id = Tracking.create({
                lock_serial_no : mac_address,
                tracking_status: TrackingStatus.STATUS_ON,
                merchantlock: lock._id,
                iot_reason: reason_desc,
                tracking_mode: TrackingMode.MODE_THEFT,
                gps_fixes : ((latitude && longitude) ? 1 : 0),
                carrier: carrier,
                rssi: rssi,
                rat: rat
              });
          }
  
          var data = {
            lock_serial_no : mac_address,
            longitude : longitude,
            latitude : latitude,
            battery_percent : battery,
            msg_desc : state_desc,
            uuid: "leo",
            merchant_id :lock.merchant_id,
            iot : true,
            speed : speed,
            numSatellites : num_satellites,
            direction : direction,
            uncertainty: uncertainty,
            iot_reason : reason_desc,
            tracking_id: tracking_id
          }
  
          // Update merchantlock with lat/long
          if (latitude && longitude) {
            merchanthelpers.update_merchantlock_geolocation(lock, latitude, longitude);
          }
  
          var result = MerchantActivities.create(data);
          var merchant = Merchants.findOne({"_id": lock.merchant_id});
  
          var merchantActivity = MerchantActivities.findOne(result);
  
          //Send a webhook to the merchant
          SendMerchantWebhook(merchantActivity, merchant);
        })
        
    }else{
        console.log("No merchant lock, inserting consumer activity")

        //Check if the lock object exists.
        var lock_id = "";

        var lock = Locks.findOne({serial_no: mac_address, removed: false}).exec();
        var result = lock.then((lockFound)=>{
          if (lockFound) {
            console.log("the found lock: " +lockFound)
            lock_id = lockFound._id;
          } else {
            //No Consumer Lock and No merchant lock!!
            // Don't insert anything
            return;
          }
          var tracking_id = "";
        //Is tracking active?
        var tracking = Tracking.findOne({lock_serial_no : mac_address, tracking_status: TrackingStatus.STATUS_ON}).exec();
        tracking.then((trackFound)=>{
         
          if(trackFound){   //Tracking is already active, so let's increment the number of gps fixes
              console.log("adding a new gps fix to existingtracking doc ....")              
              tracking_id = trackFound._id;
              Tracking.update(trackFound, {
                $set: {
                  gps_fixes: (trackFound.gps_fixes + 1)
                }})
          }else{  // If no tracking entry, then we create one.
            console.log("creating a new tracking doc ....")
              tracking_id = Tracking.create({
                lock_serial_no : mac_address,
                tracking_status: TrackingStatus.STATUS_ON,
                lock_id: lock_id,
                iot_reason: reason_desc,
                tracking_mode: TrackingMode.MODE_THEFT,
                gps_fixes : ((latitude && longitude) ? 1 : 0),
                carrier: carrier,
                rssi: rssi
              });
          }


          //self.userId = "leo";
          //Use default userprofile Id "LEO"
          this.userId = "leo";
          var userProfile_id = "leo";

          Activitys.create({
            lock_serial_no_index:mac_address,
            longitude: longitude,
            latitude: latitude,
            msg_desc : state_desc,
            batteryPercent: battery,
            iot: true,
            direction: direction,
            speed: speed,
            numSatellites: num_satellites,
            uncertainty : uncertainty,
            iot_reason : reason_desc,
            lock_id: lock_id,
            userProfile_id: userProfile_id,
            tracking_id: tracking_id
          });

          if(latitude && longitude && lock_id){
            UpdateLockLocation(lock_id, latitude, longitude);
          }
        })
        })

        
        

    }
    })

  }

    var closeConnectionPacket = function(buf){
        console.log("Close connection packet");

        console.log("Parsing Mac addr");
        var MAC_ADDR_LEN = 6;
        var CARRIER_CHAR_LEN = 8;
        var mac_address = "";

        //Make mac address from bytes. Reverse order of bytes.
        // 66:55:44:33:22:11
        for(var i = 0; i < MAC_ADDR_LEN; i++){
            var byte = i+1;
            var n = buf.readUInt8(byte);

            var hex = n.toString(16);

            //If hex is only 1 character long (eg 5) then we need to add a zero so it becomes 05
            if(hex.length == 1){
              hex = "0" + hex;
            }
            mac_address = hex + mac_address;

            //Don't add ":" on last iteration
            if(i != MAC_ADDR_LEN -1){
                mac_address = ":" + mac_address;
            }
        }
        mac_address = mac_address.toUpperCase();
        console.log(mac_address);

        var reason = buf.readUInt8(7);
        console.log("Packet reason");
        console.log(reason) ;

        var state = buf.readUInt8(8);
        console.log("state");
        console.log(state) ;


        var bat = buf.readUInt8(9);
        console.log("Battery");
        console.log(bat) ;

        closeConnection(mac_address);
    }

    closeConnection = function(mac_address){
      var tracking = Tracking.findOne({lock_serial_no : mac_address, tracking_status: TrackingStatus.STATUS_ON });

      if(tracking){
          Tracking.update(tracking, { $set :{
            tracking_status: TrackingStatus.STATUS_OFF,
            tracking_end_date: new Date(),
          }});
      }
    }

    UpdateLockLocation = function(lock_id, latitude, longitude) {
      console.log("gathered lockid:" +lock_id)
      if (typeof(longitude) === "string") { longitude = Number(longitude); }
      if (typeof(latitude)  === "string") { latitude  = Number(latitude);  }
  
      if(longitude && latitude){
          //Check for valid lat long values
          if (longitude <= 180 && longitude >= -180 && latitude <= 90 && latitude >= -90) {
  
            //Update the location of the lock
            Locks.update({ _id: lock_id }, {$set: {
              location: {
                type : "Point",
                coordinates : [
                    longitude,
                    latitude
                ]
              }
            }});
          }
      }
  
    }

//Mosca MQTT server not neccessary
// We are using TCP instead
/*
  var settings = {
  		port:1883
  		}

  var server = new mosca.Server(settings);

  server.on('ready', function(){

    console.log("ready");

    connectToMqtt();
  });

  server.on('clientConnected', function(client) {
      console.log('client connected', client.id);
  });

  // fired when a message is received
  server.on('published', function(packet, client) {

    var clientId = client != null ? client.id : "";
    console.log('Client ' + clientId + ' Published ' + packet.payload.toString());

  });
*/

/*
  var info = {
    keyPath: '/Users/kyle/Documents/Kyle/backend/backend-cms/private/Test.private.key',
    certPath: '/Users/kyle/Documents/Kyle/backend/backend-cms/private/Test.cert.pem',
    caPath: '/Users/kyle/Documents/Kyle/backend/backend-cms/private/root-CA.crt',
    clientId: '5555654545',
    region: 'us-west-2'
    //host: 'axfdlpa5tv79w.iot.us-west-2.amazonaws.com'
  }*/

  var device;
  var mqtt_options = {
    clientId: '111333555',
    port:1883,
    host: "mqtt://test.linkalock.com"
  };

  var connectToMqtt = function(){
    console.log("Creating AWS Device");
    //Turning off MQTT for the time being
    //We are using TCP Sockets instead

/*
    device = mqtt.connect("mqtt://test.linkalock.com", mqtt_options);

    device.on('message', function(topic, payload) {
        //var payload = JSON.parse(payload.toString());
        console.log(" AWS Test received topic = ");

        console.log(topic);
        console.log(" \n\n\npayload = ");
        console.log(payload);
        console.log(payload.toString());

    });

    device.on('connect',  function(){
        console.log("AWS Connected to Test ....");
        //device.subscribe("$SYS/broker/connection/#");
        //device.subscribe("$SYS/broker/log/#");
        device.subscribe('LINKA/Test');
    });*/
  }



  ENDPOINT_TEST_AWS = function () {
    return {
      /////////////////////
      // Set Pay As You Go
      /////////////////////
      post: function () {

        var data = this.bodyParams.message;
        console.log("Publishing message to MQTT...");
        console.log(data);

        //device.publish('LINKA/Test', data);

        return { statusCode: 200, body: {status: 'success', message: 'success'}};

      }
    }
  }



    // Allows the creation, maintenance, and removal of subscriptions for users
    ENDPOINT_TEST_NOMAD = function () {
      return {
        /////////////////////
        // Set Pay As You Go
        /////////////////////
        post: function () {
          console.log("Nomad Test \n\n\n\n\n");

          var pathUrl = this.bodyParams.path;
          var test = this.bodyParams.test;

          var args = {pageSize: '10', page: "1"};

          var time = new Date();

          var auth = "Basic " + new Buffer("LTM@JTM2M_GB" + ":" + "Spring2018").toString("base64");

          if(!pathUrl){
              path = require('path'),
              pathUrl = path.join(__dirname, './nomad_web_service.xml');
          }

          soap.createClient(pathUrl , { wsdl_headers: {Authorization: auth} }, function(err, client) {
              console.log("Got Client... \n\n\n\n\n");
              console.log("Time elapsed = ", (new Date() - time));

              console.log(err);
              if(client){
                console.log(client);

                  client.setSecurity(new soap.BasicAuthSecurity('LTM@JTM2M_GB', 'Spring2018'));

                  client.getSims(args, function(err, result) {
                    console.log("Got SIM's Result... \n\n\n\n\n");
                      console.log(result);
                      if(result){
                        var ret = result.return;
                        if(ret){
                          console.log("Return:")

                          var oneA = ret[0];
                          if(oneA){
                            console.log("OneA " + oneA.imsi);
                          }

                        }
                      }
                      console.log("Time elapsed = ", (new Date() - time));

                      console.log("Finish... \n\n\n\n\n");
                      console.log(err);

                  });

                  var getSimArg = {"imsi":234500001004851}

                  client.getPrepaidSimInfo(getSimArg, function(err, result) {
                    console.log("Got Prepaid SIM Result... \n\n\n\n\n");
                      console.log(result);
                      if(result){
                        var ret = result.return;

                        if(ret){
                          var bi = ret.bucketInfos;
                          if(bi){
                            console.log("Bucket Infos " + bi);
                            var bi1 = bi[0];
                            if(bi1){
                              console.log(bi1);
                              console.log("bytes available :" + bi1.bytesAvailable)
                            }
                          }
                        }
                      }
                      console.log("Time elapsed = ", (new Date() - time));

                      console.log("Finish... \n\n\n\n\n");
                      console.log(err);

                  });

              }
          });

  /*
            var xml = require('fs').readFileSync('myservice.wsdl', 'utf8');

            //http server example
            var server = http.createServer(function(request,response) {
                response.end('404: Not Found: ' + request.url);
            });

            server.listen(8000);
            soap.listen(server, '/wsdl', myService, xml);

            //express server example
            var app = express();
            //body parser middleware are supported (optional)
            app.use(bodyParser.raw({type: function(){return true;}, limit: '5mb'}));
            app.listen(8001, function(){
                //Note: /wsdl route will be handled by soap module
                //and all other routes & middleware will continue to work
                soap.listen(app, '/wsdl', myService, xml);
            });

  */
          return { statusCode: 200, body: {status: 'success', message: 'success'}};

        }
      }
    };




 /* ==================================================================
  MERCHANT WEB API
  LEO WEB API's
 * ================================================================== */


  ENDPOINT_LEO_TEST_WEBHOOK = function () {
    return {

      post: function () {

        console.log("LEO Test webhook");
        try {
          var merchant = merchanthelpers.check_merchant_by_access_token(this.bodyParams);

          //Check if ip address is whitelisted
          merchanthelpers.check_ip_whitelist_for_merchant(merchant, this.request.connection.remoteAddress);


          var mac_id = this.bodyParams.mac_addr;
          if(!mac_id){
            return { statusCode: 400, body: {status: 'error', message: 'Missing parameters'}};
          }

          this.bodyParams.lock_serial_no = mac_id;
          this.bodyParams.merchant_id = merchant._id;
          var merchantlock = merchanthelpers.check_merchantlock(this.bodyParams, true);

          var lastActivity;

          if(merchantlock){
            //Get the latest merchant activity.
            //We want to get the latest iot activity (meaning that it is sent from the LEO)
            // If this doesnn't exist then we send the latest activity (even if it is non iot)
            //If this doesn't exist then we return a "TEST" lock with a "Test" activity
            lastActivity = MerchantActivities.findOne({
              lock_serial_no: merchantlock.lock_serial_no,
              merchant_id: merchantlock.merchant_id,
              iot: true
            }, {sort: {$natural: -1} }); //Instead of using createdAt, this is too slow (just this line takes 200 ms), so we sort by $natural

            if(!lastActivity){
              lastActivity = MerchantActivities.findOne({
                lock_serial_no: merchantlock.lock_serial_no,
                merchant_id: merchantlock.merchant_id
              }, {sort: {$natural: -1} }); //Instead of using createdAt, this is too slow (just this line takes 200 ms), so we sort by $natural
            }

          }


          if(!lastActivity || !merchantlock){
            lastActivity = MerchantActivities.findOne({
            }, {sort: {$natural: -1} }); //Instead of using createdAt, this is too slow (just this line takes 200 ms), so we sort by $natural
            lastActivity.lock_serial_no = "TEST";
            lastActivity.latitude = 37.783259;
            lastActivity.longitude = -122.405277;
          }

          SendMerchantWebhook(lastActivity, merchant);
          return { statusCode: 200, body: {status: 'success', message: 'Webhook sent'}};
        } catch (e) {
          console.log(e);

          return e;
        }
      }
    }
  }

  ENDPOINT_LEO_TEST_RECEIVE_WEBHOOK = function () {
    return {

      post: function () {
        var data = this.bodyParams;
        console.log(data);
        return { statusCode: 200, body: {status: 'success', message: 'Webhook received'}};
      }
    }
  }

  SendMerchantWebhook = function (merchantActivity, merchant) {

        var url = merchant.webhook;
        var webhookHeaders = merchant.webhook_headers;

        console.log("Sending merchant webhook to " + merchant.webhook);

        if(!merchant.webhook){
          return;
        }

        /*
        {
        date: "2018-08-23T01:09:43.330Z",
        mac_addr : "F9:9F:83:DF:6C:52",
        latitude : 37.78336,
        longitude: -122.40569,
        direction: 140,
        speed: 3,
        uncertainty: 21,
        lock_state: 3,
        battery: 94
        }
        */

        var data = {
          reason: merchantActivity.iot_reason,
          date: merchantActivity.createdAt,
          mac_addr: merchantActivity.lock_serial_no,
          latitude: merchantActivity.latitude,
          longitude: merchantActivity.longitude,
          direction: merchantActivity.direction,
          speed: merchantActivity.speed,
          uncertainty: merchantActivity.uncertainty,
          lock_state: merchantActivity.msg_desc,
          battery: merchantActivity.battery_percent
        }


        HTTP.call('POST', url, {
          data: data,
          headers:webhookHeaders
        }, (error, result) => {

          console.log("Error: ");
          console.log(error);
          console.log("Result:")
          console.log(result);
        });
  }


  ENDPOINT_LEO_GPS_LATEST = function () {
    return {

      post: function () {

        console.log("LEO GPS Latest");

        try {
          var merchant = merchanthelpers.check_merchant_by_access_token(this.bodyParams);

          //Check if ip address is whitelisted
          merchanthelpers.check_ip_whitelist_for_merchant(merchant, this.request.connection.remoteAddress);


          var mac_id = this.bodyParams.mac_addr;
          if(!mac_id){
            return { statusCode: 400, body: {status: 'error', message: 'Missing parameters'}};
          }

          this.bodyParams.lock_serial_no = mac_id;
          this.bodyParams.merchant_id = merchant._id;

          var merchantlock = merchanthelpers.check_merchantlock(this.bodyParams, false);

          //Get the latest merchant activity.
          //We want to get the latest iot activity (meaning that it is sent from the LEO)
          // If this doesnn't exist then we send the latest activity (even if it is non iot)
          //If this doesn't exist then we return an error
          var lastActivity = MerchantActivities.findOne({
            lock_serial_no: merchantlock.lock_serial_no,
            merchant_id: merchantlock.merchant_id,
            iot: true
          }, {sort: {$natural: -1} }); //Instead of using createdAt, this is too slow (just this line takes 200 ms), so we sort by $natural

          if(!lastActivity){
            return { statusCode: 508, body: {status: 'error', message: 'No activities found for this lock'}};
          }

          var data = {
            date: lastActivity.createdAt,
            mac_addr: lastActivity.lock_serial_no,
            latitude: lastActivity.latitude,
            longitude: lastActivity.longitude,
            direction: lastActivity.direction,
            speed: lastActivity.speed,
            uncertainty: lastActivity.uncertainty,
            lock_state: lastActivity.msg_desc,
            battery: lastActivity.battery_percent
          }

          return { statusCode: 200, body: {status: 'success', data: data}};

        } catch (e) {
          console.log(e);
          return e;
        }

      }
    }
  }

  ENDPOINT_LEO_GPS_DATE = function () {
    return {

      post: function () {
        console.log("LEO GPS Date");

        try {
          var merchant = merchanthelpers.check_merchant_by_access_token(this.bodyParams);

          //Check if ip address is whitelisted
          merchanthelpers.check_ip_whitelist_for_merchant(merchant, this.request.connection.remoteAddress);


          var mac_id = this.bodyParams.mac_addr;
          if(!mac_id){
            return { statusCode: 400, body: {status: 'error', message: 'Missing parameters'}};
          }

          var date = this.bodyParams.date;
          if(!date){
            return { statusCode: 400, body: {status: 'error', message: 'Missing parameters'}};
          }

          this.bodyParams.lock_serial_no = mac_id;
          this.bodyParams.merchant_id = merchant._id;

          var merchantlock = merchanthelpers.check_merchantlock(this.bodyParams, false);

          var query = {
            lock_serial_no: merchantlock.lock_serial_no,
            merchant_id: merchantlock.merchant_id,
            iot: true
          };

          // For refresh, allow us to pull only recently changed rows
          query.modifiedAt = {
              $gte: new Date(new Date(date))  // no idea why we need double date
          };
          console.log(query);

          var activities = MerchantActivities.find(query).fetch(); //Instead of using createdAt, this is too slow (just this line takes 200 ms), so we sort by $natural

          var returnData = [];
          //Format the return data with the correct variable names
          activities.forEach(function(activity){
            returnData.push({
              date: activity.createdAt,
              mac_addr: activity.lock_serial_no,
              latitude: activity.latitude,
              longitude: activity.longitude,
              direction: activity.direction,
              speed: activity.speed,
              uncertainty: activity.uncertainty,
              lock_state: activity.msg_desc,
              battery: activity.battery_percent
            });

          });

          return { statusCode: 200, body: {status: 'success', data: returnData}};
        } catch (e) {
          console.log(e);

          return e;
        }

      }
    }
  }


  ENDPOINT_LEO_GPS_REQUEST = function () {
    return {

      post: function () {
        console.log("LEO GPS Request");

        try {
          var merchant = merchanthelpers.check_merchant_by_access_token(this.bodyParams);

          //Check if ip address is whitelisted
          merchanthelpers.check_ip_whitelist_for_merchant(merchant, this.request.connection.remoteAddress);


          var mac_id = this.bodyParams.mac_addr;
          if(!mac_id){
            return { statusCode: 400, body: {status: 'error', message: 'Missing parameters'}};
          }

          this.bodyParams.lock_serial_no = mac_id;
          this.bodyParams.merchant_id = merchant._id;

          var merchantlock = merchanthelpers.check_merchantlock(this.bodyParams, false);

          return { statusCode: 701, body: {status: 'error', message: 'GPS Request Functionality will be added in the future'}};
        } catch (e) {
          console.log(e);

          return e;
        }

      }
    }
  }


  ENDPOINT_LEO_GPS_STOP_TRACKING = function () {
    return {

      post: function () {
        console.log("LEO GPS Stop Tracking");

        try {
          var merchant = merchanthelpers.check_merchant_by_access_token(this.bodyParams);

          //Check if ip address is whitelisted
          merchanthelpers.check_ip_whitelist_for_merchant(merchant, this.request.connection.remoteAddress);


          var mac_id = this.bodyParams.mac_addr;
          if(!mac_id){
            return { statusCode: 400, body: {status: 'error', message: 'Missing parameters'}};
          }

          this.bodyParams.lock_serial_no = mac_id;
          this.bodyParams.merchant_id = merchant._id;

          var merchantlock = merchanthelpers.check_merchantlock(this.bodyParams, false);

          return { statusCode: 701, body: {status: 'error', message: 'Stop Tracking Functionality will be added in the future'}};
        } catch (e) {
          console.log(e);

          return e;
        }
      }
    }
  }


  ENDPOINT_LEO_COMMAND_LOCK = function () {
    return {

      post: function () {

        console.log("LEO Command lock");

        try {
          var merchant = merchanthelpers.check_merchant_by_access_token(this.bodyParams);

          //Check if ip address is whitelisted
          merchanthelpers.check_ip_whitelist_for_merchant(merchant, this.request.connection.remoteAddress);


          var mac_id = this.bodyParams.mac_addr;
          if(!mac_id){
            return { statusCode: 400, body: {status: 'error', message: 'Missing parameters'}};
          }

          this.bodyParams.lock_serial_no = mac_id;
          this.bodyParams.merchant_id = merchant._id;

          var merchantlock = merchanthelpers.check_merchantlock(this.bodyParams, false);

          return { statusCode: 701, body: {status: 'error', message: 'LEO Remote Lock Functionality will be added in the future'}};
        } catch (e) {
          console.log(e);

          return e;
        }
      }
    }
  }

  ENDPOINT_LEO_COMMAND_UNLOCK = function () {
    return {

      post: function () {

        console.log("LEO Command unlock");

        try {
          var merchant = merchanthelpers.check_merchant_by_access_token(this.bodyParams);

          //Check if ip address is whitelisted
          merchanthelpers.check_ip_whitelist_for_merchant(merchant, this.request.connection.remoteAddress);


        var mac_id = this.bodyParams.mac_addr;
        if(!mac_id){
          return { statusCode: 400, body: {status: 'error', message: 'Missing parameters'}};
        }

          return { statusCode: 701, body: {status: 'error', message: 'LEO Remote Unlock Functionality will be added in the future'}};
        } catch (e) {
          console.log(e);

          return e;
        }
      }
    }
  }

  ENDPOINT_LEO_COMMAND_SIREN = function () {
    return {

      post: function () {
        console.log("LEO Command siren");

        try {
          var merchant = merchanthelpers.check_merchant_by_access_token(this.bodyParams);

          //Check if ip address is whitelisted
          merchanthelpers.check_ip_whitelist_for_merchant(merchant, this.request.connection.remoteAddress);


        var mac_id = this.bodyParams.mac_addr;
        if(!mac_id){
          return { statusCode: 400, body: {status: 'error', message: 'Missing parameters'}};
        }

          return { statusCode: 701, body: {status: 'error', message: 'LEO Remote Siren Functionality will be added in the future'}};
        } catch (e) {
          console.log(e);

          return e;
        }
      }
    }
  }
  ENDPOINT_LEO_COMMAND_SLEEP = function () {
    return {

      post: function () {
        console.log("LEO Command sleep");


        try {
          var merchant = merchanthelpers.check_merchant_by_access_token(this.bodyParams);

          //Check if ip address is whitelisted
          merchanthelpers.check_ip_whitelist_for_merchant(merchant, this.request.connection.remoteAddress);


        var mac_id = this.bodyParams.mac_addr;
        if(!mac_id){
          return { statusCode: 400, body: {status: 'error', message: 'Missing parameters'}};
        }

          return { statusCode: 701, body: {status: 'error', message: 'LEO Remote Sleep Functionality will be added in the future'}};
        } catch (e) {
          console.log(e);

          return e;
        }
      }
    }
  }


  ENDPOINT_LEO_FETCH_ACCESS_TOKEN = function () {
    return {

      post: function () {
        console.log("Merchant API - LEO Fetch Access Token");
        try {

          var merchant = merchanthelpers.check_merchant_by_api_key(this.bodyParams);

          //Check if ip address is whitelisted
          merchanthelpers.check_ip_whitelist_for_merchant(merchant, this.request.connection.remoteAddress);

          console.log("Check finished");

          merchant = merchanthelpers.upsert_for_merchant_access_token(merchant);

          //Only return the access token, and access token expiry fields
          var returnData = {
            access_token : merchant.access_token,
            access_token_expireAt : merchant.access_token_expireAt,
            name : merchant.name
          }

          return {statusCode: 200, body: {status: 'success', data: returnData}};
        } catch (e) {
          console.log(e);

          return e;
        }
      }
    }
  }

  ENDPOINT_LEO_TEST_ACCESS_TOKEN = function () {
    return {

      post: function () {
        try {
          var merchant = merchanthelpers.check_merchant_by_access_token(this.bodyParams);

          //Check if ip address is whitelisted
          merchanthelpers.check_ip_whitelist_for_merchant(merchant, this.request.connection.remoteAddress);

          //Only return the access token, and access token expiry fields
          var returnData = {
            access_token : merchant.access_token,
            access_token_expireAt : merchant.access_token_expireAt,
            name : merchant.name
          }

          return {statusCode: 200, body: {status: 'success', data: returnData}};
        } catch (e) {
          console.log(e);

          return e;
        }
      }
    }
  }

  ENDPOINT_LEO_DEVICE_ACTIVATE = function () {
    return {

      post: function () {
        try {
          var merchant = merchanthelpers.check_merchant_by_access_token(this.bodyParams);

          //Check if ip address is whitelisted
          merchanthelpers.check_ip_whitelist_for_merchant(merchant, this.request.connection.remoteAddress);

          var mac_id = this.bodyParams.mac_addr;
          if(!mac_id){
            return { statusCode: 400, body: {status: 'error', message: 'Missing parameters'}};
          }

          return { statusCode: 701, body: {status: 'error', message: 'LEO Activation Functionality will be added in the future'}};

        } catch (e) {
          console.log(e);

          return e;
        }

      }
    }
  }

  ENDPOINT_LEO_DEVICE_DATA = function () {
    return {

      post: function () {
        try {
          var merchant = merchanthelpers.check_merchant_by_access_token(this.bodyParams);

          //Check if ip address is whitelisted
          merchanthelpers.check_ip_whitelist_for_merchant(merchant, this.request.connection.remoteAddress);


        var mac_id = this.bodyParams.mac_addr;
        if(!mac_id){
          return { statusCode: 400, body: {status: 'error', message: 'Missing parameters'}};
        }

          return { statusCode: 701, body: {status: 'error', message: 'Device Data Functionality will be added in the future'}};
        } catch (e) {
          console.log(e);

          return e;
        }

      }
    }
  }


  ENDPOINT_MERCANT_CSV_DATA = function () {
    return {

      post: function () {
        try {

          //Check if ip address is whitelisted
          var merchant = merchanthelpers.check_merchant_by_access_token(this.bodyParams);

          var startDate = this.bodyParams.startDate;
          var endDate = this.bodyParams.endDate;

          /*
          Rental id
          bike number
          fare
          start date
          end date
          user name
          user email
          start longitude
          end longitude
          plan


          */

          var query = {
            merchant_id: merchant._id,
            fare_canceled : false,
            reservation_start_date: null,
            createdAt : {
                $gte: new Date(new Date(startDate))  // no idea why we need double date
            },
            modifiedAt : {
                $lte: new Date(new Date(endDate))  // no idea why we need double date
            }
          }

          var rentals = Rentals.find(query).fetch();

          var csvString = "Rental Id, Lock Number, Start Date, End Date, Name, Email, Fare, Plan, Starting Latitude, Starting Longitude, Ending Latitude, Ending Longitude";

          rentals.forEach(function(rental){

            var rental_id = rental._id;
            var total_fare = rental.total_fare_formatted ? rental.total_fare_formatted : 0;
            var plan_type = rental.plan_type ? rental.plan_type : "free";
            var user_name = rental.name;
            var user_email = rental.user_email;

            var lock_number = 0;
            var startingLoc, endingLoc;
            var startDate, endDate;

            var locks = rental.locks;
            if(locks){
              lock = locks[0];
              lock_number = lock.merchantlock_lock_number;

              if(lock.starting_location && lock.ending_location){
                startingLoc = lock.starting_location.coordinates[1] + "," + lock.starting_location.coordinates[0];
                endingLoc = lock.ending_location.coordinates[1] + "," + lock.ending_location.coordinates[0];
              }

              startDate = lock.start_date;
              endDate = lock.end_date;
            }else{
              lock_number = rental.merchantlock_lock_number;
              endDate = rental.end_date;
              startDate = rental.start_date;
              if(rental.starting_location && rental.ending_location){

                startingLoc = rental.starting_location.coordinates[1] + "," + rental.starting_location.coordinates[0];
                endingLoc = rental.ending_location.coordinates[1] + "," + rental.ending_location.coordinates[0];
              }

            }


            var newString = "";
            newString = "\n" + rental_id + "," + lock_number + "," + startDate + "," +
              endDate + "," + user_name + "," + user_email + "," + total_fare + "," + plan_type + "," +
              startingLoc + "," + endingLoc;

            csvString = csvString + newString;

          });
          console.log(csvString);

          fs.writeFile("/Users/kyle/Documents/test.csv", csvString, function(err) {
          if(err) {
              return console.log(err);
          }

            console.log("The file was saved!");
          });



          return { statusCode: 200, body: {status: 'success', message: 'success'}};

        }catch(e){
          console.log(e);
          return e;
        }

      }
    }
  }

  ENDPOINT_MERCANT_LOCKS_CSV = function () {
    return {

      post: function () {
        try {

          //Check if ip address is whitelisted
          var merchant = merchanthelpers.check_merchant_by_access_token(this.bodyParams);

          var startDate = this.bodyParams.startDate;
          var endDate = this.bodyParams.endDate;

          /*
          Rental id
          bike number
          fare
          start date
          end date
          user name
          user email
          start longitude
          end longitude
          plan


          */

          var query = {
            merchant_id: "ZCwZXZWChah9km5Rr",
          }

          var rentals = Merchantlocks.find(query).fetch();

          var csvString = "Lock Serial No, IMSI";

          rentals.forEach(function(rental){

            var lock_serial_no = rental.lock_serial_no;
            var sim = Sims.findOne({lock_serial_no: lock_serial_no});
            var imsi = 0;
            if(sim){
               imsi = sim.imsi;
            }

            var newString = "";
            newString = "\n" + lock_serial_no + "," + imsi;

            csvString = csvString + newString;

          });
          console.log(csvString);

          fs.writeFile("/Users/kyle/Documents/test.csv", csvString, function(err) {
          if(err) {
              return console.log(err);
          }

            console.log("The file was saved!");
          });



          return { statusCode: 200, body: {status: 'success', message: 'success'}};

        }catch(e){
          console.log(e);
          return e;
        }

      }
    }
  }

module.exports = router;

