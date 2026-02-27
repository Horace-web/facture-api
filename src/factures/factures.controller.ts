import { Controller, Post, Body, Get, Param, Res } from '@nestjs/common';
import { FacturesService } from './factures.service';
import { Facture } from './facture.entity/facture.entity';
import type { Response } from 'express';
import * as fs from 'fs'; 
import * as path from 'path';

@Controller('factures')
export class FacturesController {

  constructor(private readonly facturesService: FacturesService) {}

  @Post()
  create(@Body() body): Promise<Facture> {
    return this.facturesService.create(body);
  }

  @Get()
  findAll(): Promise<Facture[]> {
    return this.facturesService.findAll();
  }

  @Get(':reference')
  findOne(@Param('reference') reference: string): Promise<Facture | null> {
    return this.facturesService.findOne(reference);
  }

  @Get(':reference/pdf')
async getPdf(@Param('reference') reference: string, @Res() res: Response): Promise<void> {
  const pdfPath = path.join(process.cwd(), 'pdfs', `${reference}.pdf`);

  if (!fs.existsSync(pdfPath)) {
    res.status(404).send('Facture non trouvée');
    return;
  }

  const pdfBuffer = fs.readFileSync(pdfPath);
  const base64 = pdfBuffer.toString('base64');
  const dataUrl = `data:application/pdf;base64,${base64}`;

  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Facture ${reference}</title>
        <style>
          * { margin: 0; padding: 0; }
          body { width: 100vw; height: 100vh; overflow: hidden; }
          iframe { width: 100%; height: 100%; border: none; }
        </style>
      </head>
      <body>
        <iframe src="${dataUrl}"></iframe>
      </body>
    </html>
  `);
}

}