import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, X, Trash2, Edit2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, startOfWeek, endOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { isHoliday } from '../utils/holidays';

interface DailyReport {
  id: string;
  date: string;
  siteWork: string[];
  delivery: string[];
  meeting: string[];
  production: string[];
  estimate: string[];
  tomorrowPlan: string[];
  futurePlan: string[];
  todayComment: string;
}

const DailyReports: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [editReport, setEditReport] = useState<DailyReport | null>(null);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [newReport, setNewReport] = useState<DailyReport>({
    id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    siteWork: [''],
    delivery: [''],
    meeting: [''],
    production: [''],
    estimate: [''],
    tomorrowPlan: [''],
    futurePlan: [''],
    todayComment: ''
  });

  useEffect(() => {
    const fetchReports = async () => {
      if (!currentUser) return;

      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
      } else if (data) {
        const formattedReports = data.map((report: any) => ({
          id: report.id,
          date: report.date,
          siteWork: Array.isArray(report.site_work) ? report.site_work : [],
          delivery: Array.isArray(report.delivery) ? report.delivery : [],
          meeting: Array.isArray(report.meeting) ? report.meeting : [],
          production: Array.isArray(report.production) ? report.production : [],
          estimate: Array.isArray(report.estimate) ? report.estimate : [],
          tomorrowPlan: Array.isArray(report.tomorrow_plan) ? report.tomorrow_plan : [],
          futurePlan: Array.isArray(report.future_plan) ? report.future_plan : [],
          todayComment: report.today_comment || '',
        }));
        setReports(formattedReports);
      }
    };

    fetchReports();
  }, [currentUser]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleAddField = (fieldName: keyof Pick<DailyReport, 'siteWork' | 'delivery' | 'meeting' | 'production' | 'estimate' | 'tomorrowPlan' | 'futurePlan'>) => {
    setNewReport(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], '']
    }));
  };

  const handleRemoveField = (fieldName: keyof Pick<DailyReport, 'siteWork' | 'delivery' | 'meeting' | 'production' | 'estimate' | 'tomorrowPlan' | 'futurePlan'>, index: number) => {
    setNewReport(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  const handleFieldChange = (fieldName: keyof Pick<DailyReport, 'siteWork' | 'delivery' | 'meeting' | 'production' | 'estimate' | 'tomorrowPlan' | 'futurePlan'>, index: number, value: string) => {
    setNewReport(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((item, i) => i === index ? value : item)
    }));
  };

  const handleEditAddField = (fieldName: keyof Pick<DailyReport, 'siteWork' | 'delivery' | 'meeting' | 'production' | 'estimate' | 'tomorrowPlan' | 'futurePlan'>) => {
    if (!editReport) return;
    setEditReport(prev => prev ? ({
      ...prev,
      [fieldName]: [...prev[fieldName], '']
    }) : null);
  };

  const handleEditRemoveField = (fieldName: keyof Pick<DailyReport, 'siteWork' | 'delivery' | 'meeting' | 'production' | 'estimate' | 'tomorrowPlan' | 'futurePlan'>, index: number) => {
    if (!editReport) return;
    setEditReport(prev => prev ? ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }) : null);
  };

  const handleEditFieldChange = (fieldName: keyof Pick<DailyReport, 'siteWork' | 'delivery' | 'meeting' | 'production' | 'estimate' | 'tomorrowPlan' | 'futurePlan'>, index: number, value: string) => {
    if (!editReport) return;
    setEditReport(prev => prev ? ({
      ...prev,
      [fieldName]: prev[fieldName].map((item, i) => i === index ? value : item)
    }) : null);
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    try {
      const filterEmpty = (arr: string[]) => arr.filter(item => item.trim() !== '');

      const { data, error } = await supabase
        .from('daily_reports')
        .insert({
          user_id: currentUser.id,
          date: newReport.date,
          site_work: filterEmpty(newReport.siteWork),
          delivery: filterEmpty(newReport.delivery),
          meeting: filterEmpty(newReport.meeting),
          production: filterEmpty(newReport.production),
          estimate: filterEmpty(newReport.estimate),
          tomorrow_plan: filterEmpty(newReport.tomorrowPlan),
          future_plan: filterEmpty(newReport.futurePlan),
          today_comment: newReport.todayComment,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating report:', error);
        return;
      }

      if (data) {
        const formattedReport: DailyReport = {
          id: data.id,
          date: data.date,
          siteWork: Array.isArray(data.site_work) ? data.site_work : [],
          delivery: Array.isArray(data.delivery) ? data.delivery : [],
          meeting: Array.isArray(data.meeting) ? data.meeting : [],
          production: Array.isArray(data.production) ? data.production : [],
          estimate: Array.isArray(data.estimate) ? data.estimate : [],
          tomorrowPlan: Array.isArray(data.tomorrow_plan) ? data.tomorrow_plan : [],
          futurePlan: Array.isArray(data.future_plan) ? data.future_plan : [],
          todayComment: data.today_comment || '',
        };
        setReports(prev => [formattedReport, ...prev]);
      }

      setShowCreateModal(false);
      setNewReport({
        id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        siteWork: [''],
        delivery: [''],
        meeting: [''],
        production: [''],
        estimate: [''],
        tomorrowPlan: [''],
        futurePlan: [''],
        todayComment: ''
      });
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const handleUpdateReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !editReport) return;

    try {
      const filterEmpty = (arr: string[]) => arr.filter(item => item.trim() !== '');

      const { data, error } = await supabase
        .from('daily_reports')
        .update({
          date: editReport.date,
          site_work: filterEmpty(editReport.siteWork),
          delivery: filterEmpty(editReport.delivery),
          meeting: filterEmpty(editReport.meeting),
          production: filterEmpty(editReport.production),
          estimate: filterEmpty(editReport.estimate),
          tomorrow_plan: filterEmpty(editReport.tomorrowPlan),
          future_plan: filterEmpty(editReport.futurePlan),
          today_comment: editReport.todayComment,
        })
        .eq('id', editReport.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating report:', error);
        return;
      }

      if (data) {
        const formattedReport: DailyReport = {
          id: data.id,
          date: data.date,
          siteWork: Array.isArray(data.site_work) ? data.site_work : [],
          delivery: Array.isArray(data.delivery) ? data.delivery : [],
          meeting: Array.isArray(data.meeting) ? data.meeting : [],
          production: Array.isArray(data.production) ? data.production : [],
          estimate: Array.isArray(data.estimate) ? data.estimate : [],
          tomorrowPlan: Array.isArray(data.tomorrow_plan) ? data.tomorrow_plan : [],
          futurePlan: Array.isArray(data.future_plan) ? data.future_plan : [],
          todayComment: data.today_comment || '',
        };
        setReports(prev => prev.map(r => r.id === formattedReport.id ? formattedReport : r));
        setSelectedReport(formattedReport);
      }

      setIsEditMode(false);
      setEditReport(null);
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const handleDeleteReport = async () => {
    if (!selectedReport || !currentUser) return;

    if (!window.confirm('この日報を削除してもよろしいですか?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('daily_reports')
        .delete()
        .eq('id', selectedReport.id);

      if (error) {
        console.error('Error deleting report:', error);
        return;
      }

      setReports(prev => prev.filter(r => r.id !== selectedReport.id));
      setShowDetailModal(false);
      setSelectedReport(null);
      setIsEditMode(false);
      setEditReport(null);
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const handleEditClick = () => {
    if (selectedReport) {
      setEditReport({...selectedReport});
      setIsEditMode(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditReport(null);
  };

  const renderDynamicFields = (
    label: string,
    fieldName: keyof Pick<DailyReport, 'siteWork' | 'delivery' | 'meeting' | 'production' | 'estimate' | 'tomorrowPlan' | 'futurePlan'>
  ) => {
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <button
            type="button"
            onClick={() => handleAddField(fieldName)}
            className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
          >
            <Plus className="h-3 w-3 mr-1" />
            追加
          </button>
        </div>
        <div className="space-y-2">
          {newReport[fieldName].map((value, index) => (
            <div key={index} className="flex gap-2">
              <textarea
                value={value}
                onChange={(e) => handleFieldChange(fieldName, index, e.target.value)}
                rows={2}
                className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-gray-100"
              />
              {newReport[fieldName].length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveField(fieldName, index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEditDynamicFields = (
    label: string,
    fieldName: keyof Pick<DailyReport, 'siteWork' | 'delivery' | 'meeting' | 'production' | 'estimate' | 'tomorrowPlan' | 'futurePlan'>
  ) => {
    if (!editReport) return null;
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <button
            type="button"
            onClick={() => handleEditAddField(fieldName)}
            className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
          >
            <Plus className="h-3 w-3 mr-1" />
            追加
          </button>
        </div>
        <div className="space-y-2">
          {editReport[fieldName].map((value, index) => (
            <div key={index} className="flex gap-2">
              <textarea
                value={value}
                onChange={(e) => handleEditFieldChange(fieldName, index, e.target.value)}
                rows={2}
                className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-gray-100"
              />
              {editReport[fieldName].length > 1 && (
                <button
                  type="button"
                  onClick={() => handleEditRemoveField(fieldName, index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">日報</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          日報を作成
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            {format(currentDate, 'yyyy年 M月', { locale: ja })}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['月', '火', '水', '木', '金', '土', '日'].map((day, idx) => (
            <div key={day} className={`bg-gray-50 py-2 text-center text-sm font-medium ${
              idx === 6 ? 'text-red-600' : idx === 5 ? 'text-blue-600' : 'text-gray-500'
            }`}>
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map(day => {
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);
            const holidayInfo = isHoliday(day);
            const dayReports = reports.filter(report =>
              isSameDay(new Date(report.date), day)
            );

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[100px] bg-white p-2 ${
                  !isCurrentMonth ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center gap-1">
                  <p className={`text-sm ${
                    isToday
                      ? 'bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                      : isCurrentMonth
                      ? holidayInfo.isHoliday ? 'text-red-600 font-medium' : 'text-gray-900'
                      : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </p>
                  {holidayInfo.isHoliday && isCurrentMonth && (
                    <p className="text-[10px] text-red-600 leading-tight">{holidayInfo.name}</p>
                  )}
                </div>

                {dayReports.map(report => (
                  <div
                    key={report.id}
                    onClick={() => {
                      setSelectedReport(report);
                      setShowDetailModal(true);
                    }}
                    className="mt-1 p-1 bg-primary-50 text-primary-700 text-xs rounded cursor-pointer hover:bg-primary-100"
                  >
                    <div className="font-medium truncate">{report.todayComment || '日報'}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditMode ? '日報編集' : '日報詳細'} - {format(new Date(isEditMode ? editReport?.date || selectedReport.date : selectedReport.date), 'yyyy年M月d日', { locale: ja })}
              </h2>
              <div className="flex items-center space-x-2">
                {!isEditMode && (
                  <>
                    <button
                      onClick={handleEditClick}
                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full"
                      title="編集"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleDeleteReport}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-full"
                      title="削除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedReport(null);
                    setIsEditMode(false);
                    setEditReport(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {isEditMode && editReport ? (
              <form onSubmit={handleUpdateReport} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      日付
                    </label>
                    <input
                      type="date"
                      value={editReport.date}
                      onChange={(e) => setEditReport(prev => prev ? ({ ...prev, date: e.target.value }) : null)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      required
                    />
                  </div>

                  {renderEditDynamicFields('今日の現場', 'siteWork')}
                  {renderEditDynamicFields('今日の納品', 'delivery')}
                  {renderEditDynamicFields('今日の打ち合わせ', 'meeting')}
                  {renderEditDynamicFields('今日の制作作業', 'production')}
                  {renderEditDynamicFields('今日の見積書', 'estimate')}
                  {renderEditDynamicFields('明日の予定', 'tomorrowPlan')}
                  {renderEditDynamicFields('先の予定', 'futurePlan')}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      今日の一言
                    </label>
                    <textarea
                      value={editReport.todayComment}
                      onChange={(e) => setEditReport(prev => prev ? ({ ...prev, todayComment: e.target.value }) : null)}
                      rows={2}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-gray-100"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                  >
                    更新
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {selectedReport.siteWork.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">今日の現場</h3>
                    <ul className="space-y-2">
                      {selectedReport.siteWork.map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 pl-4 border-l-2 border-primary-500">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedReport.delivery.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">今日の納品</h3>
                    <ul className="space-y-2">
                      {selectedReport.delivery.map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 pl-4 border-l-2 border-primary-500">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedReport.meeting.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">今日の打ち合わせ</h3>
                    <ul className="space-y-2">
                      {selectedReport.meeting.map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 pl-4 border-l-2 border-primary-500">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedReport.production.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">今日の制作作業</h3>
                    <ul className="space-y-2">
                      {selectedReport.production.map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 pl-4 border-l-2 border-primary-500">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedReport.estimate.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">今日の見積書</h3>
                    <ul className="space-y-2">
                      {selectedReport.estimate.map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 pl-4 border-l-2 border-primary-500">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedReport.tomorrowPlan.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">明日の予定</h3>
                    <ul className="space-y-2">
                      {selectedReport.tomorrowPlan.map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 pl-4 border-l-2 border-primary-500">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedReport.futurePlan.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">先の予定</h3>
                    <ul className="space-y-2">
                      {selectedReport.futurePlan.map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 pl-4 border-l-2 border-primary-500">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedReport.todayComment && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">今日の一言</h3>
                    <p className="text-sm text-gray-700 pl-4 border-l-2 border-primary-500">
                      {selectedReport.todayComment}
                    </p>
                  </div>
                )}
              </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">日報を作成</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    日付
                  </label>
                  <input
                    type="date"
                    value={newReport.date}
                    onChange={(e) => setNewReport(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required
                  />
                </div>

                {renderDynamicFields('今日の現場', 'siteWork')}
                {renderDynamicFields('今日の納品', 'delivery')}
                {renderDynamicFields('今日の打ち合わせ', 'meeting')}
                {renderDynamicFields('今日の制作作業', 'production')}
                {renderDynamicFields('今日の見積書', 'estimate')}
                {renderDynamicFields('明日の予定', 'tomorrowPlan')}
                {renderDynamicFields('先の予定', 'futurePlan')}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    今日の一言
                  </label>
                  <textarea
                    value={newReport.todayComment}
                    onChange={(e) => setNewReport(prev => ({ ...prev, todayComment: e.target.value }))}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-gray-100"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                >
                  作成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyReports;
