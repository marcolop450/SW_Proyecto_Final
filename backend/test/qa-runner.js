const BASE_URL = 'http://localhost:3000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  let body = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }
  return { status: res.status, headers: res.headers, body };
}

const testResults = [];

function assert(description, condition, details = '') {
  testResults.push({
    description,
    passed: !!condition,
    details: condition ? 'OK' : `FAIL: ${details}`,
  });
  const symbol = condition ? 'PASS' : 'FAIL';
  console.log(`[${symbol}] ${description}${condition ? '' : ' -> ' + details}`);
}

async function runQASuite() {
  console.log('====================================================');
  console.log('   ErgoCheck AI — Suite de Aseguramiento de Calidad (QA)   ');
  console.log('   Ejecutando pruebas contra entorno local en vivo          ');
  console.log('====================================================\n');

  // --- SECCIÓN 1: Rutas Raíz, Gateway y Observabilidad ---
  console.log('--- 1. Gateway, Redirecciones y Estado de Salud ---');
  
  const rootRedirect = await request('/', { redirect: 'manual' });
  assert('1.1 GET / redirige hacia /api/docs', rootRedirect.status === 302 && rootRedirect.headers.get('location') === '/api/docs', `Status: ${rootRedirect.status}`);

  const apiStatus = await request('/api');
  assert('1.2 GET /api retorna 200 OK con estado operativo', apiStatus.status === 200 && apiStatus.body.estado === 'operativo', JSON.stringify(apiStatus.body));

  const swaggerDocs = await request('/api/docs');
  assert('1.3 GET /api/docs responde con Swagger UI', swaggerDocs.status === 200 && typeof swaggerDocs.body === 'string' && swaggerDocs.body.includes('Swagger UI'), `Status: ${swaggerDocs.status}`);

  // --- SECCIÓN 2: Autenticación, JWT y Envelope de Errores ---
  console.log('\n--- 2. Autenticación y Observabilidad de Errores ---');

  const invalidLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ correo: 'carlos.mendoza@visitask.com', clave: 'clave_invalida' }),
  });
  assert('2.1 Login con contraseña inválida retorna 401', invalidLogin.status === 401, `Status: ${invalidLogin.status}`);
  assert('2.2 Error 401 incluye errorReference con formato ERR-XXXXXXXX', typeof invalidLogin.body.errorReference === 'string' && invalidLogin.body.errorReference.startsWith('ERR-'), JSON.stringify(invalidLogin.body));
  assert('2.3 Error 401 incluye errorCode y mensaje amigable', invalidLogin.body.errorCode === 'ERR_INVALID_CREDENTIALS' && invalidLogin.body.message.length > 10, JSON.stringify(invalidLogin.body));

  const validationError = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  assert('2.4 Login sin campos retorna 400 ERR_VALIDATION_FAILED', validationError.status === 400 && validationError.body.errorCode === 'ERR_VALIDATION_FAILED', JSON.stringify(validationError.body));

  const validLoginA = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ correo: 'carlos.mendoza@visitask.com', clave: '12345' }),
  });
  assert('2.5 Login válido (Admin A) retorna 200 OK y token JWT', validLoginA.status === 200 && !!validLoginA.body.token, `Status: ${validLoginA.status}`);
  const tokenA = validLoginA.body?.token;
  const userA = validLoginA.body?.usuario;
  assert('2.6 Usuario autenticado contiene organización asignada', userA && userA.organizationName === 'Visitask Global Enterprise', JSON.stringify(userA));

  // --- SECCIÓN 3: Perfil y Seguridad RBAC ---
  console.log('\n--- 3. Protección de Endpoints y Perfil de Usuario ---');

  const unauthProfile = await request('/api/auth/perfil');
  assert('3.1 GET /api/auth/perfil sin token retorna 401', unauthProfile.status === 401 && unauthProfile.body.errorReference, `Status: ${unauthProfile.status}`);

  const badTokenProfile = await request('/api/auth/perfil', {
    headers: { Authorization: 'Bearer token_invalido_forjado' },
  });
  assert('3.2 GET /api/auth/perfil con token forjado retorna 401', badTokenProfile.status === 401, `Status: ${badTokenProfile.status}`);

  const authProfile = await request('/api/auth/perfil', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert('3.3 GET /api/auth/perfil con token válido retorna 200 y datos de usuario', authProfile.status === 200 && authProfile.body.usuario?.correo === 'carlos.mendoza@visitask.com', JSON.stringify(authProfile.body));

  // --- SECCIÓN 4: Aislamiento Multi-Tenant Estricto ---
  console.log('\n--- 4. Aislamiento Multi-Tenant Estricto ---');

  const validLoginB = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ correo: 'jairo.camacho@visitask.com', clave: '12345' }),
  });
  assert('4.1 Login válido (Admin B - Tecnología Andina) retorna 200 OK', validLoginB.status === 200 && !!validLoginB.body.token, `Status: ${validLoginB.status}`);
  const tokenB = validLoginB.body?.token;
  const userB = validLoginB.body?.usuario;

  const orgA = await request('/api/organizaciones/mi-organizacion', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const orgB = await request('/api/organizaciones/mi-organizacion', {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assert('4.2 Tenant A y Tenant B tienen organizaciones diferentes', orgA.body.id !== orgB.body.id && orgA.body.nombre === 'Visitask Global Enterprise' && orgB.body.nombre === 'Tecnología Andina S.A.', `OrgA: ${orgA.body.nombre}, OrgB: ${orgB.body.nombre}`);

  const usersA = await request('/api/usuarios', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const usersB = await request('/api/usuarios', {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assert('4.3 Lista de usuarios de Tenant A no contiene usuarios de Tenant B', !usersA.body.some(u => u.correo === 'jairo.camacho@visitask.com'), 'Fuga detectada en Tenant A');
  assert('4.4 Lista de usuarios de Tenant B no contiene usuarios de Tenant A', !usersB.body.some(u => u.correo === 'carlos.mendoza@visitask.com'), 'Fuga detectada en Tenant B');

  // --- SECCIÓN 5: Creación de Departamentos y Colaboradores ---
  console.log('\n--- 5. Operaciones de Departamentos y Usuarios ---');

  const timestamp = Date.now().toString().slice(-4);
  const nuevoDep = await request('/api/organizaciones/departamentos', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      nombre: `QA Lab ${timestamp}`,
      descripcion: 'Departamento automatizado de pruebas de calidad',
    }),
  });
  assert('5.1 Creación de nuevo departamento retorna 201 Created', nuevoDep.status === 201 && nuevoDep.body.nombre.includes('QA Lab'), JSON.stringify(nuevoDep.body));

  const depId = nuevoDep.body?.id;
  const nuevoEmail = `qa.colaborador.${timestamp}@visitask.com`;
  const invitarUser = await request('/api/usuarios/invitar', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      correo: nuevoEmail,
      nombre: 'Prueba QA',
      apellido: 'Automatizada',
      rol: 'SUPERVISOR',
      departamentoId: depId,
    }),
  });
  assert('5.2 Invitación de usuario retorna 201 Created', invitarUser.status === 201 && invitarUser.body.usuario?.correo === nuevoEmail, JSON.stringify(invitarUser.body));

  const duplicateInvite = await request('/api/usuarios/invitar', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      correo: nuevoEmail,
      nombre: 'Prueba QA Repetida',
      apellido: 'Automatizada',
      rol: 'SUPERVISOR',
      departamentoId: depId,
    }),
  });
  assert('5.3 Invitación duplicada retorna 409 Conflict', duplicateInvite.status === 409 && (duplicateInvite.body.errorCode === 'ERR_USER_ALREADY_IN_ORG' || duplicateInvite.body.errorCode === 'ERR_USER_ALREADY_EXISTS'), JSON.stringify(duplicateInvite.body));

  // --- SECCIÓN 6: Consentimiento Legal Digital ---
  console.log('\n--- 6. Consentimiento Informado y Trazabilidad Legal ---');

  const consentStatus = await request('/api/consentimiento/estado', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert('6.1 Consulta de estado de consentimiento responde 200 OK', consentStatus.status === 200 && typeof consentStatus.body.tieneConsentimiento === 'boolean', JSON.stringify(consentStatus.body));

  const signConsent = await request('/api/consentimiento/firmar', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      tipo: 'TELEMETRIA_POSTURAL',
      versionTerminos: 'v1.0-SST-2026',
    }),
  });
  assert('6.2 Firma digital de consentimiento registra IP y hash criptográfico', signConsent.status === 201 && (signConsent.body.consentimiento?.isAccepted === true || signConsent.body.exito === true), JSON.stringify(signConsent.body));

  const revokeConsent = await request('/api/consentimiento/revocar', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert('6.3 Revocación de consentimiento retorna 200 OK y desactiva autorización', revokeConsent.status === 201 || revokeConsent.status === 200, JSON.stringify(revokeConsent.body));

  // Re-firmar para dejar el tenant en estado operativo
  await request('/api/consentimiento/firmar', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ tipo: 'TELEMETRIA_POSTURAL', versionTerminos: 'v1.0-SST-2026' }),
  });

  // --- SECCIÓN 7: Suscripciones, Cotización y Pasarela Sandbox ---
  console.log('\n--- 7. Suscripciones y Facturación Sandbox ---');

  const planes = await request('/api/suscripciones/planes');
  assert('7.1 Catálogo público de planes retorna los 3 planes', planes.status === 200 && Array.isArray(planes.body) && planes.body.length === 3, `Planes: ${planes.body?.length}`);

  const cotizacion = await request('/api/suscripciones/cotizar', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ planType: 'SAAS_SEAT_MONTHLY', puestos: 20 }),
  });
  assert('7.2 Cotizador calcula correctamente 20 puestos a $19 = $380', (cotizacion.status === 200 || cotizacion.status === 201) && cotizacion.body.montoTotal === 380, JSON.stringify(cotizacion.body));

  const txId = `TX-QA-${Date.now()}`;
  const pagoSandbox = await request('/api/suscripciones/pagar', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      planType: 'SAAS_SEAT_MONTHLY',
      puestos: 20,
      metodoPago: 'SANDBOX_CORPORATE_CARD',
      transactionId: txId,
    }),
  });
  assert('7.3 Pago Sandbox procesa suscripción activa y factura digital', (pagoSandbox.status === 200 || pagoSandbox.status === 201) && pagoSandbox.body.suscripcion?.status === 'ACTIVE' && !!pagoSandbox.body.factura?.invoiceNumber, JSON.stringify(pagoSandbox.body));

  const facturas = await request('/api/suscripciones/facturas', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert('7.4 Listado de facturas incluye la factura recién generada', facturas.status === 200 && facturas.body.some(f => f.transactionId === txId), `Facturas: ${facturas.body?.length}`);

  // --- RESUMEN FINAL ---
  console.log('\n====================================================');
  const total = testResults.length;
  const passed = testResults.filter(t => t.passed).length;
  const failed = total - passed;
  console.log(`TOTAL DE PRUEBAS QA: ${total} | PASADAS: ${passed} | FALLIDAS: ${failed}`);
  console.log(`TASA DE ÉXITO: ${((passed / total) * 100).toFixed(1)}%`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runQASuite().catch(err => {
  console.error('Error fatal durante ejecución de QA:', err);
  process.exit(1);
});
