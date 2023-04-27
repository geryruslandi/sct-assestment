import { ConfigModule } from '@nestjs/config';

export const getConfigModule = (forTesting = false) => {
  return ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: forTesting ? '.env.test' : '.env',
  });
};

export async function fetchWithTimeout(
  url: string,
  options = {},
  timeout = 5000,
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
}
