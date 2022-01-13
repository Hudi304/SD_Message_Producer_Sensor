var amqp = require("amqplib/callback_api");

var fs = require("fs");

var faker = require("faker");

amqp.connect(
  "amqps://kkxmqqnb:udXWnNT4STe4NESQhsqIarfYG-IwOnv0@roedeer.rmq.cloudamqp.com/kkxmqqnb",
  function (error0, connection) {
    if (error0) {
      console.log(" ERROR ", error0);
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      var queue = "hello";
      var msg = "Hello world";

      channel.assertQueue(queue, {
        durable: false,
      });

      var x = 0;

      let sensorID;
      let sensorReadInterval;

      fs.readFile("./sensor-config.json", "utf8", function (err, data) {
        if (err) {
          return console.log("error : ", err);
        }
        const dataOBJ = JSON.parse(data);
        console.log("Config Sensor ID : ", dataOBJ.sensorID);

        sensorID = dataOBJ.sensorID;
        sensorReadInterval = dataOBJ.sensorReadIterval;
      });

      fs.readFile("./sensor.csv", "utf8", function (err, data) {
        if (err) {
          return console.log("error : ", err);
        }

        const dataArray = data.split("\n");
        var i = 0;
        var args = process.argv;

        // console.log(process.argv)

        console.log("sensorID", args[2]);

        const now = new Date();
        // console.log("now : ", now);
        // console.log("now : ", now.toDateString());
        console.log("now : ", now.toUTCString());
        // console.log("now : ", now.toString());

        const dates = getLastTwoWeeks();
        // return;

        // let dateIndex = 0;

        setInterval(() => {
          // const value = {
          //   value: dataArray[i].trim(),
          //   // sensorID: sensorID,
          //   sensorID: args[2],
          //   timeStamp: now.toUTCString(),
          // };

          //? -------------------

          const value = {
            // value: dataArray[i].trim(),
            value: faker.datatype.number({
              min: 1 + i,
              max: 100 + i,
            }),

            // sensorID: sensorID,
            sensorID: args[2],
            timeStamp: dates[i].toUTCString(),
          };

          i++;
          channel.sendToQueue(queue, Buffer.from(JSON.stringify(value)));
          console.log(" [x] Sent %s", value);
        }, 1000);

        x++;
      });
    });
  }
);

function getLastTwoWeeks() {
  const now = new Date();

  const res = [];

  for (let day = 7; day >= 0; day--) {
    for (let hour = 0; hour < 24; hour++) {
      const d = new Date();
      d.setDate(now.getDate() - day);
      d.setHours(hour);
      d.setMinutes(15);

      res.push(d);

      const d2 = new Date();
      d2.setDate(now.getDate() - day);
      d2.setHours(hour);
      d2.setMinutes(45);

      res.push(d2);
    }
  }

  // console.log("res : ", res);

  return res;
}
