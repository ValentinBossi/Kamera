var main = function () {


	var status = {
		"amKopieren": false
	};

	var statusJetztUndVorher = [];

	var checkDownloads = function () {
		$("[name='download']").each(function () {
			console.log("each download");
			$(this).click(function () {
				top.location.href = $(this).attr("href");
			});
		});
	};

	var checkLoeschen = function () {
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
					medienOrdner = JSON.parse(medienAufServer);
					console.log("erste loeschen funktion");
					$(element).remove();
					console.log(medienOrdner.length);
					if (medienOrdner.length == 0) {
						pageCheck();
					}
				});
			});
			console.log("jquery löschen ausgeführt");
		});
	}

	checkDownloads();
	checkLoeschen();

	var auswerfenButtonParat = '<button title="Datenträger auswerfen" id="datentraegerAuswerfen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; padding-bottom: ; padding-top:; background-color: #bc4b51;" class="btn btn-default" ><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-eject"></span><br>USB</button>';
	var auswerfenButtonBusy = '<button disabled="disabled" title="Datenträger auswerfen" id="datentraegerAuswerfen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; padding-bottom: ; padding-top:; background-color: #bc4b51;" class="btn btn-default"><div align="center" class="loaderAuswerfen"></div></button>';
	var auswerfenButtonDisabled = '<button disabled="disabled" title="Datenträger auswerfen" id="datentraegerAuswerfen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; padding-bottom: ; padding-top:; background-color: #bc4b51;" class="btn btn-default" ><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-eject"></span><br>USB</button>';
	var kopierenButtonParat = '<button title="Medien auf Datenträger speichern" id="aufDatentraegerSpeichern" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" class="btn btn-default" id="aufUsbSpeichern"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-save"></span><br>Speichern</button>';
	var kopierenButtonBusy = '<button disabled="disabled" title="Medien auf Datenträger speichern" id="aufDatentraegerSpeichern" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" class="btn btn-default" id="aufUsbSpeichern" ><div style="vertical-align:middle;" class="loaderSpeichern"></div></button>';
	var kopierenButtonDisabled = '<button disabled="disabled" title="Medien auf Datenträger speichern" id="aufDatentraegerSpeichern" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" class="btn btn-default" id="aufUsbSpeichern"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-save"></span><br>Speichern</button>';
	var videoButtonParat = '<button title="Video aufnehmen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; margin-bottom: ; margin-top: ; margin-left: 100px; background-color: #f4a259;" id="videoMachen" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-facetime-video"></span></button>';
	var videoButtonBusy = '<button disabled="disabled" title="Video aufnehmen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; margin-bottom: ; margin-top: ; margin-left: 100px; background-color: #f4a259;" id="videoMachen" class="btn btn-default"><div align="center" class="loaderVideo"></div></button>';
	var videoButtonDisabled = '<button disabled="disabled" title="Video aufnehmen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; margin-bottom: ; margin-top: ; margin-left: 100px; background-color: #f4a259;" id="videoMachen" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-facetime-video"></span></button>';
	var fotoButtonParat = '<button title="Foto aufnehmen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; margin-bottom: ; background-color: #f4a259;" id="fotoMachen" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-camera"></span></button>';
	var fotoButtonBusy = '<button disabled="disabled" title="Foto aufnehmen" title="Foto schliessen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; margin-bottom: ; background-color: #f4a259;" id="fotoMachen" class="btn btn-default"><div align="center" class="loaderFoto"></div></button>';
	var fotoButtonDisabled = '<button disabled="disabled" title="Foto aufnehmen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; margin-bottom: ; background-color: #f4a259;" id="fotoMachen" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-camera"></span></button>';


	//soll gefüllt werden, mit fotos, die gemacht werden! hier nur zum testen!
	//soll durch medienOrdner ersetzt werden, denn das gibts schon!!!! (bei loeschen funktion)
	var pictures = [];
	$("img+div").each(function () {
		pictures.push({
			"name": this.textContent
		});
	});

	var kameraStatus = {
		"auswerfen": false,
		"kopieren": false,
		"bereitOhneUSB": false,
		"bereitMitUSB": false,
		"bereitOhneFotosMitUSB": false,
		"macheFoto": false,
		"macheVideo": false
	}

	var statusDerButtons = function (kameraStatus) {
		if (kameraStatus.auswerfen) {
			$("#datentraegerAuswerfen").replaceWith(auswerfenButtonBusy);
			$("#aufDatentraegerSpeichern").replaceWith(kopierenButtonDisabled);
			$("#videoMachen").replaceWith(videoButtonDisabled);
			$("#fotoMachen").replaceWith(fotoButtonDisabled);
		}
		if (kameraStatus.kopieren) {
			$("#datentraegerAuswerfen").replaceWith(auswerfenButtonDisabled);
			$("#aufDatentraegerSpeichern").replaceWith(kopierenButtonBusy);
			$("#videoMachen").replaceWith(videoButtonDisabled);
			$("#fotoMachen").replaceWith(fotoButtonDisabled);
		}
		if (kameraStatus.bereitOhneUSB) {
			$("#datentraegerAuswerfen").replaceWith(auswerfenButtonDisabled);
			$("#aufDatentraegerSpeichern").replaceWith(kopierenButtonDisabled);
			$("#videoMachen").replaceWith(videoButtonParat);
			$("#fotoMachen").replaceWith(fotoButtonParat);
		}
		if (kameraStatus.bereitMitUSB) {
			$("#datentraegerAuswerfen").replaceWith(auswerfenButtonParat);
			$("#aufDatentraegerSpeichern").replaceWith(kopierenButtonParat);
			$("#videoMachen").replaceWith(videoButtonParat);
			$("#fotoMachen").replaceWith(fotoButtonParat);
		}
		if (kameraStatus.bereitOhneFotosMitUSB) {
			$("#datentraegerAuswerfen").replaceWith(auswerfenButtonParat);
			$("#aufDatentraegerSpeichern").replaceWith(kopierenButtonDisabled);
			$("#videoMachen").replaceWith(videoButtonParat);
			$("#fotoMachen").replaceWith(fotoButtonParat);
		}
		if (kameraStatus.bereitOhneFotosOhneUSB) {
			$("#datentraegerAuswerfen").replaceWith(auswerfenButtonDisabled);
			$("#aufDatentraegerSpeichern").replaceWith(kopierenButtonDisabled);
			$("#videoMachen").replaceWith(videoButtonParat);
			$("#fotoMachen").replaceWith(fotoButtonParat);
		}
		if (kameraStatus.macheFoto) {
			$("#datentraegerAuswerfen").replaceWith(auswerfenButtonDisabled);
			$("#aufDatentraegerSpeichern").replaceWith(kopierenButtonDisabled);
			$("#videoMachen").replaceWith(videoButtonDisabled);
			$("#fotoMachen").replaceWith(fotoButtonBusy);
		}
		if (kameraStatus.macheVideo) {
			$("#datentraegerAuswerfen").replaceWith(auswerfenButtonDisabled);
			$("#aufDatentraegerSpeichern").replaceWith(kopierenButtonDisabled);
			$("#videoMachen").replaceWith(videoButtonBusy);
			$("#fotoMachen").replaceWith(fotoButtonDisabled);
		}
	};

	//io.connect('/'); '/' heisst von dem server, mit dem man die Webseite bzw client.js hat! ist also generisch!
	var socket = io.connect('/');
	var medienOrdner = [];

	var pageCheck = function () {
		var hatBilder = $("img");
		if (hatBilder.length == 0) {
			$("#letzterTable").append('<h3 id="keineFotos" align="center"">Keine Fotos!</h3>');
		}
	};

	pageCheck();

	socket.on('hatKopiert', function (bild) {
		status.amKopieren = true;
		console.log("hat kopiert", bild);
		console.log(pictures);

		$("#slide8MP3mmLinseMode1q100Kopie8.jpg" + bild).slideUp(400, function (bild) {
			$("#tr" + bild).remove();
		});
		if (bild === "ende") {
			status.amKopieren = false;
			statusDerButtons({
				"kopieren": false,
				"bereitOhneUSB": false,
				"bereitMitUSB": true,
				"bereitOhneFotosMitUSB": false,
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
		console.log(bild);
		var html = '<tr id="tr' + bild + '"><td><div id="slide' + bild + '"><div id="loader' + bild + '" class="loaderKopieren"></div><p>' + bild + '</p></div></td></tr>';
		$("#bilderZumSpeichern").append(html);
	};


	$("#aufDatentraegerSpeichern").click(function () {

		statusDerButtons({
			"auswerfen": false,
			"kopieren": true,
			"bereitOhneUSB": false,
			"bereitMitUSB": false,
			"bereitOhneFotosMitUSB": false,
			"macheFoto": false,
			"macheVideo": false
		});

		socket.emit('kopierenStarten', {
			"status": "start"
		});

		for (var i = 0; i < pictures.length; i++) {
			aufSpeichernListeBildHinzufuegen(pictures[i].name);
		}

		$("#speichernPanel").slideDown(300);
	});

	$("#datentraegerAuswerfen").click(function () {
		var ejectRequest;
		var data = "datenträger soll ausgeworfen werden";
		statusDerButtons({
			"auswerfen": true,
			"kopieren": false,
			"bereitOhneUSB": false,
			"bereitMitUSB": false,
			"macheFoto": false,
			"macheVideo": false
		});
		ejectRequest = $.ajax({
			url: "/datentraegerAuswerfen",
			dataType: "text",
			method: "POST",
			data: data
		});
		ejectRequest.done(function (data) {
			console.log(data);
			statusDerButtons({
				"auswerfen": false,
				"kopieren": false,
				"bereitOhneUSB": true,
				"bereitMitUSB": false,
				"bereitOhneFotosMitUSB": false,
				"macheFoto": false,
				"macheVideo": false
			});
		});
	});
	
	//bei jedem Fotomachen soll der medienOrdner gefüllt werden und schon in den unsichtbaren table gefüllt werden!
	$('#fotoMachen').click(function () {
		console.log("haallloo?");

		$("#fotoMachen").replaceWith(fotoButtonBusy);

		
		socket.emit('fotoMachen');


		});
	
	socket.on('fotoMachen', function (data) {

			setTimeout(function () {
				console.log(typeof data);


				$("#letzterTable").prepend('<tr id="' + data + '"><td style="border: 2px solid black;"><img src="pictures/' + data + '" style="width: 100%;"><div style="background-color: black; color: white; padding-top: 5px; padding-bottom: 5px;" align="center">' + data + '</div><div style="margin-top: 10px; margin-bottom: 20px;" align="center"><button title="Löschen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#bc4b51; margin-right: 10px;" class="btn btn-default" name="loeschen" id="' + data + '"><span style="font-size:2.5em; " class="glyphicon glyphicon-trash"></span></button><button title="Download" name="download" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285; margin-right: 10px;" class="btn btn-default" value="vorschau/' + data + '"><span style="font-size:2.5em;" class="glyphicon glyphicon-cloud-download"></span></button></div></td></tr>')
				checkDownloads();
				checkLoeschen();
				$("#keineFotos").remove();
				$("#fotoMachen").replaceWith(fotoButtonParat);

			}, 1000);

	
		/**
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
		});**/
	});
}
$(document).ready(main);