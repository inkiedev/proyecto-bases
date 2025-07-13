import React from 'react';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';

interface FilterField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'date';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface SearchFilterProps {
  fields: FilterField[];
  filters: Record<string, string>;
  onFilterChange: (filters: { [p: string]: string }) => void;
  onReset: () => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
                                                            fields,
                                                            filters,
                                                            onFilterChange,
                                                            onReset,
                                                          }) => {
  const handleInputChange = (name: string, value: string) => {
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {fields.map((field) => (
          <div key={field.name}>
            {field.type === 'select' ? (
              <Select
                label={field.label}
                value={filters[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                options={field.options || []}
                placeholder={field.placeholder}
              />
            ) : (
              <Input
                label={field.label}
                type={field.type}
                value={filters[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="secondary" onClick={onReset}>
          Limpiar Filtros
        </Button>
      </div>
    </div>
  );
};
