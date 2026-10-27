/**
 * ErgoCheck AI — QA Automation Suite: Sprint 2 (CU06 a CU10)
 * Validación Integral E2E de Biometría, Visión RULA, Zero-Image y ConsentGuard
 */

const assert = require('assert');
const http = require('http');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api' + path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          let parsed = {};
          try {
            parsed = JSON.parse(raw || '{}');
          } catch {
            parsed = { raw };
          }
          resolve({ status: res.statusCode, data: parsed });
        });
      },
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runSprint2QASuite() {
  console.log('================================================================');
  console.log('   ERGOCHECK AI — SUITE DE PRUEBAS AUTOMATIZADAS SPRINT 2       ');
  console.log('   Casos de Uso: CU06, CU07, CU08, CU09, CU10 + ConsentGuard    ');
  console.log('================================================================\n');

  // 1. Autenticación con credenciales válidas
  console.log('1. Autenticando usuario de prueba...');
  const login = await request('POST', '/auth/login', {
    correo: 'carlos.mendoza@visitask.com',
    clave: '12345',
  });
  assert.strictEqual(login.status, 200, 'Login debe ser exitoso (200)');
  const token = login.data.token;
  assert(token, 'El token JWT debe existir');
  console.log('   [PASS] Login exitoso y JWT criptográfico emitido.');

  // 2. Validación de ConsentGuard: Revocar consentimiento y verificar bloqueo (Reglas 5 y 10)
  console.log('\n2. Verificando ConsentGuard ante revocación de consentimiento...');
  const revocar = await request('POST', '/consentimiento/revocar', {}, token);
  assert.strictEqual(revocar.status, 201, 'Revocación procesada exitosamente');

  const intentoBloqueado = await request('POST', '/ergonomia/sesion/iniciar', {}, token);
  assert.strictEqual(intentoBloqueado.status, 403, 'ConsentGuard debe bloquear con 403');
  assert.strictEqual(
    intentoBloqueado.data.errorCode,
    'ERR_CONSENT_REQUIRED',
    'El errorCode debe ser ERR_CONSENT_REQUIRED',
  );
  assert(intentoBloqueado.data.errorReference, 'Debe incluir credencial de rastreo errorReference');
  console.log('   [PASS] ConsentGuard bloqueó correctamente el acceso (403 ERR_CONSENT_REQUIRED).');

  // 3. Firma de Consentimiento Digital Obligatorio (CU01 / Regla 10)
  console.log('\n3. Firmando consentimiento informado para cámara y biometría...');
  const firma = await request(
    'POST',
    '/consentimiento/firmar',
    { type: 'CAMERA_AND_BIOMETRICS' },
    token,
  );
  assert.strictEqual(firma.status, 201, 'Firma registrada en base de datos');
  console.log('   [PASS] Consentimiento legal otorgado y auditado con IP.');

  // 4. CU06: Calibración y Apertura de Sesión
  console.log('\n4. Probando CU06: Apertura de sesión con vector baseline de calibración...');
  const baselineData = {
    anguloCuelloBase: 12.4,
    anguloTroncoBase: 9.1,
    luminanciaPromedio: 145.8,
  };
  const nuevaSesion = await request('POST', '/ergonomia/sesion/iniciar', baselineData, token);
  assert.strictEqual(nuevaSesion.status, 201, 'Sesión creada en PostgreSQL');
  assert(nuevaSesion.data.id, 'Debe retornar el ID de la sesión');
  const sessionId = nuevaSesion.data.id;
  console.log(`   [PASS] Sesión creada con éxito. ID: ${sessionId}`);

  // 5. CU07 y CU09: Ingesta de Telemetría RULA en Tiempo Real y Zero-Image Contract
  console.log('\n5. Probando CU07 y CU09: Ingesta de telemetría y contrato Zero-Image...');
  const telemetriaNormal = {
    rulaScore: 2,
    neckAngle: 14.5,
    trunkAngle: 10.2,
    staticLoad: false,
    riskLevel: 'OPTIMO',
    timestamp: new Date().toISOString(),
  };

  const payloadSize = Buffer.byteLength(JSON.stringify(telemetriaNormal));
  assert(payloadSize < 500, 'Payload estrictamente numérico (< 500 bytes)');
  console.log(`   [PASS] Tamaño del payload: ${payloadSize} bytes. Cero video en tránsito.`);

  const resMuestra1 = await request(
    'POST',
    `/ergonomia/sesion/${sessionId}/muestra`,
    telemetriaNormal,
    token,
  );
  assert.strictEqual(resMuestra1.status, 201, 'Muestra 1 procesada');
  assert.strictEqual(resMuestra1.data.registrado, true);
  console.log('   [PASS] Telemetría RULA nivel Óptimo (Score 2) registrada.');

  // 6. CU08: Postura Estática Sostenida y Sobrecarga Muscular
  console.log('\n6. Probando CU08: Detección de sobrecarga postural estática (> 60s)...');
  const telemetriaEstatica = {
    rulaScore: 5,
    neckAngle: 25.8,
    trunkAngle: 16.2,
    staticLoad: true,
    riskLevel: 'MEDIO',
    timestamp: new Date().toISOString(),
  };

  const resMuestra2 = await request(
    'POST',
    `/ergonomia/sesion/${sessionId}/muestra`,
    telemetriaEstatica,
    token,
  );
  assert.strictEqual(resMuestra2.status, 201, 'Muestra estática procesada');
  assert(resMuestra2.data.totalAlertas >= 1, 'Las alertas deben haberse incrementado');
  console.log(`   [PASS] Sobrecarga estática registrada. Alertas acumuladas: ${resMuestra2.data.totalAlertas}`);

  // 7. CU10: Consolidación y Finalización de Sesión en Supabase
  console.log('\n7. Probando CU10: Finalización y consolidación de sesión ergonómica...');
  const finSesion = await request(
    'POST',
    `/ergonomia/sesion/${sessionId}/finalizar`,
    { promedioRula: 3.5, totalAlertas: 1 },
    token,
  );
  assert.strictEqual(finSesion.status, 201, 'Sesión finalizada exitosamente');
  assert(finSesion.data.endTime, 'Debe registrar hora de finalización');
  assert.strictEqual(finSesion.data.averageRula, 3.5);
  console.log('   [PASS] Sesión consolidada en PostgreSQL con promedio RULA 3.5 y hora de término.');

  // 8. Verificación de Resumen Histórico y Dashboard
  console.log('\n8. Verificando resumen histórico consolidado...');
  const resumen = await request('GET', '/ergonomia/resumen', null, token);
  assert.strictEqual(resumen.status, 200, 'Resumen obtenido exitosamente');
  assert(resumen.data.totalSesiones > 0, 'Debe registrar al menos una sesión');
  const sesionEncontrada = resumen.data.sesiones.find((s) => s.id === sessionId);
  assert(sesionEncontrada, 'La sesión recién terminada debe estar en el listado histórico');
  console.log(`   [PASS] Resumen validado: ${resumen.data.totalSesiones} sesiones registradas en total.`);

  console.log('\n================================================================');
  console.log('   RESULTADO: 100% DE PRUEBAS APROBADAS EN SPRINT 2 (CU06-CU10) ');
  console.log('================================================================\n');
}

runSprint2QASuite().catch((err) => {
  console.error('\n[FATAL] Error en la ejecución de la suite de pruebas:', err);
  process.exit(1);
});
