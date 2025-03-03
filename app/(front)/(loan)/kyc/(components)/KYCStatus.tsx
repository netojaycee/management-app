export default function KYCStatus({
  status,
  message,
}: {
  status: string;
  message: string;
}) {
  return (
    <div
      className={`p-4 rounded-lg shadow-md ${
        status === "VERIFIED"
          ? "bg-green-100 text-green-600"
          : "bg-red-100 text-red-600"
      }`}
    >
      <h2 className='text-xl font-semibold'>
        {status === "VERIFIED" ? "✅ Verified" : "❌ Rejected"}
      </h2>
      <p>{message}</p>
    </div>
  );
}
