// Voice Assistant Component (Floating Button)
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useStore } from '../store/useStore';
import './VoiceAssistant.css';

export const VoiceAssistant: React.FC = () => {
  const { openWindow, closeWindow, closeAllWindows, windows, setCalculatorCommand, cycleWallpaper, addTodoTask, setCalendarCommand, setPaintCommand } = useStore();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const restartTimeoutRef = useRef<any>(null);

  // Keep isListeningRef in sync
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const appMap: Record<string, { id: string; name: string; width: number; height: number }> = {
    'calculator': { id: 'calculator', name: 'Calculator', width: 400, height: 600 },
    'terminal': { id: 'terminal', name: 'Terminal', width: 800, height: 600 },
    'task manager': { id: 'taskmanager', name: 'Task Manager', width: 900, height: 700 },
    'taskmanager': { id: 'taskmanager', name: 'Task Manager', width: 900, height: 700 },
    'markdown': { id: 'markdown', name: 'Markdown', width: 1000, height: 700 },
    'todo': { id: 'todo', name: 'To-Do', width: 700, height: 700 },
    'to do': { id: 'todo', name: 'To-Do', width: 700, height: 700 },
    'paint': { id: 'paint', name: 'Paint', width: 900, height: 700 },
    'tic tac toe': { id: 'tictactoe', name: 'Tic Tac Toe', width: 650, height: 750 },
    'tic tac to': { id: 'tictactoe', name: 'Tic Tac Toe', width: 650, height: 750 },
    'tictactoe': { id: 'tictactoe', name: 'Tic Tac Toe', width: 650, height: 750 },
    'tictacto': { id: 'tictactoe', name: 'Tic Tac Toe', width: 650, height: 750 },
    'tic-tac-toe': { id: 'tictactoe', name: 'Tic Tac Toe', width: 650, height: 750 },
    'tic tac': { id: 'tictactoe', name: 'Tic Tac Toe', width: 650, height: 750 },
    'ttt': { id: 'tictactoe', name: 'Tic Tac Toe', width: 650, height: 750 },
    'snake': { id: 'snake', name: 'Snake', width: 600, height: 720 },
    'notes': { id: 'notes', name: 'Notes', width: 900, height: 600 },
    'clock': { id: 'clock', name: 'Clock', width: 900, height: 650 },
    'calendar': { id: 'calendar', name: 'Calendar', width: 1000, height: 700 },
    'files': { id: 'files', name: 'Files', width: 900, height: 600 },
    'file manager': { id: 'files', name: 'Files', width: 900, height: 600 },
    'settings': { id: 'settings', name: 'Settings', width: 800, height: 700 },
    'music': { id: 'music', name: 'Music', width: 700, height: 600 },
    'music player': { id: 'music', name: 'Music', width: 700, height: 600 },
  };

  const extractAppName = (command: string): string | null => {
    // Remove filler words and normalize
    const cleanCommand = command
      .replace(/\b(please|hey|the|a|an|now|fast|quickly|right|just|let's|lets|with|me)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Check for exact matches or partial matches
    for (const [key, app] of Object.entries(appMap)) {
      if (cleanCommand.includes(key)) {
        return app.id;
      }
    }

    return null;
  };

  // Parse math expressions from voice commands
  const parseMathExpression = (command: string): { num1: number; operator: string; num2: number } | null => {
    // Normalize command
    const normalized = command.toLowerCase()
      .replace(/what is/gi, '')
      .replace(/what's/gi, '')
      .replace(/calculate/gi, '')
      .replace(/tell me/gi, '')
      .trim();

    // Pattern 1: "9 into 2" or "9 times 2" -> 9 * 2
    let match = normalized.match(/(\d+(?:\.\d+)?)\s+(?:into|times|multiplied by|multiply)\s+(\d+(?:\.\d+)?)/i);
    if (match) {
      return { num1: parseFloat(match[1]), operator: '*', num2: parseFloat(match[2]) };
    }

    // Pattern 2: "4 plus 4" -> 4 + 4
    match = normalized.match(/(\d+(?:\.\d+)?)\s+(?:plus|add|added to)\s+(\d+(?:\.\d+)?)/i);
    if (match) {
      return { num1: parseFloat(match[1]), operator: '+', num2: parseFloat(match[2]) };
    }

    // Pattern 3: "10 minus 5" -> 10 - 5
    match = normalized.match(/(\d+(?:\.\d+)?)\s+(?:minus|subtract|less)\s+(\d+(?:\.\d+)?)/i);
    if (match) {
      return { num1: parseFloat(match[1]), operator: '-', num2: parseFloat(match[2]) };
    }

    // Pattern 4: "20 divided by 4" -> 20 / 4
    match = normalized.match(/(\d+(?:\.\d+)?)\s+(?:divided by|divide by|over)\s+(\d+(?:\.\d+)?)/i);
    if (match) {
      return { num1: parseFloat(match[1]), operator: '/', num2: parseFloat(match[2]) };
    }

    // Pattern 5: "25 percentage of 200" or "25 percent of 200" -> (25 / 100) * 200
    match = normalized.match(/(\d+(?:\.\d+)?)\s+(?:percentage|percent|%)\s+(?:of)\s+(\d+(?:\.\d+)?)/i);
    if (match) {
      return { num1: parseFloat(match[1]), operator: '%', num2: parseFloat(match[2]) };
    }

    // Pattern 6: Simple "X + Y", "X - Y", "X * Y", "X / Y"
    match = normalized.match(/(\d+(?:\.\d+)?)\s*([+\-*/×÷])\s*(\d+(?:\.\d+)?)/);
    if (match) {
      return { num1: parseFloat(match[1]), operator: match[2], num2: parseFloat(match[3]) };
    }

    return null;
  };

  // Parse todo commands with natural language date/time
  const parseTodoCommand = (command: string): { title: string; deadline?: Date } | null => {
    // Check if it's a todo command
    const isTodoCommand = /\b(add|create|new)\s+(?:in\s+)?(?:the\s+)?(?:to\s*do|todo)\s+(?:list)?/i.test(command);
    if (!isTodoCommand) return null;

    // Extract the task description after "add in the todo list" or similar
    const taskMatch = command.match(/(?:add|create|new)\s+(?:in\s+)?(?:the\s+)?(?:to\s*do|todo)\s+(?:list)?\s*[-:]?\s*(.+)/i);
    if (!taskMatch) return null;

    let taskText = taskMatch[1].trim();
    let deadline: Date | undefined;

    // Parse time patterns
    const now = new Date();
    
    // Pattern 1: "at 10 am" or "at 5 pm"
    const timeMatch = taskText.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const period = timeMatch[3].toLowerCase();
      
      if (period === 'pm' && hours !== 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;
      
      deadline = new Date(now);
      deadline.setHours(hours, minutes, 0, 0);
      
      // Remove time from task text
      taskText = taskText.replace(/\bat\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/i, '').trim();
    }

    // Pattern 2: "tomorrow" with optional time
    if (/\btomorrow\b/i.test(taskText)) {
      if (!deadline) deadline = new Date(now);
      deadline.setDate(deadline.getDate() + 1);
      
      // If no time specified, set to 9 AM tomorrow
      if (!timeMatch) {
        deadline.setHours(9, 0, 0, 0);
      }
      
      taskText = taskText.replace(/\btomorrow\b/i, '').trim();
    }

    // Pattern 3: "today" with optional time
    if (/\btoday\b/i.test(taskText)) {
      if (!deadline) deadline = new Date(now);
      
      // If no time specified, set to current time + 1 hour
      if (!timeMatch) {
        deadline.setHours(deadline.getHours() + 1, 0, 0, 0);
      }
      
      taskText = taskText.replace(/\btoday\b/i, '').trim();
    }

    // Clean up task text
    taskText = taskText
      .replace(/^[-:,\s]+/, '')
      .replace(/[-:,\s]+$/, '')
      .trim();

    if (!taskText) return null;

    return { title: taskText, deadline };
  };

  // Parse calendar commands - comprehensive natural language processing
  const parseCalendarCommand = (command: string): { 
    type: 'navigate' | 'query' | 'addEvent'; 
    month?: number; 
    year?: number;
    eventTitle?: string;
    eventDate?: Date;
    queryDate?: Date;
  } | null => {
    const months = {
      'january': 0, 'jan': 0,
      'february': 1, 'feb': 1,
      'march': 2, 'mar': 2,
      'april': 3, 'apr': 3,
      'may': 4,
      'june': 5, 'jun': 5,
      'july': 6, 'jul': 6,
      'august': 7, 'aug': 7,
      'september': 8, 'sep': 8, 'sept': 8,
      'october': 9, 'oct': 9,
      'november': 10, 'nov': 10,
      'december': 11, 'dec': 11
    };

    const normalized = command.toLowerCase();

    // Pattern 1: "open november 2023 calendar" or "open january 2026 calendar"
    const openCalendarMatch = normalized.match(/\bopen\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{4})\s+calendar\b/i);
    if (openCalendarMatch) {
      const monthName = openCalendarMatch[1].toLowerCase();
      const year = parseInt(openCalendarMatch[2]);
      const month = months[monthName as keyof typeof months];
      
      return { type: 'navigate', month, year };
    }

    // Pattern 2: "what day is on 29th january 2030" or "what is the date on next monday"
    const dayQueryMatch = normalized.match(/\bwhat\s+(?:day\s+is\s+on|is\s+the\s+date\s+on)\s+(.+)/i);
    if (dayQueryMatch) {
      const dateText = dayQueryMatch[1].trim();
      
      // Parse specific date: "29th january 2030"
      const specificDateMatch = dateText.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{4})/i);
      if (specificDateMatch) {
        const day = parseInt(specificDateMatch[1]);
        const monthName = specificDateMatch[2].toLowerCase();
        const year = parseInt(specificDateMatch[3]);
        const month = months[monthName as keyof typeof months];
        
        const queryDate = new Date(year, month, day);
        return { type: 'query', queryDate };
      }

      // Parse relative date: "next monday", "next friday"
      const nextDayMatch = dateText.match(/\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
      if (nextDayMatch) {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetDayName = nextDayMatch[1].toLowerCase();
        const targetDay = dayNames.indexOf(targetDayName);
        
        const today = new Date();
        const currentDay = today.getDay();
        let daysUntilTarget = targetDay - currentDay;
        if (daysUntilTarget <= 0) daysUntilTarget += 7;
        
        const queryDate = new Date(today);
        queryDate.setDate(today.getDate() + daysUntilTarget);
        queryDate.setHours(0, 0, 0, 0);
        
        return { type: 'query', queryDate };
      }
    }

    // Pattern 3: "add new event - my birthday is on 28th december"
    const addEventMatch = normalized.match(/\b(?:add|create)\s+(?:new\s+)?event\s*[-:]?\s*(.+?)\s+(?:is\s+)?on\s+(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)(?:\s+(\d{4}))?/i);
    if (addEventMatch) {
      const eventTitle = addEventMatch[1].trim();
      const day = parseInt(addEventMatch[2]);
      const monthName = addEventMatch[3].toLowerCase();
      const year = addEventMatch[4] ? parseInt(addEventMatch[4]) : new Date().getFullYear();
      const month = months[monthName as keyof typeof months];
      
      const eventDate = new Date(year, month, day);
      return { type: 'addEvent', eventTitle, eventDate };
    }

    return null;
  };

  // Parse paint/drawing commands
  const parsePaintCommand = (command: string): {
    type: 'shape' | 'drawing' | 'clear';
    shape?: 'circle' | 'square' | 'triangle' | 'line' | 'star' | 'heart';
    drawing?: 'cat' | 'smiley' | 'house' | 'tree' | 'sun' | 'number' | 'letter';
    text?: string;
  } | null => {
    const normalized = command.toLowerCase();

    // Check for clear canvas
    if (/\b(clear|erase|clean)\s+(?:the\s+)?canvas\b/i.test(normalized)) {
      return { type: 'clear' };
    }

    // Check for shape drawing commands
    if (/\b(draw|make|create)\b/i.test(normalized)) {
      // Shapes
      if (/\b(a\s+)?circle\b/i.test(normalized)) {
        return { type: 'shape', shape: 'circle' };
      }
      if (/\b(a\s+)?square\b/i.test(normalized)) {
        return { type: 'shape', shape: 'square' };
      }
      if (/\b(a\s+)?triangle\b/i.test(normalized)) {
        return { type: 'shape', shape: 'triangle' };
      }
      if (/\b(a\s+)?star\b/i.test(normalized)) {
        return { type: 'shape', shape: 'star' };
      }
      if (/\b(a\s+)?heart\b/i.test(normalized)) {
        return { type: 'shape', shape: 'heart' };
      }
      if (/\b(a\s+)?line\b/i.test(normalized)) {
        return { type: 'shape', shape: 'line' };
      }

      // Complex drawings
      if (/\b(a\s+)?cat\b/i.test(normalized)) {
        return { type: 'drawing', drawing: 'cat' };
      }
      if (/\b(a\s+)?smiley|smile|happy\s+face\b/i.test(normalized)) {
        return { type: 'drawing', drawing: 'smiley' };
      }
      if (/\b(a\s+)?house|home\b/i.test(normalized)) {
        return { type: 'drawing', drawing: 'house' };
      }
      if (/\b(a\s+)?tree\b/i.test(normalized)) {
        return { type: 'drawing', drawing: 'tree' };
      }
      if (/\b(a\s+)?sun\b/i.test(normalized)) {
        return { type: 'drawing', drawing: 'sun' };
      }

      // Numbers (0-9)
      const numberMatch = normalized.match(/\b(draw|make|create)\s+(?:number\s+|the\s+number\s+)?(\d+|zero|one|two|three|four|five|six|seven|eight|nine|ten)\b/i);
      if (numberMatch) {
        const numberText = numberMatch[2];
        const numberMap: { [key: string]: string } = {
          'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
          'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10'
        };
        const numValue = numberMap[numberText] || numberText;
        return { type: 'drawing', drawing: 'number', text: numValue };
      }

      // Letters (A-Z)
      const letterMatch = normalized.match(/\b(draw|make|create)\s+(?:letter\s+|the\s+letter\s+)?([a-z])\b/i);
      if (letterMatch) {
        return { type: 'drawing', drawing: 'letter', text: letterMatch[2].toUpperCase() };
      }
    }

    return null;
  };

  const processCommand = (command: string) => {
    console.log('Processing command:', command);
    
    // Check for paint commands first
    const paintData = parsePaintCommand(command);
    if (paintData) {
      console.log('Paint command detected:', paintData);
      
      // Open paint app if not already open
      const paintWindow = windows.find(w => w.appId === 'paint');
      if (!paintWindow) {
        const paintApp = appMap['paint'];
        openWindow(paintApp.id, paintApp.name, paintApp.name, paintApp.width, paintApp.height);
      }
      
      setTimeout(() => {
        setPaintCommand(paintData);
        
        if (paintData.type === 'clear') {
          setFeedback('Clearing canvas...');
        } else if (paintData.type === 'shape') {
          setFeedback(`Drawing ${paintData.shape}...`);
        } else if (paintData.type === 'drawing') {
          if (paintData.drawing === 'number' || paintData.drawing === 'letter') {
            setFeedback(`Drawing "${paintData.text}"...`);
          } else {
            setFeedback(`Drawing ${paintData.drawing}...`);
          }
        }
        
        setTimeout(() => setFeedback(''), 2000);
      }, paintWindow ? 50 : 300);
      
      return;
    }
    
    // Check for calendar commands
    const calendarData = parseCalendarCommand(command);
    if (calendarData) {
      console.log('Calendar command detected:', calendarData);
      
      if (calendarData.type === 'navigate') {
        // Open calendar to specific month/year
        const calWindow = windows.find(w => w.appId === 'calendar');
        if (!calWindow) {
          const calApp = appMap['calendar'];
          openWindow(calApp.id, calApp.name, calApp.name, calApp.width, calApp.height);
        }
        
        setTimeout(() => {
          setCalendarCommand({
            type: 'navigate',
            month: calendarData.month,
            year: calendarData.year
          });
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          setFeedback(`Opening ${monthNames[calendarData.month!]} ${calendarData.year}`);
          setTimeout(() => setFeedback(''), 2000);
        }, calWindow ? 50 : 300);
        
        return;
      } else if (calendarData.type === 'query' && calendarData.queryDate) {
        // Answer date query
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
        const dayName = dayNames[calendarData.queryDate.getDay()];
        const monthName = monthNames[calendarData.queryDate.getMonth()];
        const date = calendarData.queryDate.getDate();
        const year = calendarData.queryDate.getFullYear();
        
        setFeedback(`${dayName}, ${monthName} ${date}, ${year}`);
        setTimeout(() => setFeedback(''), 4000);
        
        return;
      } else if (calendarData.type === 'addEvent' && calendarData.eventTitle && calendarData.eventDate) {
        // Add event to calendar
        const calWindow = windows.find(w => w.appId === 'calendar');
        if (!calWindow) {
          const calApp = appMap['calendar'];
          openWindow(calApp.id, calApp.name, calApp.name, calApp.width, calApp.height);
        }
        
        setTimeout(() => {
          setCalendarCommand({
            type: 'addEvent',
            eventTitle: calendarData.eventTitle,
            eventDate: calendarData.eventDate
          });
          setFeedback(`Event added: "${calendarData.eventTitle}"`);
          setTimeout(() => setFeedback(''), 2000);
        }, calWindow ? 50 : 300);
        
        return;
      }
    }
    
    // Check for todo commands
    const todoData = parseTodoCommand(command);
    if (todoData) {
      console.log('Todo command detected:', todoData);
      
      addTodoTask({
        title: todoData.title,
        description: '',
        priority: 'medium',
        deadline: todoData.deadline,
        category: 'Personal',
      });
      
      // Open todo app if not already open
      const todoWindow = windows.find(w => w.appId === 'todo');
      if (!todoWindow) {
        const todoApp = appMap['todo'];
        openWindow(todoApp.id, todoApp.name, todoApp.name, todoApp.width, todoApp.height);
      }
      
      setFeedback(`Added to To-Do: "${todoData.title}"`);
      setTimeout(() => setFeedback(''), 2000);
      return;
    }
    
    // Check for wallpaper change command
    const isWallpaperCommand = /\b(change|switch|set|next)\s+(?:the\s+)?wallpaper\b/i.test(command);
    if (isWallpaperCommand) {
      cycleWallpaper();
      setFeedback('Wallpaper changed!');
      setTimeout(() => setFeedback(''), 1500);
      return;
    }
    
    // Check for math expressions
    const mathExpr = parseMathExpression(command);
    if (mathExpr) {
      console.log('Math expression detected:', mathExpr);
      
      // Open calculator if not already open
      const calcWindow = windows.find(w => w.appId === 'calculator');
      if (!calcWindow) {
        const calcApp = appMap['calculator'];
        openWindow(calcApp.id, calcApp.name, calcApp.name, calcApp.width, calcApp.height);
      }
      
      // Send calculation command immediately
      const expression = `${mathExpr.num1} ${mathExpr.operator} ${mathExpr.num2}`;
      // Use requestAnimationFrame for immediate next-frame execution
      requestAnimationFrame(() => {
        setCalculatorCommand(expression);
        setFeedback(`Calculating...`);
        setTimeout(() => setFeedback(''), 1500);
      });
      
      return;
    }
    
    // Check for "close all" command
    const isCloseAllCommand = /\b(close|shut|exit|quit)\s+(all|everything)\b/i.test(command);
    if (isCloseAllCommand) {
      closeAllWindows();
      setFeedback('Closing all apps...');
      setTimeout(() => setFeedback(''), 1500);
      return;
    }

    const appId = extractAppName(command);

    if (!appId) {
      setFeedback('App not recognized');
      setTimeout(() => setFeedback(''), 1500);
      return;
    }

    const app = Object.values(appMap).find(a => a.id === appId);
    if (!app) return;

    // Determine if it's an open or close command
    const isOpenCommand = /\b(open|launch|start|run|show|load|play)\b/i.test(command);
    const isCloseCommand = /\b(close|exit|quit|shut|stop|end|kill)\b/i.test(command);

    console.log('Command type:', { isOpenCommand, isCloseCommand, appId });

    if (isCloseCommand) {
      // Find and close the window
      const windowToClose = windows.find(w => w.appId === appId);
      console.log('Windows:', windows, 'Window to close:', windowToClose);
      if (windowToClose) {
        closeWindow(windowToClose.id);
        setFeedback(`Closing ${app.name}...`);
      } else {
        setFeedback(`${app.name} is not open`);
      }
      setTimeout(() => setFeedback(''), 1500);
    } else if (isOpenCommand || !isCloseCommand) {
      // Default to opening if no close keyword detected
      openWindow(app.id, app.name, app.name, app.width, app.height);
      setFeedback(`Opening ${app.name}...`);
      setTimeout(() => setFeedback(''), 1500);
    }
  };

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Keep listening continuously
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        const text = lastResult[0].transcript.toLowerCase();
        console.log('Heard:', text);
        setTranscript(text);
        processCommand(text);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Ignore no-speech errors in continuous mode
          return;
        }
        if (event.error === 'aborted') {
          // Restart if aborted
          if (isListeningRef.current) {
            restartRecognition();
          }
          return;
        }
        setFeedback('Error: Could not understand');
        setTimeout(() => setFeedback(''), 2000);
      };

      recognitionRef.current.onend = () => {
        // Automatically restart if we were listening
        console.log('Recognition ended, isListening:', isListeningRef.current);
        if (isListeningRef.current) {
          restartRecognition();
        }
      };

      // Auto-start listening on mount
      setTimeout(() => {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          setFeedback('Voice Assistant Active');
          setTimeout(() => setFeedback(''), 2000);
        } catch (e) {
          console.error('Failed to auto-start recognition:', e);
        }
      }, 500); // Reduced delay for faster startup
    }

    return () => {
      if (recognitionRef.current) {
        isListeningRef.current = false;
        recognitionRef.current.stop();
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, [openWindow, closeWindow, closeAllWindows, windows, setCalculatorCommand, cycleWallpaper, addTodoTask, setCalendarCommand, setPaintCommand]);

  const restartRecognition = () => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    
    restartTimeoutRef.current = setTimeout(() => {
      try {
        if (isListeningRef.current && recognitionRef.current) {
          recognitionRef.current.start();
          console.log('Restarted recognition');
        }
      } catch (e) {
        console.error('Failed to restart recognition:', e);
        // If it fails, try again after a longer delay
        if (isListeningRef.current) {
          setTimeout(() => restartRecognition(), 500);
        }
      }
    }, 50); // Reduced to 50ms for faster restart
  };


  const toggleListening = () => {
    if (!recognitionRef.current) {
      setFeedback('Speech recognition not supported');
      setTimeout(() => setFeedback(''), 2000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setFeedback('Stopped listening');
      setTimeout(() => setFeedback(''), 2000);
    } else {
      setTranscript('');
      setFeedback('Always listening... (Say "open" or "close" + app name)');
      setTimeout(() => setFeedback('Listening...'), 2000);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('Failed to start recognition:', e);
        setFeedback('Error starting voice recognition');
        setTimeout(() => setFeedback(''), 2000);
      }
    }
  };

  return (
    <>
      <button
        className={`voice-assistant-btn ${isListening ? 'listening' : ''}`}
        onClick={toggleListening}
        title={isListening ? 'Click to stop listening' : 'Click to start voice commands'}
      >
        {isListening ? <Mic size={24} /> : <MicOff size={24} />}
        {isListening && <span className="pulse-ring" />}
      </button>

      {(feedback || transcript) && (
        <div className="voice-feedback">
          {feedback && <div className="feedback-text">{feedback}</div>}
          {transcript && <div className="transcript-text">"{transcript}"</div>}
        </div>
      )}
    </>
  );
};

