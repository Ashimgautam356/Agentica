export function ProfileSkeleton() {
  return (
    <div className="max-w-210 animate-pulse">
      <div className="h-9 w-36 rounded-md bg-[#eef4f1]" />
      <div className="mt-2 h-4 w-64 max-w-full rounded-md bg-[#eef4f1]" />

      <section className="mt-9">
        <div className="h-4 w-28 rounded-md bg-[#eef4f1]" />
        <div className="mt-6 flex items-center gap-5">
          <div className="h-20 w-20 rounded-full bg-[#d7f0dd]" />
          <div>
            <div className="h-10 w-32 rounded-md bg-[#e8f8ed]" />
            <div className="mt-2 h-3 w-36 rounded-md bg-[#eef4f1]" />
          </div>
        </div>
      </section>

      <div className="mt-7 grid gap-5 min-[760px]:grid-cols-2">
        {Array.from({ length: 5 }, (_, index) => (
          <div className="grid gap-2" key={index}>
            <div className="h-4 w-24 rounded-md bg-[#eef4f1]" />
            <div className="h-13 rounded-md bg-[#f4f8f6]" />
          </div>
        ))}
      </div>

      <div className="mt-6 h-4 w-80 max-w-full rounded-md bg-[#eef4f1]" />

      <div className="mt-8 flex gap-4">
        <div className="h-12 w-32 rounded-md bg-[#d7f0dd]" />
        <div className="h-12 w-24 rounded-md bg-[#f4f8f6]" />
      </div>
    </div>
  );
}
