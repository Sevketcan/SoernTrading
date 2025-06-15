'use client';

import { useState, useMemo } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LabelBadge } from './LabelBadge';
import type { Label } from '@/lib/hooks';

interface LabelFilterProps {
    labels: Label[];
    selectedLabels: string[];
    onLabelsChange: (labels: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function LabelFilter({
    labels,
    selectedLabels,
    onLabelsChange,
    placeholder = 'Filter by labels...',
    className,
}: LabelFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter labels based on search query
    const filteredLabels = useMemo(() => {
        if (!searchQuery) return labels;
        return labels.filter(label =>
            label.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [labels, searchQuery]);

    const handleLabelToggle = (labelName: string) => {
        const isSelected = selectedLabels.includes(labelName);
        if (isSelected) {
            onLabelsChange(selectedLabels.filter(l => l !== labelName));
        } else {
            onLabelsChange([...selectedLabels, labelName]);
        }
    };

    const handleRemoveLabel = (labelName: string) => {
        onLabelsChange(selectedLabels.filter(l => l !== labelName));
    };

    const clearAllLabels = () => {
        onLabelsChange([]);
    };

    const getSelectedLabelObjects = () => {
        return labels.filter(label => selectedLabels.includes(label.name));
    };

    return (
        <div className={cn('relative', className)}>
            {/* Selected labels display */}
            {selectedLabels.length > 0 && (
                <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-700">Active filters:</span>
                        <button
                            onClick={clearAllLabels}
                            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        >
                            <X className="h-3 w-3" />
                            Clear all
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {getSelectedLabelObjects().map((label) => (
                            <LabelBadge
                                key={label.id}
                                label={label.name}
                                color={label.color}
                                size="sm"
                                removable
                                onRemove={() => handleRemoveLabel(label.name)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Dropdown trigger */}
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-left hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <span className="text-gray-600">
                        {selectedLabels.length > 0
                            ? `${selectedLabels.length} label${selectedLabels.length > 1 ? 's' : ''} selected`
                            : placeholder
                        }
                    </span>
                    <ChevronDown
                        className={cn(
                            'h-4 w-4 text-gray-400 transition-transform',
                            isOpen && 'rotate-180'
                        )}
                    />
                </button>

                {/* Dropdown menu */}
                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-hidden">
                        {/* Search input */}
                        <div className="p-2 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search labels..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Labels list */}
                        <div className="max-h-48 overflow-y-auto">
                            {filteredLabels.length === 0 ? (
                                <div className="p-3 text-sm text-gray-500 text-center">
                                    {searchQuery ? 'No labels found' : 'No labels available'}
                                </div>
                            ) : (
                                <div className="py-1">
                                    {filteredLabels.map((label) => {
                                        const isSelected = selectedLabels.includes(label.name);
                                        return (
                                            <button
                                                key={label.id}
                                                onClick={() => handleLabelToggle(label.name)}
                                                className={cn(
                                                    'w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors',
                                                    isSelected && 'bg-blue-50'
                                                )}
                                            >
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <div
                                                        className="h-3 w-3 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: label.color }}
                                                    />
                                                    <span className="truncate">{label.name}</span>
                                                </div>
                                                {isSelected && (
                                                    <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
} 