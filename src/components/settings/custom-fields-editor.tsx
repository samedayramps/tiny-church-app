"use client";

interface CustomField {
  name: string;
  type: string;
  options?: string[];
  required: boolean;
}

interface CustomFieldsEditorProps {
  value: {
    required_fields: string[];
    optional_fields: string[];
    custom_fields: CustomField[];
  };
  onChange: (value: any) => void;
  types: string[];
}

export function CustomFieldsEditor({ value, onChange, types }: CustomFieldsEditorProps) {
  // Implementation for editing custom fields
  // This would include UI for adding/removing fields, setting types, etc.
} 