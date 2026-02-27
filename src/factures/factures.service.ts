import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facture } from './facture.entity/facture.entity';
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FacturesService {

  constructor(
    @InjectRepository(Facture)
    private factureRepository: Repository<Facture>,
  ) {}

 async create(data: any): Promise<Facture> {
  const reference = this.generateReference();
  const subtotal = this.calculateSubtotal(data.items);
  const totalAmount = subtotal + data.transactionFee;

  const facture = this.factureRepository.create({
    reference,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    clientPhone: data.clientPhone,
    paymentMethod: data.paymentMethod,
    transactionFee: data.transactionFee,
    totalAmount,
    status: 'PAID',
    paidAt: new Date(),
    items: data.items,
  });

  const saved = await this.factureRepository.save(facture);

  // Générer et sauvegarder le PDF
  await this.savePdfToDisk(saved);

  return saved;
} 

  private async savePdfToDisk(facture: Facture): Promise<void> {
  const pdfBuffer = await this.buildPdfBuffer(facture);
  const dir = path.join(process.cwd(), 'pdfs');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(path.join(dir, `${facture.reference}.pdf`), pdfBuffer);
}

  async findAll(): Promise<Facture[]> {
    return this.factureRepository.find();
  }

  async findOne(reference: string): Promise<Facture | null> {
    return this.factureRepository.findOne({
      where: { reference }
    });
  }

  private generateReference(): string {
    return 'FAC-' + Date.now();
  }

  private calculateSubtotal(items: any[]): number {
  return items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  }
 async generatePdf(reference: string, res: Response) {
  const facture = await this.factureRepository.findOne({
    where: { reference },
    relations: ['items'],
  });

  if (!facture) {
    throw new Error('Facture non trouvée');
  }

  // Générer le PDF en mémoire
  const pdfBuffer = await this.buildPdfBuffer(facture);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="facture-${reference}.pdf"`,
    'Content-Length': pdfBuffer.length,
    'X-Content-Type-Options': 'nosniff',
  });

  res.end(pdfBuffer);
}

private buildPdfBuffer(facture: Facture): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - 100;
    const startX = 50;

    // ── HEADER ──────────────────────────────────────────────────────
    doc.fontSize(16).font('Helvetica-Bold').text('shop_new', startX, 50);
    doc.fontSize(10).font('Helvetica')
      .text('lougbegnona@gmail.com', startX)
      .text('22990877433', startX);

    doc.moveDown(2);

    // ── CLIENT INFO + DATE TABLE ─────────────────────────────────────
    const tableTop = doc.y;
    const colMid = startX + pageWidth / 2;

    doc.rect(startX, tableTop, pageWidth, 100).stroke('#999999');
    doc.moveTo(colMid, tableTop).lineTo(colMid, tableTop + 100).stroke('#999999');
    doc.rect(startX, tableTop, pageWidth, 20).fill('#f0f0f0').stroke('#999999');

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333')
      .text('Informations du client', startX + 5, tableTop + 5)
      .text('Date de paiement', colMid + 5, tableTop + 5);

    const clientY = tableTop + 28;
    doc.font('Helvetica').fillColor('black').fontSize(10)
      .text(facture.clientName || '', startX + 5, clientY)
      .text(facture.clientEmail || '', startX + 5, clientY + 15)
      .text(facture.clientPhone || '', startX + 5, clientY + 30);

    const paidDate = facture.paidAt
      ? new Date(facture.paidAt).toLocaleString('fr-FR')
      : '';
    doc.text(paidDate, colMid + 5, clientY);

    doc.y = tableTop + 110;
    doc.moveDown(1);

    // ── ITEMS TABLE ──────────────────────────────────────────────────
    const itemsTop = doc.y;
    const col1W = pageWidth * 0.55;
    const col2W = pageWidth * 0.12;
    const col3W = pageWidth * 0.165;
    const col1X = startX;
    const col2X = col1X + col1W;
    const col3X = col2X + col2W;
    const col4X = col3X + col3W;
    const rowH = 22;

    doc.rect(startX, itemsTop, pageWidth, rowH).fill('#E8601C');
    doc.fillColor('white').font('Helvetica-Bold').fontSize(10)
      .text('DÉSIGNATIONS', col1X + 5, itemsTop + 6)
      .text('QTE', col2X + 5, itemsTop + 6)
      .text('PRIX UNITAIRE', col3X + 5, itemsTop + 6)
      .text('MONTANT', col4X + 5, itemsTop + 6);

    doc.rect(startX, itemsTop, pageWidth, rowH).stroke('#cccccc');

    let currentY = itemsTop + rowH;

    facture.items.forEach((item) => {
      const amount = item.quantity * item.unitPrice;
      doc.rect(startX, currentY, pageWidth, rowH).fill('white').stroke('#cccccc');
      doc.fillColor('black').font('Helvetica').fontSize(10)
        .text(item.description || '', col1X + 5, currentY + 6, { width: col1W - 10 })
        .text(String(item.quantity).padStart(2, '0'), col2X + 5, currentY + 6)
        .text(`${this.formatAmount(item.unitPrice)} FCFA`, col3X + 5, currentY + 6)
        .text(`${this.formatAmount(amount)} FCFA`, col4X + 5, currentY + 6);
      currentY += rowH;
    });

    // Transaction fee row
    doc.rect(startX, currentY, pageWidth, rowH).fill('white').stroke('#cccccc');
    doc.fillColor('black').font('Helvetica-Bold').fontSize(10)
      .text('Frais de transaction', col1X + 5, currentY + 6)
      .text('--', col2X + 5, currentY + 6);
    doc.font('Helvetica')
      .text(`${this.formatFee(facture.transactionFee)} FCFA`, col3X + 5, currentY + 6)
      .text(`${this.formatFee(facture.transactionFee)} FCFA`, col4X + 5, currentY + 6);
    currentY += rowH;

    doc.y = currentY + 15;
    doc.moveDown();

    // ── PAYMENT METHOD ────────────────────────────────────────────────
    doc.moveTo(startX, doc.y).lineTo(startX + pageWidth, doc.y).stroke('#cccccc');
    doc.moveDown(0.5);
    doc.font('Helvetica').fillColor('#555').fontSize(10).text('Méthode de paiement', startX);
    doc.font('Helvetica-Bold').fillColor('black').text(facture.paymentMethod || 'Cartes bancaires', startX);
    doc.moveDown(0.5);
    doc.moveTo(startX, doc.y).lineTo(startX + pageWidth, doc.y).stroke('#cccccc');

    doc.moveDown(1.5);

    // ── TOTAL ─────────────────────────────────────────────────────────
    doc.font('Helvetica').fillColor('#555').fontSize(11)
      .text('Total Payé', { align: 'right' });
    doc.font('Helvetica-Bold').fillColor('black').fontSize(14)
      .text(`${this.formatAmount(facture.totalAmount)} FCFA`, { align: 'right' });

    // ── FOOTER (fixé en bas de page) ─────────────────────────────────
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 120; // remonté pour rester sur la même page

    doc.moveTo(startX, footerY).lineTo(startX + pageWidth, footerY).stroke('#cccccc');

    doc.font('Helvetica-Bold').fillColor('#333').fontSize(10)
      .text('Paiement sécurisé, rapide et fiable.', startX, footerY + 10, { align: 'center', width: pageWidth });

    doc.font('Helvetica').fillColor('#555').fontSize(9)
      .text(
        `Pour tout problème, renseignement ou plainte, veuillez contacter ${facture.clientName} et pour des informations additionnelles, contactez FeexPay à contact@feexpay.me`,
        startX,
        footerY + 25,
        { align: 'center', width: pageWidth }
      );

    doc.end();

  });
}

  private formatAmount(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  private formatFee(amount: number): string {
  const rounded = Math.round(amount);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

}