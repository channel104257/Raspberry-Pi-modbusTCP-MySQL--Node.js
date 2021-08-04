const moment = require('moment');

// create an empty modbus client
const ModbusRTU = require("modbus-serial");
const client0 = new ModbusRTU();
const client1 = new ModbusRTU();
const client2 = new ModbusRTU();

const networkErrors = ["ESOCKETTIMEDOUT", "ETIMEDOUT", "ECONNRESET", "ECONNREFUSED", "EHOSTUNREACH"];

client0.connectTCP("XXX.XXX.XXX.XXX", { port: 502 })
  .then(setClient1)
  .then( () => {
    console.log("Connect, serverID : 1, IP : XXX.XXX.XXX.XXX");})
  .catch( (e) => {
    if(e.errno){
      if(networkErrors.includes(e.errno)){
	console.log("We have to reconnect");
	}
      }
    console.log(e.message); });
    
function setClient1(){
  client0.setID(1);
  client0.setTimeout(1000);
  } 
     
client1.connectTCP("XXX.XXX.XXX.XXX", { port: 502 })
  .then(setClient2)
  .then( () => {
    console.log("Connect, serverID : 2, IP : XXX.XXX.XXX.XXX");})
  .catch( (e) => {
    if(e.errno){
      if(networkErrors.includes(e.errno)){
	console.log("We have to reconnect");
	}
      }
    console.log(e.message); });

function setClient2(){
  client1.setID(2);
  client1.setTimeout(1000);
  } 
  
client1.connectTCP("XXX.XXX.XXX.XXX", { port: 502 })
  .then(setClient2)
  .then( () => {
    console.log("Connect, serverID : 3, IP : XXX.XXX.XXX.XXX");})
  .catch( (e) => {
    if(e.errno){
      if(networkErrors.includes(e.errno)){
	console.log("We have to reconnect");
	}
      }
    console.log(e.message); });

function setClient2(){
  client1.setID(3);
  client1.setTimeout(1000);
  } 

const mysql = require('mysql');

let pool0 = mysql.createPool({
  host: "localhost",
  user: 'user',
  password: 'password',
  database: "ModbusDB"
});

let pool1 = mysql.createPool({
  host: "localhost",
  user: 'user',
  password: 'password',
  database: "ModbusDB"
});

let pool2 = mysql.createPool({
  host: "localhost",
  user: 'user',
  password: 'password',
  database: "ModbusDB"
});

setInterval( () => {
	
  client0.writeFC3(1, 1, 25, (err, data) => {
    let temp = data.data[0]*0.01;
    let RH = data.data[2]*0.01;
    let CO2 = data.data[20];
     
      pool0.getConnection(function(err, connection) {
      //create table call "modbusData" and store Temperature, Humidity, CO2.
      let sql = "INSERT INTO modbusData (Temperature, Humidity, CO2) VALUES ?";
      let values = [[parseFloat(temp.toPrecision(12)), parseFloat(RH.toPrecision(12)), CO2]];
      connection.query(sql, [values], function (err, result) {
	if (err) throw err;
	  console.log("Server0 IP:XXX.XXX.XXX.XXX");
	  console.log("系統時間：" + moment().format('YYYY年MM月DD日 HH:mm:ss'));
	  console.log("Temperature:" + parseFloat(temp.toPrecision(12)) + "oC");
	  console.log("Humidity:" + parseFloat(RH.toPrecision(12)) + "%");	
	  console.log("CO2:" + CO2 + "ppm");					
	  console.log("----------------------------------------------------------------------");
	});
      connection.release();
      });
    });
      
    client1.writeFC3(2, 1, 25, (err, data) => {
      let temp = data.data[0]*0.01;
      let RH = data.data[2]*0.01;
      let CO2 = data.data[20];  
    
      pool1.getConnection(function(err, connection) {
      //create table call "modbusData" and store Temperature, Humidity, CO2.
      let sql = "INSERT INTO modbusData1 (Temperature, Humidity, CO2) VALUES ?";
      let values = [[parseFloat(temp.toPrecision(12)), parseFloat(RH.toPrecision(12)), CO2]];
      connection.query(sql, [values], function (err, result) {
	if (err) throw err;
	  console.log("Server1 IP:XXX.XXX.XXX.XXX");
	  console.log("系統時間：" + moment().format('YYYY年MM月DD日 HH:mm:ss'));
	  console.log("Temperature:" + parseFloat(temp.toPrecision(12)) + "oC");
	  console.log("Humidity:" + parseFloat(RH.toPrecision(12)) + "%");	
	  console.log("CO2:" + CO2 + "ppm");					
	  console.log("----------------------------------------------------------------------");
	});
      connection.release();
      });
    });
    
    client1.writeFC3(3, 1, 25, (err, data) => {
      let temp = data.data[0]*0.01;
      let RH = data.data[2]*0.01;
      let CO2 = data.data[20];  
    
      pool1.getConnection(function(err, connection) {
      //create table call "modbusData" and store Temperature, Humidity, CO2.
      let sql = "INSERT INTO modbusData1 (Temperature, Humidity, CO2) VALUES ?";
      let values = [[parseFloat(temp.toPrecision(12)), parseFloat(RH.toPrecision(12)), CO2]];
      connection.query(sql, [values], function (err, result) {
	if (err) throw err;
	  console.log("Server2 IP:XXX.XXX.XXX.XXX");
	  console.log("系統時間：" + moment().format('YYYY年MM月DD日 HH:mm:ss'));
	  console.log("Temperature:" + parseFloat(temp.toPrecision(12)) + "oC");
	  console.log("Humidity:" + parseFloat(RH.toPrecision(12)) + "%");	
	  console.log("CO2:" + CO2 + "ppm");					
	  console.log("----------------------------------------------------------------------");
	});
      connection.release();
      });
    });
    
}, 5000);
