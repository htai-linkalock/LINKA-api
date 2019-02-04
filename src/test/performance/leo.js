var net = require('net');
var fs = require('fs');
var CONFIG = require('./scenario.json');

/* just do "node leo_test.js" */
var optionDigitalOcean = {
    host: CONFIG.ADDRESS,
    port: CONFIG.PORT
}

var optionAws = {
    host: CONFIG.ADDRESS_AWS,
    port: CONFIG.PORT
}
var args = process.argv.slice(2);

fs.writeFile('LEO_Test.log', 'Digital Ocean Tests: \r\n', function (err) {
if (err) throw err;
console.log('Created Log file');
});
	
const digitalOceanFile = fs.createWriteStream('./LEO_DigitalOcean_Test.log', {
	flags: 'a' //flags: 'a' preserved old data
})

console.log("START: " + new Date());
digitalOceanFile.write("START: " + new Date() + '\r\n')	
var beginTime;
var option = optionDigitalOcean;
startTest(digitalOceanFile);


//start the testing function
function startTest (writeFile){
	/* first start all connections */
	var connections = [];
	connect(0, () => {
		/* then send */
		console.log("got connections: " + connections.length);
		writeFile.write('got connections: ' + connections.length + '\r\n')
		beginTime = new Date();
		console.log("BEGIN: " + beginTime)
		writeFile.write("BEGIN: " + beginTime + '\r\n')

		for(var threadId = 0; threadId < CONFIG.THREADS; threadId++) {
			send(connections[threadId], threadId, 0, CONFIG.ITER);
		}	
});


function connect(threadId, callback) {
	
	if(threadId >= CONFIG.THREADS) {
		return callback();
	}
	var startConnect = new Date();
		var client = net.createConnection(option, () => {
			var gotConnect = new Date();
			//console.log("createConnection: " + threadId + " (ms): " + (gotConnect - startConnect));
			connections.push(client);
			client.on("data", function(data) {
				console.log(" threadId (" + threadId + "): data");
				writeFile.write(" threadId (" + threadId + "): data" + '\r\n')

			})
			client.on("end", function(data) {
				console.log(" threadId (" + threadId + "): end");
				writeFile.write(" threadId (" + threadId + "): end" + '\r\n')

			})
			client.on("close", function(data) {
				console.log(" threadId (" + threadId + "): close");
				writeFile.write(" threadId (" + threadId + "): close" + '\r\n')
			})
			connect(threadId + 1, callback);
		});
}

function send(client, threadId, i, last) {
	if(i >= last) {
		if(threadId >= CONFIG.THREADS - 1) {
			var endTime = new Date();
			var totalWait = CONFIG.ITER * CONFIG.WAIT;
			var totalTime = endTime - beginTime;
			console.log("Gross elapsed (ms): " + totalTime);
			console.log("Threads: " + CONFIG.THREADS + " Iters: " + CONFIG.ITER);
			console.log("Net elapsed (ms): " + (totalTime - totalWait));
			writeFile.write(
				"Gross elapsed (ms): " + totalTime + '\r\n' +
				"Threads: " + CONFIG.THREADS + " Iters: " + CONFIG.ITER + '\r\n' +
				"Net elapsed (ms): " + (totalTime - totalWait)+ '\r\n' 
			);
			process.exit();
		}
		return;
	}

	setTimeout(function() {
	  var begin = new Date();
      console.log(i + " threadId (" + threadId + "): " + CONFIG.PAYLOAD);
      client.write(CONFIG.PAYLOAD);
      //console.log(i + " threadId (" + threadId + "): " + CONFIG.PAYLOAD + " " + (new Date() - begin) + " ms");
      send(client, threadId, i+1, last)
	}, CONFIG.WAIT)
}
}
