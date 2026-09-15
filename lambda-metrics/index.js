const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'fixlat_db',
      user: process.env.DB_USER || 'fixlat_user',
      password: process.env.DB_PASSWORD || 'fixlat_secret',
      max: 5,
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 10000,
    });
  }
  return pool;
}

/**
 * Función principal de AWS Lambda
 * Calcula las métricas del dashboard a partir de los datos persistentes de notas.
 */
exports.handler = async (event, context) => {
  console.log('>>> [AWS Lambda] Ejecutando cálculo de métricas del dashboard');

  try {
    const dbPool = getPool();
    const result = await dbPool.query(`
      SELECT status, COUNT(*)::int AS count
      FROM notes
      GROUP BY status
    `);

    const byStatus = {
      PENDIENTE: 0,
      EN_CURSO: 0,
      HECHO: 0
    };

    let totalNotes = 0;

    result.rows.forEach(row => {
      const statusKey = String(row.status).toUpperCase();
      const countVal = parseInt(row.count, 10) || 0;
      byStatus[statusKey] = countVal;
      totalNotes += countVal;
    });

    const metricsData = {
      totalNotes,
      byStatus,
      source: 'AWS_LAMBDA',
      timestamp: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify(metricsData)
    };
  } catch (error) {
    console.error('>>> [AWS Lambda] Error al calcular métricas:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Error al calcular métricas en AWS Lambda',
        details: error.message
      })
    };
  }
};
