var request = require("request");
var Service, Characteristic;
// require('request-debug')(request);

module.exports = function(homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;

	homebridge.registerAccessory("homebridge-bmw-connected", "BMWIRemote", bmwiremote);
};

function bmwiremote(log, config) {
	this.log = log;
	this.name = config["name"];
	this.vin = config["vin"];
  this.username = config["username"];
	this.password = config["password"];
	this.authbasic = config["authbasic"];
	this.authtoken = config["authtoken"];
	this.currentState = (config["defaultState"] == "lock") ? Characteristic.LockCurrentState.SECURED  : Characteristic.LockCurrentState.UNSECURED;
	// this.log("locked = " + (this.currentState == Characteristic.LockTargetState.SECURED) ? "locked" : "unlocked");
	this.securityQuestionSecret = config["securityQuestionSecret"]

	this.log("0.1.16");

	this.refreshToken = "";
	this.refreshtime = 0;
	//this.authToken = "";

	this.lastUpdate = 0;

	this.lockservice = new Service.LockMechanism(this.name);

	this.lockservice
		.getCharacteristic(Characteristic.LockCurrentState)
		.on('get', this.getState.bind(this));

	this.lockservice
		.getCharacteristic(Characteristic.LockTargetState)
		.on('get', this.getState.bind(this))
		.on('set', this.setState.bind(this));



	this.stateRequest(function(err,state){
		if (err){
			if (err){this.log("Auth Error: " + err + "Check your creds")}
			this.log("Current lock state is " + ((this.currentState == Characteristic.LockTargetState.SECURED) ? "locked" : "unlocked"));
		}else{
			this.currentState = state
			this.lockservice.setCharacteristic(Characteristic.LockCurrentState, this.currentState);
			this.log("Current lock state is " + ((this.currentState == Characteristic.LockTargetState.SECURED) ? "locked" : "unlocked"));
		}
	}.bind(this))

}

bmwiremote.prototype.getState = function(callback) {
				this.log("Current lock state is " + ((this.currentState == Characteristic.LockTargetState.SECURED) ? "locked" : "unlocked"));
				callback(null, this.currentState);
},


bmwiremote.prototype.setState = function(state, callback) {
	var lockState = (state == Characteristic.LockTargetState.SECURED) ? "lock" : "unlock";
	this.log("Set state to", lockState);

   	this.lockRequest(state, function(err) {
			if (err) {
				callback(null);
				return
			}

		this.log("Success", (lockState == "lock" ? "locking" : "unlocking"));
			this.currentState = (state == Characteristic.LockTargetState.SECURED) ? Characteristic.LockCurrentState.SECURED : Characteristic.LockCurrentState.UNSECURED;
		this.lockservice
			.setCharacteristic(Characteristic.LockCurrentState, this.currentState);
			callback(null); // success
    	}.bind(this));
},

bmwiremote.prototype.lockRequest = function(state, callback) {
		this.getauth(function(err){
			if (err) {
				callback(err);
			}

				var callLockstate = (state == Characteristic.LockCurrentState.SECURED) ? "DOOR_LOCK" : "DOOR_UNLOCK";
				request.post({
					url: 'https://b2vapi.bmwgroup.com/webapi/v1/user/vehicles/' + this.vin + '/executeService',
					headers: {
	    		'User-Agent': 'MCVApp/1.5.2 (iPhone; iOS 9.1; Scale/2.00)',
					'Authorization': 'Bearer ' + this.authToken,
				},
				form : {
					'serviceType': callLockstate,
					'bmwSkAnswer': this.securityQuestionSecret,
				}
				},function(err, response, body) {
						 if (!err && response.statusCode == 200) {
							 callback(null);
						 }else{
							 callback( new Error(response.statusCode));
							 console.log(' ERROR REQUEST RESULTS:', err, response.statusCode, body);
						 }
				}.bind(this));
		}.bind(this));
    },

bmwiremote.prototype.stateRequest = function(callback) {
		this.getauth(function(err){
			if (err) {
				callback(err,this.currentState);
			}

				request.get({
					url: 'https://b2vapi.bmwgroup.com/webapi/v1/user/vehicles/' + this.vin +"/status",
					headers: {
	    			'User-Agent': 'MCVApp/1.5.2 (iPhone; iOS 11.0; Scale/2.00)',
					'Authorization': 'Bearer ' + this.authToken,
				},
				},function(err, response, body) {
						 if (!err && response.statusCode == 200) {
							//  console.log(' resp', err, response.statusCode, body);
							  var state = JSON.parse(body);
							  var cState = (state["vehicleStatus"]["doorLockState"] == "UNLOCKED") ? Characteristic.LockCurrentState.UNSECURED  : Characteristic.LockCurrentState.SECURED;
							 callback(null,cState);
						 }else{
							 callback( new Error(response.statusCode),this.currentState);
							 console.log(' ERROR REQUEST RESULTS:', err, response.statusCode, body);
						 }
				}.bind(this));
		}.bind(this));
    },


bmwiremote.prototype.getServices = function() {
	return [this.lockservice];
},

bmwiremote.prototype.getauth = function(callback) {
	if (this.needsAuthRefresh() === true) {
		this.log ('Getting Auth Token');
			request.post({
				url: 'https://customer.bmwgroup.com/gcdm/oauth/authenticate',
				headers: {
				'Host':	'customer.bmwgroup.com',
				'Origin':	'https://customer.bmwgroup.com',
				'Accept-Encoding':	'br, gzip, deflate',
				'Content-Type' : 'application/x-www-form-urlencoded',
    		'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_1_1 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/11.0 Mobile/15B150 Safari/604.1',
				'Origin': 'https://customer.bmwgroup.com',
				//'Authorization': 'Basic ' + this.authbasic,
  			},
				form: {
					'username': this.username,
					'password': this.password,
					'client_id':'dbf0a542-ebd1-4ff0-a9a7-55172fbfce35',
					'response_type': 'code',
					'redirect_uri':	'https://www.bmw-connecteddrive.com/app/default/static/external-dispatch.html',
					'scope': 'authenticate_user fupo',
					'state': 'eyJtYXJrZXQiOiJnYiIsImxhbmd1YWdlIjoiZW4iLCJkZXN0aW5hdGlvbiI6ImxhbmRpbmdQYWdlIiwicGFyYW1ldGVycyI6Int9In0',
					'locale': 'GB-en'
				}
			},function(err, response, body) {
				 if (!err && response.statusCode == 302) {
					 var tokens = JSON.parse(body);
					 this.log(tokens);
					 var d = new Date();
				   var n = d.getTime();

					 this.refreshToken = tokens["refresh_token"];
					 this.authToken = tokens["access_token"];
					 this.refreshtime =  n + tokens["expires_in"] * 1000;
					 this.log ('Got Auth Token: ' + this.authToken.substr(0,5));
					 callback(null);
				 }
				 else{
				this.log('Error getting Auth Token');
				 callback(response.statusCode);
			 			}
				}.bind(this)
		);
	}
	else{
		callback(null);
	}

},

bmwiremote.prototype.needsAuthRefresh = function () {
	var currentDate = new Date();
  	var now = currentDate.getTime();
 	// console.log("Now   :" + now);
 	// console.log("Later :" + this.refreshtime);
	if (now > this.refreshtime) {
		return true;
	}
	return false;
};
