import React from 'react';

interface StockItem {
  name: string;
  status: string;
  priority: 'high' | 'medium' | 'low';
}

interface StockStatusWidgetProps {
  data: StockItem[];
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 border-red-300';
    case 'medium': return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'low': return 'bg-green-100 text-green-800 border-green-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const StockStatusWidget: React.FC<StockStatusWidgetProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold flex items-center mb-4">
        <span className="h-6 w-6 mr-2 inline-block bg-blue-600 rounded-full" />
        Statut du stock
      </h2>
      <div className="flex flex-col md:flex-row gap-4">
        {data.map((item, i) => (
          <div key={i} className={`flex-1 border rounded-lg p-4 flex flex-col items-center ${getPriorityColor(item.priority)}`}>
            <div className="text-lg font-bold">{item.name}</div>
            <div className="text-sm text-gray-500 mb-2">{item.status}</div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>{item.priority}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockStatusWidget; 