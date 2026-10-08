export type DataTableConfig = typeof dataTableConfig;

export const dataTableConfig = {
  textOperators: [
    { label: 'table.filterOperators.contains', value: 'iLike' as const },
    { label: 'table.filterOperators.doesNotContain', value: 'notILike' as const },
    { label: 'table.filterOperators.is', value: 'eq' as const },
    { label: 'table.filterOperators.isNot', value: 'ne' as const },
    { label: 'table.filterOperators.isEmpty', value: 'isEmpty' as const },
    { label: 'table.filterOperators.isNotEmpty', value: 'isNotEmpty' as const }
  ],
  numericOperators: [
    { label: 'table.filterOperators.is', value: 'eq' as const },
    { label: 'table.filterOperators.isNot', value: 'ne' as const },
    { label: 'table.filterOperators.isLessThan', value: 'lt' as const },
    { label: 'table.filterOperators.isLessThanOrEqualTo', value: 'lte' as const },
    { label: 'table.filterOperators.isGreaterThan', value: 'gt' as const },
    { label: 'table.filterOperators.isGreaterThanOrEqualTo', value: 'gte' as const },
    { label: 'table.filterOperators.isBetween', value: 'isBetween' as const },
    { label: 'table.filterOperators.isEmpty', value: 'isEmpty' as const },
    { label: 'table.filterOperators.isNotEmpty', value: 'isNotEmpty' as const }
  ],
  dateOperators: [
    { label: 'table.filterOperators.is', value: 'eq' as const },
    { label: 'table.filterOperators.isNot', value: 'ne' as const },
    { label: 'table.filterOperators.isBefore', value: 'lt' as const },
    { label: 'table.filterOperators.isAfter', value: 'gt' as const },
    { label: 'table.filterOperators.isOnOrBefore', value: 'lte' as const },
    { label: 'table.filterOperators.isOnOrAfter', value: 'gte' as const },
    { label: 'table.filterOperators.isBetween', value: 'isBetween' as const },
    { label: 'table.filterOperators.isRelativeToToday', value: 'isRelativeToToday' as const },
    { label: 'table.filterOperators.isEmpty', value: 'isEmpty' as const },
    { label: 'table.filterOperators.isNotEmpty', value: 'isNotEmpty' as const }
  ],
  selectOperators: [
    { label: 'table.filterOperators.is', value: 'eq' as const },
    { label: 'table.filterOperators.isNot', value: 'ne' as const },
    { label: 'table.filterOperators.isEmpty', value: 'isEmpty' as const },
    { label: 'table.filterOperators.isNotEmpty', value: 'isNotEmpty' as const }
  ],
  multiSelectOperators: [
    { label: 'table.filterOperators.hasAnyOf', value: 'inArray' as const },
    { label: 'table.filterOperators.hasNoneOf', value: 'notInArray' as const },
    { label: 'table.filterOperators.isEmpty', value: 'isEmpty' as const },
    { label: 'table.filterOperators.isNotEmpty', value: 'isNotEmpty' as const }
  ],
  booleanOperators: [
    { label: 'table.filterOperators.is', value: 'eq' as const },
    { label: 'table.filterOperators.isNot', value: 'ne' as const }
  ],
  sortOrders: [
    { label: 'table.filterOperators.asc', value: 'asc' as const },
    { label: 'table.filterOperators.desc', value: 'desc' as const }
  ],
  filterVariants: [
    'text',
    'number',
    'range',
    'date',
    'dateRange',
    'boolean',
    'select',
    'multiSelect'
  ] as const,
  operators: [
    'iLike',
    'notILike',
    'eq',
    'ne',
    'inArray',
    'notInArray',
    'isEmpty',
    'isNotEmpty',
    'lt',
    'lte',
    'gt',
    'gte',
    'isBetween',
    'isRelativeToToday'
  ] as const,
  joinOperators: ['and', 'or'] as const
};
