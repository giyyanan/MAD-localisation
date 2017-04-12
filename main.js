var config = {
	apiKey: "AIzaSyAGCZbEkvC0hTGh5M-YABT9_KCTQ5jK5bo",
	authDomain: "ad-hoc-building-sensor-devices.firebaseapp.com",
	databaseURL: "https://ad-hoc-building-sensor-devices.firebaseio.com",
	storageBucket: "ad-hoc-building-sensor-devices.appspot.com",
};

var instance_id;//="-KYGUYsamLdgQ6TpDX3v";
var device_store;
var devices = {};
var devices_count = {};
var material_icons = {
	"FLASH":'<i class="material-icons">highlight</i>',
	"LIGHT":'<i class="material-icons">lightbulb_outline</i>',
	"TEMPERATURE":'<i class="ionicons ion-thermometer"></i>',

}
var roomDiv;
var buildRoom = function(){
	connectFirebase();
	roomDiv = document.getElementById('room');
	if(!instance_id){
		fetchInstanceId();
	}
	if(instance_id){
		fetchDevicesforInstance();
	}
	//console.log(devices)
	
}
var fetchInstanceId = function(){
	$('#myModal').modal('show');
}
var updateInstanceId = function(){
	var instId = document.getElementById("instanceID").value;

	if(instId){
		firebase.database().ref('devices/').once('value', function(snapshot) {
			device_store=snapshot.val();
			/*snapshot.forEach(function(childSnapshot) {
				var childKey = childSnapshot.key;
				var childKey = childSnapshot.key;
				childData = childSnapshot.val();
				instances.push(String(childKey));
			});*/
			if(device_store.hasOwnProperty(instId)){
				instance_id = instId;
				$('#myModal').modal('hide');
				fetchDevicesforInstance();
			}
			else{
				alert("Instance id not found in firebase");
				document.getElementById("instanceID").value = "";
			}
		});
		
	}
	else{
		alert("instance Id is not entered");
	}

}
var fetchDevicesforInstance = function()
{ 
	if(instance_id)
	{
		firebase.database().ref('devices/'+instance_id).once('value', function(snapshot) {
			device_store=snapshot.val();
			/*snapshot.forEach(function(childSnapshot) {
				var childKey = childSnapshot.key;
				childData = childSnapshot.val();
				devices[childKey] = childData;

			});*/
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
	var devices = device_store;

	for(device in devices){
		console.log(devices[device]);
		cloneDiv = deviceDiv.cloneNode(true);
		cloneDiv.id=String(device);
		device_type = devices[device].config[Object.keys(devices[device].config)[0]].hasOwnProperty("type") ? devices[device].config[Object.keys(devices[device].config)[0]].type : "NONE"
		cloneDiv.innerHTML = material_icons[device_type];
		if(!(device_type in devices_count) )
			devices_count[device_type] = 0;
		
		if(devices[device].hasOwnProperty('location')){
			
			cloneDiv.style.left = devices[device].location.coordinates.X;
			cloneDiv.style.top = devices[device].location.coordinates.Y;
			cloneDiv.style.position = 'absolute';
			roomDiv.appendChild(cloneDiv);
			
			cloneDiv.innerHTML = material_icons[device_type];

		}
		else{
			devicesDiv.appendChild(cloneDiv);
			devices_count[device_type] += 1;
		}
			$( "#"+String(device) ).fadeOut(1);
			$( "#"+String(device) ).fadeIn(2000);

	}
	updateDeviceCount();

	

}
var updateDeviceCount = function(){
	var devicesCount = document.getElementById("devices_count");
	devicesCount.innerHTML="";
	for(types in devices_count){
		devicesCount.innerHTML += " "+ String(types)+ " : "+ String(devices_count[types]) 

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
	var device = document.getElementById(deviceID);
	event.target.appendChild(device);
	device.style.left = event.offsetX;
	device.style.top = event.offsetY;
	device.style.position = 'absolute';
	event.stopPropagation();
	updateDeviceLocation(deviceID);
	device_type = device_store[deviceID].config[Object.keys(device_store[deviceID].config)[0]].hasOwnProperty("type") ? device_store[deviceID].config[Object.keys(device_store[deviceID].config)[0]].type : "NONE"
	devices_count[device_type] >0 ? devices_count[device_type]-= 1 : devices_count[device_type] =0;
	updateDeviceCount();
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