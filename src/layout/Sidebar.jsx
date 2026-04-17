function Sidebar() {
  return (
    <div className="w-64 h-screen bg-white shadow-md p-5">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

      <ul className="space-y-4">
        <li className="cursor-pointer text-gray-700 hover:text-blue-500">
          Dashboard
        </li>
        <li className="cursor-pointer text-gray-700 hover:text-blue-500">
          Cards
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;s