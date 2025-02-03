import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 }, // ramp up to 10 users
    { duration: '1m', target: 10 },  // stay at 10 users
    { duration: '30s', target: 0 },  // ramp down to 0 users
  ],
};

const BASE_URL = 'https://ave288vpc8.execute-api.us-east-1.amazonaws.com/prod';

export default function () {
  // Test GET /periodo-demonstrativo
  let periodoDemonstrativoRes = http.get(`${BASE_URL}/periodo-demonstrativo`);
  check(periodoDemonstrativoRes, {
    'GET /periodo-demonstrativo status is 200': (r) => r.status === 200,
    'GET /periodo-demonstrativo body is not empty': (r) => r.body.length > 0,
  });

  // Test PUT /login with valid credentials
  let loginPayload = JSON.stringify({ username: 'test', password: 'test' });
  let loginParams = { headers: { 'Content-Type': 'application/json' } };
  let loginRes = http.put(`${BASE_URL}/login`, loginPayload, loginParams);
  check(loginRes, {
    'PUT /login status is 200': (r) => r.status === 200,
    'PUT /login body contains token': (r) => JSON.parse(r.body).token !== undefined,
  });

  // Test PUT /login with invalid credentials
  let invalidLoginPayload = JSON.stringify({ username: 'invalid', password: 'invalid' });
  let invalidLoginRes = http.put(`${BASE_URL}/login`, invalidLoginPayload, loginParams);
  check(invalidLoginRes, {
    'PUT /login with invalid credentials status is 401': (r) => r.status === 401,
  });

  // Test GET /demonstrativo-pgto
  let demonstrativoPgtoRes = http.get(`${BASE_URL}/demonstrativo-pgto`);
  check(demonstrativoPgtoRes, {
    'GET /demonstrativo-pgto status is 200': (r) => r.status === 200,
    'GET /demonstrativo-pgto body is not empty': (r) => r.body.length > 0,
  });

  sleep(1);
}
