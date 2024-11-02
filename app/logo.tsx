export default function Logo() {
  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tree trunk */}
      <line
        x1="150"
        y1="300"
        x2="150"
        y2="220"
        stroke="#4B5563"
        strokeWidth="8"
      />
      {/* Main branches */}
      <line
        x1="150"
        y1="220"
        x2="75"
        y2="170"
        stroke="#4B5563"
        strokeWidth="6"
      />
      <line
        x1="150"
        y1="220"
        x2="150"
        y2="140"
        stroke="#4B5563"
        strokeWidth="6"
      />
      <line
        x1="150"
        y1="220"
        x2="225"
        y2="170"
        stroke="#4B5563"
        strokeWidth="6"
      />
      {/* Sub-branches level 1 */}
      <line
        x1="75"
        y1="170"
        x2="40"
        y2="130"
        stroke="#4B5563"
        strokeWidth="4"
      />
      <line
        x1="75"
        y1="170"
        x2="75"
        y2="120"
        stroke="#4B5563"
        strokeWidth="4"
      />
      <line
        x1="75"
        y1="170"
        x2="110"
        y2="130"
        stroke="#4B5563"
        strokeWidth="4"
      />
      <line
        x1="150"
        y1="140"
        x2="120"
        y2="100"
        stroke="#4B5563"
        strokeWidth="4"
      />
      <line
        x1="150"
        y1="140"
        x2="150"
        y2="80"
        stroke="#4B5563"
        strokeWidth="4"
      />
      <line
        x1="150"
        y1="140"
        x2="180"
        y2="100"
        stroke="#4B5563"
        strokeWidth="4"
      />
      <line
        x1="225"
        y1="170"
        x2="190"
        y2="130"
        stroke="#4B5563"
        strokeWidth="4"
      />
      <line
        x1="225"
        y1="170"
        x2="225"
        y2="120"
        stroke="#4B5563"
        strokeWidth="4"
      />
      <line
        x1="225"
        y1="170"
        x2="260"
        y2="130"
        stroke="#4B5563"
        strokeWidth="4"
      />
      {/* Sub-branches level 2 (uneven) */}
      <line
        x1="40"
        y1="130"
        x2="20"
        y2="100"
        stroke="#4B5563"
        strokeWidth="3"
      />
      <line x1="40" y1="130" x2="50" y2="90" stroke="#4B5563" strokeWidth="3" />
      <line
        x1="110"
        y1="130"
        x2="95"
        y2="95"
        stroke="#4B5563"
        strokeWidth="3"
      />
      <line
        x1="110"
        y1="130"
        x2="125"
        y2="100"
        stroke="#4B5563"
        strokeWidth="3"
      />
      <line
        x1="180"
        y1="100"
        x2="170"
        y2="70"
        stroke="#4B5563"
        strokeWidth="3"
      />
      <line
        x1="180"
        y1="100"
        x2="200"
        y2="80"
        stroke="#4B5563"
        strokeWidth="3"
      />
      <line
        x1="260"
        y1="130"
        x2="250"
        y2="95"
        stroke="#4B5563"
        strokeWidth="3"
      />
      <line
        x1="260"
        y1="130"
        x2="280"
        y2="100"
        stroke="#4B5563"
        strokeWidth="3"
      />
      {/* Leaf nodes */}
      <circle cx="20" cy="100" r="10" fill="#06B6D4" /> {/* Cyan */}
      <circle cx="50" cy="90" r="10" fill="#8B5CF6" /> {/* Purple */}
      <circle cx="75" cy="120" r="10" fill="#F59E0B" /> {/* Amber */}
      <circle cx="95" cy="95" r="10" fill="#10B981" /> {/* Emerald */}
      <circle cx="125" cy="100" r="10" fill="#EC4899" /> {/* Pink */}
      <circle cx="120" cy="100" r="10" fill="#3B82F6" /> {/* Blue */}
      <circle cx="150" cy="80" r="10" fill="#F97316" /> {/* Orange */}
      <circle cx="170" cy="70" r="10" fill="#14B8A6" /> {/* Teal */}
      <circle cx="200" cy="80" r="10" fill="#6366F1" /> {/* Indigo */}
      <circle cx="225" cy="120" r="10" fill="#EF4444" /> {/* Red */}
      <circle cx="250" cy="95" r="10" fill="#84CC16" /> {/* Lime */}
      <circle cx="280" cy="100" r="10" fill="#7C3AED" /> {/* Violet */}
      {/* Intersection nodes */}
      <circle cx="150" cy="220" r="8" fill="#0EA5E9" /> {/* Sky */}
      <circle cx="75" cy="170" r="6" fill="#22C55E" /> {/* Green */}
      <circle cx="150" cy="140" r="6" fill="#F43F5E" /> {/* Rose */}
      <circle cx="225" cy="170" r="6" fill="#FBBF24" /> {/* Yellow */}
      <circle cx="40" cy="130" r="5" fill="#8B5CF6" /> {/* Purple */}
      <circle cx="110" cy="130" r="5" fill="#EC4899" /> {/* Pink */}
      <circle cx="190" cy="130" r="5" fill="#06B6D4" /> {/* Cyan */}
      <circle cx="260" cy="130" r="5" fill="#F97316" /> {/* Orange */}
      <circle cx="120" cy="100" r="4" fill="#14B8A6" /> {/* Teal */}
      <circle cx="180" cy="100" r="4" fill="#6366F1" /> {/* Indigo */}
    </svg>
  );
}
