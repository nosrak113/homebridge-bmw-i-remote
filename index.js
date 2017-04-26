var request = require("request");
var Service, Characteristic;

module.exports = function(homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;

	homebridge.registerAccessory("homebridge-bmw-i-remote", "BMWIRemote", bmwiremote);
};

function bmwiremote(log, config) {
	this.log = log;
	this.name = config["name"];
	this.vin = config["vin"];
  this.username = config["username"];
	this.password = config["password"];
	this.authbasic = config["authbasic"];
	this.currentState = (config["defaultState"] == "lock") ? Characteristic.LockCurrentState.SECURED  : Characteristic.LockCurrentState.UNSECURED;
	this.log("locked = " + this.currentState);

	this.refreshToken = "";
	this.refreshtime = 0;
	this.authToken = "";

	this.lockservice = new Service.LockMechanism(this.name);

	this.lockservice
		.getCharacteristic(Characteristic.LockCurrentState)
		.on('get', this.getState.bind(this));

	this.lockservice
		.getCharacteristic(Characteristic.LockTargetState)
		.on('get', this.getState.bind(this))
		.on('set', this.setState.bind(this));
}

bmwiremote.prototype.getState = function(callback) {
	this.log("current lock state is " + this.currentState);
	this.getauth(function(err){
		this.log("got the callback");
				if (err){
					callback(err,this.currentState);
				}
				else{
					callback(null, this.currentState);
				}
	}.bind(this));
},

bmwiremote.prototype.setState = function(state, callback) {
	console.log("Set state to ", state);
	var lockState = (state == Characteristic.LockTargetState.SECURED) ? "lock" : "unlock";
	this.log("Set state to ", lockState);

   	this.lockRequest(state, function(err) {
			if (err) {
				callback(err);
			}

		this.log("Success ", (lockState == "lock" ? "locking" : "unlocking"));
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
					url: 'https://b2vapi.bmwgroup.us/webapi/v1/user/vehicles/' + this.vin + '/executeService',
					headers: {
	    		'User-Agent': 'MCVApp/1.5.2 (iPhone; iOS 9.1; Scale/2.00)',
					'Authorization': 'Bearer ' + this.authToken,
				},
				form : {
					'serviceType': callLockstate,
				}
				},function(err, response, body) {
						console.log(' set REQUEST RESULTS:', err, response.statusCode, body);
						 if (!err && response.statusCode == 200) {
							 callback(null);
						 }else{
							 callback( new Error(esponse.statusCode));
						 }
				}.bind(this));
		}.bind(this));
    },


bmwiremote.prototype.getServices = function() {
	return [this.lockservice];
},

bmwiremote.prototype.getauth = function(callback) {
	if (this.needsAuthRefresh()) {
			request.post({
				url: 'https://b2vapi.bmwgroup.us/webapi/oauth/token/',
				headers: {
				'Content-Type' : 'application/x-www-form-urlencoded',
    		'User-Agent': 'MCVApp/1.5.2 (iPhone; iOS 9.1; Scale/2.00)',
				'Authorization': 'Basic ' + this.authbasic,
  			},
				form: {
					'username': this.username,
					'password': this.password,
					'scope':'remote_services vehicle_data',
					'grant_type':'password'
				}
			},function(err, response, body) {
				 if (!err && response.statusCode == 200) {
					 var tokens = JSON.parse(body);
					 var d = new Date();
				   var n = d.getTime();

					 this.refreshToken = tokens["refresh_token"];
					 this.authToken = tokens["access_token"];
					 this.refreshtime =  n + tokens["expires_in"];
					 this.log ('Got auth: ' + this.authToken);
					 callback(null);
				 }
				 else{
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
	var d = new Date();
  var n = d.getTime();
console.log(n);
console.log(this.refreshtime);

	if (n > this.refreshtime) {
		return true;
	}
	return false;
};
