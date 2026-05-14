const JournalCalendar = () => {
  const entries = [
    { date: new Date().toISOString(), title: 'Entry 1' },
    { date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), title: 'Entry 2' }
  ];

  const hasEntry = (day) => {
    return entries.some(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getDate() === day;
    });
  };

  const getEntryTitle = (day) => {
    const entry = entries.find(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getDate() === day;
    });
    return entry ? entry.title : '';
  };

  // Days of the week
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Create an array of days for the month view
  // For simplicity, we're creating a fixed grid of 35 days
  // In a real app, you'd calculate the actual days based on the current month
  const createDaysArray = () => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const dayOfWeek = monthStart.getDay();
    
    // Create array with days from previous month, current month, and next month
    const days = [];
    for (let i = 0; i < 35; i++) {
      // Calculate the day number
      const day = i - dayOfWeek + 1;
      
      // Check if the day is in the current month
      const isCurrentMonth = day > 0 && day <= 31;
      
      days.push({
        day: day > 0 ? (day <= 31 ? day : day - 31) : 30 + day,
        isCurrentMonth,
        hasEntry: isCurrentMonth && hasEntry(day),
        entryTitle: isCurrentMonth && hasEntry(day) ? getEntryTitle(day) : ''
      });
    }
    
    return days;
  };
  
  const days = createDaysArray();
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {weekdays.map(day => (
          <div key={day} className="bg-gray-50 text-center py-2 font-medium">{day}</div>
        ))}
        
        {days.map((day, index) => (
          <div 
            key={index} 
            className={`bg-white border border-gray-100 h-24 p-1 ${day.isCurrentMonth ? '' : 'text-gray-400'} ${day.hasEntry ? 'bg-blue-50' : ''}`}
          >
            <div className="flex justify-between">
              <span className="font-medium">{day.day}</span>
              {day.hasEntry && <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
            </div>
            {day.hasEntry && (
              <div className="mt-1 text-xs bg-blue-100 p-1 rounded">{day.entryTitle}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default JournalCalendar;