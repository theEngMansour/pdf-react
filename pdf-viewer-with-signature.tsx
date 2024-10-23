'use client'

import React, { useState, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

export default function Component() {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [signature, setSignature] = useState<string | null>(null)
  const signatureRef = useRef<SignatureCanvas>(null)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  const clearSignature = () => {
    signatureRef.current?.clear()
    setSignature(null)
  }

  const saveSignature = () => {
    if (signatureRef.current) {
      const dataUrl = signatureRef.current.toDataURL()
      setSignature(dataUrl)
    }
  }

  const addSignatureToPdf = () => {
    // In a real application, you would use a library like pdf-lib
    // to add the signature to the PDF and then save it
    console.log('Adding signature to PDF')
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-6">
        <div className="mb-4">
          <Document
            file="/placeholder.pdf"
            onLoadSuccess={onDocumentLoadSuccess}
            className="border border-gray-300 rounded-lg overflow-hidden"
          >
            <Page pageNumber={pageNumber} width={300} />
          </Document>
          <p className="text-center mt-2">
            Page {pageNumber} of {numPages}
          </p>
        </div>
        
        <div className="mb-4">
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              className: 'border border-gray-300 rounded-lg w-full h-40'
            }}
          />
        </div>
        
        <div className="flex justify-between mb-4">
          <Button onClick={clearSignature} variant="outline">Clear Signature</Button>
          <Button onClick={saveSignature}>Save Signature</Button>
        </div>
        
        {signature && (
          <div className="mb-4">
            <p className="mb-2">Preview:</p>
            <img src={signature} alt="Signature" className="border border-gray-300 rounded-lg" />
          </div>
        )}
        
        <Button onClick={addSignatureToPdf} className="w-full">
          Add Signature to PDF
        </Button>
      </CardContent>
    </Card>
  )
}