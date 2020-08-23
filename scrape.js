const fs = require('fs');
const download = require('./util/download');
const csv = require('csv-parser');


let data = [];

if(!process.argv[2] || !process.argv[3]) {
  throw 'You must pass the input/output file as an argument';
}


function downloadAll() {
  if(data.length > 0) {
    const product = data.pop();
      download(`https://www.rejectshop.com.au${product.URL}`, (res) => {
        if(res.ok) {
          res.body.pipe(fs.createWriteStream(`${process.argv[3]}/${product.Identifier}.jpg`)).on('close', () => {
            console.log(`Downloading ${product.Identifier} to /${process.argv[3]}/${product.Identifier}`);
            downloadAll();
          });
        } else {
          console.log('Could not download, moving to next image');
          downloadAll();
        }
        
        
      });

  }
}

fs.createReadStream(process.argv[2])
  .pipe(csv())
  .on('data', (row) => {
    data.push(row);
  })
  .on('end', () => {
    downloadAll(data);
  });



