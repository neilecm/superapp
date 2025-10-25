export function HomeScreen({
  email,
  onClose,
}: {
  email?: string;
  onClose: () => void;
}) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Welcome{email ? `, ${email}` : ""} 👋
        </h2>
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-gray-700">
        <p>You’re signed in. This is your plug-and-play Home/Dashboard screen.</p>
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="font-medium mb-1">Next actions</div>
          <ul className="list-disc ml-5 space-y-1">
            <li>Show recommended products / catalog</li>
            <li>Display recent orders</li>
            <li>Link to shipping addresses & payment methods</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button className="rounded-2xl bg-black text-white px-3 py-2">
          Start shopping
        </button>
        <button className="rounded-2xl bg-gray-200 px-3 py-2">View orders</button>
      </div>
    </div>
  );
}
