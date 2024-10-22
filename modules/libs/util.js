const moment = require('moment'); // Make sure you have Moment.js installed

class Util
{
    static random_str(n)
    {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < n; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        let timestamp = moment().format('YYYY-MM-DD-HH-mm-ss');
        result += "-" + timestamp;
        return result;
    }

    static read_csv(file)
    {
      let promise =  new Promise((resolve, reject)=>{
        try{ 
          const fs = require('fs');
          const csv = require('csv-parser');
          
          const results = [];
          
          fs.createReadStream(file) 
            .pipe(csv({
              mapHeaders: ({ header, index }) => header.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_'), // Optional: normalize headers
            }))
            .on('data', (data) => results.push(data))
            .on('end', () => {
              resolve(results);
            });
        }
        catch(e) {
          reject(e);
        }
      })
      return promise;
    }

    static includesIgnoreCase(array, searchTerm) {
      return array.some(element => element.toLowerCase() === searchTerm.toLowerCase());
    }
} 

module.exports = Util;