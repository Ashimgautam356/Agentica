export function Badge({ value }: { value: string }) {
  const tone = getTone(value);

  return (
    <span
      className={`inline-flex min-h-7 items-center whitespace-nowrap rounded-full px-2.5 text-xs font-extrabold ${tone}`}
    >
      {value}
    </span>
  );
}

function getTone(value: string) {
  if (["Active", "Approved", "Paid", "Enabled", "Delivered", "Info"].includes(value)) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (["Low stock", "Pending", "Processing", "Warning"].includes(value)) {
    return "bg-amber-50 text-amber-700";
  }

  if (
    ["Out of stock", "Reported", "Suspended", "Disabled", "Cancelled", "Watchlist"].includes(value)
  ) {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}
