"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FieldSuggestions } from "./field-suggestions";
import { useToast } from "@/components/ui/use-toast";

interface CustomField {
  name: string;
  type: string;
  options?: string[];
  required: boolean;
}

interface MemberFieldsConfig {
  required_fields: string[];
  optional_fields: string[];
  custom_fields: CustomField[];
}

interface CustomFieldsEditorProps {
  value: MemberFieldsConfig | CustomField[];
  onChange: (value: MemberFieldsConfig | CustomField[]) => void;
  types: string[];
  mode?: 'member' | 'event' | 'group' | 'custom';
}

export function CustomFieldsEditor({ value, onChange, types, mode = 'custom' }: CustomFieldsEditorProps) {
  const [newField, setNewField] = useState<CustomField>({
    name: '',
    type: types[0] || '',
    required: false
  });
  const [newOption, setNewOption] = useState("");
  const { toast } = useToast();

  const fields = mode === 'member' 
    ? ((value as MemberFieldsConfig)?.custom_fields || [])
    : (Array.isArray(value) ? value : []);

  const addField = () => {
    if (!newField.name?.trim()) {
      toast({
        title: "Invalid field name",
        description: "Field name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    const normalizedName = newField.name.trim().toLowerCase().replace(/\s+/g, '_');
    
    if (fields.some(f => f.name.toLowerCase() === normalizedName)) {
      toast({
        title: "Duplicate field name",
        description: "A field with this name already exists",
        variant: "destructive",
      });
      return;
    }
    
    const fieldToAdd = {
      ...newField,
      name: normalizedName,
      options: newField.type === 'select' || newField.type === 'multiselect' ? [] : undefined
    };
    
    if (mode === 'member') {
      onChange({
        ...(value as MemberFieldsConfig),
        custom_fields: [...fields, fieldToAdd]
      });
    } else {
      onChange([...fields, fieldToAdd]);
    }
    
    setNewField({
      name: '',
      type: types[0] || '',
      required: false
    });
  };

  const removeField = (index: number) => {
    if (mode === 'member') {
      const newFields = [...fields];
      newFields.splice(index, 1);
      onChange({
        ...(value as MemberFieldsConfig),
        custom_fields: newFields
      });
    } else {
      const newFields = [...fields];
      newFields.splice(index, 1);
      onChange(newFields);
    }
  };

  const updateField = (index: number, updates: Partial<CustomField>) => {
    const newFields = [...fields];
    newFields[index] = { 
      ...newFields[index], 
      ...updates,
      options: (updates.type && !['select', 'multiselect'].includes(updates.type)) 
        ? undefined 
        : newFields[index].options 
    };

    if (mode === 'member') {
      onChange({
        ...(value as MemberFieldsConfig),
        custom_fields: newFields
      });
    } else {
      onChange(newFields);
    }
  };

  const addOption = (fieldIndex: number) => {
    if (!newOption?.trim()) {
      toast({
        title: "Invalid option",
        description: "Option cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const field = fields[fieldIndex];
    const normalizedOption = newOption.trim();

    if (field.options?.includes(normalizedOption)) {
      toast({
        title: "Duplicate option",
        description: "This option already exists",
        variant: "destructive",
      });
      return;
    }

    const options = [...(field.options || []), normalizedOption];
    updateField(fieldIndex, { options });
    setNewOption("");
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const field = fields[fieldIndex];
    if (!field.options) return;
    const options = [...field.options];
    options.splice(optionIndex, 1);
    updateField(fieldIndex, { options });
  };

  const handleSuggestionSelect = (suggestion: FieldSuggestion) => {
    const newField: CustomField = {
      name: suggestion.name,
      type: suggestion.type,
      required: suggestion.required,
      options: suggestion.options
    };

    if (mode === 'member') {
      onChange({
        ...(value as MemberFieldsConfig),
        custom_fields: [...fields, newField]
      });
    } else {
      onChange([...fields, newField]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Label>Field Name</Label>
          <Input
            placeholder="Field name"
            value={newField.name || ''}
            onChange={(e) => setNewField({ ...newField, name: e.target.value })}
          />
        </div>
        <div>
          <Label>Type</Label>
          <Select
            value={newField.type || types[0]}
            onValueChange={(value) => setNewField({ ...newField, type: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <div className="space-y-2">
            <Label>Required</Label>
            <Switch
              checked={newField.required}
              onCheckedChange={(checked) => setNewField({ ...newField, required: checked })}
            />
          </div>
        </div>
        <div className="flex items-end">
          <Button type="button" onClick={addField}>
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <Label>Custom Fields</Label>
        <FieldSuggestions
          type={mode === 'member' ? 'member' : mode === 'event' ? 'event' : 'group'}
          onSelect={handleSuggestionSelect}
        />
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={index} className="flex items-start gap-2 p-4 border rounded-lg">
            <div className="flex-1 space-y-4">
              <div className="flex gap-2">
                <Input
                  value={field.name}
                  onChange={(e) => updateField(index, { name: e.target.value })}
                />
                <Select
                  value={field.type}
                  onValueChange={(value) => updateField(index, { type: value })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Switch
                  checked={field.required}
                  onCheckedChange={(checked) => updateField(index, { required: checked })}
                />
              </div>

              {(field.type === 'select' || field.type === 'multiselect') && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add option"
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addOption(index)}
                    >
                      Add Option
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {field.options?.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md"
                      >
                        <span>{option}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => removeOption(index, optionIndex)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeField(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 