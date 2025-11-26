import { Controller } from '@nestjs/common';

export function ControllerDecorator(version: string, path: string) {
  return Controller(`${version}/${path}`);
}

