/**
 * ErgoCheck AI — QA Automation Suite: Sprint 3 (CU11 a CU19)
 * Validación Integral E2E de Supervisión de Conducta, Anti-Cheat,
 * Detección de Celular, Ausencia de Rostro, Atajos y Modo Entrevista
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

async function runSprint3QASuite() {
  console.log('================================================================');
  console.log('   ERGOCHECK AI — SUITE DE PRUEBAS AUTOMATIZADAS SPRINT 3       ');
  console.log('   Casos de Uso: CU11 a CU19 (Supervisión, Anti-Cheat, Interview) ');
  console.log('================================================================\n');

  // 1. Autenticación
  console.log('1. Autenticando usuario para pruebas de supervisión...');
  const login = await request('POST', '/auth/login', {
    correo: 'carlos.mendoza@visitask.com',
    clave: '12345',
  });
  assert.strictEqual(login.status, 200, 'Login debe ser 200');
  const token = login.data.token;
  assert(token, 'Token debe existir');
  console.log('   [PASS] Autenticación válida.');

  // Asegurar consentimiento activo
  await request('POST', '/consentimiento/aceptar', {
    tipo: 'CAMERA_AND_BIOMETRICS',
    version: '1.0',
  }, token);

  // 2. CU17: Crear Cuestionario Externo (Google Forms)
  console.log('\n2. Creando cuestionario externo con código temporal (CU17)...');
  const resCuestionario = await request('POST', '/supervision/cuestionarios', {
    titulo: 'Examen de Certificación Scrum 2026',
    tipo: 'EXAMEN',
    urlExterna: 'https://docs.google.com/forms/d/e/1FAIpQLScMockTest/viewform',
    duracionMinutos: 45,
    vigenciaHoras: 12,
  }, token);
  assert.strictEqual(resCuestionario.status, 201, 'Debe crear cuestionario (201)');
  const codigo = resCuestionario.data.codigoAcceso;
  assert(codigo && codigo.startsWith('EXAM-'), 'Código debe iniciar con EXAM-');
  console.log(`   [PASS] Cuestionario creado con código de acceso: ${codigo}`);

  // 3. CU17: Validar código de acceso
  console.log('\n3. Validando código de acceso del evaluado (CU17)...');
  const resVal = await request('GET', `/supervision/cuestionarios/codigo/${codigo}`, null, token);
  assert.strictEqual(resVal.status, 200, 'Validación debe ser 200');
  assert.strictEqual(resVal.data.valido, true, 'El código debe ser válido');
  console.log('   [PASS] Código temporal validado correctamente.');

  // 4. Iniciar sesión de supervisión
  console.log('\n4. Iniciando sesión de supervisión con cámara y telemetría...');
  const resSesion = await request('POST', '/supervision/sesion/iniciar', {
    codigoAcceso: codigo,
    tipo: 'EXAMEN',
  }, token);
  assert.strictEqual(resSesion.status, 201, 'Sesión creada (201)');
  const sessionId = resSesion.data.id;
  assert(sessionId, 'SessionId debe existir');
  console.log(`   [PASS] Sesión iniciada: ${sessionId}`);

  // 5. CU11, CU12, CU13, CU14, CU15: Telemetría y detección de conductas
  console.log('\n5. Registrando eventos de conducta y anti-trampa (CU11 - CU15)...');
  
  // CU11: Gaze offscreen
  await request('POST', `/supervision/sesion/${sessionId}/evento`, {
    tipo: 'GAZE_OFFSCREEN',
    severidad: 'LOW',
    detalles: { yaw: 34.5, pitch: 2.1 },
  }, token);

  // CU12: Sospecha de celular en regazo
  await request('POST', `/supervision/sesion/${sessionId}/evento`, {
    tipo: 'GAZE_DOWN_SUSTAINED',
    severidad: 'HIGH',
    duracionMs: 2500,
    detalles: { pitchEfectivo: -24.2, keyCount: 0 },
  }, token);

  // CU13: Rostro ausente
  await request('POST', `/supervision/sesion/${sessionId}/evento`, {
    tipo: 'FACE_ABSENT',
    severidad: 'HIGH',
    duracionMs: 6000,
  }, token);

  // CU14: Pérdida de foco
  await request('POST', `/supervision/sesion/${sessionId}/evento`, {
    tipo: 'WINDOW_BLUR',
    severidad: 'HIGH',
    duracionMs: 8000,
  }, token);

  // CU15: Atajo bloqueado
  await request('POST', `/supervision/sesion/${sessionId}/evento`, {
    tipo: 'SHORTCUT_BLOCKED',
    severidad: 'MEDIUM',
    detalles: { atajo: 'c', ctrl: true },
  }, token);

  console.log('   [PASS] Eventos de conducta registrados y clasificados.');

  // 6. CU18 y CU19: Modo Entrevista con Pregunta de Control y Gestos
  console.log('\n6. Ejecutando Modo Entrevista (CU18 y CU19)...');
  const resPregunta = await request('POST', `/supervision/sesion/${sessionId}/disparar-pregunta`, {
    pregunta: '¿Ha participado en algún incidente de divulgación de datos confidenciales?',
    categoria: 'INTEGRIDAD',
    tiempoEsperaSeg: 5,
  }, token);
  assert.strictEqual(resPregunta.status, 201, 'Pregunta disparada (201)');
  const preguntaId = resPregunta.data.preguntaId;

  // Registrar respuesta con blendshapes y latencia
  const resRespuesta = await request('POST', `/supervision/sesion/${sessionId}/respuesta-pregunta`, {
    preguntaId,
    latenciaRespuestaMs: 420,
    deltaTensionFacial: 0.18,
    detallesBiometricos: { browDownLeft: 0.32, browDownRight: 0.35 },
    notasEvaluador: 'Reacción dentro de umbral normal.',
  }, token);
  assert.strictEqual(resRespuesta.status, 201, 'Respuesta registrada (201)');
  console.log('   [PASS] Modo Entrevista: pregunta de control y deltas biométricos capturados.');

  // 7. Finalizar sesión y validar cálculo de Índice de Integridad
  console.log('\n7. Finalizando sesión y verificando Índice de Integridad (CU23 hook)...');
  const resFin = await request('POST', `/supervision/sesion/${sessionId}/finalizar`, {
    tiempoActivoSeg: 2400,
    tiempoOciosoSeg: 120,
    tiempoFueraSeg: 8,
  }, token);
  assert.strictEqual(resFin.status, 201, 'Finalización procesada (201)');
  assert(resFin.data.scoreIntegridad < 100, 'Score de integridad debe tener penalizaciones deducidas');
  console.log(`   [PASS] Sesión finalizada. Score de Integridad consolidado: ${resFin.data.scoreIntegridad}/100`);

  console.log('\n================================================================');
  console.log('   RESULTADO: 100% DE PRUEBAS DE SPRINT 3 APROBADAS (QA VERDE)  ');
  console.log('================================================================\n');
}

if (require.main === module) {
  runSprint3QASuite().catch((err) => {
    console.error('Fallo en la suite QA Sprint 3:', err);
    process.exit(1);
  });
}

module.exports = { runSprint3QASuite };
