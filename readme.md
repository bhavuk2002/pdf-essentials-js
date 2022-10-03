# pdf-essentials-js
This a npm package for [PDF Essentials](https://www.pdfessentials.com). Merge, Split PDFs and many more.

## Installation
`npm install pdf-essentials-js`

## Current Functionalities:
- [Merge PDF](#h2merge-pdfh2)
    Merge multiple PDF Documents into one single PDF Document
- [Split PDF](#h2split-pdfh2)
    Split PDF Document into one or more PDF Documents
- [HTML to PDF](#h2html-to-pdfh2)
    Convert HTML code to PDF Document
- [URL to PDF](#h2url-to-pdfh2)
    Convert a website into PDF Document

## <h1>Usage</h1>

## <h2>Merge PDF</h2>
Any number of PDFs can be merged into single PDF.
### async node.js example
```js
const pdfEssentials = require('./pdf-essentials-js');
const newPDF = new pdfEssentials();

(async () => {
    // pass PDF path or PDF Buffer

    // add all the pages of sample pdf
    await newPDF.add('sample.pdf');
    // add 2nd page of PDF
    await newPDF.add('sample.pdf', 2);
    // add 3rd & 6th page
    await newPDF.add('sample.pdf', [3,6]);
    // add 2 , 3 , 4 , 5 to PDF
    await newPDF.add('sample.pdf', "2 to 5");
    // add 2, 3, 4, 5 to PDF
    await newPDF.add('sample.pdf', '2 - 5');
    
    // return Buffer of merged PDFs
    const buffer = await newPDF.saveAsBuffer();
    //or Download mreged PDF. Pass filename / path 
    await newPDF.save('merged.pdf');

})();
```

## <h2>Split PDF</h2>

### async node.js example
```js
const pdfEssentials = require('./pdf-essentials-js');
const pdfFunctions = new pdfEssentials();

(async () => {
    // First parameter - pdf path
    /* Second parameter - ranges in which pdfs have to be split. 
     Must pass in a array, any number of pairs [1, 5] is refered as a pair. */ 
    /* return array of Buffers of PDFs. 
    Number of buffer in array recieved is equal to number of elements of pairs in array we passed. */
    const buffer = await pdfFunctions.split('sample.pdf', [[1,5], [6, 10]]);
})();
```

## <h2>HTML to PDF</h2>

### async node.js example
```js
const pdfEssentials = require('./pdf-essentials-js');
const pdfFunctions = new pdfEssentials();

(async ()=>{
    // convert the given HTML Code into PDF, and return PDF Buffer
    const htmlCode = 
        `<!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Pdf Essentials</title>
        </head>
        <body>
            This is sample PDF created by <a href="http://www.pdfessentials.com">PDF Essentials</a> 
        </body>
        </html>`
    try {
        // pass your HTML Code
        // returns buffer of PDF
        const buffer = await pdfFunctions.htmlToPDF(htmlCode)
    
        // if you want to download file else use buffer
        const fs = require('fs').promises
        // download PDF 
        await fs.writeFile('file.pdf' , buffer)
    } catch (error) {
        // returns if any error occur
        console.log(error)
    }
})();
```

## <h2>URL to PDF</h2>

### async node.js example

```js
const pdfEssentials = require('./pdf-essentials-js');
const pdfFunctions = new pdfEssentials();

(async ()=>{
    try {
        // returns buffer of PDF
        const buffer = await pdfFunctions.urlToPDF("https://www.google.com");
        
        // if you want to download file else use buffer
        const fs = require('fs').promises
        // download PDF 
        await fs.writeFile('file.pdf' , buffer)
    } catch (error) {
        console.log(error)
    }
})();
```

## Upcoming Functionalties
- Images to PDF
- Compress PDF
- Protect PDF
- Add Watermark

## Support
- Contribute to the [code](https://github.com/bhavuk2002/pdf-essentials-js). Help us increase functionalties.
- Dont hesitate to create [Issues](https://github.com/bhavuk2002/pdf-essentials-js/issues/new)