
var main = function () {
	
	//soll gefüllt werden, mit fotos, die gemacht werden!
	var pictures = [];

	var kameraStatus = {
		"kopieren": false,
		"bereitOhneUSB": false,
		"bereitMitUSB": false,
		"macheFoto": false,
		"macheVideo": false
	}

	var statusDerButtons = function (kameraStatus) {
		console.log(kameraStatus.kopieren);
		if (kameraStatus.kopieren) {
			console.log("solle buttons ändern!");
			$("#datentraegerAuswerfen").replaceWith('<button disabled="disabled" title="    Bin am Kopieren!" id="datentraegerAuswerfen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; padding-bottom: ; padding-top:; background-color: #bc4b51;" class="btn btn-default"><div align="center" class="loaderAuswerfen"></div>Kopiere!</button>');
			$("#aufDatentraegerSpeichern").replaceWith('<button disabled="disabled" title="    Bin am Kopieren!" id="aufDatentraegerSpeichern" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" class="btn btn-default" id="aufUsbSpeichern" ><div style="vertical-align:middle;" class="loaderSpeichern"></div>Kopiere!</button>');
		}
		if (kameraStatus.bereitOhneUSB) {
			$("#datentraegerAuswerfen").replaceWith('button title="    Kein Datenträger" id="datentraegerAuswerfen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; padding-bottom: ; padding-top:; background-color: #bc4b51;" class="btn btn-default" disabled="disabled" ><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-eject"></span><br>USB</button>');
			$("#aufDatentraegerSpeichern").replaceWith('<button title="    Kein Datenträger" id="aufDatentraegerSpeichern" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" class="btn btn-default" id="aufUsbSpeichern" disabled="disabled" ><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-save"></span><br>Speichern</button>');
		}
		if (kameraStatus.bereitMitUSB) {
			$("#datentraegerAuswerfen").replaceWith('<button title="Datenträger auswerfen" id="datentraegerAuswerfen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; padding-bottom: ; padding-top:; background-color: #bc4b51;" class="btn btn-default" ><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-eject"></span><br>USB</button>');
			$("#aufDatentraegerSpeichern").replaceWith('<button title="Medien auf Datenträger speichern" id="aufDatentraegerSpeichern" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" class="btn btn-default" id="aufUsbSpeichern"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-save"></span><br>Speichern</button>');

		}
		if (kameraStatus.macheFoto) {

		}
		if (kameraStatus.macheVideo) {

		}
	};

	//io.connect('/'); '/' heisst von dem server, mit dem man die Webseite bzw client.js hat! ist also generisch!
	var socket = io.connect('/');
	var medienOrdner = [];

	socket.on('hatKopiert', function (bild) {
		console.log("hat kopiert", bild);


		$("#slide0").slideUp(400, function () {
			$("#tr0").remove();
		});
		if (bild === "ende") {
			statusDerButtons({
				"kopieren": false,
				"bereitOhneUSB": false,
				"bereitMitUSB": true,
				"macheFoto": false,
				"macheVideo": false
			});
		} else {
			socket.emit('kopierenStarten', {
				"status": "kopieren"
			});
		}

	});

	var aufSpeichernListeBildHinzufuegen = function (bild) {

		var html = '<tr id="tr' + bild + '"><td><div id="slide' + bild + '"><div id="loader' + bild + '" class="loaderKopieren"></div><p>' + bild + '</p></div></td></tr>';
		$("#bilderZumSpeichern").append(html);
	};


	$("#aufDatentraegerSpeichern").click(function () {

		kameraStatus = {
			"kopieren": true,
			"bereitOhneUSB": false,
			"bereitMitUSB": false,
			"macheFoto": false,
			"macheVideo": false
		}
		
		statusDerButtons(kameraStatus);

		socket.emit('kopierenStarten', {
			"status": "start"
		});

		for (var i = 0; i < 5; i++) {
			aufSpeichernListeBildHinzufuegen(i);
		}

		$("#speichernPanel").slideDown(300);


		setTimeout(function () {

			$("#0").slideUp(400, function () {
				$("#tr0").remove();
			});

		}, 2000);

		setTimeout(function () {

			$("#1").slideUp(400, function () {
				$("#tr1").remove();
			});

		}, 4000);

		setTimeout(function () {

			$("#2").slideUp(400, function () {
				$("#tr2").remove();
			});

		}, 6000);

		setTimeout(function () {

			$("#3").slideUp(400, function () {
				$("#tr3").remove();
			});

		}, 8000);

		setTimeout(function () {

			$("#4").slideUp(400, function () {
				$("#tr4").remove();
			});

		}, 10000);


	});

	$("#datentraegerAuswerfen").click(function () {
		var ejectRequest;
		var data = "datenträger soll ausgeworfen werden";
		$(this).replaceWith('<button disabled="disabled" title="Bin am Auswerfen!" id="datentraegerAuswerfen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; padding-bottom: ; padding-top:; background-color: #bc4b51;" class="btn btn-default"><div align="center" class="loaderAuswerfen"></div>Werfe aus!</button>');
		ejectRequest = $.ajax({
			url: "/datentraegerAuswerfen",
			dataType: "text",
			method: "POST",
			data: data
		});
		ejectRequest.done(function (data) {
			console.log(data);
			$("#datentraegerAuswerfen").replaceWith('<button title="    Kein Datenträger" id="datentraegerAuswerfen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; padding-bottom: ; padding-top:; background-color: #bc4b51;" class="btn btn-default" disabled="disabled" ><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-eject"></span><br>USB</button>');
			$("#aufDatentraegerSpeichern").replaceWith('<button title="    Kein Datenträger" id="aufDatentraegerSpeichern" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" class="btn btn-default" id="aufUsbSpeichern" disabled="disabled" ><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-save"></span><br>Speichern</button>');
		});
	});

	$("[name='download']").each(function () {
		console.log("each download");
		$(this).click(function () {
			top.location.href = $(this).attr("href");
		});
	});

	//geht nicht mit id da einzigartig! selector ist das name attribut
	$("[name='loeschen']").each(function () {
		//console.log(element);
		$(this).click(function () {
			var picture = this.id;
			var element = document.getElementById(this.id);
			$(this).html('<div style="vertical-align:middle;" class="loaderLoeschen"></div>');
			var deleteRequest;
			//setTimeout(function () {
			deleteRequest = $.ajax({
				url: "/pictureToDelete",
				dataType: "text",
				method: "post",
				data: picture
			});
			deleteRequest.done(function (medienAufServer) {
				console.log(medienAufServer);
				medienOrdner = medienAufServer;
				console.log("erste loeschen funktion");
				$(element).remove();
			});
		});
		console.log("jquery löschen ausgeführt");
	});


	//bei jedem Fotomachen soll der medienOrdner gefüllt werden und schon in den unsichtbaren table gefüllt werden!
	$('#fotoMachen').click(function () {

		$(this).html('<div style="vertical-align:middle;" class="loader"></div>');

		var photoRequest = $.ajax({
			url: "/fotoMachen",
			dataType: "text",
			method: "GET",
		});

		photoRequest.done(function (data) {
			newPic = $.parseJSON(data);
			console.log(newPic.newPicture);
			newPictureName = newPic.newPicture;
			medienOrdner.push({
				"name": newPictureName
			});
			$("#gifloader").remove();
			var text = "Foto machen";
			$("#fotoMachen").html('<span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-camera"></span>');

			var html = '<tr id="' + newPictureName + '"><td style="border: 2px solid black;"><img src="pictures/' + newPictureName + '" style="width: 100%;"><div style="background-color: black; color: white; padding-top: 5px; padding-bottom: 5px;" align="center">' + newPictureName + '</div><div style="margin-top: 10px; margin-bottom: 20px;" align="center"><button title="Löschen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#bc4b51; margin-right: 10px;" class="btn btn-default" name="loeschen" id="' + newPictureName + '"><span style="font-size:2.5em; " class="glyphicon glyphicon-trash"></span></button><button title="Download" name="download" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285; margin-right: 10px;" class="btn btn-default" value="vorschau/' + newPictureName + '"><span style="font-size:2.5em;" class="glyphicon glyphicon-cloud-download"></span></button></div></td></tr>';

			$("#letzterTable").prepend(html);

			$("[name='download']").each(function () {
				$(this).click(function () {
					top.location.href = $(this).attr("href");
				});
			});

			//geht nicht mit id da einzigartig! selector ist das name attribut
			$("[name='loeschen']").each(function (index) {

				$(this).click(function () {
					var picture = this.id;
					var element = document.getElementById(this.id);

					$(this).html('<img id="gifloader" src="gif/fbloader.gif" />');
					var deleteRequest;
					setTimeout(function () {
						deleteRequest = $.ajax({
							url: "/pictureToDelete",
							dataType: "text",
							method: "post",
							data: picture
						});
						deleteRequest.done(function (medienAufServer) {
							console.log(medienAufServer);
							medienOrdner = medienAufServer;
							console.log("zweite loeschen funktion");
							$(element).remove();
						});
					}, 1000);
				});
				console.log("jquery löschen ausgeführt");
			});
		});
		photoRequest.fail(function () {
			console.log("konnte kein Foto machen!");
		});
	});
}
$(document).ready(main);