const {PDFDocument} = require('pdf-lib');
const puppeteer = require('puppeteer');

const fs = require('fs').promises

class pdfEssentials{
    
    constructor(){
        this.doc = undefined

        this.loadOptions = {
            ignoreEncryption: true
        }
    }

    async _checkDoc(){
        if(!this.doc){
            this.doc = await PDFDocument.create()
            this.doc.setAuthor('PDF-essentials')
            this.doc.setCreator('PDF-essentials')
            this.doc.setCreationDate(new Date())
        }
    }

    async _getInputAsBuffer(input){
        if(input instanceof Buffer || input instanceof ArrayBuffer){
            return input
        }

        return await fs.readFile(input)
    }

    async _addCompleteDocument(input){
        const src = await this._getInputAsBuffer(input)
        const srcDoc = await PDFDocument.load(src,this.loadOptions)

        const copiedPages = await this.doc.copyPages(srcDoc, srcDoc.getPageIndices())

        copiedPages.forEach((page) => {
            this.doc.addPage(page)
        })

    }



    async _addFromToPage(input, from, to){

        if(typeof from !== 'number' || typeof to !== 'number' || from < 1){
            throw new Error('Invalid function parameter. \'from\' or \'to\' must be positive \'numbers\'.')
        }

        if(to < from){
            throw new Error('Invalid function parameter. \'to\' must be greater than or equal to \'from\'')
        }

        const src = await this._getInputAsBuffer(input)
        const srcDoc = await PDFDocument.load(src,this.loadOptions)
        
        const pageCount = srcDoc.getPageCount()
        if(to >= pageCount || from >= pageCount){
            throw new Error(`Invalid function parameter. The document doesnt have enough pages. (from: ${from}, to: ${to}, pages: ${pageCount},)`)
        }



        const range = (start, stop) => Array.from({length: (stop - start + 1)}, (_, i) => start - 1 + i)
        const copiedPages = await this.doc.copyPages(srcDoc, range(from, to))

        copiedPages.forEach((page) => {
            this.doc.addPage(page)
        })
    }

    


    async _addGivenPages(input, page){

        const src = await this._getInputAsBuffer(input)
        const srcDoc = await PDFDocument.load(src,this.loadOptions)

        // indexed from 0 as we get input from reference from 1
        const indexFrom1 = page.map(x => x - 1)

        const copiedPages = await this.doc.copyPages(srcDoc, indexFrom1)

        copiedPages.forEach((page) => {
            this.doc.addPage(page)
        })
    }

    async add(inputFile, pages) {

        await this._checkDoc();

        if (typeof pages === 'undefined' || pages === null) {
            await this._addCompleteDocument(inputFile)
        } else if (Array.isArray(pages)) {
            await this._addGivenPages(inputFile, pages)
        } else if (typeof pages === 'number') {
            await this._addGivenPages(inputFile, new Array(pages.toString()))
        } else if (pages.toLowerCase().indexOf('to') > 0) {
            const span = pages.replace(/ /g, '').split('to')
            await this._addFromToPage(inputFile, parseInt(span[0]), parseInt(span[1]))
        } else if (pages.indexOf('-') > 0) {
            const span = pages.replace(/ /g, '').split('-')
            await this._addFromToPage(inputFile, parseInt(span[0]), parseInt(span[1]))
        } else if (pages.toString().trim().match(/^[0-9]+$/)) {
            await this._addGivenPages(inputFile, new Array(pages))
        } else {
            throw new Error('invalid parameter "pages"')
        }
    }

    // work in progress - 02-10-2022
    async _splitPDFinFixedRange(input, fixedRange){

        const src = await this._getInputAsBuffer(input)
        const srcDoc = await PDFDocument.load(src,this.loadOptions)

        const length = srcDoc.getPageCount()
        const count = length / fixedRange
    
        

        const newPDF = await PDFDocument.create()
        newPDF.setAuthor('PDF-essentials')
        newPDF.setCreator('PDF-essentials')
        newPDF.setCreationDate(new Date())


        const range = (fixedRange, count) => Array.from({length: (count + ((length-count*fixedRange) ? 1 : 0))}, (_, i) => i * fixedRange)
        console.log(range(fixedRange, count), fixedRange, count, length, count + ((length-count*fixedRange) ? 1 : 0))
        // const copiedPages = await newPDF.copyPages(srcDoc, range(from, to))

    }

    async _bufferAddFromToPage(input, from, to){

        if(typeof from !== 'number' || typeof to !== 'number' || from < 1){
            throw new Error('Invalid function parameter. \'from\' or \'to\' must be positive \'numbers\'.')
        }

        if(to < from){
            throw new Error('Invalid function parameter. \'to\' must be greater than or equal to \'from\'')
        }

        const src = await this._getInputAsBuffer(input)
        const srcDoc = await PDFDocument.load(src,this.loadOptions)
        
        const pageCount = srcDoc.getPageCount()
        if(to > pageCount || from < 1){
            throw new Error(`Invalid function parameter. The document doesnt have enough pages. (from: ${from}, to: ${to}, pages: ${pageCount})`)
        }

        const newPDF = await PDFDocument.create()
        newPDF.setAuthor('PDF-essentials')
        newPDF.setCreator('PDF-essentials')
        newPDF.setCreationDate(new Date())


        const range = (start, stop) => Array.from({length: (stop - start + 1)}, (_, i) => start - 1 + i)
        const copiedPages = await newPDF.copyPages(srcDoc, range(from, to))

        copiedPages.forEach((page) => {
            newPDF.addPage(page)
        })

        const uInt8Array = await newPDF.save()
        return Buffer.from(uInt8Array)
        
    }

    // working when we have fexible ranges
    async split(input, ranges, fixedRange){

        const splitPdfs = new Array()
        
        if(typeof fixedRange === 'number'){

            await this._splitPDFinFixedRange(input, fixedRange);

        } else if(Array.isArray(ranges)){

            var i = 1

            for(const range of ranges){
                var newPDF = new ArrayBuffer
                newPDF = await this._bufferAddFromToPage(input, range[0], range[1])
                splitPdfs.push(Buffer.from(newPDF))
            }

        }

        return splitPdfs
    
    }

    // convert HTML code to PDF
    async htmlToPDF(code){        
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(code);
        const pdfBuffer = await page.pdf({ format: 'a4'});
        await browser.close();
        return pdfBuffer
    }

    async urlToPDF(url){
        // have to handle if a user doesnt pass URL with http
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        try {
            await page.goto(url, {
                waitUntil: 'networkidle2',
            });
            
        } catch (error) {
            throw new Error(error)
        }
        await page.emulateMediaType('screen')
        const pdfBuffer = await page.pdf({ format: 'a4'});
        await browser.close();
        return pdfBuffer
    }

    async save(fileName){
        
        await this._checkDoc()
        const pdfBytes = await this.doc.save()
        await fs.writeFile(fileName, pdfBytes)
    }

    async saveAsBuffer () {
        await this._checkDoc()
        const uInt8Array = await this.doc.save()
        return Buffer.from(uInt8Array)
    }

}

module.exports = pdfEssentials