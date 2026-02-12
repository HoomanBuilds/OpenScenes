export const isDev = process.env.NODE_ENV === 'development';

export const limits = {
  render: {
    perMinute: 2,
    perHour: 10,
    perDay: 30,
    maxPayloadBytes: 5 * 1024 * 1024,
    maxSlides: 15,
    maxSlideDurationMs: 15000,
    maxTotalDurationMs: 180000,
  },

  ai: {
    generate: {
      perMinute: 1,
      perDay: 10,
      perMonth: 50,
    },
    edit: {
      perMinute: 2,
      perDay: 20,
      perMonth: 100,
    },
    defaultPerMinute: 60,
    defaultPerHour: 1000,
  },

  validation: {
    maxTemplateNameLength: 100,
    maxElementsPerSlide: 20,
    maxFiles: 3,
    maxFileSize: 5 * 1024 * 1024,
    allowedFormats: ['pdf', 'txt', 'md', 'json', 'csv', 'html', 'js', 'ts', 'tsx', 'css'] as const,
    allowedQualities: ['low', 'medium', 'high', 'ultra'] as const,
    fpsRange: { min: 1, max: 120 },
    scaleRange: { min: 0.1, max: 2.0 },
  },
};

export const auth = {
  enabled: !isDev,
  providers: ['google', 'github'] as const,
  sessionMaxAge: 30 * 24 * 60 * 60,
};

export function shouldEnforceLimits(): boolean {
  return !isDev;
}

export function shouldEnforceAuth(): boolean {
  return auth.enabled;
}
