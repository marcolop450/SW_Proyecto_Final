import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  Query,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ConsentGuard } from '../../common/guards/consent.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { MotorCorrelacionService } from './services/motor-correlacion.service';
import { BitacoraInmutableService } from './services/bitacora-inmutable.service';
import { GeneradorReportesService } from './services/generador-reportes.service';

class AuditarIncidenteDto {
  estado: string;
  justificacion?: string;
}

@ApiTags('Supervisión y Auditoría Sprint 4')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ConsentGuard)
@Controller('supervision')
export class SupervisionSp4Controller {
  constructor(
    private readonly prisma: PrismaService,
    private readonly correlacion: MotorCorrelacionService,
    private readonly bitacora: BitacoraInmutableService,
    private readonly reportes: GeneradorReportesService,
  ) {}

  @Post('correlacion/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'CU20 – Ejecutar motor de correlación de ventana deslizante' })
  async correlacionar(@Param('sessionId') sessionId: string) {
    const incidentes = await this.correlacion.evaluarVentanaDeslizante(sessionId);
    return { total: incidentes.length, incidentes };
  }

  @Get('incidentes/:sessionId')
  @ApiOperation({ summary: 'CU22 – Listar incidentes correlacionados de una sesión' })
  async listarIncidentes(@Param('sessionId') sessionId: string) {
    return this.correlacion.obtenerIncidentes(sessionId);
  }

  @Put('incidentes/:incidentId/auditar')
  @ApiOperation({ summary: 'CU22 – Auditar incidente (confirmar/desestimar/falso positivo)' })
  async auditarIncidente(
    @Param('incidentId') incidentId: string,
    @Body() dto: AuditarIncidenteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const resultado = await this.correlacion.auditarIncidente(
      incidentId,
      dto.estado,
      dto.justificacion,
      user.id,
    );

    await this.bitacora.registrar({
      userId: user.id,
      action: 'AUDITAR_INCIDENTE',
      entity: 'Incident',
      entityId: incidentId,
      categoria: 'AUDITORIA',
      details: { estadoNuevo: dto.estado, justificacion: dto.justificacion },
    });

    return resultado;
  }

  @Get('indices/:sessionId')
  @ApiOperation({ summary: 'CU23 – Obtener índices sintéticos de Integridad y Bienestar Ergonómico' })
  async obtenerIndices(@Param('sessionId') sessionId: string) {
    return this.correlacion.calcularIndices(sessionId);
  }

  @Get('reportes/:sessionId/ergonomico-excel')
  @ApiOperation({ summary: 'CU24 – Descargar reporte ergonómico corporativo en formato Excel (.xlsx)' })
  async descargarReporteExcel(@Param('sessionId') sessionId: string, @Res() res: Response) {
    const session = await this.prisma.supervisionSession.findUnique({
      where: { id: sessionId },
      include: { usuario: true, eventosConducta: true, incidentes: true },
    });
    if (!session) throw new NotFoundException('Sesión de supervisión no encontrada');

    const buffer = await this.reportes.generarReporteErgonomicoExcel({
      totalSesiones: 1,
      minutosTotales: 45,
      totalAlertas: session.incidentes?.length || 0,
      promedioRula: 2.8,
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="reporte-ergonomico-${sessionId.slice(0, 8)}.xlsx"`);
    res.end(buffer);
  }

  @Get('reportes/:sessionId/forense-pdf')
  @ApiOperation({ summary: 'CU25 – Descargar dictamen forense PDF con sello SHA-256' })
  async descargarReportePdf(@Param('sessionId') sessionId: string, @Res() res: Response) {
    const session = await this.prisma.supervisionSession.findUnique({
      where: { id: sessionId },
      include: { usuario: true, incidentes: true, eventosConducta: true },
    });
    if (!session) throw new NotFoundException('Sesión de supervisión no encontrada');

    const buffer = await this.reportes.generarReporteForensePdf(session);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="dictamen-forense-${sessionId.slice(0, 8)}.pdf"`);
    res.end(buffer);
  }

  @Get('bitacora')
  @ApiOperation({ summary: 'CU26 – Consultar bitácora WORM inmutable' })
  async consultarBitacora(@Query('categoria') categoria?: string, @Query('limit') limit?: string) {
    return this.bitacora.consultarRegistros(categoria, limit ? parseInt(limit, 10) : 50);
  }

  @Get('bitacora/verificar')
  @ApiOperation({ summary: 'CU26 – Verificar matemáticamente la integridad de la cadena SHA-256' })
  async verificarCadena() {
    return this.bitacora.verificarIntegridadCadena();
  }

  @Get('bitacora/exportar')
  @ApiOperation({ summary: 'CU26 – Exportar registros WORM a CSV' })
  async exportarCsv(@Res() res: Response) {
    const csv = await this.bitacora.exportarCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="bitacora-inmutable-worm.csv"');
    res.send(csv);
  }
}
