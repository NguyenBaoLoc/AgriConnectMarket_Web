/**
 * Sample PayloadFields Configuration
 *
 * This file contains example configurations for different event types
 * showing how to structure the payloadFields JSON that should be stored
 * in the backend EventType entity.
 */

// Example 1: Pest Detection Event
const pestDetectionPayloadFields = [
  {
    name: 'pestType',
    label: 'Pest Type',
    type: 'select',
    required: true,
    options: [
      { label: 'Aphids', value: 'aphids' },
      { label: 'Mites', value: 'mites' },
      { label: 'Beetles', value: 'beetles' },
      { label: 'Caterpillars', value: 'caterpillars' },
      { label: 'Whiteflies', value: 'whiteflies' },
      { label: 'Other', value: 'other' },
    ],
  },
  {
    name: 'affectedArea',
    label: 'Affected Area (%)',
    type: 'number',
    required: true,
    min: 0,
    max: 100,
    placeholder: '0-100',
  },
  {
    name: 'pestCount',
    label: 'Approximate Pest Count',
    type: 'number',
    required: false,
    min: 0,
    placeholder: 'e.g., 50',
  },
  {
    name: 'severity',
    label: 'Severity Level',
    type: 'select',
    required: true,
    options: [
      { label: 'Low (1-25%)', value: 'low' },
      { label: 'Medium (25-50%)', value: 'medium' },
      { label: 'High (50-75%)', value: 'high' },
      { label: 'Critical (>75%)', value: 'critical' },
    ],
  },
  {
    name: 'observations',
    label: 'Observations',
    type: 'textarea',
    required: false,
    placeholder: 'Describe what you observed...',
  },
];

// Example 2: Fertilizer Application Event
const fertilizerApplicationPayloadFields = [
  {
    name: 'fertilizerType',
    label: 'Fertilizer Type',
    type: 'select',
    required: true,
    options: [
      { label: 'NPK (10-10-10)', value: 'npk_10_10_10' },
      { label: 'NPK (20-20-20)', value: 'npk_20_20_20' },
      { label: 'Organic Compost', value: 'organic_compost' },
      { label: 'Nitrogen Rich', value: 'nitrogen_rich' },
      { label: 'Phosphate Rich', value: 'phosphate_rich' },
      { label: 'Other', value: 'other' },
    ],
  },
  {
    name: 'amountKg',
    label: 'Amount (kg)',
    type: 'number',
    required: true,
    min: 0.1,
    max: 10000,
    placeholder: 'e.g., 50',
  },
  {
    name: 'applicationMethod',
    label: 'Application Method',
    type: 'select',
    required: true,
    options: [
      { label: 'Broadcasting', value: 'broadcasting' },
      { label: 'Banding', value: 'banding' },
      { label: 'Liquid Spray', value: 'liquid_spray' },
      { label: 'Drip Irrigation', value: 'drip_irrigation' },
      { label: 'Foliar Spray', value: 'foliar_spray' },
    ],
  },
  {
    name: 'weatherConditions',
    label: 'Weather Conditions',
    type: 'text',
    required: false,
    placeholder: 'e.g., Clear, Sunny',
  },
  {
    name: 'applicatorName',
    label: 'Applied By',
    type: 'text',
    required: false,
    placeholder: 'Name of the person applying fertilizer',
  },
];

// Example 3: Irrigation Event
const irrigationPayloadFields = [
  {
    name: 'irrigationMethod',
    label: 'Irrigation Method',
    type: 'select',
    required: true,
    options: [
      { label: 'Sprinkler', value: 'sprinkler' },
      { label: 'Drip Irrigation', value: 'drip' },
      { label: 'Flood Irrigation', value: 'flood' },
      { label: 'Manual Watering', value: 'manual' },
      { label: 'Micro Sprinkler', value: 'micro_sprinkler' },
    ],
  },
  {
    name: 'waterAmountMm',
    label: 'Water Amount (mm)',
    type: 'number',
    required: true,
    min: 0,
    max: 500,
    placeholder: 'e.g., 25',
  },
  {
    name: 'waterSource',
    label: 'Water Source',
    type: 'select',
    required: true,
    options: [
      { label: 'Well', value: 'well' },
      { label: 'Pump', value: 'pump' },
      { label: 'Canal', value: 'canal' },
      { label: 'Rainwater', value: 'rainwater' },
      { label: 'Other', value: 'other' },
    ],
  },
  {
    name: 'duration',
    label: 'Duration (hours)',
    type: 'number',
    required: false,
    min: 0,
    max: 24,
    placeholder: 'e.g., 2',
  },
  {
    name: 'soilCondition',
    label: 'Soil Condition After Watering',
    type: 'textarea',
    required: false,
    placeholder: 'Describe soil moisture and condition...',
  },
];

