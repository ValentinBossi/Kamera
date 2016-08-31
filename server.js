var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var morgan = require("morgan");
var path = require("path");
var exec = require('child_process').exec;
var fs = require('fs');
var bodyParser = require("body-parser");
var df = require("node-df");
const spawn = require('child_process').spawn;

app.use(express.static(path.resolve(__dirname, "public")));

app.use('/vorschau', express.static(__dirname + '/public'));

var
	options = {
		file: '/home',
		prefixMultiplier: 'MB',
		isDisplayPrefixMultiplier: true,
		precision: 2
	};

df(options, function (error, response) {
	if (error) {
		throw error;
	}

	console.log(JSON.stringify(response, null, 2));
});

var tmpCounter = 0;
var medienOrdnerInhalt = [];
var picToCopyString;
var gesicherteMedien = [];
var zuKopierendeMedien = [];

// wenn von mount ein String zurück kommt, ist ein Stick eingesteckt
// TO-DO: checken, ob Stick Fat32 ist
var usbOK = false;
var kameraOK = true;
var fotoMachen = false;
var videoMachen = false;
var kopieren = false;


var systemStatus = {
	usbOK: usbOK,
	kameraOK: kameraOK,
	fotoMachen: fotoMachen,
	videoMachen: videoMachen,
	kopieren: kopieren,
	medien: medienOrdnerInhalt
};
var pathToMediaFolder = '/home/pi/git/Kamera/public/pictures/';
var arrayOfPictures;
var objectOfPicturesArray = [];
var usbStick = "/media/usb0";

//Makes this entries array available in all views
app.locals.systemStatus = systemStatus;

var args = ["-t", "0", "-k", "-o", pathToMediaFolder+"bild%02d.jpg", "-v"]
const child = spawn('raspistill', args);

var usbCheck = function () {
	exec('mount | grep "/media/usb0"', function (error, stdout, stderr) {
		if (stdout.length > 0) {
			systemStatus.usbOK = true;
		} else {
			systemStatus.usbOK = false;
		}
		//console.log('stdout ' + stdout);
		//console.log('stderr ' + stderr);
		if (error !== null) {
			console.log('exec error mount: ' + error);
			systemStatus.usbOK = false;
		}
	});
}
usbCheck();

