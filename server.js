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

//app.use(express.static(path.resolve(__dirname, "/public")));

app.use('/', express.static(__dirname + '/public'));

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
var fotoZaehler = 0;

// wenn von mount ein String zurück kommt, ist ein Stick eingesteckt
// TO-DO: checken, ob Stick Fat32 ist


var systemStatus = {
	usbOK: false,
	kameraOK: true,
	fotoMachen: false,
	videoMachen: false,
	kopieren: false,
	medien: medienOrdnerInhalt
};

// pi '/home/pi/git/Kamera/public/pictures/'
// OSX '/Users/bossival/git/Kamera/public/pictures/'
var pathToMediaFolder = '/Users/bossival/git/Kamera/public/pictures/';
var arrayOfPictures;
var objectOfPicturesArray = [];
var usbStick = "/media/usb0";

//Makes this entries array available in all views
app.locals.systemStatus = systemStatus;

var args = ["-t", "0", "-k", "-o", pathToMediaFolder + "bild.jpg", "-v"]
	//const child = spawn('raspistill', args);

// OSX 'diskutil list | grep "FAT32"'
// pi 'mount | grep "FAT32"'
var usbCheck = function () {
	exec('diskutil list | grep "FAT32"', function (error, stdout, stderr) {
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

io.on('connection', function (client) {
	console.log('Kamera connected...');
	//console.log(client.id);
	//console.log(io.sockets.clients().connected);

	//Bild loeschen
	client.on('bildLoeschen', function (bild) {
		var pathToPicture = pathToMediaFolder + bild;
		exec('rm -rf ' + pathToPicture, function (error, stdout, stderr) {
			console.log('stdout ' + stdout);
			console.log('stderr ' + stderr);
			if (error !== null) {
				console.log('exec error rm: ' + error);
			} else {
				console.log("Bild wurde gelöscht: ", bild);
				fs.readdir(pathToMediaFolder, function (err, list) {
					medienOrdnerInhalt = [];
					list.forEach(function (pic) {
						medienOrdnerInhalt.push({
							name: pic
						});
					});
					app.locals.pictures = medienOrdnerInhalt;
					systemStatus.medien = medienOrdnerInhalt;
					console.log(medienOrdnerInhalt);
					client.emit('bildLoeschen', bild);
				});
			}
		});
	});

	//Datentraeger auswerfen
	client.on('datentraegerAuswerfen', function () {
		// pi 'sudo umount /media/usb0'
		// OSX diskutil umountDisk /dev/disk3
		exec('diskutil umountDisk /dev/disk3', function (error, stdout, stderr) {
			console.log('stdout ' + stdout);
			console.log('stderr ' + stderr);
			if (error !== null) {
				console.log('exec error umount: ' + error);
				client.emit('datentraegerAuswerfen', true);
			} else {
				client.emit('datentraegerAuswerfen', false);
				systemStatus.usbOK = false;
			}
		});
	});

	//Auf Datentraeger kopieren
	client.on('kopierenStarten', function (data) {

		if (data.status === "start") {
			var zuKopierendeMedien = medienOrdnerInhalt;
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

	//Foto machen
	client.on('fotoMachen', function () {

		// pi child.stdin.write("\n");
		var bildname = zeitstempel() + ".jpg";

		// stderr wird von raspistill als standart output verwendet! anstatt stdout! 
		child.stderr.on('data', (data) => {

			console.log(`raspistill stderr: ${data}`);
		});
		//timeout, weil stderr im intervall ausgiebt und das unberechenbar ist! und es mehr sicherheit gibt, dass das bild fertig auf die sd geschrieben worden ist!
		setTimeout(function () {
			exec('mv ' + pathToMediaFolder + "bild.jpg " + bildname, function (error, stdout, stderr) {
				console.log('stdout ' + stdout);
				console.log('stderr ' + stderr);
				if (error !== null) {
					console.log('exec error mv: ' + error);
				} else {
					medienOrdnerInhalt.push({
						name: bildname
					});
					client.emit('fotoMachen', bildname);
				}
			});
		}, 500);

		child.on('close', (code) => {
			if (code !== 0) {
				console.log(`raspistill process exited with code ${code}`);
				//client.emit('fotoMachen', {"status": "close", "message": code});
			}
		});


	});

	//Status senden
	client.on('status', function () {
		client.emit('status', systemStatus);
		console.log(systemStatus);
	});

});


app.get('/', function (reg, res) {
	usbCheck();
	fs.readdir(pathToMediaFolder, function (err, list) {
		medienOrdnerInhalt = [];
		list.forEach(function (pic) {
			medienOrdnerInhalt.push({
				name: pic
			});
		});
		//console.log(systemStatus);
		//console.log(medienOrdnerInhalt);
		app.locals.pictures = medienOrdnerInhalt;
		systemStatus.medien = medienOrdnerInhalt;
		// um usbCheck() erkennen zu koennen!
		setTimeout(function () {
			res.render('pages/vorschau');
		}, 100)
	});
});

app.get('/vorschau/:picture', function (reg, res) {
	res.download(pathToMediaFolder + reg.params.picture);
});
//console.log(fs.createReadStream('test.log').pipe(fs.createWriteStream('newLog.log')));


server.listen(3000);