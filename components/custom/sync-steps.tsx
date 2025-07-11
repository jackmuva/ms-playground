import { SyncStep } from "./sync-status-panel"

export const SyncSteps = ({
  steps,
}: {
  steps: Array<SyncStep>,
}) => {
  return (
    <>
      {steps.map((step, index) => {
        return (
          <div key={index}>
            <div className="flex items-center space-x-2">
              {step.status === "completed" ? (
                <div className="rounded-full h-[15px] w-[15px] bg-green-500" />) :
                (step.status === "in-progress" ? (
                  <div className="rounded-full h-[15px] w-[15px] bg-indigo-600 animate-pulse" />
                ) : (
                  <div className="rounded-full h-[15px] w-[15px] border border-muted-foreground" />
                ))}
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
            {(index < (steps.length - 1)) &&
              <div className="border-l border-muted-foreground h-4 ml-[6.5px]" />}
          </div>
        )
      })}
    </>
  )
}
