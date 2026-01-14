/**
 * Utility for managing units for care event types
 * Units are extracted from field names that contain them in parentheses
 */

/**
 * Map of event types to their amount-related fields and their units
 * Units are extracted from the field names (e.g., "Water volume (l)" → "l")
 */
export const eventTypeUnitsMap: Record<
  string,
  { fields: string[]; unit: string }
> = {
  'Soil preparation': {
    fields: ['Soil amendment (amount)', 'Fuel consumed'],
    unit: 'l', // Fuel consumed is typically in liters
  },
  'Soil testing': {
    fields: [],
    unit: '',
  },
  'Planting / transplanting': {
    fields: [],
    unit: '',
  },
  Irrigation: {
    fields: ['Water volume (l)', 'Duration (min)'],
    unit: 'l', // Primary unit for water volume
  },
  Fertilization: {
    fields: ['Rate'],
    unit: 'g/ha', // Rate is typically in g/ha or similar
  },
  'Pest and disease control': {
    fields: ['Rate (%)'],
    unit: '%',
  },
  Weeding: {
    fields: ['Area treated (ha)', 'Labor'],
    unit: 'ha', // Primary unit for area
  },
  'Pruning / training': {
    fields: [],
    unit: '',
  },
  'Growth monitoring': {
    fields: [],
    unit: '',
  },
  Pollination: {
    fields: [],
    unit: '',
  },
  Harvest: {
    fields: ['Quantity (kg)'],
    unit: 'kg',
  },
};

/**
 * Extracts the unit from a field name that has unit in parentheses
 * e.g., "Water volume (l)" → "l"
 */
export function extractUnitFromFieldName(fieldName: string): string {
  const match = fieldName.match(/\(([^)]+)\)$/);
  return match ? match[1] : '';
}

/**
 * Gets the appropriate unit for an event type
 * Returns the unit based on the primary amount field for that event type
 */
export function getUnitForEventType(eventType: string): string {
  const config = eventTypeUnitsMap[eventType];

  if (!config || config.fields.length === 0) {
    return '';
  }

  // Try to extract unit from the first field name that has units in parentheses
  for (const field of config.fields) {
    const unit = extractUnitFromFieldName(field);
    if (unit) {
      return unit;
    }
  }

  // Fall back to the configured unit
  return config.unit;
}

/**
 * Checks if an event type has amount-related fields
 */
export function hasAmountFields(eventType: string): boolean {
  const config = eventTypeUnitsMap[eventType];
  return config ? config.fields.length > 0 : false;
}

/**
 * Gets the amount field names for a specific event type
 */
export function getAmountFieldsForEventType(eventType: string): string[] {
  const config = eventTypeUnitsMap[eventType];
  return config ? config.fields : [];
}
