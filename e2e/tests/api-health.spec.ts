import { test, expect } from '@playwright/test';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'http://api-prod:3000' 
  : 'http://localhost:3000';

test('API Health Check', async ({ request }) => {
  const response = await request.get(`${API_URL}/actuator/health`);
  const healthData = await response.json();
  
  expect(response.status()).toBe(200);
  expect(healthData.status).toBe('UP');
  expect(healthData.components.db.status).toBe('UP');
});

test('Database Connection Check', async ({ request }) => {
  const response = await request.get(`${API_URL}/actuator/health`);
  const healthData = await response.json();
  
  expect(healthData.components.db.details.database).toBe('PostgreSQL');
  expect(healthData.components.db.details.validationQuery).toBe('isValid()');
});
