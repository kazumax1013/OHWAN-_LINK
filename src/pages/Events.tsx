import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { isHoliday } from '../utils/holidays';
import {
  Calendar as CalendarIcon,
  MapPin,
  Users,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  List,
  X,
  Check,
  Building2,
  Edit2,
  Trash2,
  Save,
  Briefcase,
  User
} from 'lucide-react';

const COLORS = [
  { name: 'デフォルト', bg: 'from-primary-600 to-primary-400', text: 'text-primary-700', light: 'bg-primary-50' },
  { name: 'ブルー', bg: 'from-blue-600 to-blue-400', text: 'text-blue-700', light: 'bg-blue-50' },
  { name: 'グリーン', bg: 'from-green-600 to-green-400', text: 'text-green-700', light: 'bg-green-50' },
  { name: 'レッド', bg: 'from-red-600 to-red-400', text: 'text-red-700', light: 'bg-red-50' },
  { name: 'パープル', bg: 'from-purple-600 to-purple-400', text: 'text-purple-700', light: 'bg-purple-50' },
  { name: 'イエロー', bg: 'from-yellow-600 to-yellow-400', text: 'text-yellow-700', light: 'bg-yellow-50' },
  { name: 'オレンジ', bg: 'from-orange-600 to-orange-400', text: 'text-orange-700', light: 'bg-orange-50' },
];

const getColorForLocation = (location: string) => {
  if (location === 'osaka') {
    return { name: 'オレンジ', bg: 'from-orange-600 to-orange-400', text: 'text-orange-700', light: 'bg-orange-50' };
  } else if (location === 'tokyo') {
    return { name: 'ブルー', bg: 'from-blue-600 to-blue-400', text: 'text-blue-700', light: 'bg-blue-50' };
  }
  return COLORS[0];
};

const LOCATIONS = [
  { id: 'tokyo', name: '東京物件' },
  { id: 'osaka', name: '大阪物件' }
];

const CUSTOMERS = [
  'ディーワークス',
  'ディー・ファクトリー',
  'フジヤ',
  '日邦',
  '昭栄美術',
  'ツーウィークス',
  'ファースト',
  'サクラインターナショナル',
  'アドバンスエイジ'
];

const formatDateForDisplay = (dateString: string) => {
  if (!dateString) return '';
  return dateString.split('T')[0];
};

