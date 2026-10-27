import { build } from 'vite';

// Host público injetado pelo Blueprint, mesmo quando o Render altera o nome da API.
const host = process.env.VITE_API_HOST;
if (!host) throw new Error('VITE_API_HOST não foi fornecido pelo Blueprint.');
if (!/^[a-z0-9.-]+$/i.test(host)) throw new Error('VITE_API_HOST deve conter apenas o hostname.');
process.env.VITE_API_URL = `https://${host}/api`;
await build();
