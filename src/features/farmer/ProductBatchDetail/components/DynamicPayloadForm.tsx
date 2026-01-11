import React, { useMemo } from 'react';
import type { PayloadField } from '../types/event';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { Label } from '../../../../components/ui/label';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../../../components/ui/utils';

interface DynamicPayloadFormProps {
  fields: PayloadField[];
  values: Record<string, string | number>;
  onChange: (fieldName: string, value: string | number) => void;
  errors?: Record<string, string>;
}

export function DynamicPayloadForm({
  fields,
  values,
  onChange,
  errors = {},
}: DynamicPayloadFormProps) {
  // Sort fields by required first, then by original order
  const sortedFields = useMemo(() => {
    return [...fields].sort((a, b) => {
      if (a.required === b.required) return 0;
      return a.required ? -1 : 1;
    });
  }, [fields]);

  const renderField = (field: PayloadField) => {
    const value = values[field.name] ?? '';
    const error = errors[field.name];
    const isInvalid = !!error;

    const baseInputClasses = cn(
      'w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900',
      'placeholder-gray-400 transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      isInvalid && 'border-red-400 focus:ring-red-500'
    );

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            key={field.name}
            id={field.name}
            placeholder={
              field.placeholder || `Enter ${field.label.toLowerCase()}...`
            }
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            rows={3}
            className={cn(baseInputClasses, 'resize-none font-mono text-sm')}
          />
        );

      case 'number':
        return (
          <Input
            key={field.name}
            id={field.name}
            type="number"
            placeholder={
              field.placeholder || `Enter ${field.label.toLowerCase()}...`
            }
            value={value}
            onChange={(e) =>
              onChange(
                field.name,
                e.target.value === '' ? '' : parseFloat(e.target.value)
              )
            }
            min={field.min}
            max={field.max}
            className={baseInputClasses}
          />
        );

      case 'email':
        return (
          <Input
            key={field.name}
            id={field.name}
            type="email"
            placeholder={field.placeholder || 'Enter email address...'}
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            className={baseInputClasses}
          />
        );

      case 'date':
        return (
          <Input
            key={field.name}
            id={field.name}
            type="date"
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            className={baseInputClasses}
          />
        );

      case 'select':
        return (
          <Select
            key={field.name}
            value={String(value)}
            onValueChange={(val) => onChange(field.name, val)}
          >
            <SelectTrigger
              className={cn(
                'w-full px-3 py-2 rounded-md border border-gray-300 bg-white',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                isInvalid && 'border-red-400 focus:ring-red-500'
              )}
              disabled={!field.options || field.options.length === 0}
            >
              <SelectValue
                placeholder={
                  field.placeholder || `Select ${field.label.toLowerCase()}...`
                }
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'text':
      default:
        return (
          <Input
            key={field.name}
            id={field.name}
            type="text"
            placeholder={
              field.placeholder || `Enter ${field.label.toLowerCase()}...`
            }
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            className={baseInputClasses}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {sortedFields.length === 0 ? (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-600">
            No additional fields required for this event type.
          </p>
        </div>
      ) : (
        sortedFields.map((field) => {
          const error = errors[field.name];
          const isInvalid = !!error;

          return (
            <div
              key={field.name}
              className="space-y-2 animate-in fade-in-50 duration-300"
            >
              <div className="flex items-center justify-between">
                <Label
                  htmlFor={field.name}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isInvalid ? 'text-red-600' : 'text-gray-700'
                  )}
                >
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-red-500 font-bold">*</span>
                  )}
                </Label>
                {field.type === 'number' &&
                  field.min !== undefined &&
                  field.max !== undefined && (
                    <span className="text-xs text-gray-500">
                      {field.min} - {field.max}
                    </span>
                  )}
              </div>

              {renderField(field)}

              {isInvalid && (
                <div className="flex items-center gap-2 text-red-600 text-xs mt-1">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
