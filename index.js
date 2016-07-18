var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

const APP_TOKEN = 'EXAQTBtWmusQBAPZCuItvXLWVPjb613TZBcZC5fsrMlwQ26k5G0A1wzkCbQBKNZBTN1WEylDsZBW0Q4fQ6DQt1zAorX5OGmenxk4wtFNqN2JZAAnvybMN3DZBx2AVOAyHMNaTZAeboKxezMZBYKFd76TcCdtuU0diHRCSam6ojXDzDZBqVUJnq8iDkD';

var app = express();
app.use(bodyParser.json());

app.listen(3000, function(){
	console.log("El servidor se encuentra en el puerto 3000");
});

app.get('/', function(req, res){
	res.send('Bienvenido al taller');
});

app.get('/webhook', function(req, res){
	if(req.query['hub.verify_token'] === 'test_token_say_hello'){
		res.send(req.query['hub.challenge']);
	}else{
		res.send('Tu no tienes que entrar aqui');
	}
});

app.post('/webhook', function(req, res){

	var data = req.body;
	if(data.object == 'page'){
	
		data.entry.forEach(function(pageEntry){
			pageEntry.messaging.forEach(function(messagingEvent){
				
				if(messagingEvent.message){
					receiveMessage(messagingEvent);	
				}
			
			});
		});
		res.sendStatus(200);
	}
});


function receiveMessage(event){
	var senderID = event.sender.id;
	var messageText = event.message.text;


	evaluateMessage(senderID, messageText);
}

function evaluateMessage(recipientId ,message){
	var finalMessage = '';

	if(isContain(message, 'ayuda')){
		finalMessage = 'Por el momento no te puedo ayudar';

	}else if(isContain(message, 'gato')){

	 sendMessageImage(recipientId);

	}else if(isContain(message, 'clima')){

		getWeather(function(temperature){

			message = getMessageWeather(temperature);
			sendMessageText(recipientId,message);

		});
	
	}else if(isContain(message, 'info')){

	 sendMessageTemplate(recipientId);

	}else{
		finalMessage = 'solo se repetir las cosas : ' + message;
	}
	sendMessageText(recipientId,finalMessage);
}

function sendMessageText(recipientId, message){
	var messageData = {
		recipient : {
			id : recipientId
		},
		message: {
			text: message
		}
	};
	callSendAPI(messageData);
}

function sendMessageImage(recipientId){
	var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: "http://i.imgur.com/SOFXhd6.jpg"
        }
      }
    }
  };
	callSendAPI(messageData);
}


function sendMessageTemplate(recipientId){
	var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [ elemenTemplate() ]
        }
      }
    }
  };
	callSendAPI(messageData);
}

function elemenTemplate(){
	return {
	  title: "Eduardo Ismael",
	  subtitle: "Desarrollado de Software en Código facilito",
	  item_url: "https://www.facebook.com/codigofacilito/?fref=ts",               
	  image_url: "http://i.imgur.com/SOFXhd6.jpg",
	  buttons: [ buttonTemplate() ],
  }
}

function buttonTemplate(){
	return{
		type: "web_url",
		url : "https://www.facebook.com/codigofacilito/?fref=ts",
		title : "Codigo Facilito"
	}
}

function callSendAPI(messageData){
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs : { access_token :  APP_TOKEN },
		method: 'POST',
		json: messageData
	}, function(error, response, data){

		if(error){
			console.log('No es posible enviar el mensaje');
		}else{
			console.log("El mensaje fue enviado");
		}

	});
}

function getMessageWeather(temperature){
	if (temperature > 30)
		return "Nos encontramos a "+ temperature +" Hay demaciado calor, te recomiendo que no salgas";
	return "Nos encontramos a "+ temperature +" es un bonito día para salir";
}

function getWeather(  callback ){
	request('http://api.geonames.org/findNearByWeatherJSON?lat=16.750000&lng=-93.116669&username=demo',
		function(error, response, data){
			if(!error){
				var response = JSON.parse(data);
				var temperature = response.weatherObservation.temperature;
				callback(temperature);
			}
		});
}

function isContain(sentence, word){
	return sentence.indexOf(word) > -1;
}