// Example 4: Harvest Event
const harvestPayloadFields = [
  {
    name: 'harvestedQuantityKg',
    label: 'Harvested Quantity (kg)',
    type: 'number',
    required: true,
    min: 0,
    max: 100000,
    placeholder: 'e.g., 500',
  },
  {
    name: 'harvestQuality',
    label: 'Overall Quality',
    type: 'select',
    required: true,
    options: [
      { label: 'Excellent', value: 'excellent' },
      { label: 'Good', value: 'good' },
      { label: 'Fair', value: 'fair' },
      { label: 'Poor', value: 'poor' },
    ],
  },
  {
    name: 'defectPercentage',
    label: 'Defect Percentage (%)',
    type: 'number',
    required: false,
    min: 0,
    max: 100,
    placeholder: '0-100',
  },
  {
    name: 'harvestDate',
    label: 'Harvest Date',
    type: 'date',
    required: true,
  },
  {
    name: 'harvestedBy',
    label: 'Harvested By',
    type: 'text',
    required: false,
    placeholder: 'Name or team',
  },
  {
    name: 'notes',
    label: 'Harvest Notes',
    type: 'textarea',
    required: false,
    placeholder: 'Any special observations or incidents...',
  },
];

// Example 5: Disease Detection Event
const diseaseDetectionPayloadFields = [
  {
    name: 'diseaseType',
    label: 'Disease Type',
    type: 'select',
    required: true,
    options: [
      { label: 'Leaf Spot', value: 'leaf_spot' },
      { label: 'Powdery Mildew', value: 'powdery_mildew' },
      { label: 'Rust', value: 'rust' },
      { label: 'Blight', value: 'blight' },
      { label: 'Wilt', value: 'wilt' },
      { label: 'Other', value: 'other' },
    ],
  },
  {
    name: 'affectedAreaPercentage',
    label: 'Affected Area (%)',
    type: 'number',
    required: true,
    min: 0,
    max: 100,
    placeholder: '0-100',
  },
  {
    name: 'severity',
    label: 'Disease Severity',
    type: 'select',
    required: true,
    options: [
      { label: 'Mild', value: 'mild' },
      { label: 'Moderate', value: 'moderate' },
      { label: 'Severe', value: 'severe' },
    ],
  },
  {
    name: 'treatmentNeeded',
    label: 'Treatment Needed',
    type: 'select',
    required: true,
    options: [
      { label: 'Yes - Immediate', value: 'yes_immediate' },
      { label: 'Yes - Soon', value: 'yes_soon' },
      { label: 'Monitor', value: 'monitor' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    name: 'diseaseDescription',
    label: 'Disease Description',
    type: 'textarea',
    required: true,
    placeholder: 'Describe the symptoms and affected plants...',
  },
];

/**
 * HOW TO USE IN BACKEND:
 *
 * When creating or updating an EventType, store the payloadFields as a JSON string:
 *
 * const eventType = {
 *   eventTypeName: "Pest Detection",
 *   eventTypeDesc: "Record pest detection and infestation level",
 *   payloadFields: JSON.stringify(pestDetectionPayloadFields)
 * };
 *
 * // Or in SQL:
 * INSERT INTO event_types (eventTypeName, eventTypeDesc, payloadFields)
 * VALUES (
 *   'Pest Detection',
 *   'Record pest detection and infestation level',
 *   '[{"name":"pestType","label":"Pest Type",...}]'
 * );
 */

export {
  pestDetectionPayloadFields,
  fertilizerApplicationPayloadFields,
  irrigationPayloadFields,
  harvestPayloadFields,
  diseaseDetectionPayloadFields,
};
