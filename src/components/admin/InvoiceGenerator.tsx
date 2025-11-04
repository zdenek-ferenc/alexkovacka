'use client';

import { useState, useEffect } from 'react';
import { PDFDownloadLink, Font } from '@react-pdf/renderer';
import { InvoiceTemplate } from './InvoiceTemplate';
import { FileDown, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';

// Registrace fontů (zůstává)
Font.register({ 
  family: 'Roboto', 
  src: '/fonts/Roboto-Regular.ttf' 
});
Font.register({ 
  family: 'Roboto-Bold', 
  src: '/fonts/Roboto-Bold.ttf' 
});

type Props = {
  clientNameDefault: string;
  invoiceNumberDefault: string;
};

export default function InvoiceGenerator({ clientNameDefault, invoiceNumberDefault }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Stavy pro formulář (zůstávají)
  const [clientName, setClientName] = useState(clientNameDefault);
  const [clientAddress1, setClientAddress1] = useState('');
  const [clientAddress2, setClientAddress2] = useState('');
  const [clientIco, setClientIco] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(invoiceNumberDefault);
  const [itemDescription, setItemDescription] = useState(`Fotografické služby - ${clientNameDefault}`);
  const [itemPrice, setItemPrice] = useState('0');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  // Stav pro QR kód (zůstává)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  const canGenerate = clientName && clientAddress1 && clientAddress2 && itemDescription && parseFloat(itemPrice) > 0 && invoiceNumber;

  useEffect(() => {
    if (canGenerate && isOpen) {
      // Variabilní symbol (číslo faktury bez pomlček)
      const vs = invoiceNumber.replace(/\D/g, '');
      
      // --- ZMĚNA ZDE ---
      // Načteme IBAN a ODSTRANÍME z něj všechny mezery
      const iban = (process.env.NEXT_PUBLIC_INVOICE_IBAN || '').replace(/\s/g, '');
      // --- KONEC ZMĚNY ---
      
      // Vytvoření standardního SPD řetězce (nyní s IBAN bez mezer)
      const spdString = `SPD*1.0*ACC:${iban}*AM:${itemPrice}*CC:CZK*VS:${vs}`;

      QRCode.toDataURL(spdString, { errorCorrectionLevel: 'M', width: 150 })
        .then(url => {
          setQrCodeDataUrl(url);
        })
        .catch(err => {
          console.error("Chyba generování QR kódu:", err);
          setQrCodeDataUrl(null);
        });
    } else {
      setQrCodeDataUrl(null);
    }
  }, [isOpen, canGenerate, itemPrice, invoiceNumber]);

  const invoiceData = {
    invoiceNumber,
    issueDate,
    dueDate,
    clientName,
    clientAddress1,
    clientAddress2,
    clientIco,
    itemDescription,
    itemPrice: parseFloat(itemPrice).toLocaleString('cs-CZ'),
    qrCodeDataUrl: qrCodeDataUrl,
  };

  const canDownload = canGenerate && qrCodeDataUrl;

  return (
    <>
      {/* Tlačítko pro otevření modálu (beze změny) */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-all ease-in-out duration-200 cursor-pointer"
      >
        Vystavit fakturu
      </button>

      {/* Modální okno (beze změny) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Formulář (beze změny) */}
            <h2 className="text-2xl font-bold mb-6">Vystavit fakturu</h2>
            <div className="grid grid-cols-2 gap-6">
              {/* Info o klientovi */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Odběratel (Klient)</h3>
                <div>
                  <label className="block text-sm font-medium">Jméno / Název firmy *</label>
                  <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Ulice a č.p. *</label>
                  <input type="text" value={clientAddress1} onChange={(e) => setClientAddress1(e.target.value)} className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium">PSČ a Město *</label>
                  <input type="text" value={clientAddress2} onChange={(e) => setClientAddress2(e.target.value)} className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium">IČ (volitelné)</label>
                  <input type="text" value={clientIco} onChange={(e) => setClientIco(e.target.value)} className="w-full p-2 border rounded-md" />
                </div>
              </div>
              {/* Info o faktuře */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Položky</h3>
                <div>
                  <label className="block text-sm font-medium">Číslo faktury *</label>
                  <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Datum vystavení *</label>
                  <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="w-full p-2 border rounded-md" />
                </div>
                 <div>
                  <label className="block text-sm font-medium">Datum splatnosti *</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Popis položky *</label>
                  <textarea value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} className="w-full p-2 border rounded-md" rows={3}></textarea>
                </div>
                 <div>
                  <label className="block text-sm font-medium">Celková cena (Kč) *</label>
                  <input type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} className="w-full p-2 border rounded-md" />
                </div>
              </div>
            </div>

            {/* Tlačítka (beze změny) */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
              <button 
                type="button" 
                onClick={() => setIsOpen(false)} 
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Zrušit
              </button>
              {canDownload ? (
                <PDFDownloadLink
                  document={<InvoiceTemplate {...invoiceData} />}
                  fileName={`faktura-${invoiceNumber}-${clientName.replace(/\s/g, '_')}.pdf`}
                  className="px-4 py-2 text-white bg-black rounded-md hover:bg-gray-800 flex items-center gap-2"
                >
                  {({ loading }) => (
                    <>
                      {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <FileDown size={18} />
                      )}
                      Generovat a stáhnout PDF
                    </>
                  )}
                </PDFDownloadLink>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 text-white bg-gray-400 rounded-md flex items-center gap-2"
                  title="Vyplňte všechna povinná pole (*)"
                >
                  <FileDown size={18} />
                  Generovat a stáhnout PDF
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}