import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { URL } from 'node:url';

export interface ProjectRegistrationResult {
  status: 201 | 409;
  projectId: string;
  message?: string;
}

export function registerProject(
  serverUrl: string,
  name: string
): Promise<ProjectRegistrationResult> {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/projects', serverUrl);
    const body = JSON.stringify({ name });
    const makeRequest = url.protocol === 'https:' ? httpsRequest : httpRequest;

    const req = makeRequest(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk: Buffer) => {
          data += chunk.toString();
        });
        res.on('end', () => {
          if (res.statusCode === 201 || res.statusCode === 409) {
            const parsed = JSON.parse(data) as {
              projectId: string;
              message?: string;
            };
            resolve({
              status: res.statusCode,
              projectId: parsed.projectId,
              message: parsed.message,
            });
          } else {
            reject(new Error(`Unexpected response status: ${String(res.statusCode)}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}
