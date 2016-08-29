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


var systemStatus = {
	usbOK: usbOK,
	kameraOK: kameraOK,
};
var pathToMediaFolder = '/Users/bossival/git/Kamera/public/pictures/';
var arrayOfPictures;
var objectOfPicturesArray = [];
var usbStick = "/Volumes/FAT32";

//Makes this entries array available in all views
app.locals.systemStatus = systemStatus;

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
		
		if(data.status === "start"){
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

			res.json({
				medienOrdnerInhalt
			});
		});

	});

});

app.get('/fotoMachen', function (req, res) {

	var datumJetzt = new Date();
	var zeit = datumJetzt.toLocaleTimeString();
	var nurZeit = zeit.split(" ");
	var zeitFuerPic = nurZeit[0];
	var zeitFuerPic = zeitFuerPic.replace(/:/gi, "_"); //ersetze alle : durch ; ermöglicht mit /gi
	//datum wieder einfügen!
	//var datum = datumJetzt.toLocaleDateString();


	var command = "sudo raspistill ";
	var msToWait = "-t 2000 ";
	var output = "-o ";
	var fotoNamen = zeitFuerPic;
	var dateiFormat = ".jpg";
	var concatedCommand = command + msToWait + output + pathToMediaFolder + fotoNamen + dateiFormat;
	var neuesFoto = fotoNamen + dateiFormat;

	raspistill = exec(concatedCommand, function (error, stdout, stderr) {
		data = stdout;
		console.log('raspistill stdout ' + stdout);
		console.log('raspistill stderr ' + stderr);
		if (error !== null) {
			console.log('raspistill exec error cp: ' + error);
		}
		/**
		setTimeout(function () {
			res.json({
				newPicture: fotoNamen
			});
		}, 3000);**/
	});

	raspistill.on('exit', function (code) {
		console.log('raspistill exited with exit code ' + code);
		//res.send("pictureDeleted!");
		res.json({
			newPicture: neuesFoto
		});
	});

});

app.post('/datentraegerAuswerfen', function (req, res) {

	exec('diskutil umountDisk /dev/disk2', function (error, stdout, stderr) {

		console.log('stdout ' + stdout);
		console.log('stderr ' + stderr);
		if (error !== null) {
			console.log('exec error umount: ' + error);
		} else {
			res.send("Datenträger ausgeworfen!");
		}
	});
});

//console.log(fs.createReadStream('test.log').pipe(fs.createWriteStream('newLog.log')));


server.listen(3000);