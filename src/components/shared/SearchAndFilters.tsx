
import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"

interface SearchAndFiltersProps {
  onSearchChange: (search: string) => void
  onFilterChange: (filters: Record<string, string>) => void
  filterOptions?: {
    key: string
    label: string
    options: { value: string; label: string }[]
  }[]
  placeholder?: string
}

export function SearchAndFilters({
  onSearchChange,
  onFilterChange,
  filterOptions = [],
  placeholder = "Search..."
}: SearchAndFiltersProps) {
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [showFilters, setShowFilters] = useState(false)

  // Debounce search to improve performance
  const debouncedSearch = useDebounce(search, 300)

  // Memoize filter options to prevent unnecessary re-renders
  const memoizedFilterOptions = useMemo(() => filterOptions, [filterOptions])

  // Effect to handle debounced search
  useEffect(() => {
    onSearchChange(debouncedSearch)
  }, [debouncedSearch, onSearchChange])

  const handleSearchChange = (value: string) => {
    setSearch(value)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters }
    if (value === "all" || value === "") {
      delete newFilters[key]
    } else {
      newFilters[key] = value
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    setSearch("")
    onSearchChange("")
    onFilterChange({})
  }

  const hasActiveFilters = search || Object.keys(filters).length > 0

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="h-10"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="h-10"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {showFilters && memoizedFilterOptions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
          {memoizedFilterOptions.map(({ key, label, options }) => (
            <div key={key}>
              <label className="text-sm font-medium mb-2 block">{label}</label>
              <Select
                value={filters[key] || "all"}
                onValueChange={(value) => handleFilterChange(key, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {options.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
