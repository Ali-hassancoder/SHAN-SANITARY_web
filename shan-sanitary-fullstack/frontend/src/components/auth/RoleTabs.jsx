import { motion } from "framer-motion";

// Pure UI component — no auth logic here. Login.jsx/Signup.jsx own the
// selected role in their own state and pass it down, exactly like
// StudentForm.jsx in your last project only collected data and handed
// it up to its parent.
const RoleTabs = ({ selectedRole, onSelect }) => {
  const tabs = [
    { value: "customer", label: "Customer" },
    { value: "admin", label: "Admin" },
  ];

  return (
    <div className="relative flex bg-carbon/5 rounded-full p-1 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onSelect(tab.value)}
          className={`relative flex-1 py-2 text-sm font-medium rounded-full z-10 transition-colors ${
            selectedRole === tab.value ? "text-white" : "text-carbon/70"
          }`}
        >
          {tab.label}
        </button>
      ))}
      <motion.div
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-wine rounded-full"
        animate={{ x: selectedRole === "admin" ? "100%" : "0%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    </div>
  );
};

export default RoleTabs;