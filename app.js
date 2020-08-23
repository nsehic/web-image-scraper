const Crawler = require("crawler");
const fs = require('fs');
const csv = require('csv-parser');

// const download = require('./util/download');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

if(!process.argv[2]) {
  throw 'You must pass the input file as an argument';
}

const csvWriter = createCsvWriter({
  path: process.argv[2],
  header: [
    {id: 'p_sku', title: 'p_sku'},
    {id: 'p_title', title: 'p_title'},
    {id: 'p_description', title: 'p_description'}
  ]
});

let data = [];
let new_data = [];

const c = new Crawler({
  maxConnections : 10,
  callback : function (error, res, done) {
      if(error){
          console.log(error);
      }else{
          const $ = res.$;
          const p_sku = $('#productsku').text().match(/[0-9]{8,12}/)[0];
          const p_title = $('.name').text();
          // const p_image = 'https://www.rejectshop.com.au' + $('.lazyOwl').attr('data-src');
          const p_description = $('br','.tab-details').next().text()
          new_data.push({
            p_sku,
            p_title,
            p_description
          });

          console.log(`Importing ${p_sku} - ${p_title}`);

          //OPTION TO DOWNLOAD IMAGE

          // download(image, `images/${sku}.jpg`, () => {
          //   console.log(`Loading product: ${sku} - ${description}`);
          // });

          
      }
      done();
  }
});


c.on('drain',function(){
  csvWriter
  .writeRecords(new_data)
  .then(()=> console.log('The CSV file was written successfully'));
});


// fs.readFile(process.argv[2], 'utf8', function (err, data) {
//   const articles = data.split(/\r?\n/); 
//   c.queue(articles.map(article => `https://www.rejectshop.com.au/p/${article.replace(/[\\$'"]/g, "\\$&")}`));
// });

fs.createReadStream(process.argv[2])
  .pipe(csv())
  .on('data', (row) => {
    data.push(row);
  })
  .on('end', () => {
    c.queue(data.map(d => `https://www.rejectshop.com.au/p/${d.p_sku}`));
  });


