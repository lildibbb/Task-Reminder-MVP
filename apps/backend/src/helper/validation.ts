import { ValidationError } from 'class-validator';

export interface ErrorFormat {
  property: string;
  constraints: { [key: string]: string };
}
export const extractAllErrors = (e: ValidationError): ErrorFormat[] => {
  if (!!e.children && e.children.length) {
    const errors: ErrorFormat[] = [];
    e.children.forEach((child) => {
      errors.push(...extractAllErrors(child).map((childErr) => childErr));
    });
    return errors;
  } else {
    return [{ property: e.property, constraints: e.constraints || {} }];
  }
};
