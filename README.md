# Raspberry-Pi-modbusTCP-MySQL--Node.js
在樹梅派上基於Node.js<br>
使用modbusTCP讀取server端資料並存取至MySQL中<br>

## npm套件
* moment        https://www.npmjs.com/package/moment
* modbus-serial https://www.npmjs.com/package/modbus-serial
* mysql         https://www.npmjs.com/package/mysql

## 說明
### 設定server端裝置連線
連接三台server的設定如下
```javascript
client.connectTCP("XXX.XXX.XXX.XXX", { port: XXXX })
  .then(setClient1)
  .then( () => {
    console.log("Connect, serverID : ID, IP : XXX.XXX.XXX.XXX");})
  .catch( (e) => {
    if(e.errno){
      if(networkErrors.includes(e.errno)){
	console.log("We have to reconnect");
	}
      }
    console.log(e.message); });
    
function setClient(){
  client.setID(1);
  clien0.setTimeout(1000);
} 
```
>在 setClient()函數中，務必設定每台裝置的ID編號
>```javascript
>.setID(id) //Sets the unit id
>```
### 設定MySQL連線池
```javascript
let pool = mysql.createPool({
  host: "localhost",
  user: 'user', //自己的帳號
  password: 'password', //自己的密碼
  database: "ModbusDB"
});
```
### 讀取並寫入資料至MySQL
```javascript
client.writeFC3(1, 1, 25, (err, data) => {
    let temp = data.data[0]*0.01;
    let RH = data.data[2]*0.01;
    let CO2 = data.data[20];
     
      pool.getConnection(function(err, connection) {
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
````
modbusTCP部分<br>
>在透過modbusTCP讀取資料時，請使用以下函式
>```javascript
>.writeFC3 (unit, address, length, callback) //Writes "Read Holding Registers" (FC=03) request to serial port.
>```
>unit {number} : 裝置ID(前段程式自訂的)<br>
>address {number} : 資料起始位置<br>
>length {number} : 讀取資料長度<br>
>callback {function} : 回呼函式，調用函式應為function(error, data) { ... }<br>

MySQL部分
>開啟連接池連線<br>
>```javascript
>pool.getConnection(function(err, connection) {...}};
>```
>將所需使用的SQL指令包裝進sql變數中<br>
>透過查詢的方法來使用<br>
>```javascript
>let sql = "INSERT INTO modbusData (Temperature, Humidity, CO2) VALUES ?";
>let values = [[parseFloat(temp.toPrecision(12)), parseFloat(RH.toPrecision(12)), CO2]];
>connection.query(sql, [values], function (err, result) {
>   if (err) throw err;
>   .
>   .
>   .
>});

最後在終端機顯示回傳的資料

## 參考表格
### server端資料
No  |Register number 1-based |Register hex address |Content          |R/W |Signed unsigned   |Scaling | Unit
--- |------------------------|-------------------- |----             |--- |----------------  |--------|------
1   |40001                   |0x0000               |Temperature      |R   |signed integer    |1:100   |℃,°F
2   |40003                   |0x0002               |Relative humidity|R   |unsigned integer  |1:100   |%
3   |40021                   |0x0014               |Temperature      |R   |unsigned integer  |1:1     |ppm

## 備註
此程序一旦未讀取到資料，便會立即報錯。
