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

// wenn von mount ein String zurück kommt, ist ein Stick eingesteckt
// TO-DO: checken, ob Stick Fat32 ist
var usbOK = null;
var kameraOK = true;
var systemStatus = {
	usbOK: usbOK,
	kameraOK: kameraOK
};
var pathToMediaFolder = '/Users/bossival/git/Kamera/public/pictures';
var arrayOfPictures;
var objectOfPicturesArray = [];
var usbStick = "/media/usb0";

//Makes this entries array available in all views
app.locals.systemStatus = systemStatus;

var usbCheck = function () {
	exec('mount | grep "media/usb0"', function (error, stdout, stderr) {
		if (stdout === '') {
			systemStatus.usbOK = false;
		} else {
			systemStatus.usbOK = true;
		}
		//console.log('stdout ' + stdout);
		//console.log('stderr ' + stderr);
		if (error !== null) {
			console.log('exec error pidof raspivid: ' + error);
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
	usbCheck();
	setTimeout(function () {
		res.render('pages/index');
	}, 50)
});


io.on('connection', function (client) {
	console.log('Kamera connected...');

	client.on('startCopyToUSBProcess', function (data) {
		
		
		if (medienOrdnerInhalt[0] !== undefined && data.sendMediaList) {
			umgekehrteReihenfolge = [];
			for(var i=medienOrdnerInhalt.length-1; i >= 0; i--){
				umgekehrteReihenfolge.push(medienOrdnerInhalt[i]);
			}
			client.emit('startCopyToUSBProcess', umgekehrteReihenfolge);
		}
		if(data.startCopy){
			picToCopyString = medienOrdnerInhalt.pop().name;
			picToCopy = pathToMediaFolder + picToCopyString;
			console.log(picToCopy);
			exec("cp " + picToCopy + " " + usbStick, function (error, stdout, stderr) {

					console.log('stdout ' + stdout);
					console.log('stderr ' + stderr);

					if (error !== null) {
						console.log('exec error copy to usb stick: ' + error);
					} else {
						client.emit('startCopyToUSBProcess', picToCopyString);
					}
				});
		}
		/**
		console.log(data);
		console.log(typeof data);
		if (medienOrdnerInhalt[0] !== undefined) {
			client.emit('startCopyToUSBProcess', medienOrdnerInhalt);

			//starte Kopierprozess
			console.log(medienOrdnerInhalt);

			for (property in medienOrdnerInhalt) {
				
				picToCopyString = medienOrdnerInhalt[property].name;
				console.log("pic bei for schloaufe" , picToCopyString);
				picToCopy = pathToMediaFolder + medienOrdnerInhalt[property].name;

				//console.log(medienOrdnerInhalt[property].name);

				exec("cp " + picToCopy + " " + usbStick, function (error, stdout, stderr) {

					console.log('stdout ' + stdout);
					console.log('stderr ' + stderr);

					if (error !== null) {
						console.log('exec error copy to usb stick: ' + error);
					}
					client.emit('startCopyToUSBProcess', picToCopyString);
				});

			}
			 funktioniert!
			setTimeout(function(){
				client.emit('startCopyToUSBProcess', ".AppleDouble");
			},5000)
		}**/
		
		
	});



});


app.get('/vorschau', function (reg, res) {
	fs.readdir(pathToMediaFolder, function (err, list) {
		medienOrdnerInhalt = [];
		list.forEach(function (pic) {
			medienOrdnerInhalt.push({
				name: pic
			});
		});
		app.locals.pictures = medienOrdnerInhalt;
		res.render('pages/vorschau');
	});
});

/**app.post('/aufUSBStickSPeichern', function (reg, res) {
	console.log(reg.body);
	res.render('pages/aufUsbStickSpeichern');
});**/

app.get('/vorschau/:picture', function (reg, res) {
	res.download(pathToMediaFolder + reg.params.picture);
});

app.get("/aufUSBStickSPeichern", function (reg, res) {

	res.render('pages/aufUsbStickSpeichern');

});
/**
app.put("/aufUSBStickSPeichern", function (reg, res) {
	
	obKummuniziert = Object.keys(reg.body);
	obKummuniziert = obKummuniziert.toString();
	console.log(obKummuniziert);
	
	var medienOrdnerInhalt = [];
	fs.readdir(pathToMediaFolder, function(err, list){
		list.forEach(function(pic){
			medienOrdnerInhalt.push({name: pic});
		});
		app.locals.pictures = medienOrdnerInhalt;
		res.send(medienOrdnerInhalt);
	});
	

});**/

//brauchts nicht mehr, da einfach alle in der Vorschau enthaltene Bilder gespeichert werden.
/**app.post('/picturesToSave', function (reg, res) {
	var a = reg.body;
	console.log(reg.body);

	setTimeout(function () {
		res.json({
			ok: a
		});
	}, 3000)


	for (property in a) {
		console.log(property);
	}



});**/

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
				deletedPicture: picString
			});
		});

	});

	/**var childProcess = require('child_process'),
		ls;
	console.log("aaaaaaaaaaaaaaaa: rm -rf "+pathToPicture);
	ls = childProcess.exec('rm -rf '+pathToPicture, function (error, stdout, stderr) {
		if (error) {
			console.log(error.stack);
			console.log('Error code: ' + error.code);
			console.log('Signal received: ' + error.signal);
		}
		console.log('Child Process STDOUT: ' + stdout);
		console.log('Child Process STDERR: ' + stderr);
	});
	ls.on('exit', function (code) {
		console.log('Child process exited with exit code ' + code);
		//res.send("pictureDeleted!");
		res.json({
				deletedPicture: picString
			});
	});**/

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

	/**
	var picName = "8MP3mmLinseMode2q100_";
	tmpCounter++;
	picName = picName + tmpCounter + ".jpg";
	console.log(picName);
	var path = "/home/pi/GreinerCam/NodeJS/Express/public/pictures/";
	var command = "cp ";
	var toCopyPic = "/home/pi/GreinerCam/NodeJS/Express/public/pictures/8MP3mmLinseMode2q100_.jpg ";
	var newPic = path + picName
	var concatedCommand = command + toCopyPic + newPic;
	console.log
	exec(concatedCommand, function (error, stdout, stderr) {
		data = stdout;
		console.log('stdout ' + stdout);
		console.log('stderr ' + stderr);
		if (error !== null) {
			console.log('exec error cp: ' + error);
		}
		setTimeout(function () {
			res.json({
				newPicture: picName
			});
		}, 3000);
	});
	console.log("ausgeführt!");**/

});

//console.log(fs.createReadStream('test.log').pipe(fs.createWriteStream('newLog.log')));

app.use(express.static(path.resolve(__dirname, "public")));
server.listen(3000);