"use client"

import { AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "state",
    header: "State",
  },
]

type LocationFilterProps = {
  locations: { location: string; state: string }[]
  onFilterChange: (selectedLocations: string[]) => void
}

export function LocationFilter({ locations, onFilterChange }: LocationFilterProps) {
  const [open, setOpen] = useState(false)
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const uniqueStates = [...new Set(locations.map((item) => item.state))]

  const filteredLocations = locations.filter((location) =>
    location.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleLocationToggle = (location: string) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter((l) => l !== location))
    } else {
      setSelectedLocations([...selectedLocations, location])
    }
  }

  const handleApplyFilters = () => {
    onFilterChange(selectedLocations)
    setOpen(false)
  }

  const handleClearFilters = () => {
    setSelectedLocations([])
    onFilterChange([])
    setOpen(false)
  }

  const isLocationSelected = (location: string) => selectedLocations.includes(location)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Filter Locations</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[60vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Locations</DialogTitle>
          <DialogDescription>Select locations to filter</DialogDescription>
        </DialogHeader>

        <div className="p-2">
          <Label htmlFor="search">Search Locations</Label>
          <Input
            type="search"
            id="search"
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1"
          />
        </div>

        <Separator />

        <div className="p-2">
          <Label>States</Label>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1 p-2">
            {uniqueStates.map((state) => (
              <Button
                key={state}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm px-1 sm:px-2"
                onClick={() => {
                  const locationsInState = locations.filter((l) => l.state === state).map((l) => l.location)
                  const allSelected = locationsInState.every((location) => selectedLocations.includes(location))

                  if (allSelected) {
                    setSelectedLocations(selectedLocations.filter((location) => !locationsInState.includes(location)))
                  } else {
                    const newSelection = [
                      ...selectedLocations,
                      ...locationsInState.filter((location) => !selectedLocations.includes(location)),
                    ]
                    setSelectedLocations(newSelection)
                  }
                }}
              >
                {state}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="p-2">
          <Label>Locations</Label>
          <ScrollArea className="h-[150px] w-full rounded-md border">
            {filteredLocations.map((location) => (
              <div key={location.location} className="flex items-center space-x-2 p-2">
                <Checkbox
                  id={location.location}
                  checked={isLocationSelected(location.location)}
                  onCheckedChange={() => handleLocationToggle(location.location)}
                />
                <Label htmlFor={location.location}>{location.location}</Label>
              </div>
            ))}
          </ScrollArea>
        </div>

        <AlertDialogFooter className="pt-2 pb-1 space-x-2">
          <AlertDialogCancel onClick={handleClearFilters} className="h-8 px-3">
            Clear Filters
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleApplyFilters} className="h-8 px-3">
            Apply Filters
          </AlertDialogAction>
        </AlertDialogFooter>
      </DialogContent>
    </Dialog>
  )
}