var zeitstempel = function () {
	full = new Date();
	datum = full.toLocaleDateString().replace(/\//g, "_");
	datum
	zeit = full.toLocaleTimeString();
	zeit = zeit.substring(0, zeit.indexOf(' PM')).replace(/:/g, "_");
	return datum + "_" + zeit;;
};

app.set("view engine", "ejs");

app.set("views", path.resolve(__dirname, "views"));

app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(morgan("short"));

// index page 
app.get('/', function (req, res) {
	//usbCheck();
	setTimeout(function () {
		res.render('pages/index');
	}, 50)
});

io.on('connection', function (client) {
	console.log('Kamera connected...');
	

	client.on('kopierenStarten', function (data) {

		if (data.status === "start") {
			zuKopierendeMedien = medienOrdnerInhalt;
		}

		console.log("kopierenStarten!", data);
		console.log(zuKopierendeMedien);

		if (zuKopierendeMedien.length > 0) {
			bildZumKopieren = zuKopierendeMedien.pop().name;
			console.log("kopieren!", data.status);
			bild = pathToMediaFolder + bildZumKopieren;
			exec("cp " + bild + " " + usbStick, function (error, stdout, stderr) {

				console.log('stdout ' + stdout);
				console.log('stderr ' + stderr);

				if (error !== null) {
					console.log('exec error copy to usb stick: ' + error);
				} else {
					client.emit('hatKopiert', bildZumKopieren);
					console.log("bild wurde kopiert!", bildZumKopieren);
				}
			});
		} else {
			client.emit('hatKopiert', "ende");
			console.log("nicht kopieren!", data.status);
		}
	});

	client.on('fotoMachen', function () {
		//console.log(data);
		child.stdin.write("\n");
		/**
		setTimeout(function () {
			child.stdin.write("\n");
			setTimeout(function () {
				child.stdin.write("X\n");
			}, 5000);
		}, 10000);**/

		child.on('error', (err) => {
			console.log('Failed to start child process.' + err);
			//client.emit('fotoMachen', {"status": "error", "message": err});
		});
		
		/** stout wird von raspistill nicht verwendet! kein output!
		child.stdout.on('data', (data) => {
			child.stdin.write(data);
			client.emit('fotoMachen', {
				"status": "stdout",
				"message": data
			});
		});**/
		
		// stderr wird von raspistill als standart output verwendet! anstatt stdout! 
		var i = 0;
		child.stderr.on('data', (data) => {
			
			console.log(`raspistill stderr: ${data}`);
			console.log("ausgegeben:::::::::::::::::",i);
			if(data.includes("Opening output")){
				var words = data.toString().split(" ");
				var file = words[3];
				var tree = file.split("/");
				var tree2 = tree[7].split("\n");
				console.log(tree2[0]);
				client.emit('fotoMachen', tree2[0]);
			}
			i++;
			/**
			if(data.toString().includes("Opening output")){
				client.emit('fotoMachen', data.toString());
			}
			if(data.toString().includes("Finished capture")){
				client.emit('fotoMachen', data.toString());
			}**/
			//client.emit('fotoMachen', {"status": "stderr", "message": data});
		});

		child.on('close', (code) => {
			if (code !== 0) {
				console.log(`raspistill process exited with code ${code}`);
				//client.emit('fotoMachen', {"status": "close", "message": code});
			}
		});
	});
	
	client.on('status', function(){
		client.emit('status', systemStatus);
	});

});


app.get('/vorschau', function (reg, res) {
	usbCheck();
	fs.readdir(pathToMediaFolder, function (err, list) {
		medienOrdnerInhalt = [];
		list.forEach(function (pic) {
			medienOrdnerInhalt.push({
				name: pic
			});
		});
		console.log(systemStatus);
		console.log(medienOrdnerInhalt);
		app.locals.pictures = medienOrdnerInhalt;
		// um usbCheck() erkennen zu koennen!
		setTimeout(function () {
			res.render('pages/vorschau');
		}, 100)
	});
});

app.get('/vorschau/:picture', function (reg, res) {
	res.download(pathToMediaFolder + reg.params.picture);
});

app.post('/pictureToDelete', function (reg, res) {

	var picture = Object.keys(reg.body);
	var picString = picture.toString();
	var pathToPicture = pathToMediaFolder + picString;

	//node MUSS mit sudo ausgeführt werden, um .AppleDouble löschen zu können!
	//habe -rf hinzugefügt, da .AppleDouble (auf raspi zero) so gelöscht werden konnte. ohne -rf nicht!
	exec('rm -rf ' + pathToPicture, function (error, stdout, stderr) {

		console.log('stdout ' + stdout);
		console.log('stderr ' + stderr);
		if (error !== null) {
			console.log('exec error rm: ' + error);
		}
		console.log("aaaaaaaaaaaaaaaa: rm -rf " + pathToPicture);

		fs.readdir(pathToMediaFolder, function (err, list) {
			medienOrdnerInhalt = [];
			list.forEach(function (pic) {
				medienOrdnerInhalt.push({
					name: pic
				});
			});

			app.locals.pictures = medienOrdnerInhalt;

			res.json(medienOrdnerInhalt);
			console.log(medienOrdnerInhalt);
		});

	});

});

app.post('/datentraegerAuswerfen', function (req, res) {

	exec('sudo umount /media/usb0', function (error, stdout, stderr) {

		console.log('stdout ' + stdout);
		console.log('stderr ' + stderr);
		if (error !== null) {
			console.log('exec error umount: ' + error);
			res.send("false");
		} else {
			res.send("true");
			systemStatus.usbOK = false;
		}
	});
});

//console.log(fs.createReadStream('test.log').pipe(fs.createWriteStream('newLog.log')));


server.listen(3000);