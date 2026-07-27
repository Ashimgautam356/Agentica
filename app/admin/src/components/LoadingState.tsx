export function LoadingState({ message }: { message: string }) {
  return (
    <div className="grid min-h-[70vh] place-items-center rounded-lg border border-slate-200 bg-white p-6">
      <div className="grid gap-2 text-center">
        <strong className="text-lg">{message}</strong>
        <span className="text-slate-500">Please wait.</span>
      </div>
    </div>
  );
}
