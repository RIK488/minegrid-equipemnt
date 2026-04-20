import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

export const PlanningWidget = ({ data }: { data: any }) => {
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'daily' | 'overview'>('daily');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-orange-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500';
      case 'green':
        return 'bg-green-500';
      case 'orange':
        return 'bg-orange-500';
      case 'purple':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const filteredDays = selectedDay === 'all'
    ? data.days
    : data.days.filter((day: any) => day.day === selectedDay);

  const allTasks = data.days?.flatMap((day: any) => day.tasks) || [];
  const completedTasks = allTasks.filter((task: any) => task.status === 'completed').length;
  const inProgressTasks = allTasks.filter((task: any) => task.status === 'in-progress').length;
  const scheduledTasks = allTasks.filter((task: any) => task.status === 'scheduled').length;

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Calendar className="h-6 w-6 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">{data.title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          {data.days && (
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">Tous les jours</option>
              {data.days.map((day: any) => (
                <option key={day.day} value={day.day}>{day.day}</option>
              ))}
            </select>
          )}
          {data.categories && (
            <button
              onClick={() => setViewMode(viewMode === 'daily' ? 'overview' : 'daily')}
              className="text-sm px-2 py-1 rounded bg-orange-100 text-orange-700"
            >
              {viewMode === 'daily' ? 'Vue d\'ensemble' : 'Planning détaillé'}
            </button>
          )}
        </div>
      </div>

      {/* Statistiques rapides */}
      {data.days && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{completedTasks}</div>
            <div className="text-xs text-green-600">Terminées</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{inProgressTasks}</div>
            <div className="text-xs text-blue-600">En cours</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-600">{scheduledTasks}</div>
            <div className="text-xs text-gray-600">Planifiées</div>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">{allTasks.length}</div>
            <div className="text-xs text-orange-600">Total</div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      {viewMode === 'daily' && data.days ? (
        <div className="space-y-4">
          {filteredDays.map((day: any, dayIndex: number) => (
            <div key={dayIndex} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">{day.day}</h4>
              <div className="space-y-2">
                {day.tasks.map((task: any, taskIndex: number) => (
                  <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center flex-1">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} mr-3`} />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{task.title}</div>
                        <div className="text-xs text-gray-600">{task.time} • {task.technician}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}>
                        {task.status === 'completed' ? 'Terminé' :
                         task.status === 'in-progress' ? 'En cours' :
                         task.status === 'scheduled' ? 'Planifié' :
                         task.status === 'delayed' ? 'En retard' : 'Normal'}
                      </div>
                      <button className="text-orange-600 hover:text-orange-700 text-xs">
                        Détails
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : data.categories ? (
        <div className="space-y-4">
          {data.categories.map((category: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${getCategoryColor(category.color)} mr-2`} />
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                </div>
                <div className="text-sm text-gray-600">
                  {category.completed}/{category.total} terminées
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progression</span>
                  <span>{getProgressPercentage(category.completed, category.total).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getCategoryColor(category.color)}`}
                    style={{ width: `${getProgressPercentage(category.completed, category.total)}%` }}
                  />
                </div>
              </div>

              {/* Détails */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-bold text-green-600">{category.completed}</div>
                  <div className="text-green-600">Terminées</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-bold text-blue-600">{category.inProgress}</div>
                  <div className="text-blue-600">En cours</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-bold text-gray-600">{category.scheduled}</div>
                  <div className="text-gray-600">Planifiées</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Aucune donnée de planification</p>
        </div>
      )}
    </div>
  );
};
