'use strict';
var cron = require('node-cron');
var komga = require('./komga');

global.RUN = false;

exports.execute = function () {

  cron.schedule('0 0 */1 * * *', () => { /*cron every hour*/
      if(!global.RUN) {
        console.log('Executing tasks');
        global.RUN = true; /*just avoid two schedules at same time*/
        komga.tasks();
      }

  });

}
