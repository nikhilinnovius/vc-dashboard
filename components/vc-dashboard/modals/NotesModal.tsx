import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AffinityNotes } from "@/components/affinity-notes"

interface NotesModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedVC: string
  vcWebsite?: string
}

export const NotesModal: React.FC<NotesModalProps> = ({
  isOpen,
  onOpenChange,
  selectedVC,
  vcWebsite = "",
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col bg-[#0f172a] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">{selectedVC} - Notes</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <AffinityNotes domain={vcWebsite} name={selectedVC} />
        </div>
      </DialogContent>
    </Dialog>
  )
}