import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

export let options = {
  stages: [
    { duration: '30s', target: 50 }, // ramp up to 50 users
    { duration: '1m', target: 50 },  // stay at 50 users
    { duration: '30s', target: 0 },  // ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requisições devem ser abaixo de 500ms
  },
};

const BASE_URL = 'https://ave288vpc8.execute-api.us-east-1.amazonaws.com/prod';
const CPFS = [
  '12345678901', '23456789012', '34567890123', '45678901234', '56789012345',
  '67890123456', '78901234567', '89012345678', '90123456789', '01234567890',
  '11234567890', '12234567890', '13234567890', '14234567890', '15234567890',
  '16234567890', '17234567890', '18234567890', '19234567890', '20234567890'
];

export default function () {
  for (const cpf of CPFS) {
    // Test GET /periodo-demonstrativo
    let periodoDemonstrativoRes = http.get(`${BASE_URL}/periodo-demonstrativo?cpf=${cpf}`);
    check(periodoDemonstrativoRes, {
      'GET /periodo-demonstrativo status is 200': (r) => r.status === 200,
      'GET /periodo-demonstrativo body is not empty': (r) => r.body.length > 0,
    });

    // Test PUT /login with CPF only
    let loginPayload = JSON.stringify({ queryStringParameters: { cpf: cpf } });
    let loginParams = { headers: { 'Content-Type': 'application/json' } };
    let loginRes = http.put(`${BASE_URL}/login`, loginPayload, loginParams);
    check(loginRes, {
      'PUT /login status is 200': (r) => r.status === 200,
      'PUT /login body contains token': (r) => JSON.parse(r.body).token !== undefined,
    });

    // Test GET /demonstrativo-pgto
    let demonstrativoPgtoRes = http.get(`${BASE_URL}/demonstrativo-pgto?cpf=${cpf}&ano=2023&mes=10`);
    check(demonstrativoPgtoRes, {
      'GET /demonstrativo-pgto status is 200': (r) => r.status === 200,
      'GET /demonstrativo-pgto body is not empty': (r) => r.body.length > 0,
    });

    sleep(1);
  }
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Exibe o resumo no console
    'report.html': htmlReport(data), // Gera o relatório HTML
  };
}
