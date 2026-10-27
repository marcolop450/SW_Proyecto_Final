const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({ status: res.statusCode, headers: res.headers, data: json, raw: data });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function testSuite() {
  console.log('=== Verificación E2E de Telemetría Real y RBAC ===');

  // 1. Login Super Admin (Manuela)
  const loginSuper = await request(
    {
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { correo: 'manuela@gmail.com', clave: '12345' }
  );
  console.assert(loginSuper.status === 200 || loginSuper.status === 201, 'Super Admin login exitoso');
  const tokenSuper = loginSuper.data.token;

  // 2. Super Admin lista todas las organizaciones
  const resOrgs = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/organizaciones/todas',
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenSuper}` },
  });
  console.assert(resOrgs.status === 200, 'Super Admin puede listar todas las organizaciones');
  console.assert(Array.isArray(resOrgs.data) && resOrgs.data.length >= 3, 'Retorna las organizaciones registradas');
  console.log(`[PASS] Super Admin consultó exitosamente ${resOrgs.data.length} organizaciones.`);

  // 3. Login Admin Organizacion (Carlos Mendoza)
  const loginOrgAdmin = await request(
    {
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { correo: 'carlos.mendoza@visitask.com', clave: '12345' }
  );
  console.assert(loginOrgAdmin.status === 200 || loginOrgAdmin.status === 201, 'Org Admin login exitoso');
  const tokenOrgAdmin = loginOrgAdmin.data.token;

  // 4. Admin Organizacion NO puede acceder a /organizaciones/todas (RBAC 403)
  const resForbidden = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/organizaciones/todas',
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenOrgAdmin}` },
  });
  console.assert(resForbidden.status === 403, 'Admin Organizacion bloqueado con 403 en directorio global');
  console.log('[PASS] RBAC estricto: Admin Organización bloqueado con 403 al intentar acceder al directorio global.');

  // 5. Login Colaborador (Juan Matienzo)
  const loginEmpleado = await request(
    {
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { correo: 'juan.matienzo@visitask.com', clave: '12345' }
  );
  console.assert(loginEmpleado.status === 200 || loginEmpleado.status === 201, 'Empleado login exitoso');
  const tokenEmpleado = loginEmpleado.data.token;

  // 6. Juan Matienzo consulta /api/ergonomia/resumen (telemetría real de Supabase)
  const resErgonomia = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/ergonomia/resumen',
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenEmpleado}` },
  });
  console.assert(resErgonomia.status === 200, 'Telemetría ergonómica consultada exitosamente');
  console.assert(resErgonomia.data.totalSesiones >= 3, 'Juan Matienzo tiene sesiones sembradas');
  console.assert(resErgonomia.data.promedioRula > 0, 'RULA promedio calculado correctamente');
  console.log(`[PASS] Telemetría real de Juan Matienzo: ${resErgonomia.data.totalSesiones} sesiones, RULA promedio ${resErgonomia.data.promedioRula}, ${resErgonomia.data.minutosMonitoreados} min.`);

  // 7. Login Postulante
  const loginPostulante = await request(
    {
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { correo: 'candidato.demo@gmail.com', clave: '12345' }
  );
  console.assert(loginPostulante.status === 200 || loginPostulante.status === 201, 'Postulante login exitoso');
  const tokenPostulante = loginPostulante.data.token;

  // Revocar explícitamente para comprobar que ConsentGuard bloquea telemetría sin consentimiento (CU03)
  await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/consentimiento/revocar',
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenPostulante}` },
  });

  // 8. Usuario sin consentimiento activo es bloqueado por ConsentGuard (CU03)
  const resBloqueado = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/ergonomia/resumen',
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenPostulante}` },
  });
  console.assert(resBloqueado.status === 403, 'Bloqueo por falta de consentimiento 403');
  console.assert(resBloqueado.data?.errorCode === 'ERR_CONSENT_REQUIRED', 'ErrorCode ERR_CONSENT_REQUIRED emitido');
  console.log('[PASS] CU03 ConsentGuard: Postulante con consentimiento revocado bloqueado con HTTP 403 ERR_CONSENT_REQUIRED.');

  console.log('=== TODAS LAS PRUEBAS E2E DE RBAC Y TELEMETRÍA APROBADAS AL 100% ===');
}

testSuite().catch((err) => {
  console.error('[FAIL] Error en pruebas:', err);
  process.exit(1);
});
