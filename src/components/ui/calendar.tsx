
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type CaptionProps } from "react-day-picker"
import { ko } from "date-fns/locale";
import { format, getYear, getMonth, setYear, setMonth, addYears, subYears } from "date-fns";

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  onSelect?: (date: Date | undefined) => void;
};


function CustomCaption(props: CaptionProps & { 
  onBackToMonthView?: () => void;
  onBackToYearView?: () => void;
  currentView: 'days' | 'months' | 'years';
  showYearMonthPicker?: boolean;
  onYearClick?: () => void;
  onMonthClick?: () => void;
 }) {
  const { 
    displayMonth, 
    onBackToMonthView, 
    onBackToYearView, 
    currentView,
    showYearMonthPicker,
    onYearClick,
    onMonthClick
  } = props;
  const { goToMonth, nextMonth, previousMonth } = DayPicker.useNavigation();


  if (currentView === 'years') {
    return (
      <div className="flex justify-center items-center pt-1 relative">
        <h2 className="text-sm font-medium">연도 선택</h2>
      </div>
    );
  }

  if (currentView === 'months') {
    return (
      <div className="flex justify-center items-center pt-1 relative">
         <Button
            variant="ghost"
            size="sm"
            onClick={onBackToYearView}
            className="absolute left-1"
          >
          <ChevronLeft className="h-4 w-4" />
          연도
        </Button>
        <h2 className="text-sm font-medium cursor-pointer hover:underline" onClick={onYearClick}>
          {format(displayMonth, "yyyy년", { locale: ko })}
        </h2>
      </div>
    );
  }

  // Day View Caption
  return (
    <div className="flex justify-between items-center pt-1 relative px-1">
       <Button
            variant="ghost"
            size="sm"
            onClick={onBackToMonthView}
            className="absolute left-1 flex items-center"
          >
          <ChevronLeft className="h-4 w-4 mr-1" />
          월
        </Button>
      <div className="flex-1 text-center">
        <span className="text-sm font-medium cursor-pointer hover:underline" onClick={onMonthClick}>
          {format(displayMonth, "MMMM", { locale: ko })}
        </span>
        <span className="text-sm font-medium ml-1 cursor-pointer hover:underline" onClick={onYearClick}>
           {format(displayMonth, "yyyy", { locale: ko })}
        </span>
      </div>
      <div className="flex items-center">
        <Button
            onClick={() => previousMonth && goToMonth(previousMonth)}
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={!previousMonth}
        >
            <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
            onClick={() => nextMonth && goToMonth(nextMonth)}
            variant="outline"
            size="icon"
            className="h-7 w-7 ml-1"
            disabled={!nextMonth}
        >
            <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}


function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  selected,
  onSelect,
  fromYear: fromYearProp,
  toYear: toYearProp,
  ...props
}: CalendarProps) {
  const [currentView, setCurrentView] = React.useState<'years' | 'months' | 'days'>('years');
  const [displayDate, setDisplayDate] = React.useState<Date>(selected || new Date());
  const [yearPage, setYearPage] = React.useState<number>(getYear(selected || new Date()));

  const fromYear = fromYearProp || getYear(new Date()) - 100;
  const toYear = toYearProp || getYear(new Date()) + 0;

  React.useEffect(() => {
    if (selected) {
      setDisplayDate(selected);
      // If a date is selected, we could start at 'days', but the prompt implies starting at year selection.
      // For a better UX if a date is already selected, we could go to 'days':
      // setCurrentView('days');
      // setYearPage(getYear(selected));
    } else {
      // Start with year view if no date is selected
      setCurrentView('years');
      setYearPage(toYear); // Start at the most recent decade
    }
  }, [selected, toYear]);


  const handleYearSelect = (year: number) => {
    setDisplayDate(setYear(displayDate, year));
    setCurrentView('months');
  };

  const handleMonthSelect = (monthIndex: number) => {
    setDisplayDate(setMonth(displayDate, monthIndex));
    setCurrentView('days');
  };
  
  const handleDaySelect = (date: Date | undefined) => {
    if (onSelect) {
      onSelect(date);
    }
    // Optionally, reset to year view or close popover.
    // For now, let the parent component handle popover close.
    // setCurrentView('years'); 
  };

  const renderYearView = () => {
    const yearsPerPage = 12;
    const startYearOfPage = Math.floor((yearPage - fromYear) / yearsPerPage) * yearsPerPage + fromYear;
    
    const years: number[] = [];
    for (let i = 0; i < yearsPerPage; i++) {
      const year = startYearOfPage + i;
      if (year >= fromYear && year <= toYear) {
        years.push(year);
      }
    }
    if (years.length === 0 && startYearOfPage > fromYear) { // case where yearPage is past toYear
        const lastValidStartYear = Math.max(fromYear, toYear - yearsPerPage + 1);
         for (let i = 0; i < yearsPerPage; i++) {
            const year = lastValidStartYear + i;
            if (year >= fromYear && year <= toYear) {
                years.push(year);
            }
        }
    }


    return (
      <div className="p-3">
        <div className="flex justify-between items-center mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setYearPage(Math.max(fromYear, yearPage - yearsPerPage))}
            disabled={startYearOfPage <= fromYear}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            {years.length > 0 ? `${years[0]} - ${years[years.length - 1]}` : `${startYearOfPage} - ${startYearOfPage + yearsPerPage -1}`}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setYearPage(Math.min(toYear, yearPage + yearsPerPage))}
            disabled={startYearOfPage + yearsPerPage > toYear}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {years.map((year) => (
            <Button
              key={year}
              variant={getYear(displayDate) === year ? "default" : "outline"}
              size="sm"
              onClick={() => handleYearSelect(year)}
              className="w-full"
            >
              {year}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const months = Array.from({ length: 12 }, (_, i) => i);
    return (
      <div className="p-3">
         <div className="grid grid-cols-3 gap-2">
          {months.map((monthIndex) => (
            <Button
              key={monthIndex}
              variant={getMonth(displayDate) === monthIndex && getYear(displayDate) === getYear(setMonth(new Date(), monthIndex)) ? "default" : "outline"}
              size="sm"
              onClick={() => handleMonthSelect(monthIndex)}
              className="w-full"
            >
              {format(setMonth(new Date(), monthIndex), "MMM", { locale: ko })}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    return (
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption_label: "hidden", // We use CustomCaption
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1", // Handled by CustomCaption
          nav_button_next: "absolute right-1", // Handled by CustomCaption
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_range_end: "day-range-end",
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        locale={ko}
        month={displayDate} // Control the displayed month
        selected={selected}
        onSelect={handleDaySelect}
        components={{
          Caption: (captionProps) => <CustomCaption 
            {...captionProps} 
            currentView="days" 
            onBackToMonthView={() => setCurrentView('months')}
            showYearMonthPicker={true}
            onYearClick={() => setCurrentView('years')}
            onMonthClick={() => setCurrentView('months')}
           />,
          // IconLeft and IconRight are handled within CustomCaption for day view
        }}
        fromYear={fromYear}
        toYear={toYear}
        disabled={props.disabled}
        {...props}
      />
    );
  };

  return (
    <div>
      <CustomCaption 
        displayMonth={displayDate} 
        currentView={currentView} 
        onBackToYearView={() => setCurrentView('years')}
        onYearClick={() => setCurrentView('years')}
        onMonthClick={() => setCurrentView('months')}
      />
      {currentView === 'years' && renderYearView()}
      {currentView === 'months' && renderMonthView()}
      {currentView === 'days' && renderDayView()}
    </div>
  );
}
Calendar.displayName = "Calendar"

export { Calendar }
