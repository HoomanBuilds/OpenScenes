import { limits, shouldEnforceLimits } from './limits';
import { TemplateData } from '../schemas/template';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateRenderRequest(
  templateData: TemplateData,
  payloadSize: number
): ValidationResult {
  const errors: string[] = [];

  if (!shouldEnforceLimits()) {
    return { valid: true, errors: [] };
  }

  if (payloadSize > limits.render.maxPayloadBytes) {
    errors.push(`Payload too large: ${(payloadSize / 1024 / 1024).toFixed(2)}MB (max: ${limits.render.maxPayloadBytes / 1024 / 1024}MB)`);
  }

  if (templateData.name.length > limits.validation.maxTemplateNameLength) {
    errors.push(`Template name too long (max: ${limits.validation.maxTemplateNameLength} chars)`);
  }

  if (templateData.slides.length > limits.render.maxSlides) {
    errors.push(`Too many slides: ${templateData.slides.length} (max: ${limits.render.maxSlides})`);
  }

  let totalDuration = 0;
  for (let i = 0; i < templateData.slides.length; i++) {
    const slide = templateData.slides[i];
    
    if (slide.duration > limits.render.maxSlideDurationMs) {
      errors.push(`Slide ${i + 1} duration too long: ${slide.duration}ms (max: ${limits.render.maxSlideDurationMs}ms)`);
    }
    
    totalDuration += slide.duration;

    if (slide.elements && slide.elements.length > limits.validation.maxElementsPerSlide) {
      errors.push(`Slide ${i + 1} has too many elements: ${slide.elements.length} (max: ${limits.validation.maxElementsPerSlide})`);
    }
  }

  if (totalDuration > limits.render.maxTotalDurationMs) {
    errors.push(`Total duration too long: ${totalDuration / 1000}s (max: ${limits.render.maxTotalDurationMs / 1000}s)`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateRenderParams(params: {
  fps?: number;
  scale?: number;
  format?: string;
  quality?: string;
}): ValidationResult {
  const errors: string[] = [];

  if (!shouldEnforceLimits()) {
    return { valid: true, errors: [] };
  }

  if (params.fps !== undefined) {
    if (params.fps < limits.validation.fpsRange.min || params.fps > limits.validation.fpsRange.max) {
      errors.push(`FPS out of range: ${params.fps} (allowed: ${limits.validation.fpsRange.min}-${limits.validation.fpsRange.max})`);
    }
  }

  if (params.scale !== undefined) {
    if (params.scale < limits.validation.scaleRange.min || params.scale > limits.validation.scaleRange.max) {
      errors.push(`Scale out of range: ${params.scale} (allowed: ${limits.validation.scaleRange.min}-${limits.validation.scaleRange.max})`);
    }
  }

  if (params.format && !limits.validation.allowedRenderFormats.includes(params.format as any)) {
    errors.push(`Invalid format: ${params.format} (allowed: ${limits.validation.allowedRenderFormats.join(', ')})`);
  }

  if (params.quality && !limits.validation.allowedQualities.includes(params.quality as any)) {
    errors.push(`Invalid quality: ${params.quality} (allowed: ${limits.validation.allowedQualities.join(', ')})`);
  }

  return { valid: errors.length === 0, errors };
}
