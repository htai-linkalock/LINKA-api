var net = require('net');

var CONFIG = require('./scenario.json');

/* just do "node leo_test.js" */
var option = {
    host: CONFIG.ADDRESS,
    port: CONFIG.PORT
}
var startTime = new Date();
console.log("START: " + startTime)
var beginTime;
var threadTimings = [];
/* first start all connections */
var connections = [];
connect(0, () => {
	/* then send */
	console.log("got connections: " + connections.length);
	beginTime = new Date();
	console.log("BEGIN: " + beginTime)
	for(var threadId = 0; threadId < CONFIG.THREADS; threadId++) {
		send(connections[threadId], threadId, 0, CONFIG.ITER);
	}	
});
var threadCreationTimings = [];
var timeCreationDiffs = [];

function connect(threadId, callback) {
	if(threadId >= CONFIG.THREADS) {
		return callback();
	}
	var startConnect = new Date();
	var client = net.createConnection(option, () => {
		if(threadCreationTimings.length == 0){
			var now =  new Date();
			threadCreationTimings.push(now);
			timeCreationDiffs.push(now -startTime)
		}else{
			var now = new Date();
			var perviousTiming = threadCreationTimings[threadCreationTimings.length-1];
			threadCreationTimings.push(now);
			timeCreationDiffs.push((now - perviousTiming))
		}
		
		var gotConnect = new Date();
		//console.log("createConnection: " + threadId + " (ms): " + (gotConnect - startConnect));
		connections.push(client);
		client.on("data", function(data) {
			console.log(" threadId (" + threadId + "): data");
		})
		client.on("close", function(data) {
			console.log(" threadId (" + threadId + "): data: " +data);

		})
		client.on("end", function(data) {

		})
		
		client.on("error", function(err) {
			
		})
	    connect(threadId + 1, callback);
	});
}
var timeDiffs = [];
function send(client, threadId, i, last) {
	
	if(i == 0 && threadId == 0){
		var now =  new Date();
		//console.log("threadTiming1: " + (now -beginTime));
		threadTimings.push(now);
		timeDiffs.push(now -beginTime)
	}else if (i != 0 &&threadId == 0){
		var now = new Date();
		var perviousTiming = threadTimings[threadTimings.length-1];
		//console.log("threadTiming: " + ((now - perviousTiming) -500))
		threadTimings.push(now);
		timeDiffs.push((now - perviousTiming))
	}
	else {
		var now = new Date();
		var perviousTiming = threadTimings[threadTimings.length-1];
		//console.log("threadTiming: " + ((now - perviousTiming)))
		threadTimings.push(now);
		timeDiffs.push((now - perviousTiming))
	}
	if(i >= last) {
		if(threadId >= CONFIG.THREADS - 1) {	
			var endTime = new Date();
			var totalWait = CONFIG.ITER * CONFIG.WAIT;
			var totalTime = endTime - beginTime;
			var timingsSum = timeDiffs.reduce((total,num)=>{return total+num;});
			var timingsCreationSum = timeCreationDiffs.reduce((total,num)=>{return total+num;});
			console.log(timingsCreationSum + " out of " + CONFIG.THREADS)
			console.log("average thread Creation time: " + (timingsCreationSum/(CONFIG.THREADS)) + "ms");			
			console.log("Gross elapsed (ms): " + totalTime);	
			console.log("Threads: " + CONFIG.THREADS + " Iters: " + CONFIG.ITER);	
			console.log("Net elapsed (ms): " + (totalTime - totalWait));
			
		}
		return;
	}

	setTimeout(function() {
	  var begin = new Date();
      //console.log(i + " threadId (" + threadId + "): " + CONFIG.PAYLOAD);
      client.write(CONFIG.PAYLOAD);
      console.log(i + " threadId (" + threadId + "): " + CONFIG.PAYLOAD + " " + (new Date() - begin) + " ms");
      send(client, threadId, i+1, last)
	}, CONFIG.WAIT)
}