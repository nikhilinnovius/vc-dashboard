import { getRaisePredictionColor, getRaisePredictionTooltip } from "@/utils/startup-utils"

interface RaisePredictionIndicatorProps {
  raisePredictor?: string
}

export function RaisePredictionIndicator({ raisePredictor }: RaisePredictionIndicatorProps) {
  return (
    <div className="relative group flex items-center">
      <div
        className={`h-4 w-4 rounded-full inline-block ${getRaisePredictionColor(raisePredictor)}`}
        aria-label="Raise Prediction Indicator"
      />
      <div className="absolute z-50 invisible group-hover:visible bg-black text-white text-xs rounded py-1 px-2 -left-1/2 -translate-x-1/2 bottom-full mb-1 whitespace-nowrap">
        {getRaisePredictionTooltip(raisePredictor)}
      </div>
    </div>
  )
}
