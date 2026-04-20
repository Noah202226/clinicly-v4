function StatusBadge({ status }: { status: string }) {
  const s = (status ?? "").toLowerCase();
  const className =
    s === "approved"
      ? "bg-green-100 text-green-700"
      : s === "pending"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${className}`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
