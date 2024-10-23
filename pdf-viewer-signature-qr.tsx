'use client'

import React, { useState, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import SignatureCanvas from 'react-signature-canvas'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

export default function Component() {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [signature, setSignature] = useState<string | null>(null)
  const [qrText, setQrText] = useState('https://example.com')
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

  const downloadQRCode = () => {
    const svg = document.getElementById("qr-code")
    const svgData = new XMLSerializer().serializeToString(svg!)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx!.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.download = "QRCode"
      downloadLink.href = `${pngFile}`
      downloadLink.click()
    }
    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-6">
        <Tabs defaultValue="pdf" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pdf">PDF Viewer</TabsTrigger>
            <TabsTrigger value="signature">Signature</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>
          <TabsContent value="pdf">
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
            <Button onClick={addSignatureToPdf} className="w-full">
              Add Signature to PDF
            </Button>
          </TabsContent>
          <TabsContent value="signature">
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
          </TabsContent>
          <TabsContent value="qr">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-text">QR Code Content</Label>
                <Input
                  id="qr-text"
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  placeholder="Enter text or URL for QR code"
                />
              </div>
              <div className="flex justify-center">
                <QRCodeSVG
                  id="qr-code"
                  value={qrText}
                  size={200}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"L"}
                  includeMargin={false}
                />
              </div>
              <Button onClick={downloadQRCode} className="w-full">
                Download QR Code
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}