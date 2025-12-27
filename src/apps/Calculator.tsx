// Professional Calculator with Multiple Modes - Fully Featured
import React, { useState, useEffect, useCallback } from 'react';
import { Delete, RotateCcw } from 'lucide-react';
import { useStore } from '../store/useStore';
import './Calculator.css';

type Mode = 'basic' | 'scientific' | 'programmer';
type Base = 'dec' | 'bin' | 'hex' | 'oct';

export const Calculator: React.FC = () => {
  const { calculatorCommand, clearCalculatorCommand } = useStore();
  const [mode, setMode] = useState<Mode>('basic');
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [base, setBase] = useState<Base>('dec');
  const [memory, setMemory] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Format large numbers with commas and handle scientific notation
  const formatDisplay = (value: string): string => {
    if (error) return 'Error';
    if (mode === 'programmer') return value;
    
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    if (!isFinite(num)) return 'Infinity';
    
    // Use scientific notation for very large or small numbers
    if (Math.abs(num) > 1e15 || (Math.abs(num) < 1e-6 && num !== 0)) {
      return num.toExponential(6);
    }
    
    // Format with appropriate decimal places
    if (value.includes('.')) {
      return value;
    }
    return num.toLocaleString('en-US', { maximumFractionDigits: 10 });
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent default for calculator keys
      if (['+', '-', '*', '/', 'Enter', 'Escape'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key >= '0' && e.key <= '9') {
        handleNumberClick(e.key);
      } else if (e.key === '+') {
        handleOperationClick('+');
      } else if (e.key === '-') {
        handleOperationClick('-');
      } else if (e.key === '*') {
        handleOperationClick('*');
      } else if (e.key === '/') {
        handleOperationClick('/');
      } else if (e.key === 'Enter' || e.key === '=') {
        handleEquals();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        handleClear();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === '.') {
        handleDecimalClick();
      } else if (e.key === '%') {
        if (mode === 'basic') {
          handleOperationClick('mod');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [display, operation, previousValue, waitingForOperand, mode]);

  // Handle voice commands from Voice Assistant
  useEffect(() => {
    if (calculatorCommand) {
      executeVoiceCalculation(calculatorCommand.expression);
      clearCalculatorCommand();
    }
  }, [calculatorCommand, clearCalculatorCommand]);

  // Execute calculations from voice commands
  const executeVoiceCalculation = (expression: string) => {
    try {
      // Parse the expression and execute it
      const tokens = expression.split(' ').filter(t => t);
      
      if (tokens.length < 3) return;

      const num1 = parseFloat(tokens[0]);
      const operator = tokens[1];
      const num2 = parseFloat(tokens[2]);

      if (isNaN(num1) || isNaN(num2)) return;

      // Perform calculation immediately
      let result = 0;
      let isError = false;
      
      switch (operator) {
        case '+':
          result = num1 + num2;
          break;
        case '-':
          result = num1 - num2;
          break;
        case '*':
        case '×':
          result = num1 * num2;
          break;
        case '/':
        case '÷':
          if (num2 === 0) {
            setError('Cannot divide by zero');
            setDisplay('Error');
            isError = true;
          } else {
            result = num1 / num2;
          }
          break;
        case '%':
        case 'percent':
          // "X percent of Y" = (X / 100) * Y
          result = (num1 / 100) * num2;
          break;
        default:
          return;
      }

      if (!isError) {
        // Set the result immediately
        setDisplay(String(result));
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(true);
        setHistory(prev => [...prev.slice(-9), `${num1} ${operator} ${num2} = ${result}`]);
      }
    } catch (err) {
      console.error('Voice calculation error:', err);
      setError('Calculation error');
      setDisplay('Error');
    }
  };

  const handleNumberClick = useCallback((num: string) => {
    setError(null);
    
    // Handle hex digits in programmer mode
    if (mode === 'programmer' && base === 'hex') {
      const validHex = /^[0-9A-F]$/i.test(num);
      if (!validHex) return;
    }
    
    // Handle binary digits
    if (mode === 'programmer' && base === 'bin' && !/^[01]$/.test(num)) {
      return;
    }
    
    // Handle octal digits
    if (mode === 'programmer' && base === 'oct' && !/^[0-7]$/.test(num)) {
      return;
    }

    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      // Limit display length to prevent overflow
      if (display.length >= 16) return;
      setDisplay(display === '0' ? num : display + num);
    }
  }, [waitingForOperand, display, mode, base]);

  const handleOperationClick = useCallback((op: string) => {
    setError(null);
    
    // If we have a previous operation pending, calculate it first
    if (previousValue !== null && !waitingForOperand && operation !== null) {
      handleEquals();
    }
    
    setPreviousValue(display);
    setOperation(op);
    setWaitingForOperand(true);
  }, [display, previousValue, waitingForOperand, operation]);

  const handleEquals = useCallback(() => {
    if (!previousValue || !operation) return;

    setError(null);
    
    const prev = parseFloat(previousValue);
    const current = parseFloat(display);
    
    // Handle invalid inputs
    if (isNaN(prev) || isNaN(current)) {
      setError('Invalid input');
      setDisplay('Error');
      setPreviousValue(null);
      setOperation(null);
      return;
    }

    let result = 0;

    try {
      switch (operation) {
        case '+':
          result = prev + current;
          break;
        case '-':
          result = prev - current;
          break;
        case '*':
          result = prev * current;
          break;
        case '/':
          if (current === 0) {
            setError('Cannot divide by zero');
            setDisplay('Error');
            setPreviousValue(null);
            setOperation(null);
            setWaitingForOperand(true);
            return;
          }
          result = prev / current;
          break;
        case '^':
          result = Math.pow(prev, current);
          if (!isFinite(result)) {
            setError('Result too large');
            setDisplay('Infinity');
            setPreviousValue(null);
            setOperation(null);
            setWaitingForOperand(true);
            return;
          }
          break;
        case 'mod':
          if (current === 0) {
            setError('Cannot divide by zero');
            setDisplay('Error');
            setPreviousValue(null);
            setOperation(null);
            setWaitingForOperand(true);
            return;
          }
          result = prev % current;
          break;
        default:
          return;
      }

      // Check for overflow
      if (!isFinite(result)) {
        setError('Result too large');
        setDisplay('Infinity');
      } else {
        const resultStr = String(result);
        setDisplay(resultStr);
        // Add to history
        setHistory(prev => [...prev.slice(-9), `${previousValue} ${operation} ${current} = ${result}`]);
      }
      
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    } catch (err) {
      setError('Calculation error');
      setDisplay('Error');
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  }, [previousValue, operation, display]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setError(null);
  }, []);

  const handleAllClear = useCallback(() => {
    handleClear();
    setMemory(0);
    setHistory([]);
  }, [handleClear]);

  const handleBackspace = useCallback(() => {
    if (error) {
      handleClear();
      return;
    }
    
    if (waitingForOperand) return;
    
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  }, [display, error, waitingForOperand]);

  const handleDecimalClick = useCallback(() => {
    if (mode === 'programmer') return; // No decimals in programmer mode
    
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand, mode]);

  const handlePercentage = useCallback(() => {
    const value = parseFloat(display);
    if (isNaN(value)) return;
    
    setDisplay(String(value / 100));
    setWaitingForOperand(true);
  }, [display]);

  const handlePlusMinus = useCallback(() => {
    const value = parseFloat(display);
    if (isNaN(value) || value === 0) return;
    
    setDisplay(String(-value));
  }, [display]);

  const handleScientificFunction = useCallback((func: string) => {
    const value = parseFloat(display);
    
    if (isNaN(value)) {
      setError('Invalid input');
      setDisplay('Error');
      return;
    }

    let result = 0;

    try {
      switch (func) {
        case 'sin':
          result = Math.sin(value);
          break;
        case 'cos':
          result = Math.cos(value);
          break;
        case 'tan':
          result = Math.tan(value);
          break;
        case 'asin':
          if (value < -1 || value > 1) {
            setError('Domain error');
            setDisplay('Error');
            return;
          }
          result = Math.asin(value);
          break;
        case 'acos':
          if (value < -1 || value > 1) {
            setError('Domain error');
            setDisplay('Error');
            return;
          }
          result = Math.acos(value);
          break;
        case 'atan':
          result = Math.atan(value);
          break;
        case 'log':
          if (value <= 0) {
            setError('Domain error');
            setDisplay('Error');
            return;
          }
          result = Math.log10(value);
          break;
        case 'ln':
          if (value <= 0) {
            setError('Domain error');
            setDisplay('Error');
            return;
          }
          result = Math.log(value);
          break;
        case 'sqrt':
          if (value < 0) {
            setError('Domain error');
            setDisplay('Error');
            return;
          }
          result = Math.sqrt(value);
          break;
        case 'square':
          result = value * value;
          break;
        case 'cube':
          result = value * value * value;
          break;
        case 'factorial':
          if (value < 0 || !Number.isInteger(value) || value > 170) {
            setError('Invalid input');
            setDisplay('Error');
            return;
          }
          result = factorial(Math.floor(value));
          break;
        case 'inverse':
          if (value === 0) {
            setError('Cannot divide by zero');
            setDisplay('Error');
            return;
          }
          result = 1 / value;
          break;
        case 'pi':
          result = Math.PI;
          break;
        case 'e':
          result = Math.E;
          break;
        case 'abs':
          result = Math.abs(value);
          break;
        case 'exp':
          result = Math.exp(value);
          break;
        case '10x':
          result = Math.pow(10, value);
          break;
        default:
          return;
      }

      if (!isFinite(result)) {
        setError('Result too large');
        setDisplay('Infinity');
      } else {
        setDisplay(String(result));
      }
      
      setWaitingForOperand(true);
    } catch (err) {
      setError('Calculation error');
      setDisplay('Error');
      setWaitingForOperand(true);
    }
  }, [display]);

  const factorial = (n: number): number => {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  const handleBaseConversion = useCallback((newBase: Base) => {
    try {
      let decValue: number;
      
      // Convert current display to decimal
      switch (base) {
        case 'bin':
          decValue = parseInt(display, 2);
          break;
        case 'hex':
          decValue = parseInt(display, 16);
          break;
        case 'oct':
          decValue = parseInt(display, 8);
          break;
        default:
          decValue = parseInt(display, 10);
      }

      if (isNaN(decValue)) {
        setError('Invalid number');
        setDisplay('Error');
        return;
      }

      // Convert decimal to target base
      let result: string;
      switch (newBase) {
        case 'bin':
          result = decValue.toString(2);
          break;
        case 'hex':
          result = decValue.toString(16).toUpperCase();
          break;
        case 'oct':
          result = decValue.toString(8);
          break;
        default:
          result = decValue.toString(10);
      }

      setDisplay(result);
      setBase(newBase);
    } catch (err) {
      setError('Conversion error');
      setDisplay('Error');
    }
  }, [display, base]);

  const handleBitwiseOperation = useCallback((op: string) => {
    try {
      const radix = base === 'hex' ? 16 : base === 'bin' ? 2 : base === 'oct' ? 8 : 10;
      
      if (op === 'NOT') {
        const current = parseInt(display, radix);
        if (isNaN(current)) {
          setError('Invalid input');
          setDisplay('Error');
          return;
        }
        const result = ~current;
        const resultStr = base === 'hex' ? result.toString(16).toUpperCase() : 
                          base === 'bin' ? result.toString(2) : 
                          base === 'oct' ? result.toString(8) : result.toString(10);
        setDisplay(resultStr);
        setWaitingForOperand(true);
        return;
      }

      if (!previousValue) {
        setPreviousValue(display);
        setOperation(op);
        setWaitingForOperand(true);
        return;
      }
      
      const prev = parseInt(previousValue, radix);
      const current = parseInt(display, radix);
      
      if (isNaN(prev) || isNaN(current)) {
        setError('Invalid input');
        setDisplay('Error');
        setPreviousValue(null);
        setOperation(null);
        return;
      }

      let result = 0;

      switch (op) {
        case 'AND':
          result = prev & current;
          break;
        case 'OR':
          result = prev | current;
          break;
        case 'XOR':
          result = prev ^ current;
          break;
        case '<<':
          result = prev << current;
          break;
        case '>>':
          result = prev >> current;
          break;
        default:
          return;
      }

      const resultStr = base === 'hex' ? result.toString(16).toUpperCase() : 
                        base === 'bin' ? result.toString(2) : 
                        base === 'oct' ? result.toString(8) : result.toString(10);
      
      setDisplay(resultStr);
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    } catch (err) {
      setError('Calculation error');
      setDisplay('Error');
      setPreviousValue(null);
      setOperation(null);
    }
  }, [display, previousValue, base]);

  const handleMemory = useCallback((op: string) => {
    const value = parseFloat(display);
    
    if (isNaN(value) && op !== 'MC') return;

    switch (op) {
      case 'MC':
        setMemory(0);
        break;
      case 'MR':
        setDisplay(String(memory));
        setWaitingForOperand(true);
        break;
      case 'M+':
        setMemory(memory + value);
        break;
      case 'M-':
        setMemory(memory - value);
        break;
      case 'MS':
        setMemory(value);
        break;
    }
  }, [display, memory]);

  return (
    <div className="calculator-app">
      {/* Mode Tabs */}
      <div className="calculator-modes">
        <button
          className={`mode-tab ${mode === 'basic' ? 'active' : ''}`}
          onClick={() => {
            setMode('basic');
            handleClear();
          }}
        >
          Basic
        </button>
        <button
          className={`mode-tab ${mode === 'scientific' ? 'active' : ''}`}
          onClick={() => {
            setMode('scientific');
            handleClear();
          }}
        >
          Scientific
        </button>
        <button
          className={`mode-tab ${mode === 'programmer' ? 'active' : ''}`}
          onClick={() => {
            setMode('programmer');
            handleClear();
          }}
        >
          Programmer
        </button>
      </div>

      {/* Display */}
      <div className="calculator-display">
        {operation && previousValue && !error && (
          <div className="display-operation">
            {previousValue} {operation === '*' ? '×' : operation === '/' ? '÷' : operation}
          </div>
        )}
        {error && <div className="display-error">{error}</div>}
        <div className="display-value" title={display}>
          {mode === 'programmer' ? display : formatDisplay(display)}
        </div>
        {memory !== 0 && <div className="memory-indicator">M</div>}
      </div>

      {/* Basic Mode */}
      {mode === 'basic' && (
        <div className="calculator-buttons basic-grid">
          <button className="btn btn-function" onClick={handleAllClear} title="Clear All (Escape)">AC</button>
          <button className="btn btn-function" onClick={handlePlusMinus} title="Toggle Sign">±</button>
          <button className="btn btn-function" onClick={handlePercentage} title="Percentage">%</button>
          <button className="btn btn-operation" onClick={() => handleOperationClick('/')} title="Divide (/)">÷</button>

          <button className="btn" onClick={() => handleNumberClick('7')} title="7">7</button>
          <button className="btn" onClick={() => handleNumberClick('8')} title="8">8</button>
          <button className="btn" onClick={() => handleNumberClick('9')} title="9">9</button>
          <button className="btn btn-operation" onClick={() => handleOperationClick('*')} title="Multiply (*)">×</button>

          <button className="btn" onClick={() => handleNumberClick('4')} title="4">4</button>
          <button className="btn" onClick={() => handleNumberClick('5')} title="5">5</button>
          <button className="btn" onClick={() => handleNumberClick('6')} title="6">6</button>
          <button className="btn btn-operation" onClick={() => handleOperationClick('-')} title="Subtract (-)">−</button>

          <button className="btn" onClick={() => handleNumberClick('1')} title="1">1</button>
          <button className="btn" onClick={() => handleNumberClick('2')} title="2">2</button>
          <button className="btn" onClick={() => handleNumberClick('3')} title="3">3</button>
          <button className="btn btn-operation" onClick={() => handleOperationClick('+')} title="Add (+)">+</button>

          <button className="btn btn-zero" onClick={() => handleNumberClick('0')} title="0">0</button>
          <button className="btn" onClick={handleDecimalClick} title="Decimal Point (.)">.</button>
          <button className="btn btn-equals" onClick={handleEquals} title="Equals (=)">=</button>
        </div>
      )}

      {/* Scientific Mode */}
      {mode === 'scientific' && (
        <div className="calculator-buttons scientific-grid">
          {/* Memory & Clear Row */}
          <button className="btn btn-mem" onClick={() => handleMemory('MC')} title="Memory Clear">MC</button>
          <button className="btn btn-mem" onClick={() => handleMemory('MR')} title="Memory Recall">MR</button>
          <button className="btn btn-mem" onClick={() => handleMemory('M+')} title="Memory Add">M+</button>
          <button className="btn btn-mem" onClick={() => handleMemory('M-')} title="Memory Subtract">M−</button>
          <button className="btn btn-mem" onClick={() => handleMemory('MS')} title="Memory Store">MS</button>
          <button className="btn btn-function" onClick={handleAllClear} title="Clear All">AC</button>
          <button className="btn btn-function" onClick={handleBackspace} title="Backspace"><Delete size={16} /></button>

          {/* Trigonometric Functions */}
          <button className="btn btn-sci" onClick={() => handleScientificFunction('sin')} title="Sine">sin</button>
          <button className="btn btn-sci" onClick={() => handleScientificFunction('cos')} title="Cosine">cos</button>
          <button className="btn btn-sci" onClick={() => handleScientificFunction('tan')} title="Tangent">tan</button>
          <button className="btn btn-sci" onClick={() => handleScientificFunction('asin')} title="Arc Sine">asin</button>
          <button className="btn btn-sci" onClick={() => handleScientificFunction('acos')} title="Arc Cosine">acos</button>
          <button className="btn btn-sci" onClick={() => handleScientificFunction('atan')} title="Arc Tangent">atan</button>
          <button className="btn btn-function" onClick={handlePlusMinus} title="Toggle Sign">±</button>

          {/* Logarithmic & Exponential */}
          <button className="btn btn-sci" onClick={() => handleScientificFunction('log')} title="Log base 10">log</button>
          <button className="btn btn-sci" onClick={() => handleScientificFunction('ln')} title="Natural Log">ln</button>
          <button className="btn btn-sci" onClick={() => handleScientificFunction('exp')} title="e^x">e^x</button>
          <button className="btn btn-sci" onClick={() => handleScientificFunction('10x')} title="10^x">10^x</button>
          <button className="btn btn-sci" onClick={() => handleScientificFunction('sqrt')} title="Square Root">√</button>
          <button className="btn btn-sci" onClick={() => handleScientificFunction('square')} title="Square">x²</button>
          <button className="btn btn-sci" onClick={() => handleScientificFunction('cube')} title="Cube">x³</button>

          {/* Constants & Special Functions */}
          <button className="btn btn-sci" onClick={() => handleScientificFunction('pi')} title="Pi">π</button>
          <button className="btn btn-sci" onClick={() => handleScientificFunction('e')} title="Euler's Number">e</button>
          <button className="btn btn-sci" onClick={() => handleScientificFunction('factorial')} title="Factorial">n!</button>
          <button className="btn btn-sci" onClick={() => handleScientificFunction('inverse')} title="Inverse">1/x</button>
          <button className="btn btn-sci" onClick={() => handleScientificFunction('abs')} title="Absolute Value">|x|</button>
          <button className="btn btn-sci" onClick={() => handleOperationClick('^')} title="Power">x^y</button>
          <button className="btn btn-sci" onClick={() => handleOperationClick('mod')} title="Modulo">mod</button>

          {/* Number Pad */}
          <button className="btn" onClick={() => handleNumberClick('7')}>7</button>
          <button className="btn" onClick={() => handleNumberClick('8')}>8</button>
          <button className="btn" onClick={() => handleNumberClick('9')}>9</button>
          <button className="btn btn-operation" onClick={() => handleOperationClick('/')}>÷</button>
          <button className="btn btn-operation" onClick={() => handleOperationClick('*')}>×</button>
          <button className="btn btn-function" onClick={handlePercentage}>%</button>
          <button className="btn btn-function" onClick={handleClear}>C</button>

          <button className="btn" onClick={() => handleNumberClick('4')}>4</button>
          <button className="btn" onClick={() => handleNumberClick('5')}>5</button>
          <button className="btn" onClick={() => handleNumberClick('6')}>6</button>
          <button className="btn btn-operation" onClick={() => handleOperationClick('-')}>−</button>
          <button className="btn btn-operation" onClick={() => handleOperationClick('+')}>+</button>
          <button className="btn btn-equals span-2-row" onClick={handleEquals}>=</button>

          <button className="btn" onClick={() => handleNumberClick('1')}>1</button>
          <button className="btn" onClick={() => handleNumberClick('2')}>2</button>
          <button className="btn" onClick={() => handleNumberClick('3')}>3</button>
          <button className="btn span-2" onClick={() => handleNumberClick('0')}>0</button>
          <button className="btn" onClick={handleDecimalClick}>.</button>
        </div>
      )}

      {/* Programmer Mode */}
      {mode === 'programmer' && (
        <>
          <div className="base-selector">
            <button 
              className={`base-btn ${base === 'dec' ? 'active' : ''}`} 
              onClick={() => handleBaseConversion('dec')}
              title="Decimal"
            >
              DEC
            </button>
            <button 
              className={`base-btn ${base === 'bin' ? 'active' : ''}`} 
              onClick={() => handleBaseConversion('bin')}
              title="Binary"
            >
              BIN
            </button>
            <button 
              className={`base-btn ${base === 'hex' ? 'active' : ''}`} 
              onClick={() => handleBaseConversion('hex')}
              title="Hexadecimal"
            >
              HEX
            </button>
            <button 
              className={`base-btn ${base === 'oct' ? 'active' : ''}`} 
              onClick={() => handleBaseConversion('oct')}
              title="Octal"
            >
              OCT
            </button>
          </div>
          
          <div className="calculator-buttons programmer-grid">
            {/* Control Row */}
            <button className="btn btn-function" onClick={handleAllClear}>AC</button>
            <button className="btn btn-function" onClick={handleBackspace}><Delete size={16} /></button>
            <button className="btn btn-bit" onClick={() => handleBitwiseOperation('AND')} title="Bitwise AND">AND</button>
            <button className="btn btn-bit" onClick={() => handleBitwiseOperation('OR')} title="Bitwise OR">OR</button>
            <button className="btn btn-bit" onClick={() => handleBitwiseOperation('XOR')} title="Bitwise XOR">XOR</button>
            <button className="btn btn-bit" onClick={() => handleBitwiseOperation('NOT')} title="Bitwise NOT">NOT</button>

            {/* Hex Digits (A-F) - Only show in HEX mode */}
            {base === 'hex' && (
              <>
                <button className="btn btn-hex" onClick={() => handleNumberClick('A')}>A</button>
                <button className="btn btn-hex" onClick={() => handleNumberClick('B')}>B</button>
                <button className="btn btn-hex" onClick={() => handleNumberClick('C')}>C</button>
                <button className="btn btn-hex" onClick={() => handleNumberClick('D')}>D</button>
                <button className="btn btn-hex" onClick={() => handleNumberClick('E')}>E</button>
                <button className="btn btn-hex" onClick={() => handleNumberClick('F')}>F</button>
              </>
            )}

            {/* Shift Operations */}
            <button className="btn btn-bit" onClick={() => handleBitwiseOperation('<<')} title="Left Shift">{'<<'}</button>
            <button className="btn btn-bit" onClick={() => handleBitwiseOperation('>>')} title="Right Shift">{'>>'}</button>

            {/* Number Pad */}
            <button 
              className="btn" 
              onClick={() => handleNumberClick('7')}
              disabled={base === 'bin'}
            >
              7
            </button>
            <button 
              className="btn" 
              onClick={() => handleNumberClick('8')}
              disabled={base === 'bin' || base === 'oct'}
            >
              8
            </button>
            <button 
              className="btn" 
              onClick={() => handleNumberClick('9')}
              disabled={base === 'bin' || base === 'oct'}
            >
              9
            </button>
            <button className="btn btn-operation" onClick={() => handleOperationClick('/')}>÷</button>
            <button className="btn btn-operation" onClick={() => handleOperationClick('*')}>×</button>

            <button 
              className="btn" 
              onClick={() => handleNumberClick('4')}
              disabled={base === 'bin'}
            >
              4
            </button>
            <button 
              className="btn" 
              onClick={() => handleNumberClick('5')}
              disabled={base === 'bin'}
            >
              5
            </button>
            <button 
              className="btn" 
              onClick={() => handleNumberClick('6')}
              disabled={base === 'bin'}
            >
              6
            </button>
            <button className="btn btn-operation" onClick={() => handleOperationClick('-')}>−</button>
            <button className="btn btn-operation" onClick={() => handleOperationClick('+')}>+</button>

            <button 
              className="btn" 
              onClick={() => handleNumberClick('1')}
            >
              1
            </button>
            <button 
              className="btn" 
              onClick={() => handleNumberClick('2')}
              disabled={base === 'bin'}
            >
              2
            </button>
            <button 
              className="btn" 
              onClick={() => handleNumberClick('3')}
              disabled={base === 'bin'}
            >
              3
            </button>
            <button className="btn btn-operation" onClick={() => handleOperationClick('mod')}>%</button>
            <button className="btn btn-equals" onClick={handleEquals}>=</button>

            <button className="btn span-3" onClick={() => handleNumberClick('0')}>0</button>
            <button className="btn btn-function" onClick={handleClear}>C</button>
          </div>
        </>
      )}
    </div>
  );
};
