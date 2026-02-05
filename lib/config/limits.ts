export const isDev = process.env.NODE_ENV === 'development';

export const limits = {
  render: {
    perMinute: 5,
    perHour: 30,
    perDay: 100,
    maxPayloadBytes: 5 * 1024 * 1024,
    maxSlides: 100,
    maxSlideDurationMs: 60000,
    maxTotalDurationMs: 600000,
  },

  api: {
    defaultPerMinute: 60,
    defaultPerHour: 1000,
  },

  validation: {
    maxTemplateNameLength: 100,
    maxElementsPerSlide: 50,
    allowedFormats: ['mp4', 'webm'] as const,
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
