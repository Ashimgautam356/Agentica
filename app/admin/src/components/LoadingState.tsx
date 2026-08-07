export function LoadingState({ message }: { message: string }) {
  return (
    <div
      aria-live="polite"
      className="fixed inset-0 z-50 grid place-items-center bg-[#FBF8F2]/55 p-6 backdrop-blur-sm"
      role="status"
    >
      <div className="grid min-w-60 place-items-center gap-4 rounded-lg border border-[#EFE7D8] bg-white/90 p-6 text-center shadow-[0_18px_60px_rgba(36,31,20,0.14)]">
        <span className="size-11 animate-spin rounded-full border-4 border-[#DDEFE1] border-t-[#34A85B]" />
        <div className="grid gap-1">
          <strong className="text-base font-extrabold text-[#241F14]">{message}</strong>
          <span className="text-sm font-semibold text-[#8A8172]">Please wait.</span>
        </div>
      </div>
    </div>
  );
}