const Events: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [localEvents, setLocalEvents] = useState<any[]>([]);
  const [locationFilter, setLocationFilter] = useState<'all' | 'tokyo' | 'osaka'>('all');
  const [newEvent, setNewEvent] = useState({
    title: '',
    startDate: '',
    endDate: '',
    location: 'tokyo',
    constructionLocation: '',
    area: '',
    customer: '',
    manager: '',
    color: getColorForLocation('tokyo'),
    notes: ''
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;

      const formattedEvents = data?.map(prop => ({
        id: prop.id,
        title: prop.title,
        client: prop.client,
        startDate: prop.start_date,
        endDate: prop.end_date,
        location: prop.location,
        constructionLocation: prop.construction_location,
        area: prop.area || '',
        customer: prop.customer || '',
        manager: prop.manager || '',
        creatorId: prop.created_by,
        attendees: Array(prop.attendee_count).fill(''),
        color: {
          name: prop.color_name,
          bg: prop.color_bg,
          text: prop.color_text,
          light: prop.color_light
        },
        notes: prop.notes
      })) || [];

      setLocalEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getFilteredEvents = () => {
    if (locationFilter === 'all') {
      return localEvents;
    }
    return localEvents.filter(event => event.location === locationFilter);
  };

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return getFilteredEvents().filter(event => {
      const eventStart = formatDateForDisplay(event.startDate);
      const eventEnd = formatDateForDisplay(event.endDate);
      return dateStr >= eventStart && dateStr <= eventEnd;
    });
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      if (name === 'location') {
        updated.color = getColorForLocation(value);
      }
      if (name === 'startDate' && value && !prev.endDate) {
        updated.endDate = value;
      }
      return updated;
    });
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    if (!newEvent.title || !newEvent.startDate || !newEvent.endDate) {
      alert('物件名、開始日、終了日は必須項目です');
      return;
    }

    if (new Date(newEvent.endDate) < new Date(newEvent.startDate)) {
      alert('終了日は開始日以降に設定してください');
      return;
    }

    try {
      const { error } = await supabase
        .from('properties')
        .insert({
          title: newEvent.title,
          client: '',
          start_date: newEvent.startDate,
          end_date: newEvent.endDate,
          location: newEvent.location,
          construction_location: newEvent.constructionLocation,
          area: newEvent.area,
          customer: newEvent.customer,
          manager: newEvent.manager,
          notes: newEvent.notes,
          color_name: newEvent.color.name,
          color_bg: newEvent.color.bg,
          color_text: newEvent.color.text,
          color_light: newEvent.color.light,
          created_by: currentUser.id,
          attendee_count: 1
        });

      if (error) throw error;

      await fetchProperties();
      setShowCreateModal(false);
      setNewEvent({
        title: '',
        startDate: '',
        endDate: '',
        location: 'tokyo',
        constructionLocation: '',
        area: '',
        customer: '',
        manager: '',
        color: getColorForLocation('tokyo'),
        notes: ''
      });
    } catch (error) {
      console.error('Error creating property:', error);
    }
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
    setIsEditing(false);
    setEditForm({
      title: event.title,
      startDate: formatDateForDisplay(event.startDate),
      endDate: formatDateForDisplay(event.endDate),
      location: event.location,
      constructionLocation: event.constructionLocation,
      area: event.area || '',
      customer: event.customer || '',
      manager: event.manager || '',
      notes: event.notes,
      color: event.color
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => {
      const updated = {
        ...prev,
        [name]: value
      };
      if (name === 'location') {
        updated.color = getColorForLocation(value);
      }
      if (name === 'startDate' && value && !prev.endDate) {
        updated.endDate = value;
      }
      return updated;
    });
  };

  const handleUpdate = async () => {
    if (!selectedEvent || !currentUser) return;

    if (!editForm.title || !editForm.startDate || !editForm.endDate) {
      alert('物件名、開始日、終了日は必須項目です');
      return;
    }

    if (new Date(editForm.endDate) < new Date(editForm.startDate)) {
      alert('終了日は開始日以降に設定してください');
      return;
    }

    try {
      const { error } = await supabase
        .from('properties')
        .update({
          title: editForm.title,
          client: '',
          start_date: editForm.startDate,
          end_date: editForm.endDate,
          location: editForm.location,
          construction_location: editForm.constructionLocation,
          area: editForm.area,
          customer: editForm.customer,
          manager: editForm.manager,
          notes: editForm.notes,
          color_name: editForm.color.name,
          color_bg: editForm.color.bg,
          color_text: editForm.color.text,
          color_light: editForm.color.light
        })
        .eq('id', selectedEvent.id);

      if (error) throw error;

      await fetchProperties();
      setIsEditing(false);
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error updating property:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent || !currentUser) return;

    if (!confirm('この物件を削除してもよろしいですか?')) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', selectedEvent.id);

      if (error) throw error;

      await fetchProperties();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">物件管理</h1>
        <div className="flex space-x-3">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                view === 'calendar'
                  ? 'bg-primary-50 text-primary-700 border-primary-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b -ml-px ${
                view === 'list'
                  ? 'bg-primary-50 text-primary-700 border-primary-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            物件を追加
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">地域:</span>
        <div className="flex rounded-md shadow-sm">
          <button
            onClick={() => setLocationFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
              locationFilter === 'all'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setLocationFilter('tokyo')}
            className={`px-4 py-2 text-sm font-medium border-t border-b -ml-px ${
              locationFilter === 'tokyo'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            東京物件
          </button>
          <button
            onClick={() => setLocationFilter('osaka')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b -ml-px ${
              locationFilter === 'osaka'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            大阪物件
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {view === 'calendar' ? (
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
              const dayEvents = getEventsForDay(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentDate);
              const holidayInfo = isHoliday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[120px] bg-white p-2 ${
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
                  
                  <div className="mt-1 space-y-1">
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className={`group relative px-2 py-1 text-xs ${event.color?.light || 'bg-primary-50'} ${event.color?.text || 'text-primary-700'} cursor-pointer hover:bg-opacity-75 hover:shadow-sm transition-all`}
                      >
                        <div className="font-medium truncate">
                          {event.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredEvents().map(event => (
            <div
              key={event.id}
              onClick={() => handleEventClick(event)}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow animate-fade-in group relative cursor-pointer"
            >
              <div className={`h-24 bg-gradient-to-r ${event.color?.bg || 'from-primary-600 to-primary-400'} p-4 flex items-center justify-center`}>
                <div className="text-center text-white">
                  <div className="text-2xl font-bold">
                    {format(new Date(formatDateForDisplay(event.startDate)), 'd')}
                  </div>
                  <div className="text-sm font-medium">
                    {format(new Date(formatDateForDisplay(event.startDate)), 'yyyy年 M月', { locale: ja })}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>

                <div className="mt-4 space-y-2">
                  {event.location && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                      {LOCATIONS.find(loc => loc.id === event.location)?.name || event.location}
                    </div>
                  )}
                  {event.constructionLocation && (
                    <div className="flex items-start text-sm text-gray-500">
                      <Building2 className="h-4 w-4 mr-1.5 text-gray-400 mt-1" />
                      <span className="flex-1">{event.constructionLocation}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1.5 text-gray-400" />
                    {event.attendees.length} 人が参加予定
                  </div>
                </div>
                
                {event.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                    {event.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Property Detail Modal */}
      {showDetailModal && selectedEvent && editForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-900">物件詳細</h2>
              <div className="flex items-center space-x-2">
                {!isEditing && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="編集"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="削除"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {!isEditing ? (
              <div className="p-6">
                <div className={`h-32 bg-gradient-to-r ${selectedEvent.color?.bg || 'from-primary-600 to-primary-400'} rounded-lg p-6 mb-6 flex items-center justify-center`}>
                  <div className="text-center text-white">
                    <div className="text-3xl font-bold mb-2">
                      {selectedEvent.title}
                    </div>
                    <div className="text-sm font-medium opacity-90">
                      {formatDateForDisplay(selectedEvent.startDate) === formatDateForDisplay(selectedEvent.endDate)
                        ? format(new Date(formatDateForDisplay(selectedEvent.startDate)), 'yyyy年 M月d日', { locale: ja })
                        : `${format(new Date(formatDateForDisplay(selectedEvent.startDate)), 'yyyy年 M月d日', { locale: ja })} - ${format(new Date(formatDateForDisplay(selectedEvent.endDate)), 'yyyy年 M月d日', { locale: ja })}`
                      }
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedEvent.area && (
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">物件番号</div>
                      <div className="text-base text-gray-900">{selectedEvent.area}</div>
                    </div>
                  )}

                  {selectedEvent.customer && (
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">取引先</div>
                      <div className="flex items-center text-base text-gray-900">
                        <Briefcase className="h-5 w-5 mr-2 text-gray-400" />
                        {selectedEvent.customer}
                      </div>
                    </div>
                  )}

                  {selectedEvent.manager && (
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">担当者</div>
                      <div className="flex items-center text-base text-gray-900">
                        <User className="h-5 w-5 mr-2 text-gray-400" />
                        {selectedEvent.manager}
                      </div>
                    </div>
                  )}

                  {selectedEvent.constructionLocation && (
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">施工場所</div>
                      <div className="flex items-start text-base text-gray-900">
                        <Building2 className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                        <span>{selectedEvent.constructionLocation}</span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedEvent.notes && (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-500 mb-1">備考</div>
                    <div className="p-4 bg-gray-50 rounded-lg text-base text-gray-700">
                      {selectedEvent.notes}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">物件名 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="title"
                      value={editForm.title}
                      onChange={handleEditChange}
                      required
                      className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">物件番号</label>
                      <input
                        type="text"
                        name="area"
                        value={editForm.area}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">取引先</label>
                      <input
                        type="text"
                        name="customer"
                        list="customer-list-edit"
                        value={editForm.customer}
                        onChange={handleEditChange}
                        placeholder="選択または入力してください"
                        className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2"
                      />
                      <datalist id="customer-list-edit">
                        {CUSTOMERS.map(customer => (
                          <option key={customer} value={customer} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">担当者</label>
                      <input
                        type="text"
                        name="manager"
                        value={editForm.manager}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">施工場所</label>
                      <input
                        type="text"
                        name="constructionLocation"
                        value={editForm.constructionLocation}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">開始日 <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        name="startDate"
                        value={editForm.startDate}
                        onChange={handleEditChange}
                        required
                        className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">終了日 <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        name="endDate"
                        value={editForm.endDate}
                        onChange={handleEditChange}
                        required
                        className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
                    <textarea
                      name="notes"
                      value={editForm.notes}
                      onChange={handleEditChange}
                      rows={3}
                      className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">カラー</label>
                    <div className="grid grid-cols-3 gap-2">
                      {COLORS.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          className={`flex items-center space-x-2 p-2 rounded ${
                            editForm.color.name === color.name ? 'ring-2 ring-primary-500' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setEditForm((prev: any) => ({ ...prev, color }))}
                        >
                          <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${color.bg}`} />
                          <span className="text-sm">{color.name}</span>
                          {editForm.color.name === color.name && (
                            <Check className="h-4 w-4 text-primary-600 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    保存
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                >
                  閉じる
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Property Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">新しい物件</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateEvent}>
              <div className="p-6 bg-gray-50">
                <div className="space-y-3">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      物件名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={newEvent.title}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2"
                      maxLength={30}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      エリア
                    </label>
                    <select
                      id="location"
                      name="location"
                      value={newEvent.location}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2"
                    >
                      {LOCATIONS.map(location => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="area" className="block text-sm font-medium text-gray-700">
                      物件番号
                    </label>
                    <input
                      type="text"
                      id="area"
                      name="area"
                      value={newEvent.area}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2"
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
                      取引先
                    </label>
                    <input
                      type="text"
                      id="customer"
                      name="customer"
                      list="customer-list"
                      value={newEvent.customer}
                      onChange={handleInputChange}
                      placeholder="選択または入力してください"
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2"
                      maxLength={50}
                    />
                    <datalist id="customer-list">
                      {CUSTOMERS.map(customer => (
                        <option key={customer} value={customer} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label htmlFor="manager" className="block text-sm font-medium text-gray-700">
                      担当者
                    </label>
                    <input
                      type="text"
                      id="manager"
                      name="manager"
                      value={newEvent.manager}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2"
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label htmlFor="constructionLocation" className="block text-sm font-medium text-gray-700">
                      施工場所
                    </label>
                    <input
                      type="text"
                      id="constructionLocation"
                      name="constructionLocation"
                      value={newEvent.constructionLocation}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      備考
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={newEvent.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2"
                      maxLength={200}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      カラー
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {COLORS.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          className={`flex items-center space-x-2 p-2 rounded ${
                            newEvent.color.name === color.name ? 'ring-2 ring-primary-500' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setNewEvent(prev => ({ ...prev, color }))}
                        >
                          <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${color.bg}`} />
                          <span className="text-sm">{color.name}</span>
                          {newEvent.color.name === color.name && (
                            <Check className="h-4 w-4 text-primary-600 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                        開始日 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={newEvent.startDate}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2"
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                        終了日 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={newEvent.endDate}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-white border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
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

export default Events;