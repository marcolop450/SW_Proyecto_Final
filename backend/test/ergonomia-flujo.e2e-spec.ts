import { ErgonomiaService } from '../src/modules/ergonomia/ergonomia.service';
import { calcularReferencia } from '../../frontend/src/features/ergonomia/utils/calibracionPostura';

describe('Preparación y registro ergonómico', () => {
  it('calcula la referencia con muestras reales y rechaza muestras insuficientes', () => {
    const muestra = { anguloCuello: 10, anguloTronco: 15, anguloBrazos: 20, inclinacionHombros: 2, luminancia: 100 };
    expect(calcularReferencia([muestra])).toBeNull();
    const referencia = calcularReferencia([muestra, muestra, muestra, muestra, { ...muestra, anguloCuello: 20 }]);
    expect(referencia).toMatchObject({ anguloCuelloBase: 12, anguloTroncoBase: 15, luminanciaPromedio: 100 });
    expect(calcularReferencia([muestra, muestra, muestra, muestra, { ...muestra, anguloCuello: NaN }])).toBeNull();
  });
  it('no inventa un puntaje al iniciar y conserva la primera muestra', async () => {
    const prisma = { ergonomicSession: {
      create: jest.fn().mockResolvedValue({ id: 's', startTime: new Date() }),
      findFirst: jest.fn().mockResolvedValue({ id: 's', averageRula: null, totalAlerts: 0 }),
      update: jest.fn().mockResolvedValue({ averageRula: 5, totalAlerts: 1 }),
    } };
    const servicio = new ErgonomiaService(prisma as any);
    await servicio.iniciarSesion('u', {});
    expect(prisma.ergonomicSession.create.mock.calls[0][0].data).not.toHaveProperty('averageRula');
    await servicio.registrarMuestra('s', 'u', { rulaScore: 5, neckAngle: 10, trunkAngle: 10, staticLoad: false });
    expect(prisma.ergonomicSession.findFirst).toHaveBeenCalledWith({ where: { id: 's', userId: 'u' } });
    expect(prisma.ergonomicSession.update.mock.calls[0][0].data.averageRula).toBe(5);
  });
});
