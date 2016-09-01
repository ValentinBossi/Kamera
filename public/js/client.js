var main = function () {

	///////////////////////////////////////////////////////////////VARIABLEN////////////////////////////////////////////////////////////
	var auswerfenButtonParat = '<button title="Datenträger auswerfen" id="datentraegerAuswerfen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; padding-bottom: ; padding-top:; background-color: #bc4b51;" class="btn btn-default" ><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-eject"></span><br>USB</button>';
	var auswerfenButtonBusy = '<button disabled="disabled" title="Datenträger auswerfen" id="datentraegerAuswerfen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; padding-bottom: ; padding-top:; background-color: #bc4b51;" class="btn btn-default"><div align="center" class="loader"></div></button>';
	var auswerfenButtonDisabled = '<button disabled="disabled" title="Datenträger auswerfen" id="datentraegerAuswerfen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; padding-bottom: ; padding-top:; background-color: #bc4b51;" class="btn btn-default" ><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-eject"></span><br>USB</button>';
	var kopierenButtonParat = '<button title="Medien auf Datenträger speichern" id="aufDatentraegerSpeichern" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" class="btn btn-default" id="aufUsbSpeichern"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-save"></span><br>Speichern</button>';
	var kopierenButtonBusy = '<button disabled="disabled" title="Medien auf Datenträger speichern" id="aufDatentraegerSpeichern" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" class="btn btn-default" id="aufUsbSpeichern" ><div style="vertical-align:middle;" class="loader"></div></button>';
	var kopierenButtonDisabled = '<button disabled="disabled" title="Medien auf Datenträger speichern" id="aufDatentraegerSpeichern" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" class="btn btn-default" id="aufUsbSpeichern"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-save"></span><br>Speichern</button>';
	var videoButtonParat = '<button title="Video aufnehmen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; margin-bottom: ; margin-top: ; margin-left: 100px; background-color: #f4a259;" id="videoMachen" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-facetime-video"></span></button>';
	var videoButtonBusy = '<button disabled="disabled" title="Video aufnehmen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; margin-bottom: ; margin-top: ; margin-left: 100px; background-color: #f4a259;" id="videoMachen" class="btn btn-default"><div align="center" class="loader"></div></button>';
	var videoButtonDisabled = '<button disabled="disabled" title="Video aufnehmen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; margin-bottom: ; margin-top: ; margin-left: 100px; background-color: #f4a259;" id="videoMachen" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-facetime-video"></span></button>';
	var fotoButtonParat = '<button title="Foto aufnehmen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; margin-bottom: ; background-color: #f4a259;" id="fotoMachen" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-camera"></span></button>';
	var fotoButtonBusy = '<button disabled="disabled" title="Foto aufnehmen" title="Foto schliessen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; margin-bottom: ; background-color: #f4a259;" id="fotoMachen" class="btn btn-default"><div align="center" class="loader"></div></button>';
	var fotoButtonDisabled = '<button disabled="disabled" title="Foto aufnehmen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; margin-bottom: ; background-color: #f4a259;" id="fotoMachen" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-camera"></span></button>';

	//soll gefüllt werden, mit fotos, die gemacht werden! hier nur zum testen!
	//soll durch medienOrdner ersetzt werden, denn das gibts schon!!!! (bei loeschen funktion)
	var pictures = [];

	var systemStatus = {
		usbOK: false,
		kameraOK: false,
		fotoMachen: false,
		videoMachen: false,
		kopieren: false,
		medien: {}
	};

	var auswerfenButton = {
		state: auswerfenButtonDisabled
	};

	var videoButton = {
		state: videoButtonDisabled
	};

	var kopierenButton = {
		state: kopierenButtonDisabled
	};

	var fotoButton = {
		state: fotoButtonDisabled
	};

	////////////////////////////////////////////////INITIAL-FUNKTIONEN//////////////////////////////////////////////////////////////////

	//io.connect('/'); '/' heisst von dem server, mit dem man die Webseite bzw client.js hat! ist also generisch!
	var socket = io.connect('/');

	//anpassen!
	var imageCheck = function () {
		var hatBilder = $("img");
		if (hatBilder.length == 0) {
			$("#letzterTable").append('<h3 id="keineFotos" align="center"">Keine Fotos!</h3>');
		}
	};
	imageCheck();

	var statusCheck = function () {
		socket.emit('status');
	};
	statusCheck();

	socket.on('status', function (ServersystemStatus) {
		systemStatus = ServersystemStatus;
		console.log(systemStatus);
	});

	var download = function () {
		$("[name='download']").each(function () {
			console.log("each download");
			$(this).click(function () {
				top.location.href = $(this).attr("href");
			});
		});
	};
	download();

	var loeschen = function () {
		$("[name='loeschen']").each(function () {
			$(this).click(function () {
				var picture = this.getAttribute("data");
				var tableZuLoeschen = document.getElementById(this.getAttribute("data"));
				
				$(this).html('<div style="vertical-align:middle;" class="loader"></div>');
				socket.emit('bildLoeschen', picture);
				socket.on('bildLoeschen', function(bild){
					$(tableZuLoeschen).remove();
					imageCheck();
					
				});
			});
			//console.log("jquery löschen ausgeführt");
		});
	}
	loeschen();

	/////////////////////////////////////////////////////////DIVERSE-FUNKTIONEN/////////////////////////////////////////////////////////
	
	var erstelleKopierGallerie = function ()
	
	$("img+div").each(function () {
		pictures.push({
			"name": this.textContent
		});
	});

	var aufSpeichernListeBildHinzufuegen = function (bild) {
		console.log(bild);
		var html = '<tr id="tr' + bild + '"><td><div id="slide' + bild + '"><div id="loader' + bild + '" class="loader"></div><p>' + bild + '</p></div></td></tr>';
		$("#bilderZumSpeichern").append(html);
	};

	//button = auswerfenButton zbsp
	var pressButton = function (button) {
		if (button == auswerfenButton) {
			auswerfenButton.state = auswerfenButtonBusy;
			videoButton.state = videoButtonDisabled;
			kopierenButton.state = kopierenButtonDisabled;
			fotoButton.state = fotoButtonDisabled;
		}
		if (button == videoButton) {
			videoButton.state = videoButtonBusy;
			kopierenButton.state = kopierenButtonDisabled;
			fotoButton.state = fotoButtonDisabled;
			auswerfenButton.state = auswerfenButtonDisabled;
		}
		if (button == kopierenButton) {
			kopierenButton.state = kopierenButtonBusy;
			fotoButton.state = fotoButtonDisabled;
			auswerfenButton.state = auswerfenButtonDisabled;
			videoButton.state = videoButtonDisabled;
		}
		if (button == fotoButton) {
			fotoButton.state = fotoButtonBusy;
			auswerfenButton.state = auswerfenButtonDisabled;
			videoButton.state = videoButtonDisabled;
			kopierenButton.state = kopierenButtonDisabled;
		}
		toggleButtons();
	};

	var runCheck = function () {
		download();
		loeschen();
		fotoMachen();
		videoMachen();
		aufDatentraegerSpeichern();
		datentraegerAuswerfen();
	};


	//callback rerender jquery click methoden! (löschen, download, die 4 menuebuttons)
	var toggleButtons = function () {
		$("#datentraegerAuswerfen").replaceWith(auswerfenButton.state);
		$("#videoMachen").replaceWith(videoButton.state);
		$("#aufDatentraegerSpeichern").replaceWith(kopierenButton.state);
		$("#fotoMachen").replaceWith(fotoButton.state);
		runCheck();
	};

	var releaseButton = function (button) {

		if (button == auswerfenButton) {
			auswerfenButton.state = systemStatus.usbOK ? auswerfenButtonParat : auswerfenButtonDisabled;
			videoButton.state = videoButtonParat;
			kopierenButton.state = systemStatus.usbOK ? kopierenButtonParat : kopierenButtonDisabled;
			fotoButton.state = fotoButtonParat;
		}
		if (button == videoButton) {
			videoButton.state = videoButtonParat;
			kopierenButton.state = systemStatus.usbOK ? kopierenButtonParat : kopierenButtonDisabled;
			fotoButton.state = fotoButtonParat;
			auswerfenButton.state = systemStatus.usbOK ? auswerfenButtonParat : auswerfenButtonDisabled;
		}
		if (button == kopierenButton) {
			kopierenButton.state = systemStatus.usbOK ? kopierenButtonParat : kopierenButtonDisabled;
			fotoButton.state = fotoButtonParat;
			auswerfenButton.state = systemStatus.usbOK ? auswerfenButtonParat : auswerfenButtonDisabled;
			videoButton.state = videoButtonParat;
		}
		if (button == fotoButton) {
			videoButton.state = videoButtonParat;
			kopierenButton.state = systemStatus.usbOK ? kopierenButtonParat : kopierenButtonDisabled;
			fotoButton.state = fotoButtonParat;
			auswerfenButton.state = systemStatus.usbOK ? auswerfenButtonParat : auswerfenButtonDisabled;
		}
		toggleButtons();
	};

	//////////////////////////////////////////HAUPTAKTIONEN////////////////////////////////////////////////////////////////////////

	var videoMachen = function () {
		//jquery...click usw
	};

	var aufDatentraegerSpeichern = function () {

		$("#aufDatentraegerSpeichern").click(function () {

			pressButton(kopierenButton);

			socket.emit('kopierenStarten', {
				"status": "start"
			});

			for (var i = 0; i < pictures.length; i++) {
				aufSpeichernListeBildHinzufuegen(pictures[i].name);
			}

			$("#speichernPanel").slideDown(300);
		});
	}

	var datentraegerAuswerfen = function () {
		$("#datentraegerAuswerfen").click(function () {
			pressButton(auswerfenButton);
			socket.emit('datentraegerAuswerfen');
			socket.on('datentraegerAuswerfen', function (data) {
				systemStatus.usbOK = data;
				console.log(data);
				releaseButton(auswerfenButton);
			});
		});
	}
	datentraegerAuswerfen();

	//bei jedem Fotomachen soll der medienOrdner gefüllt werden und schon in den unsichtbaren table gefüllt werden!
	var fotoMachen = function () {
		$('#fotoMachen').click(function () {
			pressButton(fotoButton);
			socket.emit('fotoMachen');
			socket.on('fotoMachen', function (data) {
				console.log(data);
				releaseButton(fotoButton);
			});
		});
	};
	fotoMachen();
	/////////////////////////////////////////////////////SOCKET-FUNKTIONEN////////////////////////////////////////////////////////////
	socket.on('hatKopiert', function (bild) {
		systemStatus.amKopieren = true;
		console.log("hat kopiert", bild);
		console.log(pictures);

		$("#slide8MP3mmLinseMode1q100Kopie8.jpg" + bild).slideUp(400, function (bild) {
			$("#tr" + bild).remove();
		});
		if (bild === "ende") {
			systemStatus.amKopieren = false;
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
}
$(document).ready(main);