import axios, { AxiosError } from 'axios';

export interface ApiErrorEnvelope {
  statusCode: number;
  errorCode: string;
  message: string;
  errorReference: string;
  timestamp: string;
  path?: string;
}

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ergocheck_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function extraerErrorApi(error: unknown): ApiErrorEnvelope {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorEnvelope | undefined;
    if (data && data.errorReference) {
      return data;
    }
    return {
      statusCode: error.response?.status || 500,
      errorCode: 'ERR_NETWORK_OR_SERVER',
      message: error.message || 'Error de comunicación con el servidor.',
      errorReference: 'ERR-NET-FAIL',
      timestamp: new Date().toISOString(),
    };
  }

  return {
    statusCode: 500,
    errorCode: 'ERR_CLIENT_UNKNOWN',
    message: 'Ocurrió un error inesperado en la interfaz.',
    errorReference: 'ERR-CLIENT-00',
    timestamp: new Date().toISOString(),
  };
}
