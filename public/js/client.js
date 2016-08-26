var pictures = [];
var main = function () {

	//geht nicht mit id da einzigartig! selector ist das name attribut
	$("[name='loeschen']").each(function () {
		//console.log(element);
		$(this).click(function () {
			var picture = this.id;
			var element = document.getElementById(this.id);
			$(this).html('<img id="gifloader" src="gif/fbloader.gif" />');
			var deleteRequest;
			//setTimeout(function () {
			deleteRequest = $.ajax({
				url: "/pictureToDelete",
				dataType: "text",
				method: "post",
				data: picture
			});
			deleteRequest.done(function (data) {
				console.log(data);
				console.log("erste loeschen funktion");
				$(element).remove();
			});
			//}, 1000);
		});
		console.log("jquery löschen ausgeführt");
	});

	$('#fotoMachen').click(function () {

		$(this).html('<img id="gifloader" src="gif/fbloader.gif" />');

		var photoRequest = $.ajax({
			url: "/fotoMachen",
			dataType: "text",
			method: "GET",
		});

		photoRequest.done(function (data) {
			newPic = $.parseJSON(data);
			console.log(newPic.newPicture);
			newPictureName = newPic.newPicture;
			$("#gifloader").remove();
			var text = "Foto machen";
			$("#fotoMachen").text(text);

			var html = '<tr id="' + newPictureName + '"><td style="border: 2px solid black;"><img src="pictures/' + newPictureName + '" style="width: 100%;"><div align="center" style="background-color: black; color: white; padding-top: 5px; padding-bottom: 5px;">"' + newPictureName + '"</div><div align="center" style="margin-top: 10px; margin-bottom: 20px;"><button style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#bc4b51; margin-right: 10px;" class="btn btn-default" name="loeschen" id="' + newPictureName + '"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-trash"></span></button><button name="download" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" type="button" class="btn btn-default" href="vorschau/' + newPictureName + '"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-cloud-download"></span></button></div></td></tr>';

			$("#letzterTable").prepend(html);

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
						deleteRequest.done(function (data) {
							console.log(data);
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
	/**
	$("#aufUsbSpeichern").click(function () {
		window.location = "/aufUsbStickSpeichern";
	});**/
	
	$("#aufUsbSpeichern").click(function () {
		
		
		
		
		
		
	});

	if (document.getElementById("ichArbeite") != null) {
		var medienArrayLaenge;

		//io.connect('/'); '/' heisst von dem server, mit dem man die Webseite bzw client.js hat! ist also generisch!
		var socket = io.connect('/');

		socket.on('connect', function (data) {
			socket.emit('startCopyToUSBProcess', {
				"sendMediaList": true
			});
		});

		socket.on('startCopyToUSBProcess', function (data) {
			console.log(String == "hallo");
			console.log(data);
			if (Array.isArray(data)) {
				medienArrayLaenge = data.length;
				for (property in data) {
					console.log(data[property].name);
					$("#bilderDieGespeichertWerden").append('<li name="' + data[property].name + '" class="list-group-item"><img id="' + data[property].name + '"  src="gif/ajax-loader.gif" style="width: 35px; margin-right: 20px;">' + data[property].name + '</li>');
				}
				socket.emit('startCopyToUSBProcess', {
					"startCopy": true
				});
			}
			if (typeof data === 'string') {

				console.log("gif sollte jetzt gelöscht werden!");

				//$(document.getElementById(data)).append("<span style='font-size:2.5em;' class='glyphicon glyphicon-ok'></span>");
				$(document.getElementById(data)).remove();
				$("[name='" + data + "']").prepend("<span style='font-size:1.5em; margin-right: 20px;' class='glyphicon glyphicon-ok'></span>");
				medienArrayLaenge--;
				if (medienArrayLaenge > 0) {
					socket.emit('startCopyToUSBProcess', {
						"startCopy": true
					});
				}
				console.log("medienArrayLaenge", medienArrayLaenge);
				if (medienArrayLaenge == 0) {
					$(document.getElementById("ichArbeite")).replaceWith("<span style='font-size:5.5em; margin-left: 10px;' class='glyphicon glyphicon-ok'></span>");
					$(".jumbotron").prepend('<h3 align="center">Sie können nun auf "USB-Datenträger auswerfen" klicken und sobald der Button grün ist den Datenträger entfernen</h3>');
					for (var i = 5; i >= 1; i--) {

						$("#usbStickAuswerfenTop").fadeOut(800).fadeIn(800)

					}
				}
			}

		});

		var data = "aufUSBSpeichern kommuniziert!";
		var saveRequest;
		//setTimeout(function () {
		saveRequest = $.ajax({
			url: "/aufUsbStickSpeichern",
			dataType: "json",
			method: "PUT",
			data: data
		});
		saveRequest.done(function (data) {

			for (property in data) {
				console.log(data[property].name);
				$("#bilderDieGespeichertWerden").append('<li class="list-group-item">' + data[property].name + '</li>');
			}
			console.log("aufUsbStickSpeichern antwortet!");



		});



		console.log("ok");
		$("#aufUsbSpeichern").click(function () {
			console.log("auch drin");
		});
	} else {
		console.log("nicht ok");
	}

	/**
	$("#aufUsbSpeichern").click(function (event) {
		var picturesToSave = [];
		var $h2 = $("h2");
		$("input:checked").each(function () {
			picturesToSave.push({"name": this.name});
		});
		event.preventDefault();
		
		var request = $.ajax({
			url: "/picturesToSave",
			dataType: "json",
			method: "POST",
			data: picturesToSave
		});
		
		request.done(function(data){
			console.log(data);
		});

	});
	**/
}
$(document).ready(main);