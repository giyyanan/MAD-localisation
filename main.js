var config = {
	apiKey: "AIzaSyAGCZbEkvC0hTGh5M-YABT9_KCTQ5jK5bo",
	authDomain: "ad-hoc-building-sensor-devices.firebaseapp.com",
	databaseURL: "https://ad-hoc-building-sensor-devices.firebaseio.com",
	storageBucket: "ad-hoc-building-sensor-devices.appspot.com",
};

var instance_id = "-KYGUYsamLdgQ6TpDX3v";
var device_store;
var devices = [];
var roomDiv;
var buildRoom = function(){
	roomDiv = document.getElementById('room');
	fetchDevicesforInstance();
	//console.log(devices)
	
}
var fetchDevicesforInstance = function()
{
	if(connectFirebase())
	{
		firebase.database().ref('devices/'+instance_id).once('value', function(snapshot) {
			device_store=snapshot.val();
			snapshot.forEach(function(childSnapshot) {
				var childKey = childSnapshot.key;
				childData = childSnapshot.val();
				devices.push(childKey);

			});
			addDevices();
		});
	}
	else{
		alert("Firebase connection failed");
	}
}

var addDevices = function(){
	var deviceDiv = document.getElementById("device");
	var devicesDiv = document.getElementById("devices");
	var cloneDiv;
	for(device in devices){
		console.log(devices[device]);
		cloneDiv = deviceDiv.cloneNode(true);
		cloneDiv.id=devices[device];
		if(device_store[devices[device]].hasOwnProperty('location')){
			roomDiv.appendChild(cloneDiv);
			cloneDiv.style.left = device_store[devices[device]].location.coordinates.X;
			cloneDiv.style.top = device_store[devices[device]].location.coordinates.Y;
		}
		else{
			devicesDiv.appendChild(cloneDiv);
		}
	}
	

}

var connectFirebase = function(){

	firebase.initializeApp(config);

	return true;
}

var dragStart=function(event){
	//console.log(event)
	event.dataTransfer.setData("id", event.target.id);
}

var dragging = function(event){
	event.preventDefault();console.log(event)
}

var deviceDropped = function(event){
	console.log(event)
	event.preventDefault();
	var deviceID = event.dataTransfer.getData("id");
	var device = document.getElementById(deviceID)
	event.target.appendChild(device);
	device.style.left = event.offsetX;
	device.style.top = event.offsetY;

	event.stopPropagation();
	updateDeviceLocation(deviceID)
}
var updateDeviceLocation = function(deviceID){
	var coordinates = getDeviceLocation(deviceID);
	firebase.database().ref('devices/'+instance_id+'/'+deviceID+'/location/coordinates').set({
		X:coordinates.split(',')[0],
		Y:coordinates.split(',')[1],
	});

}
var getDeviceLocation = function(deviceID){
	var selectedDevice = document.getElementById(deviceID);
	if(selectedDevice.parentNode.id === "room"){
		console.log("X:"+selectedDevice.style.left+"Y:"+selectedDevice.style.top);
	}
	return(selectedDevice.style.left.split('px')[0]+","+selectedDevice.style.top.split('px')[0])
}

var showDeviceInfo = function(event){
	console.log(event.target.style)
	alert(getDeviceLocation(event.target.id));

	
}