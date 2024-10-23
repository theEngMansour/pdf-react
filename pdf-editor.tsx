'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import SignatureCanvas from 'react-signature-canvas'
import { QRCode } from 'qrcode.react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Move } from 'lucide-react'

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

type Element = {
  type: 'signature' | 'qr'
  x: number
  y: number
  width: number
  height: number
  data: string
}

export default function Component() {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [signature, setSignature] = useState<string | null>(null)
  const [qrText, setQrText] = useState('https://example.com')
  const [elements, setElements] = useState<Element[]>([])
  const [draggingElement, setDraggingElement] = useState<number | null>(null)
  const [scale, setScale] = useState(1)
  const signatureRef = useRef<SignatureCanvas>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    drawElements()
  }, [elements, scale])

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

  const addElement = (type: 'signature' | 'qr') => {
    if ((type === 'signature' && !signature) || (type === 'qr' && !qrText)) return

    const newElement: Element = {
      type,
      x: 50,
      y: 50,
      width: type === 'signature' ? 200 : 100,
      height: type === 'signature' ? 100 : 100,
      data: type === 'signature' ? signature! : 
        `data:image/svg+xml;base64,${btoa(QRCode.toString(qrText, {
          type: 'svg',
          width: 100,
          height: 100,
          level: 'L',
          margin: 0,
        }))}`
    }

    setElements([...elements, newElement])
  }

  const drawElements = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    elements.forEach((element) => {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, element.x * scale, element.y * scale, element.width * scale, element.height * scale)
      }
      img.src = element.data
    })
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale

    const clickedElementIndex = elements.findIndex(
      (el) => x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height
    )

    if (clickedElementIndex !== -1) {
      setDraggingElement(clickedElementIndex)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingElement === null) return

    const rect = canvasRef.current!.getBoundingClientRect()
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale

    setElements(elements.map((el, index) => 
      index === draggingElement 
        ? { ...el, x: x - el.width / 2, y: y - el.height / 2 }
        : el
    ))
  }

  const handleMouseUp = () => {
    setDraggingElement(null)
  }

  const removeElement = (index: number) => {
    setElements(elements.filter((_, i) => i !== index))
  }

  const savePdf = () => {
    // In a real application, you would use a library like pdf-lib
    // to add the elements to the PDF and then save it
    console.log('Saving PDF with added elements')
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <Tabs defaultValue="pdf" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pdf">PDF Editor</TabsTrigger>
            <TabsTrigger value="signature">Signature</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>
          <TabsContent value="pdf">
            <div className="mb-4 relative" ref={containerRef}>
              <Document
                file="/placeholder.pdf"
                onLoadSuccess={onDocumentLoadSuccess}
                className="border border-gray-300 rounded-lg overflow-hidden"
              >
                <Page 
                  pageNumber={pageNumber} 
                  width={containerRef.current?.clientWidth} 
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
            <div className="flex justify-between items-center mb-4">
              <p>
                Page {pageNumber} of {numPages}
              </p>
              <div className="flex items-center space-x-2">
                <Label htmlFor="scale">Scale:</Label>
                <Slider
                  id="scale"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[scale]}
                  onValueChange={([value]) => setScale(value)}
                  className="w-32"
                />
                <span>{scale.toFixed(1)}x</span>
              </div>
            </div>
            <div className="flex space-x-2 mb-4">
              <Button onClick={() => addElement('signature')} disabled={!signature}>
                Add Signature
              </Button>
              <Button onClick={() => addElement('qr')} disabled={!qrText}>
                Add QR Code
              </Button>
            </div>
            <div className="mb-4">
              {elements.map((element, index) => (
                <div key={index} className="flex items-center justify-between mb-2">
                  <span>{element.type === 'signature' ? 'Signature' : 'QR Code'}</span>
                  <Button variant="destructive" size="sm" onClick={() => removeElement(index)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <Button onClick={savePdf} className="w-full">
              Save PDF
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
                <QRCode
                  id="qr-code"
                  value={qrText}
                  size={200}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"L"}
                  includeMargin={false}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}