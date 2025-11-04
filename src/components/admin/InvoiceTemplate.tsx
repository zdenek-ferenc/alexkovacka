'use client'; 

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

type InvoiceProps = {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientAddress1: string;
  clientAddress2: string;
  clientIco: string;
  itemDescription: string;
  itemPrice: string;
  qrCodeDataUrl: string | null;
};

// --- ZMĚNA VE STYLECH ---
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 11,
    padding: 60,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 34,
  },
  headerRight: {
    textAlign: 'right',
  },
  invoiceTitle: {
    fontSize: 24,
    fontFamily: 'Roboto-Bold',
  },
  invoiceNumber: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  invoiceDates: {
    fontSize: 10,
    color: '#555',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    marginBottom: 8,
    color: '#000',
  },
  columnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  columnLeft: {
    width: '50%',
  },
  columnRight: {
    width: '45%',
    textAlign: 'right',
  },
  address: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  // Odebrali jsme `flexDirection` atd.
  paymentSection: {
    // Tady už není nic potřeba
  },
  qrCode: {
    width: 90, 
    height: 90,
    marginTop: 10, // Odsadíme ho od textu nad ním
  },
  table: {
    width: '100%',
    border: '1px solid #eee',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #eee',
    backgroundColor: '#fff',
  },
  tableHeader: {
    backgroundColor: '#f9f9f9',
    fontFamily: 'Roboto-Bold',
  },
  tableCol: {
    padding: 8,
  },
  colDescription: {
    width: '60%',
  },
  colQty: {
    width: '20%',
    textAlign: 'right',
  },
  colPrice: {
    width: '20%',
    textAlign: 'right',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    marginRight: 10,
  },
  totalValue: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: '#000',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 60,
    right: 60,
    fontSize: 9,
    textAlign: 'center',
    color: '#888',
    borderTop: '1px solid #eee',
    paddingTop: 10,
  },
});
// --- KONEC ZMĚN STYLŮ ---

const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/logo.png`;

export const InvoiceTemplate = ({
  invoiceNumber, issueDate, dueDate, clientName,
  clientAddress1, clientAddress2, clientIco,
  itemDescription, itemPrice,
  qrCodeDataUrl
}: InvoiceProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* 1. Hlavička (beze změny) */}
      <View style={styles.header}>
        <View>
          <Image style={styles.logo} src={logoUrl} />
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.invoiceTitle}>FAKTURA</Text>
          <Text style={styles.invoiceNumber}>č. {invoiceNumber}</Text>
          <Text style={styles.invoiceDates}>Datum vystavení: {issueDate}</Text>
          <Text style={styles.invoiceDates}>Datum splatnosti: {dueDate}</Text>
        </View>
      </View>

      {/* 2. Sloupce adres */}
      <View style={styles.columnContainer}>
        <View style={styles.columnLeft}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dodavatel</Text>
            <Text style={styles.address}>{process.env.NEXT_PUBLIC_INVOICE_NAME}</Text>
            <Text style={styles.address}>{process.env.NEXT_PUBLIC_INVOICE_ADDRESS_LINE_1}</Text>
            <Text style={styles.address}>{process.env.NEXT_PUBLIC_INVOICE_ADDRESS_LINE_2}</Text>
            <Text style={styles.address}>IČ: {process.env.NEXT_PUBLIC_INVOICE_ICO}</Text>
            <Text style={styles.address}>{process.env.NEXT_PUBLIC_INVOICE_NOT_VAT_PAYER}</Text>
          </View>
          
          {/* 3. ZMĚNA SEKCE PLATEBNÍCH ÚDAJŮ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Platební údaje</Text>
            {/* Kontejner `paymentSection` je nyní jen obal */}
            <View style={styles.paymentSection}>
              {/* Texty */}
              <View>
                <Text style={styles.address}>Číslo účtu: {process.env.NEXT_PUBLIC_INVOICE_BANK_ACCOUNT}</Text>
                <Text style={styles.address}>IBAN: {process.env.NEXT_PUBLIC_INVOICE_IBAN}</Text>
                <Text style={styles.address}>SWIFT/BIC: {process.env.NEXT_PUBLIC_INVOICE_SWIFT}</Text>
              </View>
              {/* QR Kód je *pod* texty, ne vedle nich */}
              {qrCodeDataUrl && (
                <View>
                  <Image style={styles.qrCode} src={qrCodeDataUrl} />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Pravý sloupec (beze změny) */}
        <View style={styles.columnRight}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Odběratel</Text>
            <Text style={styles.address}>{clientName}</Text>
            <Text style={styles.address}>{clientAddress1}</Text>
            <Text style={styles.address}>{clientAddress2}</Text>
            {clientIco && <Text style={styles.address}>IČ: {clientIco}</Text>}
          </View>
        </View>
      </View>

      {/* 4. Položky faktury (beze změny) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fakturujeme Vám</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCol, styles.colDescription]}>Popis</Text>
            <Text style={[styles.tableCol, styles.colQty]}>Množství</Text>
            <Text style={[styles.tableCol, styles.colPrice]}>Cena (Kč)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCol, styles.colDescription]}>{itemDescription}</Text>
            <Text style={[styles.tableCol, styles.colQty]}>1</Text>
            <Text style={[styles.tableCol, styles.colPrice]}>{itemPrice}</Text>
          </View>
        </View>
      </View>

      {/* 5. Celková částka (beze změny) */}
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Celkem k úhradě:</Text>
        <Text style={styles.totalValue}>{itemPrice} Kč</Text>
      </View>

      {/* 6. Patička (beze změny) */}
      <View style={styles.footer}>
        <Text>{process.env.NEXT_PUBLIC_INVOICE_REGISTER}</Text>
        <Text>Děkuji za spolupráci.</Text>
      </View>
    </Page>
  </Document>
);